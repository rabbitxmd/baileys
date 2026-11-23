// Derived from zapo-js (MIT, (c) vinikjkkj): src/protocol/{jid,defaults,message}.ts
// Only the JID helpers and constants the VoIP code uses.
export const WA_DEFAULTS = Object.freeze({
    HOST_DOMAIN: 's.whatsapp.net',
    GROUP_SERVER: 'g.us',
    BROADCAST_SERVER: 'broadcast',
    LID_SERVER: 'lid',
    HOSTED_SERVER: 'hosted',
    HOSTED_LID_SERVER: 'hosted.lid'
});
export const WA_MESSAGE_TAGS = Object.freeze({
    RECEIPT: 'receipt',
    ACK: 'ack'
});
function findAtIndex(jid) {
    const atIndex = jid.indexOf('@');
    if (atIndex < 1 || atIndex >= jid.length - 1)
        throw new Error(`invalid jid: ${jid}`);
    return atIndex;
}
/** `{ user, server, device }` of a JID; `device` is `0` without a `:device` segment. */
export function parseSignalAddressFromJid(jid) {
    const atIndex = findAtIndex(jid);
    const colonIndex = jid.indexOf(':', 0);
    const server = jid.slice(atIndex + 1);
    if (colonIndex === -1 || colonIndex > atIndex) {
        return { user: jid.slice(0, atIndex), server, device: 0 };
    }
    if (colonIndex >= atIndex - 1)
        throw new Error(`invalid jid device: ${jid}`);
    let device = 0;
    for (let i = colonIndex + 1; i < atIndex; i += 1) {
        const digit = jid.charCodeAt(i) - 48;
        if (digit < 0 || digit > 9)
            throw new Error(`invalid jid device: ${jid}`);
        device = device * 10 + digit;
        if (device > Number.MAX_SAFE_INTEGER)
            throw new Error(`invalid jid device: ${jid}`);
    }
    return { user: jid.slice(0, colonIndex), server, device };
}
/** Maps the hosted server variants back to their canonical Signal server. */
export function canonicalizeSignalServer(server, hostDomain = WA_DEFAULTS.HOST_DOMAIN) {
    if (server === WA_DEFAULTS.HOSTED_SERVER)
        return hostDomain;
    if (server === WA_DEFAULTS.HOSTED_LID_SERVER)
        return WA_DEFAULTS.LID_SERVER;
    return server;
}
/** Bare `user@server`; `canonicalizeSignalServer` also rewrites hosted servers. */
export function toUserJid(jid, options = {}) {
    const address = parseSignalAddressFromJid(jid);
    const server = options.canonicalizeSignalServer
        ? canonicalizeSignalServer(address.server, options.hostDomain ?? WA_DEFAULTS.HOST_DOMAIN)
        : address.server;
    return `${address.user}@${server}`;
}
/** Full device form: `user:device@server`, or `user@server` for device 0. */
export function normalizeDeviceJid(jid) {
    const address = parseSignalAddressFromJid(jid);
    if (address.device === 0)
        return `${address.user}@${address.server}`;
    return `${address.user}:${address.device}@${address.server}`;
}
export function isLidJid(jid) {
    const atIndex = jid.lastIndexOf('@');
    return atIndex > 0 && jid.slice(atIndex + 1) === WA_DEFAULTS.LID_SERVER;
}
/** Inverse of {@link parseSignalAddressFromJid}. */
export function signalAddressToJid(address) {
    return address.device === 0
        ? `${address.user}@${address.server}`
        : `${address.user}:${address.device}@${address.server}`;
}
