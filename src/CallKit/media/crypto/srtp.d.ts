import { RtpPacket } from '../media/rtp.js';
import { type SrtpKeyingMaterial } from '../types.js';
import type { WaMediaCrypto } from './primitives.js';
/**
 * Default upper bound on the number of per-SSRC receive contexts an {@link SrtpSession}
 * or {@link SrtcpSession} keeps at once. Past this bound, the oldest tracked
 * SSRC is evicted to admit a new one. Each session counts on its own and can be
 * resized with `setMaxRecvContexts`.
 */
export declare const SRTP_MAX_RECV_CONTEXTS = 32;
/**
 * SRTCP authentication tag length in bytes. WhatsApp truncates the RTP tag to 4
 * bytes but keeps the full HMAC-SHA1_80 tag on RTCP: a 4-byte tag here makes the
 * peer drop every control packet we emit, key-frame requests included.
 */
export declare const SRTCP_AUTH_TAG_LEN = 10;
/** RFC 3711 sliding replay window over the 64 indices below the highest, as two 32-bit words. */
export declare class ReplayWindow {
    private initialized;
    private highest;
    /** Offsets 0-31 below `highest`. */
    private low;
    /** Offsets 32-63 below `highest`. */
    private high;
    has(index: number): boolean;
    /** Records an authenticated `index`; returns whether it became the highest. */
    add(index: number): boolean;
}
export declare class SrtpContext {
    private readonly crypto;
    private readonly keys;
    private readonly authTagLen;
    private readonly replay;
    private roc;
    private lastSeq;
    private initialized;
    private readonly ivBuffer;
    private readonly rocBuffer;
    constructor(crypto: WaMediaCrypto, keying: SrtpKeyingMaterial, authTagLen?: number);
    protect(packet: RtpPacket): Uint8Array;
    /**
     * Verifies and decrypts `data`; `null` for a replayed or duplicate packet.
     * @throws {SrtpError} `packet_too_short` or `auth_failed`
     */
    unprotect(data: Uint8Array): RtpPacket | null;
    private updateRoc;
    private estimateRoc;
    /** RFC 3711 4.1.1: salt XOR SSRC XOR the 48-bit index `roc || seq`. */
    private generateIv;
    private computeAuthTag;
}
export declare class SrtpSession {
    private readonly crypto;
    private readonly sendKey;
    private readonly recvKey;
    private readonly sendAuthLen?;
    private readonly recvAuthLen?;
    private readonly sendContexts;
    private readonly recvContexts;
    /** The material each entry of `recvContexts` was built from, under the same key. */
    private readonly recvKeyings;
    private maxRecv;
    constructor(crypto: WaMediaCrypto, sendKey: SrtpKeyingMaterial, recvKey: SrtpKeyingMaterial, sendAuthLen?: number, recvAuthLen?: number);
    protect(packet: RtpPacket): Uint8Array;
    /**
     * Verifies and decrypts `data` in the context of its SSRC; `null` for a replayed or
     * duplicate packet. A new SSRC is admitted only once it authenticates.
     * @throws {SrtpError} `packet_too_short` or `auth_failed`
     */
    unprotect(data: Uint8Array): RtpPacket | null;
    /**
     * Keys the receive context of `ssrc` with `keying` instead of the session's own receive key.
     * The same material again keeps the context, its ROC and replay window; other material
     * replaces it. Returns whether a new context was installed.
     */
    setRecvKeying(ssrc: number, keying: SrtpKeyingMaterial): boolean;
    /** Drops the receive context of `ssrc`; a later packet on it is keyed lazily again. */
    deleteRecvContext(ssrc: number): boolean;
    get recvContextCount(): number;
    get maxRecvContexts(): number;
    /** Resizes the receive-context bound; shrinking evicts the oldest contexts past it. */
    setMaxRecvContexts(max: number): void;
    private admitRecvContext;
}
export declare class SrtcpContext {
    private readonly crypto;
    private readonly keys;
    private readonly authTagLen;
    private readonly replay;
    private index;
    private readonly ivBuffer;
    constructor(crypto: WaMediaCrypto, keying: SrtpKeyingMaterial, authTagLen?: number);
    protect(rtcp: Uint8Array, senderSsrc: number): Uint8Array;
    /**
     * Verifies the tag and returns the RTCP packet in the clear; `null` for a replayed or
     * duplicate packet, judged on the 31-bit SRTCP index.
     * @throws {SrtpError} `packet_too_short` or `auth_failed`
     */
    unprotect(data: Uint8Array): Uint8Array | null;
    private generateIv;
}
/**
 * Dispatches incoming SRTCP to one {@link SrtcpContext} per sender SSRC (bytes 4-7): each of
 * the peer's streams runs its own SRTCP index, so each needs its own replay window.
 */
export declare class SrtcpSession {
    private readonly crypto;
    private readonly keying;
    private readonly authTagLen;
    private readonly contexts;
    /** The material each entry of `contexts` was built from, under the same key. */
    private readonly keyings;
    private maxRecv;
    constructor(crypto: WaMediaCrypto, keying: SrtpKeyingMaterial, authTagLen?: number);
    /**
     * Verifies and decrypts an incoming SRTCP packet; `null` for a replayed or duplicate one.
     * A new SSRC is cached only once it authenticates, so a forged one cannot evict a stream.
     * @throws {SrtpError} `packet_too_short` or `auth_failed`
     */
    unprotect(data: Uint8Array): Uint8Array | null;
    /**
     * Keys the context of sender `ssrc` with `keying` instead of the session's own. The same
     * material again keeps the context and its replay window; other material replaces it.
     * Returns whether a new context was installed.
     */
    setRecvKeying(ssrc: number, keying: SrtpKeyingMaterial): boolean;
    /** Drops the context of sender `ssrc`; a later packet on it is keyed lazily again. */
    deleteRecvContext(ssrc: number): boolean;
    get recvContextCount(): number;
    get maxRecvContexts(): number;
    /** Resizes the context bound; shrinking evicts the oldest contexts past it. */
    setMaxRecvContexts(max: number): void;
    private admitContext;
}
/** RFC 3711 key derivation with a key derivation rate of zero. */
export declare function deriveSrtpSessionKey(crypto: WaMediaCrypto, masterKey: Uint8Array, masterSalt: Uint8Array, label: number, length: number): Uint8Array;
export declare class SrtpError extends Error {
    type: 'packet_too_short' | 'auth_failed';
    constructor(type: SrtpError['type'], message: string);
}
