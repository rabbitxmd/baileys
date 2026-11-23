import type { Logger } from '../logger.js';
import { type Connection } from './leg.js';
import type { RelayTraffic } from './trace.js';
export interface WaRelayKeepaliveOptions {
    readonly logger: Logger;
    readonly now: () => number;
    /** Hands a datagram to a leg; whether it went out. */
    readonly send: (conn: Connection, data: ArrayBuffer) => boolean;
    /** Whether media goes out on `conn`, for the log of a leg going unresponsive. */
    readonly isElected: (conn: Connection) => boolean;
    /** The call's datagram counts, which the periodic diagnostics carry. */
    readonly traffic: Readonly<RelayTraffic>;
}
/**
 * Pings each open leg on the call's cadence and takes a leg whose pings go unanswered out of the
 * media election until it answers again.
 */
export declare class WaRelayKeepalive {
    private readonly logger;
    private readonly now;
    private readonly send;
    private readonly isElected;
    private readonly traffic;
    private readonly timers;
    private pingIntervalMs;
    constructor(options: WaRelayKeepaliveOptions);
    start(conn: Connection): void;
    private sendPing;
    /** Takes a leg whose oldest unanswered ping is `UNRESPONSIVE_TIMEOUT_MS` old out of the election. */
    private checkResponsive;
    onPong(conn: Connection): void;
    /** Moves the keepalive of `legs` to the cadence of an accepted call; later legs start on it. */
    setMediaFlowing(legs: Iterable<Connection>): void;
    stop(connectionId: string): void;
    stopAll(): void;
    /** Back to the cadence of a call that sets up. */
    reset(): void;
}
