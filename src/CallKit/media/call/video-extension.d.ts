/** The largest video extension: a frame's first packet, carrying the bitrate estimate too. */
export declare const VIDEO_EXTENSION_SCRATCH_LENGTH: number;
/** One slice of `scratch` per length in 32-bit words, so no packet calls `subarray`. */
export declare function buildExtensionViews(scratch: Uint8Array): readonly Uint8Array[];
/**
 * Writes a video packet's header extension at the start of `extension` and returns its padded
 * length. A `receiverEstimate` above zero appends the REMB element.
 */
export declare function writeVideoExtension(extension: Uint8Array, keyFrame: boolean, firstPacket: boolean, frameNumber: number, transportSequence: number, receiverEstimate: number): number;
