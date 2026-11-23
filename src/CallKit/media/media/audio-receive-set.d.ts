import { type Logger } from '../logger.js';
import type { MlowPacketRead } from './mlow-packet.js';
import { type SenderReportReception } from './rtcp.js';
import { type WaJitterBufferStats } from './WaJitterBuffer.js';
import type { MLowCodecStats, MLowDecodeOutcome } from './WaMlowDecoder.js';
/** What the set needs of a decoder: the receive half of `MLowCodec`, so a test needs no wasm. */
export interface AudioStreamDecoder {
    decodeSequenced(seq: number, packet: Uint8Array, onFrame: (pcm: Float32Array) => void, timestamp?: number, stream?: 0 | 1, read?: MlowPacketRead): MLowDecodeOutcome;
    getStats(): Pick<MLowCodecStats, 'success' | 'errors' | 'plc' | 'late'>;
    resetSequence(): void;
    destroy(): void;
}
/** One remote sender: the streams routed to it by SSRC, its main audio among them. */
export interface AudioReceiveSenderSpec {
    readonly id: string;
    readonly audio: number;
    readonly streams: readonly number[];
}
/** The audio of one remote sender of a group call. */
export interface AudioReceiveSenderStats {
    readonly id: string;
    /** Audio packets that authenticated. */
    readonly recv: number;
    readonly decoded: number;
    readonly decodeErrors: number;
    /** Packets that arrived behind what was already played. */
    readonly late: number;
    /** Frames concealed for packets that never arrived. */
    readonly plc: number;
    readonly lossPercent: number;
    /** Packets on this sender's streams whose SRTP or SRTCP tag did not verify. */
    readonly authFailures: number;
    /** Packets dropped because its decoder was still loading. */
    readonly decoderPending: number;
    /** Audio on PT 122 (`mlow-1`), and what its decoder made of it. */
    readonly pt122Received: number;
    readonly pt122Decoded: number;
    readonly pt122Rejected: number;
}
interface AudioReceiveSetOptions {
    /** Clock of the inbound audio RTP timestamps. */
    readonly clockRate: number;
    /** Clock of the inbound video RTP timestamps. */
    readonly videoClockRate: number;
    /** Playout queue of each sender, in samples. */
    readonly playoutCapacity: number;
    /** Senders held at once; past it the plan's later ones are left out. */
    readonly maxSenders: number;
    /** A synchronous factory attaches before it returns; a promise leaves packets pending. */
    readonly createDecoder: () => AudioStreamDecoder | Promise<AudioStreamDecoder>;
    /** Each decoded frame of a sender, before the mix; `pcm` is reused after the call. */
    readonly onSenderAudio?: (senderId: string, pcm: Float32Array) => void;
    readonly logger?: Logger;
}
/**
 * The inbound media of a group call by remote sender: one decoder and one playout queue each,
 * mixed on the host's clock by {@link pullPlayout}, a video reception each, and whether each is
 * being heard.
 */
export declare class AudioReceiveSet {
    private readonly options;
    private readonly logger;
    private readonly senders;
    private readonly bySsrc;
    /** One sender's samples for the mix, sized to the host's block. */
    private mixScratch;
    private mixUnderruns;
    constructor(options: AudioReceiveSetOptions);
    get size(): number;
    /** Whether `ssrc` belongs to a sender of the set. */
    has(ssrc: number): boolean;
    /** The sender owning `ssrc`, by its plan id. */
    senderIdOf(ssrc: number): string | undefined;
    /**
     * Makes the set exactly `specs`: a new sender's decoder starts loading now, a sender left
     * out is torn down with its decoder and queued audio, a kept one keeps both. Returns the
     * senders left out that were being heard.
     */
    sync(specs: readonly AudioReceiveSenderSpec[]): string[];
    /**
     * Records an authenticated packet on `ssrc` at `nowMs`; returns the sender's id when this
     * starts it being heard.
     */
    noteHeard(ssrc: number, nowMs: number): string | undefined;
    /** The senders heard before and not for `silenceMs` up to `nowMs`, no longer heard now. */
    takeSilent(nowMs: number, silenceMs: number): string[];
    /** Feeds a video packet to its sender's video reception, which follows its first stream. */
    observeVideo(ssrc: number, seq: number, timestamp: number, arrivalMs: number): void;
    /** One video report block per sender heard; see {@link receptionReports}. */
    videoReceptionReports(nowMs: number): SenderReportReception[];
    /** The video stream of every sender heard, in sender order. */
    videoSourceSsrcs(): number[];
    /** The worst cumulative video loss among the senders. */
    videoPeakLossPercent(): number;
    /**
     * Feeds one authenticated audio packet to its sender's decoder: `stream` 0 is PT 120 and 1
     * is PT 121, numbered apart on the sender's timeline. `null` when no sender owns `ssrc` or
     * its decoder is still loading.
     */
    receive(ssrc: number, seq: number, timestamp: number, payload: Uint8Array, stream: 0 | 1, arrivalMs: number, read?: MlowPacketRead): MLowDecodeOutcome | null;
    /** Counts a PT 122 packet against its sender, with what {@link receive} made of it. */
    countPt122(ssrc: number, outcome: MLowDecodeOutcome | null): void;
    /** Counts a packet on `ssrc` that failed authentication; false when no sender owns it. */
    noteAuthFailure(ssrc: number): boolean;
    /** Hands a sender report to the tracker of the sender it describes. */
    observeSenderReport(rtcp: Uint8Array, arrivalMs: number): void;
    /**
     * One report block per sender heard from, each the tracker's reused object: hand the list
     * to the builder before the next call.
     */
    receptionReports(nowMs: number): SenderReportReception[];
    /** Loss of the sender owning `ssrc` since the last call for it; 0 for no sender. */
    takeLossPercent(ssrc: number): number;
    /** The worst cumulative loss among the senders: the one uplink encoder protects the worst leg. */
    peakLossPercent(): number;
    /**
     * Mixes every sender's next samples into `out`, summed and clipped to [-1, 1], and returns
     * how many hold audio; the rest is silence.
     */
    pullPlayout(out: Float32Array): number;
    /** The senders' queues as one: the fullest one's backlog, drops summed, mixes left short. */
    get playoutStats(): WaJitterBufferStats;
    /** Forgets every sender's sequence position and reception, as after new SRTP contexts. */
    resetSequences(): void;
    /** Empties every sender's playout queue. */
    resetPlayout(): void;
    stats(): AudioReceiveSenderStats[];
    clear(): void;
    private startDecoder;
    private logDecoderFailure;
}
export {};
