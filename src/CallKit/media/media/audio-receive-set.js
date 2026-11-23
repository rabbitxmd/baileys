import { toError } from '../errors.js';
import { createNoopLogger } from '../logger.js';
import { senderReportSourceSsrc } from './rtcp.js';
import { RtpStreamReception } from './rtp-stream-reception.js';
import { WaJitterBuffer } from './WaJitterBuffer.js';
/**
 * The receive state of one remote sender. The decoder is per sender because it holds the
 * sequence position, the concealment state and the timeline of one stream: two senders
 * through one decoder interleave their sequence numbers and read as late.
 */
class AudioReceiveSender {
    id;
    audio;
    reception;
    /** The sender's first video stream heard; its report block and REMB entry. */
    video;
    playout;
    /** Bound once so the per-packet decode allocates no closure. */
    onDecoded;
    decoder = null;
    retired = false;
    received = 0;
    authFailures = 0;
    decoderPending = 0;
    pt122Received = 0;
    pt122Decoded = 0;
    pt122Rejected = 0;
    /** When an authenticated packet of any of its streams last arrived. */
    lastHeardMs = 0;
    receiving = false;
    constructor(spec, options, playoutLogger) {
        this.id = spec.id;
        this.audio = spec.audio;
        this.reception = new RtpStreamReception(options.clockRate);
        this.video = new RtpStreamReception(options.videoClockRate);
        this.playout = new WaJitterBuffer(options.playoutCapacity, playoutLogger);
        const onSenderAudio = options.onSenderAudio;
        this.onDecoded = onSenderAudio
            ? (pcm) => {
                this.playout.write(pcm);
                try {
                    onSenderAudio(this.id, pcm);
                }
                catch (err) {
                    playoutLogger.warn('sender audio handler failed', {
                        message: toError(err).message
                    });
                }
            }
            : (pcm) => this.playout.write(pcm);
    }
    stats() {
        const decoded = this.decoder?.getStats();
        return {
            id: this.id,
            recv: this.received,
            decoded: decoded?.success ?? 0,
            decodeErrors: decoded?.errors ?? 0,
            late: decoded?.late ?? 0,
            plc: decoded?.plc ?? 0,
            lossPercent: Math.round(this.reception.lossPercent * 10) / 10,
            authFailures: this.authFailures,
            decoderPending: this.decoderPending,
            pt122Received: this.pt122Received,
            pt122Decoded: this.pt122Decoded,
            pt122Rejected: this.pt122Rejected
        };
    }
    destroy() {
        this.retired = true;
        this.decoder?.destroy();
        this.decoder = null;
        this.playout.reset();
    }
}
/**
 * The inbound media of a group call by remote sender: one decoder and one playout queue each,
 * mixed on the host's clock by {@link pullPlayout}, a video reception each, and whether each is
 * being heard.
 */
export class AudioReceiveSet {
    options;
    logger;
    senders = new Map();
    bySsrc = new Map();
    /** One sender's samples for the mix, sized to the host's block. */
    mixScratch = new Float32Array(0);
    mixUnderruns = 0;
    constructor(options) {
        this.options = options;
        this.logger = options.logger ?? createNoopLogger();
    }
    get size() {
        return this.senders.size;
    }
    /** Whether `ssrc` belongs to a sender of the set. */
    has(ssrc) {
        return this.bySsrc.has(ssrc);
    }
    /** The sender owning `ssrc`, by its plan id. */
    senderIdOf(ssrc) {
        return this.bySsrc.get(ssrc)?.id;
    }
    /**
     * Makes the set exactly `specs`: a new sender's decoder starts loading now, a sender left
     * out is torn down with its decoder and queued audio, a kept one keeps both. Returns the
     * senders left out that were being heard.
     */
    sync(specs) {
        const wanted = new Map();
        for (const spec of specs) {
            if (wanted.size === this.options.maxSenders) {
                this.logger.debug('group senders past the bound left out', {
                    senders: specs.length,
                    maxSenders: this.options.maxSenders
                });
                break;
            }
            wanted.set(spec.id, spec);
        }
        const silenced = [];
        for (const [id, sender] of this.senders) {
            if (wanted.has(id))
                continue;
            if (sender.receiving)
                silenced.push(id);
            sender.destroy();
            this.senders.delete(id);
        }
        this.bySsrc.clear();
        for (const spec of wanted.values()) {
            let sender = this.senders.get(spec.id);
            if (sender) {
                sender.audio = spec.audio;
            }
            else {
                sender = new AudioReceiveSender(spec, this.options, this.logger.child({ component: 'playout', sender: spec.id }));
                this.senders.set(spec.id, sender);
                this.startDecoder(sender);
            }
            this.bySsrc.set(spec.audio, sender);
            for (const ssrc of spec.streams)
                this.bySsrc.set(ssrc, sender);
        }
        return silenced;
    }
    /**
     * Records an authenticated packet on `ssrc` at `nowMs`; returns the sender's id when this
     * starts it being heard.
     */
    noteHeard(ssrc, nowMs) {
        const sender = this.bySsrc.get(ssrc);
        if (!sender)
            return undefined;
        sender.lastHeardMs = nowMs;
        if (sender.receiving)
            return undefined;
        sender.receiving = true;
        return sender.id;
    }
    /** The senders heard before and not for `silenceMs` up to `nowMs`, no longer heard now. */
    takeSilent(nowMs, silenceMs) {
        const silent = [];
        for (const sender of this.senders.values()) {
            if (!sender.receiving || nowMs - sender.lastHeardMs < silenceMs)
                continue;
            sender.receiving = false;
            silent.push(sender.id);
        }
        return silent;
    }
    /** Feeds a video packet to its sender's video reception, which follows its first stream. */
    observeVideo(ssrc, seq, timestamp, arrivalMs) {
        const video = this.bySsrc.get(ssrc)?.video;
        if (!video)
            return;
        const followed = video.sourceSsrc;
        if (followed === 0 || followed === ssrc)
            video.observe(ssrc, seq, timestamp, arrivalMs);
    }
    /** One video report block per sender heard; see {@link receptionReports}. */
    videoReceptionReports(nowMs) {
        const reports = [];
        for (const sender of this.senders.values()) {
            if (sender.video.sourceSsrc === 0)
                continue;
            reports.push(sender.video.report(nowMs));
        }
        return reports;
    }
    /** The video stream of every sender heard, in sender order. */
    videoSourceSsrcs() {
        const ssrcs = [];
        for (const sender of this.senders.values()) {
            if (sender.video.sourceSsrc !== 0)
                ssrcs.push(sender.video.sourceSsrc);
        }
        return ssrcs;
    }
    /** The worst cumulative video loss among the senders. */
    videoPeakLossPercent() {
        let peak = 0;
        for (const sender of this.senders.values()) {
            const loss = sender.video.lossPercent;
            if (loss > peak)
                peak = loss;
        }
        return peak;
    }
    /**
     * Feeds one authenticated audio packet to its sender's decoder: `stream` 0 is PT 120 and 1
     * is PT 121, numbered apart on the sender's timeline. `null` when no sender owns `ssrc` or
     * its decoder is still loading.
     */
    receive(ssrc, seq, timestamp, payload, stream, arrivalMs, read) {
        const sender = this.bySsrc.get(ssrc);
        if (!sender)
            return null;
        sender.received++;
        const followed = sender.reception.sourceSsrc;
        if (stream === 0 || followed === 0 || followed === ssrc) {
            sender.reception.observe(ssrc, seq, timestamp, arrivalMs);
        }
        const decoder = sender.decoder;
        if (!decoder) {
            sender.decoderPending++;
            return null;
        }
        return decoder.decodeSequenced(seq, payload, sender.onDecoded, timestamp, stream, read);
    }
    /** Counts a PT 122 packet against its sender, with what {@link receive} made of it. */
    countPt122(ssrc, outcome) {
        const sender = this.bySsrc.get(ssrc);
        if (!sender)
            return;
        sender.pt122Received++;
        if (outcome === 'decoded')
            sender.pt122Decoded++;
        else if (outcome === 'rejected')
            sender.pt122Rejected++;
    }
    /** Counts a packet on `ssrc` that failed authentication; false when no sender owns it. */
    noteAuthFailure(ssrc) {
        const sender = this.bySsrc.get(ssrc);
        if (!sender)
            return false;
        sender.authFailures++;
        return true;
    }
    /** Hands a sender report to the tracker of the sender it describes. */
    observeSenderReport(rtcp, arrivalMs) {
        const source = senderReportSourceSsrc(rtcp);
        if (source === null)
            return;
        const sender = this.bySsrc.get(source);
        sender?.reception.observeSenderReport(rtcp, arrivalMs);
        sender?.video.observeSenderReport(rtcp, arrivalMs);
    }
    /**
     * One report block per sender heard from, each the tracker's reused object: hand the list
     * to the builder before the next call.
     */
    receptionReports(nowMs) {
        const reports = [];
        for (const sender of this.senders.values()) {
            if (sender.reception.sourceSsrc === 0)
                continue;
            reports.push(sender.reception.report(nowMs));
        }
        return reports;
    }
    /** Loss of the sender owning `ssrc` since the last call for it; 0 for no sender. */
    takeLossPercent(ssrc) {
        return this.bySsrc.get(ssrc)?.reception.takeLossPercent() ?? 0;
    }
    /** The worst cumulative loss among the senders: the one uplink encoder protects the worst leg. */
    peakLossPercent() {
        let peak = 0;
        for (const sender of this.senders.values()) {
            const loss = sender.reception.lossPercent;
            if (loss > peak)
                peak = loss;
        }
        return peak;
    }
    /**
     * Mixes every sender's next samples into `out`, summed and clipped to [-1, 1], and returns
     * how many hold audio; the rest is silence.
     */
    pullPlayout(out) {
        out.fill(0);
        if (this.mixScratch.length !== out.length)
            this.mixScratch = new Float32Array(out.length);
        const scratch = this.mixScratch;
        let real = 0;
        for (const sender of this.senders.values()) {
            if (sender.playout.buffered === 0)
                continue;
            const drained = sender.playout.read(scratch);
            if (drained > real)
                real = drained;
            for (let i = 0; i < drained; i++)
                out[i] += scratch[i];
        }
        for (let i = 0; i < real; i++) {
            const sample = out[i];
            if (sample > 1)
                out[i] = 1;
            else if (sample < -1)
                out[i] = -1;
        }
        if (real < out.length)
            this.mixUnderruns++;
        return real;
    }
    /** The senders' queues as one: the fullest one's backlog, drops summed, mixes left short. */
    get playoutStats() {
        let buffered = 0;
        let dropped = 0;
        for (const sender of this.senders.values()) {
            const stats = sender.playout.stats;
            if (stats.buffered > buffered)
                buffered = stats.buffered;
            dropped += stats.dropped;
        }
        return {
            buffered,
            capacity: this.options.playoutCapacity,
            dropped,
            underruns: this.mixUnderruns
        };
    }
    /** Forgets every sender's sequence position and reception, as after new SRTP contexts. */
    resetSequences() {
        for (const sender of this.senders.values()) {
            sender.decoder?.resetSequence();
            sender.reception.reset();
        }
    }
    /** Empties every sender's playout queue. */
    resetPlayout() {
        for (const sender of this.senders.values())
            sender.playout.reset();
    }
    stats() {
        const stats = [];
        for (const sender of this.senders.values())
            stats.push(sender.stats());
        return stats;
    }
    clear() {
        for (const sender of this.senders.values())
            sender.destroy();
        this.senders.clear();
        this.bySsrc.clear();
    }
    startDecoder(sender) {
        let created;
        try {
            created = this.options.createDecoder();
        }
        catch (err) {
            this.logDecoderFailure(sender, err);
            return;
        }
        if (!isPromiseLike(created)) {
            sender.decoder = created;
            return;
        }
        void created.then((decoder) => {
            if (sender.retired)
                decoder.destroy();
            else
                sender.decoder = decoder;
        }, (err) => this.logDecoderFailure(sender, err));
    }
    logDecoderFailure(sender, err) {
        this.logger.warn('group sender decoder failed to load', {
            sender: sender.id,
            message: toError(err).message
        });
    }
}
function isPromiseLike(value) {
    return typeof value.then === 'function';
}
