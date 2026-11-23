import type { RawUdpLeg, RawUdpLegOptions } from '../relay/leg.js';
/**
 * How long a leg may send media before the peer's stream has to arrive, in ms. Sending can pull
 * the peer's stream onto a relay that forwards nothing, so giving up fast lets the old path back.
 */
export declare const RAW_UDP_RETURN_PATH_TIMEOUT_MS = 5000;
/**
 * How long a confirmed leg may go without inbound media before it is rolled back, in ms. Only
 * non-STUN datagrams slide it: a relay that forwards nothing still answers every ping.
 */
export declare const RAW_UDP_RETURN_PATH_STALL_MS = 10000;
/** Reason `onFailure` reports when the return-path window closes unanswered. */
export declare const RAW_UDP_NO_RETURN_PATH = "raw_udp_no_return_path";
export interface WaRawUdpLegOptions extends RawUdpLegOptions {
    /** Overrides {@link RAW_UDP_RETURN_PATH_TIMEOUT_MS} for this leg. */
    readonly returnPathTimeoutMs?: number;
    /** Overrides {@link RAW_UDP_RETURN_PATH_STALL_MS} for this leg. */
    readonly stallTimeoutMs?: number;
}
/**
 * A media leg to the relay over a connected UDP socket, with no ICE, DTLS or SCTP: the socket's
 * 5-tuple is the leg's identity to the relay. Sending is what elects it, so it polices its own
 * return path and fails when media goes out and none comes back. The owner builds every message.
 */
export declare class WaRawUdpLeg implements RawUdpLeg {
    private readonly options;
    private readonly logger;
    private readonly returnPathTimeoutMs;
    private readonly stallTimeoutMs;
    private socket;
    private opened;
    private closed;
    private returnPathTimer;
    private returnPathSeen;
    /** Monotonic, since it is only read as an elapsed time. */
    private lastInboundAt;
    constructor(options: WaRawUdpLegOptions);
    /** Whether the socket is bound and has not been closed since. */
    get isOpen(): boolean;
    /** Whether media has arrived from the relay at least once, which confirms the leg. */
    get hasReturnPath(): boolean;
    /** Binds the socket to the relay; `onOpen` never fires synchronously. */
    open(): void;
    /**
     * Writes one datagram to the relay; returns whether the socket took it. The first media
     * datagram, never STUN, arms the return-path window.
     */
    send(data: Uint8Array): boolean;
    /** Closes the socket. Idempotent, and never throws. */
    close(): void;
    /** Arms the window; a confirmed leg whose deadline comes early re-arms for the time left. */
    private armReturnPathTimer;
    private clearReturnPathTimer;
    private fail;
}
