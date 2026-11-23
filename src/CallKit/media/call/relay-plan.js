import { TRUE_WEB_CLIENT_RELAY_PORT } from '../relay/relay-info.js';
import { dialableRelayEndpoints } from './plan.js';
/** Whether two SSRC lists are the same, order included: the order is what the relay gets. */
export function sameSsrcs(left, right) {
    if (left.length !== right.length)
        return false;
    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i])
            return false;
    }
    return true;
}
/** `base` followed by whatever of `extra` it lacks, in order. */
export function unionInOrder(base, extra) {
    const merged = [...base];
    for (const ssrc of extra) {
        if (!merged.includes(ssrc))
            merged.push(ssrc);
    }
    return merged;
}
/** The plan's dialable relays as the relay is told them, on the web client's port unless asked. */
export function toRelayConfigs(endpoints, useOriginalRelayPort) {
    return dialableRelayEndpoints(endpoints).map((ep) => {
        const port = useOriginalRelayPort ? ep.port : TRUE_WEB_CLIENT_RELAY_PORT;
        return {
            ip: ep.ip,
            port,
            token: ep.token,
            authToken: ep.authToken,
            rawAuthToken: ep.rawAuthToken,
            rawToken: ep.rawToken,
            key: ep.key,
            relayId: ep.relayId,
            name: ep.name || `${ep.ip}:${port}`,
            authTokenId: ep.authTokenId,
            originalPort: ep.port,
            transport: ep.transport
        };
    });
}
/** The video asked of each sender, by the sender's pid; a sender without one yet is left out. */
export function rxVideoSubscriptionInfos(senders, wanted) {
    const pids = new Map();
    for (const sender of senders) {
        if (sender.pid !== undefined)
            pids.set(sender.id, sender.pid);
    }
    const infos = [];
    for (const subscription of wanted) {
        const pid = pids.get(subscription.senderId);
        if (pid !== undefined)
            infos.push({ pid, quality: subscription.quality });
    }
    return infos;
}
