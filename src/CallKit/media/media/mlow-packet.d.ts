/** Parses and writes the MLow PT 121 payload: multiframes, TOC spans and in-band RED. */
/** Multiframe packet: `[0x82 | toc & 0x39][count][count - 1 lengths][sub-frames, each with its TOC]`. */
export declare const MULTIFRAME_MARKER = 130;
/** Most sub-frames one multiframe packet carries. */
export declare const MLOW_MAX_SUBFRAMES = 18;
/** A TOC with both top bits set selects CELT, whose low bits mean something else. */
export declare const CELT_TOC = 192;
/** TOC bit 6: the frame carries speech. Clear on the silence and DTX frames. */
export declare const MLOW_TOC_VAD = 64;
/** Most copies an in-band RED packet carries, a bound of ours. */
export declare const MLOW_MAX_RED_BLOCKS = 8;
/**
 * Splits a multiframe packet into `bounds` as `[offset, length]` pairs and returns the sub-frame
 * count, or 0 for a single frame or a header that does not add up.
 */
export declare function readMlowSubframes(packet: Uint8Array, bounds: Int32Array): number;
/** Samples a frame spans on the 16 kHz RTP clock, read from its TOC; 0 for a CELT TOC. */
export declare function mlowFrameSamples(toc: number): number;
/**
 * Samples `packet` spans, its sub-frames summed, with `bounds` as {@link readMlowSubframes} fills
 * it; 0 when it does not parse as MLow: empty, a CELT TOC, or a multiframe that does not add up.
 */
export declare function mlowPacketSamples(packet: Uint8Array, bounds: Int32Array): number;
/**
 * Writes the official in-band MLow RED, a compact RFC 2198, into `target` and returns
 * its length: `[0x80 | steps][length]` per copy, the `0x00` primary header, the copies, then
 * `primary`. Steps are 10 ms units back from `timestamp`, 1 to 127; a copy empty, over 255 bytes or
 * off that grid is left out. Goes on PT 121; the receiver needs `enable_red_pt_support_rx`.
 */
export declare function writeMlowRed(target: Uint8Array, primary: Uint8Array, timestamp: number, copies: readonly Uint8Array[], copyTimestamps: readonly number[]): number;
/**
 * Splits the in-band RED of {@link writeMlowRed} into `bounds`, `[offset, length, Δts]` per copy,
 * Δts its 10 ms steps as 16 kHz samples, then the primary's `[offset, length]`. Returns the copy
 * count, 0 for a lone primary, -1 when `packet` is not RED: headers while F is set, then `0x00`.
 */
export declare function readMlowRed(packet: Uint8Array, bounds: Int32Array): number;
/** One read of a PT 121 packet, kept so {@link MLowCodec.decodeSequenced} does not read it again. */
export declare class MlowPacketRead {
    readonly subframeBounds: Int32Array<ArrayBuffer>;
    readonly redBounds: Int32Array<ArrayBuffer>;
    packet: Uint8Array | null;
    subframes: number;
    copies: number;
    /** Reads `packet`; whether it parses as MLow, as frames with a span or as in-band RED. */
    read(packet: Uint8Array): boolean;
}
