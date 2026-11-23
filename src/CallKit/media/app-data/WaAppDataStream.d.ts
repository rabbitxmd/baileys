import type { Logger } from '../logger.js';
import { RtpPacket } from '../media/rtp.js';
import { type WaCallReaction } from './protocol.js';
/**
 * The RTP payload type this side stamps on the app-data it sends. Nothing negotiates it; it
 * is the one the official client uses, since a receiver still compares it against its own.
 */
export declare const WA_APP_DATA_PAYLOAD_TYPE = 119;
export interface WaAppDataStreamOptions {
    readonly logger: Logger;
    /** SSRC of this device's app-data stream, derived from the call's slot 6. */
    readonly ssrc: number;
    /**
     * Hands one framed packet to the transport, which applies the audio stream's own
     * end-to-end SRTP and writes it to the media socket. Returns whether it left.
     */
    readonly sendPacket: (packet: RtpPacket) => boolean;
    /** Overrides the outgoing payload type; see {@link WaAppDataStream.payloadType}. */
    readonly payloadType?: number | null;
    readonly retransmissionIntervalMs?: number;
    readonly clearIntervalMs?: number;
}
/**
 * The app-data stream of one call, which carries reactions: RTP on the audio's media socket,
 * on an SSRC of its own, under the audio's SRTP. Each reaction is resent until its clear
 * interval elapses; the receiver deduplicates by transaction id.
 */
export declare class WaAppDataStream {
    readonly ssrc: number;
    private readonly logger;
    private readonly sendPacket;
    private readonly retransmissionIntervalMs;
    private readonly clearIntervalMs;
    private sequenceNumber;
    /** A random constant: the stream has no media clock, and the SRTP IV ignores timestamps. */
    private readonly timestamp;
    private outgoing;
    private retransmitTimer;
    /** Reactions already surfaced, as `ssrc:transactionId`: each device numbers its own from 1. */
    private readonly seenTransactions;
    /**
     * This stream's own reaction counter, from one as the official client counts: a random
     * `uint64` past 2^63 is tracked by the peer but never rendered.
     */
    private nextTransactionId;
    private readonly configuredPayloadType;
    private txReactionCount;
    private txReactionErrorCount;
    private rxReactionCount;
    constructor(options: WaAppDataStreamOptions);
    /** RTP payload type this stream stamps on what it sends. */
    get payloadType(): number;
    /**
     * Sets the outgoing reaction, replacing whatever was in the send buffer, and starts
     * retransmitting it. Returns whether the first attempt left the socket; a `false` does
     * not abandon it, the buffer keeps it and the retransmission carries it.
     */
    sendReaction(reaction: string): boolean;
    /**
     * Reads one decrypted app-data RTP payload, arrived on `ssrc`, and returns the
     * reactions in it not seen before, so a caller surfaces each of the peer's reactions
     * once per burst.
     */
    receive(payload: Uint8Array, ssrc: number): readonly WaCallReaction[];
    /** Drops the send buffer and stops every timer of this stream. */
    close(): void;
    private rememberTransaction;
    private armRetransmission;
    private onRetransmissionTick;
    private clearOutgoing;
    private transmit;
}
