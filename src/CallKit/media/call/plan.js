/**
 * The endpoints the plane dials: UDP only (protocol 0), the first per advertised
 * `ip:port`, and of those only the ones carrying a key and a raw token.
 */
export function dialableRelayEndpoints(endpoints) {
    const seen = new Set();
    const dialable = [];
    for (const ep of endpoints) {
        if ((ep.protocol ?? 0) !== 0)
            continue;
        const key = `${ep.ip}:${ep.port}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        if (ep.key && ep.rawToken)
            dialable.push(ep);
    }
    return dialable;
}
/** Video quality a subscription asks for. */
export const WA_VIDEO_QUALITY = Object.freeze({
    Default: 0,
    Low: 1,
    Medium: 2,
    High: 3,
    Hd: 4
});
