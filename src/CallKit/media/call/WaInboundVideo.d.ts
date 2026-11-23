import { type Logger } from '../logger.js';
import type { RtpHeader } from '../media/rtp.js';
import type { InboundVideoFrame } from '../types.js';
/** Reassembly buffers kept per inbound video SSRC, at least; the oldest is dropped on overflow. */
export declare const MAX_H264_DEPACKETIZERS = 8;
export interface WaInboundVideoOptions {
    readonly logger: Logger;
    readonly onFrame?: (frame: InboundVideoFrame) => void;
    readonly requestKeyFrame: (ssrc: number) => void;
}
/** Reassembles each inbound video SSRC into frames, bounded, and paces key frame requests. */
export declare class WaInboundVideo {
    private readonly logger;
    private readonly traceEnabled;
    private readonly onFrame;
    private readonly requestKeyFrame;
    private readonly streams;
    /** Inbound video streams reassembled at once: the default, or two per group sender. */
    private maxStreams;
    private lastKeyFrameRequestAt;
    constructor(options: WaInboundVideoOptions);
    /** Feeds one H.264 payload to its stream's reassembly and hands over each frame it closes. */
    push(header: RtpHeader, payload: Uint8Array, now: number, senderId: string | undefined): void;
    /** Bounds the video streams reassembled at once; a lower bound drops the oldest past it. */
    setMaxStreams(max: number): void;
    drop(ssrc: number): void;
    clear(): void;
}
