import type { Logger } from '../logger.js';
import { type RtpPacket, type RtpSession } from '../media/rtp.js';
import { type WaMediaClock } from '../media/WaMediaClock.js';
export interface WaOutboundVideoOptions {
    readonly logger: Logger;
    readonly clock: WaMediaClock;
    /** Protects and sends one packet; returns whether it left. */
    readonly sendRtp: (packet: RtpPacket) => boolean;
    /** One frame went out on `ssrc`, before its frame number advances: the sender report hook. */
    readonly onFrameSent: (ssrc: number, timestamp: number, captureMs: number, now: number) => void;
}
/**
 * Turns H.264 access units into RTP packets carrying WhatsApp's video extension. The stream
 * opens on a key frame, closes on a hold, and its timestamps only move forward.
 */
export declare class WaOutboundVideo {
    private readonly logger;
    private readonly clock;
    private readonly sendRtp;
    private readonly onFrameSent;
    /** Maps the host's video capture timestamps onto the clock, one video tick apart at least. */
    private readonly captureTimes;
    /** Whether our video is held for the peer; see `WaCallMediaVideo.sendHeld`. */
    private sendHeld;
    /** Whether our video stream went out yet: it opens on a key frame, never on a delta. */
    private streamOpen;
    private videoPacketCount;
    private videoOctetCount;
    /** Timestamp of the last video frame sent, valid once one was. */
    private videoTimestamp;
    private videoFrameNumber;
    private videoTransportSequence;
    private videoSendFrames;
    /** The video RTP header extension, rewritten in place per packet. */
    private readonly videoExtensionScratch;
    private readonly videoExtensionViews;
    constructor(options: WaOutboundVideoOptions);
    get held(): boolean;
    get packetCount(): number;
    get octetCount(): number;
    get framesSent(): number;
    /** Holds or releases our frames; a hold closes the stream so it reopens on a key frame. */
    setHeld(held: boolean): void;
    /**
     * Packetizes and sends one access unit on `rtpSession` and returns the packet count, or 0
     * while the stream waits for a key frame. `receiverEstimate` rides on the first packet.
     */
    sendFrame(rtpSession: RtpSession, data: Uint8Array, timestampUs: number, receiverEstimate: number): number;
    /**
     * Writes a video packet's header extension into the scratch and returns the slice, valid
     * until the next call. A `receiverEstimate` above zero appends the REMB element.
     */
    buildVideoExtension(keyFrame: boolean, firstPacket: boolean, transportSequence: number, receiverEstimate: number): Uint8Array;
}
