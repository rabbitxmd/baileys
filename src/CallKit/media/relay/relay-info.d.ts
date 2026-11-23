import type { WaMediaCrypto } from '../crypto/primitives.js';
/**
 * The port a web client's relay media rides on, unless the advertised one is dialled. A mobile
 * primary's legs open here, a companion's on the advertised one; see `RelayInfo.fallbackPort`.
 */
export declare const TRUE_WEB_CLIENT_RELAY_PORT = 3480;
export interface RelayInfo {
    id: string;
    ip: string;
    port: number;
    token: string;
    authToken?: string;
    rawAuthToken?: Uint8Array;
    rawToken?: Uint8Array;
    key: string;
    relayId: number;
    name?: string;
    authTokenId?: string;
    /**
     * The other of the web client port and the advertised one, tried once if the relay never
     * answers on `port`: which of the two answers follows the account class the server assigns.
     */
    fallbackPort?: number;
    /** `'raw-udp'` when this leg rides raw UDP; absent, it rides WebRTC. */
    transport?: 'raw-udp';
}
/** A relay as the call hands it over, before its leg id and fallback port are set. */
export type RelayEndpoint = Omit<RelayInfo, 'id' | 'fallbackPort'> & {
    /** The port the relay advertised, before the WebRTC rewrite; raw legs dial it. */
    originalPort?: number;
};
export declare function makeConnectionId(ip: string, port: number, authTokenId?: string): string;
/** The address part of a relay key, without its auth token id. */
export declare function relayAddressOf(relayKey: string): string;
/**
 * Whether a leg to the same address can take `next`'s credentials without a new socket. A raw
 * leg always can; a WebRTC leg keeps its connection through a rotated auth token, but not
 * through a new relay key or auth token id.
 */
export declare function canReregisterInPlace(held: RelayInfo, next: RelayInfo): boolean;
/** A short one-way fingerprint that tells two credentials apart without showing either. */
export declare function credentialFingerprint(crypto: WaMediaCrypto, credential: string): string;
/**
 * Turns a batch into the relays to dial: raw UDP where `rawUdpLegs` puts it and the host can
 * dial it, else WebRTC on the web client port. A relay that needs raw UDP from a host without
 * it is named in `undialable` instead.
 */
export declare function planRelayInfos(relays: readonly RelayEndpoint[], rawUdpLegs: 'all' | 'required', canDialRaw: boolean): {
    readonly infos: RelayInfo[];
    readonly undialable: string[];
};
