import type { Logger } from '../logger.js';
import { type Connection, type RawUdpLeg, type RawUdpLegOptions } from './leg.js';
export interface WaRelayLegDialerOptions {
    /** The call's legs; a dial whose leg left them closes what it built. */
    readonly legs: ReadonlyMap<string, Connection>;
    readonly logger: Logger;
    readonly traceEnabled: boolean;
    readonly createPeerConnection: (configuration: RTCConfiguration) => Promise<RTCPeerConnection>;
    readonly createRawUdpLeg?: (options: RawUdpLegOptions) => RawUdpLeg;
    /** The leg opened; `rawUdp` tells which transport it rides. */
    readonly onOpen: (conn: Connection, rawUdp: boolean) => void;
    readonly onMessage: (data: Uint8Array, conn: Connection) => void;
    readonly onFailure: (conn: Connection, reason: string) => void;
    /** The leg's data channel closed. */
    readonly onClosed: (conn: Connection) => void;
}
/**
 * Dials a registered leg over WebRTC (peer connection, munged SDP answer, data channels) or raw
 * UDP, and reports its open, datagrams, failure and close.
 */
export declare class WaRelayLegDialer {
    private readonly legs;
    private readonly logger;
    private readonly traceEnabled;
    private readonly createPeerConnection;
    private readonly createRawUdpLeg;
    private readonly onOpen;
    private readonly onMessage;
    private readonly onFailure;
    private readonly onClosed;
    constructor(options: WaRelayLegDialerOptions);
    /** Dials a leg that is already registered, over the configured transport. */
    dial(conn: Connection): Promise<void>;
    /** Opens a raw UDP leg, which then runs through the same bookkeeping as a WebRTC one. */
    private openRawUdpLeg;
    /** Fails a leg still `Connecting` after `CONNECTION_TIMEOUT`. */
    private armConnectTimeout;
}
