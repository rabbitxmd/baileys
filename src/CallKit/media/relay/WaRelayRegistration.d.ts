import type { WaMediaCrypto } from '../crypto/primitives.js';
import type { Logger } from '../logger.js';
import { type Connection } from './leg.js';
import { type StreamLayerSsrcs } from './stun-subscriptions.js';
/**
 * When a leg replays its registration, in ms from the moment it opened. Not a retry on
 * failure: nothing waits for an answer, the replays cover the relay's own setup and lost datagrams.
 */
export declare const REGISTRATION_RETRY_DELAYS_MS: number[];
export interface WaRelayRegistrationOptions {
    readonly crypto: WaMediaCrypto;
    readonly logger: Logger;
    readonly now: () => number;
    /** Hands a datagram to a leg; whether it went out. */
    readonly send: (conn: Connection, data: ArrayBuffer) => boolean;
}
/**
 * The SSRC and subscription state every allocate carries, and the registration of each leg:
 * its allocate (cached while its inputs hold), its binding requests and the replay ladder.
 */
export declare class WaRelayRegistration {
    private readonly crypto;
    private readonly logger;
    private readonly now;
    private readonly send;
    /** The attribute layout of each leg's last allocate, logged when it changes. */
    private readonly allocateLayouts;
    private audioSsrc;
    private subscriptionSsrc;
    private selfStreamSsrcs;
    private peerStreamSsrcs;
    private selfPid;
    private peerPid;
    /** Set, allocates carry the layered descriptor of these streams; see {@link setSelfLayers}. */
    private selfLayers;
    /** Set, allocates carry this `0x4021`; see {@link setRxSubscriptions}. */
    private rxSubscriptions;
    /** Bumped whenever an input of the allocate's SSRC attributes changes. */
    private allocateEpoch;
    constructor(options: WaRelayRegistrationOptions);
    setSsrc(ssrc: number): void;
    setSubscriptionSsrc(ssrc: number): void;
    setStreamSsrcs(selfSsrcs: number[], peerSsrcs: number[]): void;
    /** Whether the ids changed to two known ones, which the open legs must hear. */
    setParticipantIds(selfPid?: number, peerPid?: number): boolean;
    /** Whether the layers changed; see `WaSctpRelay.setSelfLayers`. */
    setSelfLayers(layers: readonly StreamLayerSsrcs[] | null): boolean;
    /** Whether the subscription changed; see `WaSctpRelay.setRxSubscriptions`. */
    setRxSubscriptions(bytes: Uint8Array | null): boolean;
    /** Forgets the call's SSRC state; allocates cached before it are rebuilt. */
    reset(): void;
    /**
     * Emits a raw leg's ALLOCATE, its only STUN message besides the ping; the relay pairs the
     * call's ends off the token inside it. Returns whether one went out.
     */
    sendRawAllocate(conn: Connection, label: string): boolean;
    /**
     * Sends the leg's allocate, rebuilt only when its credentials or SSRC state changed, and
     * stamps the first send. The layout is noted when the bytes are new.
     */
    private sendAllocate;
    /** Runs `send` at each delay of the registration ladder, on unreferenced timers. */
    private scheduleRegistrationReplays;
    /** Sends a raw leg's allocate and the replays of its registration ladder. */
    registerRawLeg(conn: Connection, label: string): void;
    /**
     * Builds the `0x4024` an allocate carries: the layered descriptor once self layers are set,
     * else the 1:1 list, falling back to the single inbound and outbound SSRCs when the
     * per-stream lists have not been handed over yet.
     */
    private buildAllocateSsrcList;
    /** Runs a WebRTC leg's registration ladder; each send reads the leg's current credentials. */
    sendStunAllocateOnOpen(conn: Connection): void;
    /** Logs an allocate's attribute types and lengths, never values, when its layout changes. */
    private noteAllocateLayout;
}
