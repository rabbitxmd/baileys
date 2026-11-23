import type { Logger } from '../logger.js';
import type { Connection } from './leg.js';
/** Datagram counts across every leg of a call, for diagnostics only. */
export interface RelayTraffic {
    sent: number;
    pongs: number;
    rtpReceived: number;
    warpReceived: number;
    unknownReceived: number;
}
export declare function createRelayTraffic(): RelayTraffic;
/** Zeroes the counts in place, since the keepalive diagnostics hold the same object. */
export declare function resetRelayTraffic(traffic: RelayTraffic): void;
export declare function traceSend(logger: Logger, traffic: Readonly<RelayTraffic>, conn: Connection, data: ArrayBuffer): void;
/** Logs a STUN datagram that is not a pong: its errors always, the rest at trace. */
export declare function logStunResponse(logger: Logger, traceEnabled: boolean, data: Uint8Array, conn: Connection): void;
/** The per-datagram traces; called only with trace enabled. */
export declare function traceReceive(logger: Logger, traffic: RelayTraffic, data: Uint8Array, conn: Connection, twoBits: number, framed: boolean): void;
