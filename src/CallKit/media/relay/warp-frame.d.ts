/** What {@link readWarpFrame} made of a datagram. */
type WarpFrameRead = 
/** No frame: the datagram is what it already was. */
{
    readonly kind: 'not_framed';
}
/** A frame around media: `rtp` is the packet inside it, a view over the datagram. */
 | {
    readonly kind: 'framed';
    readonly headerLength: number;
    readonly rtp: Uint8Array;
}
/** The marker is there but its header length runs past the datagram. */
 | {
    readonly kind: 'header_overruns';
    readonly headerLength: number;
}
/** A frame that fits but holds no RTP: the relay's own control frames. */
 | {
    readonly kind: 'no_rtp_inside';
    readonly headerLength: number;
};
/** Whether a datagram carries the marker; {@link readWarpFrame} decides if the frame holds. */
export declare function isWarpFramedPacket(data: Uint8Array): boolean;
/**
 * Bytes the frame header takes, `4 + (byte1 & 0x7f) * 2`. The rule fits both header sizes seen
 * so far (8 and 18 bytes); a length that does not fit the datagram reads as `header_overruns`.
 */
export declare function warpFrameHeaderLength(data: Uint8Array): number;
/**
 * Takes the frame off a datagram, or says why not. A datagram with no frame is the normal case
 * and comes back as `not_framed`, so this can run over every inbound datagram.
 */
export declare function readWarpFrame(data: Uint8Array): WarpFrameRead;
export {};
