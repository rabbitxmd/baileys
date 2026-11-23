import { type Logger } from '../logger.js';
import { type MlowModule } from './mlow-binding.js';
import { type MlowPacketRead } from './mlow-packet.js';
export interface MLowCodecStats {
    /** Packets decoded normally. */
    readonly success: number;
    /** Packets the decoder rejected. */
    readonly errors: number;
    /** Frames rebuilt by packet loss concealment. */
    readonly plc: number;
    /**
     * Frames recovered through in-band FEC. Counts accepted attempts, so it
     * over-reports: a packet holding no redundant copy yields a concealed frame
     * the decoder reports the same way.
     */
    readonly fec: number;
    /** Packets dropped because the stream had already moved past them. */
    readonly late: number;
    /** Gaps that were longer than `maxConcealFrames` and got truncated. */
    readonly concealCapped: number;
    /** Sub-frames and in-band RED copies dropped: their stretch had already played or lost nothing. */
    readonly redundant: number;
    /** Sub-frames and RED copies played in the place of a lost packet, carried by a later one. */
    readonly redRecovered: number;
}
/**
 * What {@link MLowCodec.decodeSequenced} did with the packet itself, apart from the gap before it:
 * played (whole, in part, or found redundant), rejected by the decoder, late, or empty.
 */
export type MLowDecodeOutcome = 'decoded' | 'rejected' | 'late' | 'empty';
/**
 * Plays one inbound MLow stream: sequence gaps, the RTP timeline, multiframe and RED placement,
 * concealment, and decode statistics.
 */
export declare class WaMlowDecoder {
    private lib;
    private readonly logger;
    private readonly traceEnabled;
    private readonly concealer;
    private decodeErrors;
    private decodeSuccess;
    private lateFrames;
    private redundantSubframes;
    private redRecoveredFrames;
    /** Sequence position of each stream {@link decodeSequenced} numbers apart; -1 before its first. */
    private readonly lastSeqs;
    /** RTP timestamp where the audio played so far ends, or -1 without a timeline. */
    private playedUntil;
    /** New audio the last packet that followed on without a hole brought; 0 unknown. */
    private packetStep;
    /** Every decoded frame lands here, concealed ones too; see {@link decodeSequenced}. */
    private readonly decodeScratch;
    /** `[offset, length]` of each sub-frame of the packet being decoded. */
    private readonly subframeBounds;
    /** Timeline span of each sub-frame of the packet being decoded. */
    private readonly subframeSpans;
    /** {@link readMlowRed} bounds of the in-band RED packet being decoded. */
    private readonly redBounds;
    /** Span of each copy of that packet that fills a lost slot, 0 for one that does not. */
    private readonly redFills;
    private constructor();
    static open(lib: MlowModule, maxConcealFrames: number | undefined, logger: Logger): Promise<WaMlowDecoder>;
    decode(mlowFrame: Uint8Array | null): Float32Array;
    /** The `MLowCodec.decodeSequenced` contract, on this stream's decoder. */
    decodeSequenced(seq: number, packet: Uint8Array, onFrame: (pcm: Float32Array) => void, timestamp?: number, stream?: 0 | 1, read?: MlowPacketRead): MLowDecodeOutcome;
    resetSequence(): void;
    setCompanionModel(model: Uint8Array): void;
    getStats(): MLowCodecStats;
    /** Frees the library decoder; the statistics stay readable. */
    free(): void;
    /**
     * Decodes `packet` whole after concealing what `missing` packets left. With `timestamp` it
     * opens the timeline the next packets are placed on. False when the decoder rejects it.
     */
    private playWhole;
    /**
     * Drops the leading sub-frames whose stretch of the timeline already played, conceals the
     * hole a loss left before the first new one, and decodes from there. False when rejected.
     */
    private playOnTimeline;
    /** Plays the primary of an in-band RED packet whole, its `copies` dropped as redundant. */
    private playRedPrimary;
    /**
     * Plays an in-band RED packet: a copy only where a loss left its slot unplayed, then the
     * primary; with no such copy the primary goes through {@link playOnTimeline}. False if rejected.
     */
    private playRedOnTimeline;
    /**
     * Splits `packet` into {@link subframeBounds} with each sub-frame's span in
     * {@link subframeSpans}; 0 for a malformed multiframe or a CELT frame, which have no span.
     * `subframes` is a {@link readMlowSubframes} count already in the bounds, or -1 to read it.
     */
    private splitOnTimeline;
    /** Sub-frames from `first` inside the lost packets' own stretch: copies standing in for them. */
    private countCopiesInHole;
    /**
     * Conceals from `playedUntil` up to `until`, `budget` samples at most; the FEC of `fecPacket`,
     * which sits right before it, only when the span reaches `until`. Returns the samples emitted.
     */
    private concealUntil;
    /** Decode one packet against the live decoder, or `null` if it was rejected. */
    private tryDecode;
}
