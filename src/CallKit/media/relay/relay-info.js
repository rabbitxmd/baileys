import { bytesToHex, TEXT_ENCODER } from '../bytes.js';
/**
 * The port a web client's relay media rides on, unless the advertised one is dialled. A mobile
 * primary's legs open here, a companion's on the advertised one; see `RelayInfo.fallbackPort`.
 */
export const TRUE_WEB_CLIENT_RELAY_PORT = 3480;
export function makeConnectionId(ip, port, authTokenId) {
    const base = ip.includes(':') ? `[${ip}]:${port}` : `${ip}:${port}`;
    return authTokenId ? `${base}#${authTokenId}` : base;
}
/** The address part of a relay key, without its auth token id. */
export function relayAddressOf(relayKey) {
    const hash = relayKey.indexOf('#');
    return hash < 0 ? relayKey : relayKey.slice(0, hash);
}
/**
 * Whether a leg to the same address can take `next`'s credentials without a new socket. A raw
 * leg always can; a WebRTC leg keeps its connection through a rotated auth token, but not
 * through a new relay key or auth token id.
 */
export function canReregisterInPlace(held, next) {
    if (held.transport !== next.transport)
        return false;
    if (held.transport === 'raw-udp')
        return true;
    return held.key === next.key && held.authTokenId === next.authTokenId;
}
/** Keys the one-way credential fingerprints logs carry instead of the credentials. */
const CREDENTIAL_FINGERPRINT_KEY = TEXT_ENCODER.encode('relay-credential-fingerprint');
/** A short one-way fingerprint that tells two credentials apart without showing either. */
export function credentialFingerprint(crypto, credential) {
    const digest = crypto.hmacSha1(CREDENTIAL_FINGERPRINT_KEY, TEXT_ENCODER.encode(credential));
    return bytesToHex(digest.subarray(0, 4));
}
/**
 * Turns a batch into the relays to dial: raw UDP where `rawUdpLegs` puts it and the host can
 * dial it, else WebRTC on the web client port. A relay that needs raw UDP from a host without
 * it is named in `undialable` instead.
 */
export function planRelayInfos(relays, rawUdpLegs, canDialRaw) {
    const infos = [];
    const undialable = [];
    for (const relay of relays) {
        const rawUdp = relay.transport === 'raw-udp' || rawUdpLegs === 'all';
        if (relay.transport === 'raw-udp' && !canDialRaw) {
            undialable.push(relay.name || relay.ip);
            continue;
        }
        const transport = rawUdp && canDialRaw ? 'raw-udp' : undefined;
        const webClientPort = relay.port || TRUE_WEB_CLIENT_RELAY_PORT;
        // Only WebRTC legs move to the web client port; a raw leg keeps the advertised one.
        const port = transport ? (relay.originalPort ?? webClientPort) : webClientPort;
        const connectionId = makeConnectionId(relay.ip, port, relay.authTokenId);
        const otherPort = port === TRUE_WEB_CLIENT_RELAY_PORT ? relay.originalPort : TRUE_WEB_CLIENT_RELAY_PORT;
        infos.push({
            id: connectionId,
            ip: relay.ip,
            port,
            token: relay.token,
            authToken: relay.authToken,
            rawAuthToken: relay.rawAuthToken,
            rawToken: relay.rawToken,
            key: relay.key,
            relayId: relay.relayId,
            name: relay.name || 'unknown',
            authTokenId: relay.authTokenId,
            fallbackPort: otherPort !== port ? otherPort : undefined,
            transport
        });
    }
    return { infos, undialable };
}
