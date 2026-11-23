import { EMPTY_BYTES } from '../bytes.js';
import { toError } from '../errors.js';
import { MLOW_MAX_PACKET_BYTES } from '../media/mlow-binding.js';
import { MLOW_TOC_VAD } from '../media/mlow-packet.js';
import { AUDIO_SAMPLE_RATE } from '../types.js';
/** Samples in one frame of the codec, used until the codec itself is loaded. */
const DEFAULT_FRAME_SAMPLES = 960;
/** Most frames bundled per audio packet: the two the official 1:1 client sends. */
const MAX_AUDIO_FRAMES_PER_PACKET = 2;
/**
 * How far a frame's capture instant may drift from the stream's timeline: 120 ms. Later
 * and the stream jumps to the clock with the marker set; earlier and the frame is shed.
 */
const AUDIO_TIMELINE_SLACK_TICKS = (120 * AUDIO_SAMPLE_RATE) / 1000;
/**
 * Turns captured PCM into timestamped encoded payloads: whole codec frames on a timeline that
 * follows the capture within a slack, bundled per the plan's `maxfpp` or sent behind a RED copy.
 */
export class WaOutboundAudio {
    logger;
    clock;
    send;
    /**
     * Unanchored, the next audio frame takes its timestamp from the clock; anchored, frames
     * follow on from `nextAudioTimestamp` while their capture stays within the slack.
     */
    audioTimelineAnchored = false;
    nextAudioTimestamp = 0;
    /**
     * Samples the plane dropped since the last frame sent (no leg, keys or codec, a failed
     * encode). The next frame steps over them, so the wire gap matches the audio lost.
     */
    pendingSkipSamples = 0;
    /** Capture instant, on the clock, of the first sample in the encode buffer. */
    encodeBufferCaptureMs = 0;
    audioTimelineResyncs = 0;
    audioFramesShed = 0;
    /** Clock ticks of the last frame's capture instant minus its timestamp. */
    audioCaptureSkewTicks = 0;
    audioDropCount = 0;
    /** Frames bundled per audio packet: the plan's `rc.maxfpp`, 1 until it says otherwise. */
    audioFramesPerPacket = 1;
    /** Two encode targets, so a frame waiting for its bundle survives the next encode. */
    encodeSlots = [
        new Uint8Array(MLOW_MAX_PACKET_BYTES),
        new Uint8Array(MLOW_MAX_PACKET_BYTES)
    ];
    /** The two frames of a bundle, handed to the repacketizer without a fresh array. */
    bundlePair = [EMPTY_BYTES, EMPTY_BYTES];
    /** A speech frame waiting for the next to share its packet: a view into one of the slots. */
    pendingAudio = null;
    pendingAudioTimestamp = 0;
    pendingAudioMarker = false;
    pendingAudioCaptureMs = 0;
    /** RED: the redundant copy of the last frame sent, which the next packet carries first. */
    previousSecondary = null;
    previousSecondaryTimestamp = 0;
    previousSecondaryCaptureMs = 0;
    encodeBufferA = null;
    encodeBufferB = null;
    encodeBuffer = null;
    encodeBufferPos = 0;
    /** Zeros, sliced to the length of whatever capture has to go out as silence. */
    silenceScratch = new Float32Array(DEFAULT_FRAME_SAMPLES);
    constructor(options) {
        this.logger = options.logger;
        this.clock = options.clock;
        this.send = options.send;
    }
    get framesPerPacket() {
        return this.audioFramesPerPacket;
    }
    get dropCount() {
        return this.audioDropCount;
    }
    get timelineResyncs() {
        return this.audioTimelineResyncs;
    }
    get framesShed() {
        return this.audioFramesShed;
    }
    /** Capture instant minus timestamp of the last frame sent, in ms. */
    get captureSkewMs() {
        return (this.audioCaptureSkewTicks * 1000) / AUDIO_SAMPLE_RATE;
    }
    /** Applies the plan's `rc.maxfpp`, clamped to what the official client sends; absent is 1. */
    setFramesPerPacket(framesPerPacket) {
        const frames = Math.trunc(framesPerPacket ?? 1);
        this.audioFramesPerPacket = frames > 1 ? Math.min(frames, MAX_AUDIO_FRAMES_PER_PACKET) : 1;
    }
    silence(length) {
        if (this.silenceScratch.length < length) {
            this.silenceScratch = new Float32Array(length);
        }
        return this.silenceScratch.subarray(0, length);
    }
    /**
     * Discards `captured` samples with the partial frame, so the timeline steps over exactly
     * what was lost. Returns the drops so far.
     */
    drop(captured) {
        this.skipAudioSamples(this.encodeBufferPos + captured);
        this.encodeBufferPos = 0;
        return ++this.audioDropCount;
    }
    /** Frames `data` (first sample captured at `capturedAtMs`) and sends each complete frame. */
    encode(codec, data, capturedAtMs) {
        const frameSamples = codec.getFrameSize();
        if (!this.encodeBuffer) {
            if (!this.encodeBufferA) {
                this.encodeBufferA = new Float32Array(frameSamples);
                this.encodeBufferB = new Float32Array(frameSamples);
            }
            this.encodeBuffer = this.encodeBufferA;
            this.encodeBufferPos = 0;
        }
        let offset = 0;
        while (offset < data.length) {
            if (this.encodeBufferPos === 0) {
                this.encodeBufferCaptureMs = capturedAtMs + (offset * 1000) / AUDIO_SAMPLE_RATE;
            }
            const toCopy = Math.min(data.length - offset, frameSamples - this.encodeBufferPos);
            const target = this.encodeBuffer;
            for (let i = 0; i < toCopy; i++) {
                const sample = data[offset + i];
                target[this.encodeBufferPos + i] = Number.isFinite(sample) ? sample : 0;
            }
            this.encodeBufferPos += toCopy;
            offset += toCopy;
            if (this.encodeBufferPos < frameSamples)
                break;
            const frameData = this.encodeBuffer;
            this.encodeBuffer =
                frameData === this.encodeBufferA ? this.encodeBufferB : this.encodeBufferA;
            this.encodeBufferPos = 0;
            this.sendCapturedFrame(codec, frameData, this.encodeBufferCaptureMs);
        }
    }
    /** Our audio SSRC changed: the next frame starts a new timeline, nothing waiting carries over. */
    restartTimeline() {
        this.audioTimelineAnchored = false;
        this.pendingSkipSamples = 0;
        this.pendingAudio = null;
        this.previousSecondary = null;
    }
    /** Sends what waits and drops the partial frame, stepping the timeline over it. */
    reset() {
        this.flushPendingAudio();
        this.skipAudioSamples(this.encodeBufferPos);
        this.encodeBuffer = null;
        this.encodeBufferPos = 0;
    }
    clear() {
        this.encodeBuffer = null;
        this.encodeBufferPos = 0;
        this.pendingAudio = null;
        this.previousSecondary = null;
    }
    /**
     * Stamps one captured frame on the audio timeline, then encodes and sends it. A frame that
     * does not continue the last one exactly (a pause or a drop) goes out with the marker set.
     */
    sendCapturedFrame(codec, frame, captureMs) {
        const onClock = this.clock.ticksAt(captureMs, AUDIO_SAMPLE_RATE);
        let timestamp = onClock;
        let resync = false;
        if (this.audioTimelineAnchored) {
            const next = (this.nextAudioTimestamp + this.pendingSkipSamples) >>> 0;
            const drift = (onClock - next) | 0;
            if (drift <= -AUDIO_TIMELINE_SLACK_TICKS) {
                const shed = ++this.audioFramesShed;
                if (shed === 1 || shed % 100 === 0) {
                    this.logger.debug('audio frame shed, capture ahead of the clock', {
                        shed,
                        aheadMs: (-drift * 1000) / AUDIO_SAMPLE_RATE
                    });
                }
                return;
            }
            if (drift < AUDIO_TIMELINE_SLACK_TICKS) {
                timestamp = next;
            }
            else {
                resync = true;
            }
        }
        const slot = this.pendingAudio?.buffer === this.encodeSlots[0].buffer
            ? this.encodeSlots[1]
            : this.encodeSlots[0];
        let encodedLength;
        try {
            encodedLength = codec.encodeInto(frame, slot);
        }
        catch (err) {
            this.logger.error('encode error', { message: toError(err).message });
            this.skipAudioSamples(frame.length);
            return;
        }
        const marker = !this.audioTimelineAnchored || timestamp !== this.nextAudioTimestamp;
        if (resync) {
            this.audioTimelineResyncs++;
            this.logger.debug('audio timeline resynced to the clock', {
                pauseMs: (((onClock - this.nextAudioTimestamp) | 0) * 1000) / AUDIO_SAMPLE_RATE
            });
        }
        this.audioTimelineAnchored = true;
        this.nextAudioTimestamp = (timestamp + frame.length) >>> 0;
        this.pendingSkipSamples = 0;
        this.audioCaptureSkewTicks = (onClock - timestamp) | 0;
        this.packetizeAudio(codec, slot.subarray(0, encodedLength), timestamp, marker, captureMs);
    }
    /**
     * Puts one encoded frame on the wire, behind the copy of the frame before with RED. Otherwise
     * a speech frame waits to share a packet when the plan bundles, and a frame that breaks the
     * run (VAD clear, or not following on) sends what waits on its own first.
     */
    packetizeAudio(codec, frame, timestamp, marker, captureMs) {
        if (codec.redActive) {
            this.packetizeRed(codec, frame, timestamp, marker, captureMs);
            return;
        }
        const bundles = this.audioFramesPerPacket > 1 && (frame[0] & MLOW_TOC_VAD) !== 0;
        const pending = this.pendingAudio;
        if (pending && bundles && !marker) {
            const packet = this.packAudio(codec, pending, frame);
            if (packet) {
                this.pendingAudio = null;
                this.send(packet, this.pendingAudioTimestamp, this.pendingAudioMarker, this.pendingAudioCaptureMs);
                return;
            }
        }
        this.flushPendingAudio();
        if (bundles) {
            this.pendingAudio = frame;
            this.pendingAudioTimestamp = timestamp;
            this.pendingAudioMarker = marker;
            this.pendingAudioCaptureMs = captureMs;
            return;
        }
        this.send(frame, timestamp, marker, captureMs);
    }
    /**
     * `[copy of frame n-1][frame n]` at frame n-1's timestamp: the copy lands on the slot the
     * previous packet filled, a duplicate unless that packet was lost. A marked frame goes alone.
     */
    packetizeRed(codec, frame, timestamp, marker, captureMs) {
        const copy = this.previousSecondary;
        const copyTimestamp = this.previousSecondaryTimestamp;
        const copyCaptureMs = this.previousSecondaryCaptureMs;
        this.previousSecondary = codec.lastSecondary;
        this.previousSecondaryTimestamp = timestamp;
        this.previousSecondaryCaptureMs = captureMs;
        const packet = copy && !marker ? this.packAudio(codec, copy, frame) : null;
        if (packet) {
            this.send(packet, copyTimestamp, false, copyCaptureMs);
        }
        else {
            this.send(frame, timestamp, marker, captureMs);
        }
    }
    packAudio(codec, first, second) {
        const pair = this.bundlePair;
        pair[0] = first;
        pair[1] = second;
        try {
            return codec.packFrames(pair);
        }
        catch (err) {
            this.logger.trace('audio frames not packed, sent apart', {
                message: toError(err).message
            });
            return null;
        }
    }
    /** Sends the frame waiting for its bundle on its own, so nothing captured stays behind. */
    flushPendingAudio() {
        const pending = this.pendingAudio;
        if (!pending)
            return;
        this.pendingAudio = null;
        this.send(pending, this.pendingAudioTimestamp, this.pendingAudioMarker, this.pendingAudioCaptureMs);
    }
    /** Records samples the plane lost, for the next frame to step over once anchored. */
    skipAudioSamples(samples) {
        if (this.audioTimelineAnchored)
            this.pendingSkipSamples += samples;
    }
}
