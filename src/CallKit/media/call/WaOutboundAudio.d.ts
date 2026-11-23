import type { Logger } from '../logger.js';
import type { MLowCodec } from '../media/mlow-codec.js';
import type { WaMediaClock } from '../media/WaMediaClock.js';
export interface WaOutboundAudioOptions {
    readonly logger: Logger;
    readonly clock: WaMediaClock;
    /** Sends one encoded payload; `captureMs` lets the sender report carry its timestamp. */
    readonly send: (payload: Uint8Array, timestamp: number, marker: boolean, captureMs: number) => void;
}
/**
 * Turns captured PCM into timestamped encoded payloads: whole codec frames on a timeline that
 * follows the capture within a slack, bundled per the plan's `maxfpp` or sent behind a RED copy.
 */
export declare class WaOutboundAudio {
    private readonly logger;
    private readonly clock;
    private readonly send;
    /**
     * Unanchored, the next audio frame takes its timestamp from the clock; anchored, frames
     * follow on from `nextAudioTimestamp` while their capture stays within the slack.
     */
    private audioTimelineAnchored;
    private nextAudioTimestamp;
    /**
     * Samples the plane dropped since the last frame sent (no leg, keys or codec, a failed
     * encode). The next frame steps over them, so the wire gap matches the audio lost.
     */
    private pendingSkipSamples;
    /** Capture instant, on the clock, of the first sample in the encode buffer. */
    private encodeBufferCaptureMs;
    private audioTimelineResyncs;
    private audioFramesShed;
    /** Clock ticks of the last frame's capture instant minus its timestamp. */
    private audioCaptureSkewTicks;
    private audioDropCount;
    /** Frames bundled per audio packet: the plan's `rc.maxfpp`, 1 until it says otherwise. */
    private audioFramesPerPacket;
    /** Two encode targets, so a frame waiting for its bundle survives the next encode. */
    private readonly encodeSlots;
    /** The two frames of a bundle, handed to the repacketizer without a fresh array. */
    private readonly bundlePair;
    /** A speech frame waiting for the next to share its packet: a view into one of the slots. */
    private pendingAudio;
    private pendingAudioTimestamp;
    private pendingAudioMarker;
    private pendingAudioCaptureMs;
    /** RED: the redundant copy of the last frame sent, which the next packet carries first. */
    private previousSecondary;
    private previousSecondaryTimestamp;
    private previousSecondaryCaptureMs;
    private encodeBufferA;
    private encodeBufferB;
    private encodeBuffer;
    private encodeBufferPos;
    /** Zeros, sliced to the length of whatever capture has to go out as silence. */
    private silenceScratch;
    constructor(options: WaOutboundAudioOptions);
    get framesPerPacket(): number;
    get dropCount(): number;
    get timelineResyncs(): number;
    get framesShed(): number;
    /** Capture instant minus timestamp of the last frame sent, in ms. */
    get captureSkewMs(): number;
    /** Applies the plan's `rc.maxfpp`, clamped to what the official client sends; absent is 1. */
    setFramesPerPacket(framesPerPacket: number | undefined): void;
    silence(length: number): Float32Array;
    /**
     * Discards `captured` samples with the partial frame, so the timeline steps over exactly
     * what was lost. Returns the drops so far.
     */
    drop(captured: number): number;
    /** Frames `data` (first sample captured at `capturedAtMs`) and sends each complete frame. */
    encode(codec: MLowCodec, data: Float32Array, capturedAtMs: number): void;
    /** Our audio SSRC changed: the next frame starts a new timeline, nothing waiting carries over. */
    restartTimeline(): void;
    /** Sends what waits and drops the partial frame, stepping the timeline over it. */
    reset(): void;
    clear(): void;
    /**
     * Stamps one captured frame on the audio timeline, then encodes and sends it. A frame that
     * does not continue the last one exactly (a pause or a drop) goes out with the marker set.
     */
    private sendCapturedFrame;
    /**
     * Puts one encoded frame on the wire, behind the copy of the frame before with RED. Otherwise
     * a speech frame waits to share a packet when the plan bundles, and a frame that breaks the
     * run (VAD clear, or not following on) sends what waits on its own first.
     */
    private packetizeAudio;
    /**
     * `[copy of frame n-1][frame n]` at frame n-1's timestamp: the copy lands on the slot the
     * previous packet filled, a duplicate unless that packet was lost. A marked frame goes alone.
     */
    private packetizeRed;
    private packAudio;
    /** Sends the frame waiting for its bundle on its own, so nothing captured stays behind. */
    private flushPendingAudio;
    /** Records samples the plane lost, for the next frame to step over once anchored. */
    private skipAudioSamples;
}
