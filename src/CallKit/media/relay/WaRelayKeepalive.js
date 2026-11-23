import { toArrayBuffer } from '../bytes.js';
import { toError } from '../errors.js';
import { isLegOpen } from './leg.js';
import { buildWhatsAppPing } from './stun.js';
/** `relay_ping_interval` while the call sets up, then once it is accepted. */
const PING_SETUP_INTERVAL_MS = 5000;
const PING_INTERVAL_MS = 1000;
/** `relay_unresponsive_timeout`: a leg with a ping unanswered this long leaves the election. */
const UNRESPONSIVE_TIMEOUT_MS = 4000;
/**
 * Pings each open leg on the call's cadence and takes a leg whose pings go unanswered out of the
 * media election until it answers again.
 */
export class WaRelayKeepalive {
    logger;
    now;
    send;
    isElected;
    traffic;
    timers = new Map();
    pingIntervalMs = PING_SETUP_INTERVAL_MS;
    constructor(options) {
        this.logger = options.logger;
        this.now = options.now;
        this.send = options.send;
        this.isElected = options.isElected;
        this.traffic = options.traffic;
    }
    start(conn) {
        const connectionId = conn.id;
        this.stop(connectionId);
        this.sendPing(conn);
        this.logger.debug('keepalive first ping sent', { connectionId });
        let keepaliveCount = 0;
        const timer = setInterval(() => {
            if (!isLegOpen(conn)) {
                this.stop(connectionId);
                return;
            }
            this.checkResponsive(conn);
            this.sendPing(conn);
            keepaliveCount++;
            if (keepaliveCount % 3 === 0) {
                const pc = conn.peerConnection;
                const dcState = conn.channel?.readyState || 'unknown';
                const iceState = pc?.iceConnectionState || 'unknown';
                const connState = pc?.connectionState || 'unknown';
                let bufferedAmount;
                try {
                    const buffered = conn.channel?.bufferedAmount;
                    if (buffered !== undefined) {
                        bufferedAmount = buffered;
                    }
                }
                catch (err) {
                    this.logger.trace('bufferedAmount unavailable', {
                        message: toError(err).message
                    });
                }
                this.logger.debug('sctp relay diagnostics', {
                    connectionId,
                    dcState,
                    iceState,
                    connState,
                    sentPackets: conn.stats.sentPackets,
                    sentBytes: conn.stats.sentBytes,
                    receivedPackets: conn.stats.receivedPackets,
                    receivedBytes: conn.stats.receivedBytes,
                    pongs: this.traffic.pongs,
                    rtpRecv: this.traffic.rtpReceived,
                    warpRecv: this.traffic.warpReceived,
                    keepalives: keepaliveCount,
                    globalSend: this.traffic.sent,
                    bufferedAmount
                });
            }
        }, this.pingIntervalMs);
        this.timers.set(connectionId, timer);
        this.logger.debug('keepalive started', {
            connectionId,
            intervalMs: this.pingIntervalMs
        });
    }
    sendPing(conn) {
        conn.ping ??= toArrayBuffer(buildWhatsAppPing(conn.stunTransactionId));
        if (this.send(conn, conn.ping)) {
            conn.pingUnansweredSince ??= this.now();
        }
    }
    /** Takes a leg whose oldest unanswered ping is `UNRESPONSIVE_TIMEOUT_MS` old out of the election. */
    checkResponsive(conn) {
        const since = conn.pingUnansweredSince;
        if (conn.unresponsive || since === null)
            return;
        if (this.now() - since < UNRESPONSIVE_TIMEOUT_MS)
            return;
        conn.unresponsive = true;
        this.logger.warn('relay leg unresponsive, out of the media election', {
            connectionId: conn.id,
            elected: this.isElected(conn)
        });
    }
    onPong(conn) {
        conn.pingUnansweredSince = null;
        if (!conn.unresponsive)
            return;
        conn.unresponsive = false;
        this.logger.debug('relay leg answering again, back in the media election', {
            connectionId: conn.id
        });
    }
    /** Moves the keepalive of `legs` to the cadence of an accepted call; later legs start on it. */
    setMediaFlowing(legs) {
        if (this.pingIntervalMs === PING_INTERVAL_MS)
            return;
        this.pingIntervalMs = PING_INTERVAL_MS;
        for (const conn of legs) {
            if (this.timers.has(conn.id))
                this.start(conn);
        }
    }
    stop(connectionId) {
        const timer = this.timers.get(connectionId);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(connectionId);
        }
    }
    stopAll() {
        for (const [id] of this.timers) {
            this.stop(id);
        }
    }
    /** Back to the cadence of a call that sets up. */
    reset() {
        this.pingIntervalMs = PING_SETUP_INTERVAL_MS;
    }
}
