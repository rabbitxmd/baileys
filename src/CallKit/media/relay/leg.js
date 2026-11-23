import { toError } from '../errors.js';
import { createStunTransactionId } from './stun.js';
export function closeQuietly(closeable, logger) {
    try {
        closeable?.close();
    }
    catch (err) {
        logger.trace('close failed', { message: toError(err).message });
    }
}
export var ConnectionState;
(function (ConnectionState) {
    ConnectionState["None"] = "None";
    ConnectionState["Connecting"] = "Connecting";
    ConnectionState["Open"] = "Open";
    ConnectionState["Closed"] = "Closed";
    ConnectionState["Failed"] = "Failed";
})(ConnectionState || (ConnectionState = {}));
/** A leg `Connecting` to `relayInfo` that holds nothing yet. */
export function createLeg(relayInfo, generation, id) {
    return {
        state: ConnectionState.Connecting,
        peerConnection: null,
        channel: null,
        rawLeg: null,
        incomingChannels: [],
        id,
        relayInfo,
        connectionTimeout: null,
        iceDisconnectTimers: new Set(),
        abortDial: null,
        hasReceivedFirstPacket: false,
        allocateSentAt: null,
        peerMediaAt: null,
        pingUnansweredSince: null,
        unresponsive: false,
        localUfrag: '',
        stunTransactionId: createStunTransactionId(),
        generation,
        stats: { sentPackets: 0, receivedPackets: 0, sentBytes: 0, receivedBytes: 0 }
    };
}
/** Whether a leg is `Open` and its socket or data channel can carry a datagram. */
export function isLegOpen(conn) {
    if (conn.state !== ConnectionState.Open)
        return false;
    if (conn.rawLeg)
        return conn.rawLeg.isOpen;
    return conn.channel?.readyState === 'open';
}
/**
 * Ends a leg's dial and timers and closes what it holds; `closeChannel` is false when its
 * data channel is what closed.
 */
export function releaseLeg(conn, closeChannel, logger) {
    conn.abortDial?.();
    if (conn.connectionTimeout)
        clearTimeout(conn.connectionTimeout);
    for (const timer of conn.iceDisconnectTimers)
        clearTimeout(timer);
    conn.iceDisconnectTimers.clear();
    if (closeChannel)
        closeQuietly(conn.channel, logger);
    const incoming = conn.incomingChannels;
    conn.incomingChannels = [];
    for (const ch of incoming)
        closeQuietly(ch, logger);
    closeQuietly(conn.peerConnection, logger);
    closeQuietly(conn.rawLeg, logger);
}
