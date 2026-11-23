import type { WaMediaCrypto } from '../crypto/primitives.js';
/**
 * Creates the 12-byte transaction id of a relay connection: stable per connection, not per
 * message, as the official client does. It also keys the IPv6 `XOR-RELAYED-ADDRESS`.
 */
export declare function createStunTransactionId(): Uint8Array;
/**
 * Builds the relay ALLOCATE, without which the relay forwards no media. It authenticates with the
 * raw token in 0x4000 and MESSAGE-INTEGRITY keyed with `hmacKey`; a `USERNAME` is answered 456.
 * `transactionId` is the connection's; `rxSubscriptions` goes between credential and SSRC list.
 */
export declare function buildAllocateForRelay(crypto: WaMediaCrypto, relayCredential: Uint8Array, ssrcList: Uint8Array, hmacKey: Uint8Array, relayIp?: string, relayPort?: number, transactionId?: Uint8Array, rxSubscriptions?: Uint8Array | null): Uint8Array;
/**
 * Builds an ICE binding request: `username` is `remote-ufrag:local-ufrag`, `hmacKey` the ice-pwd,
 * and `senderSubscriptions` rides in 0x4000. `transactionId` is the connection's.
 */
export declare function buildBindingRequestWithSubs(crypto: WaMediaCrypto, username: Uint8Array | undefined, hmacKey: Uint8Array | undefined, senderSubscriptions: Uint8Array | undefined, includeIceControlling: boolean, includeFingerprint: boolean, transactionId?: Uint8Array): Uint8Array;
/** Builds the bare 0x0801 keepalive the relay answers with a 0x0802 pong. */
export declare function buildWhatsAppPing(transactionId?: Uint8Array): Uint8Array;
/**
 * Whether a datagram is STUN control. Decided by the magic cookie, or the cookieless ping and
 * pong types; a WARP frame shares STUN's clear high bits and is never STUN, whatever its bytes.
 */
export declare function isStunPacket(data: Uint8Array): boolean;
/** Whether a datagram is the relay's 0x0802 pong, as {@link parseStunResponse} reads one. */
export declare function isWaPong(data: Uint8Array): boolean;
export declare function isRtpPacket(data: Uint8Array): boolean;
/** RTCP/SRTCP keeps the RTCP header clear, so it can be demultiplexed before SRTP. */
export declare function isRtcpPacket(data: Uint8Array): boolean;
export interface StunResponseInfo {
    rawType: number;
    method: string;
    stunClass: string;
    isSuccess: boolean;
    isError: boolean;
    errorCode?: number;
    errorReason?: string;
    transactionId: string;
    length: number;
    attributes: StunAttribute[];
}
interface StunAttribute {
    type: number;
    typeName: string;
    length: number;
    data: Uint8Array;
}
export declare function parseStunResponse(data: Uint8Array): StunResponseInfo | null;
export declare function formatStunResponse(info: StunResponseInfo): string;
export declare function classifyPacket(data: Uint8Array): string;
export {};
