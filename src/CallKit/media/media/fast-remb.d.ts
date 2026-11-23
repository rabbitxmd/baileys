/**
 * Id of the RTP header extension element that carries the receive bandwidth estimate inside
 * video RTP, as the official client sends it. Must stay off {3, 5, 6, 9}, the other video ids.
 */
export declare const WA_FAST_REMB_EXTENSION_ID = 13;
/** The whole element: the id/len byte plus the content. */
export declare const WA_FAST_REMB_ELEMENT_LENGTH: number;
/**
 * Writes the one-byte RFC 8285 element announcing `bitsPerSecond` as the receive estimate into
 * `target` at `offset`, and returns its length. The peer takes it as its estimator's ceiling.
 */
export declare function writeFastRembExtension(target: Uint8Array, offset: number, bitsPerSecond: number): number;
