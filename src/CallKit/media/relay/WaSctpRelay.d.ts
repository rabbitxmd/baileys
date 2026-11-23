import type { WaMediaCrypto } from '../crypto/primitives.js';
import { type Logger } from '../logger.js';
import { type RawUdpLeg, type RawUdpLegOptions } from './leg.js';
import { type RelayEndpoint } from './relay-info.js';
import type { StreamLayerSsrcs } from './stun-subscriptions.js';
export interface WaSctpRelayOptions {
    readonly logger?: Logger;
    /** The host's primitives, for the MESSAGE-INTEGRITY of every STUN message a leg sends. */
    readonly crypto: WaMediaCrypto;
    /** Builds the peer connection of each WebRTC leg, so the host picks the implementation. */
    readonly createPeerConnection: (configuration: RTCConfiguration) => Promise<RTCPeerConnection>;
    /** Builds a raw UDP leg; which legs ride one is {@link rawUdpLegs}. */
    readonly createRawUdpLeg?: (options: RawUdpLegOptions) => RawUdpLeg;
    /**
     * With `createRawUdpLeg`, `'all'` (the default) dials every leg over raw UDP and `'required'`
     * only the relays configured with `transport: 'raw-udp'`, leaving the rest on WebRTC.
     */
    readonly rawUdpLegs?: 'all' | 'required';
    /** A leg opened and is carrying traffic. */
    readonly onConnected?: () => void;
    /** The call has no leg left, open or dialling; see `announceLastLegLost`. */
    readonly onLost?: (reason: string) => void;
    /**
     * A relay answered for the first time, once per relay name. `rttMs` runs from the first
     * allocate of the leg it answered on, when one went out.
     */
    readonly onRelayAnswered?: (name: string, rttMs?: number) => void;
    /**
     * A packet arrived from a relay, STUN and media alike, before any parsing. `connectionId`
     * names the leg, for {@link WaSctpRelay.notePeerMedia}.
     */
    readonly onReceive?: (data: Uint8Array, connectionId: string) => void;
    /** Monotonic time source, in ms; `performance.now()` by default. */
    readonly now?: () => number;
}
export declare class WaSctpRelay {
    private readonly logger;
    private readonly crypto;
    private readonly createRawUdpLeg;
    private readonly rawUdpLegs;
    private readonly onConnected;
    private readonly onLost;
    private readonly onRelayAnswered;
    private readonly onReceive;
    private readonly now;
    private readonly traceEnabled;
    private readonly registration;
    private readonly keepalive;
    private readonly dialer;
    private readonly watchdog;
    private readonly election;
    private readonly connections;
    private readonly answeredRelayNames;
    /** The relays of the newest generation, by relay key; older ones leave it when it advances. */
    private relayMap;
    /** Whether the call was accepted; see {@link setMediaFlowing}. */
    private mediaFlowing;
    private stats;
    private readonly traffic;
    constructor(options: WaSctpRelayOptions);
    setSsrc(ssrc: number): void;
    setSubscriptionSsrc(ssrc: number): void;
    setStreamSsrcs(selfSsrcs: number[], peerSsrcs: number[]): void;
    setParticipantIds(selfPid?: number, peerPid?: number): void;
    /**
     * Sets the streams this side sends, in which case every allocate carries the self-only
     * layered descriptor instead of the 1:1 SSRC list; `null` goes back to the 1:1 list. A change
     * is re-announced on the open legs.
     */
    setSelfLayers(layers: readonly StreamLayerSsrcs[] | null): void;
    /**
     * Sets the `0x4021` video subscription every allocate carries (see `buildRxSubscriptions`);
     * `null` or empty leaves it out. A change is re-announced on the open legs.
     */
    setRxSubscriptions(bytes: Uint8Array | null): void;
    resendSubscriptions(): void;
    /**
     * Puts a leg in `connections` as `Connecting` before anything is dialled, so
     * `announceLastLegLost` sees a whole batch before any leg of it can fail.
     */
    private registerConnection;
    /** Dials a leg that is already registered, over the configured transport. */
    private startConnection;
    /**
     * Fails a leg: closes what it holds and takes it out of the call if still held. A stale leg
     * whose id a redial reused only releases its own resources.
     */
    private failConnection;
    /** Fails `conn`, which redials it on the other port, if `afterMs` from now it is still in the call and `waiting()`. */
    private armPortFallback;
    /** Armed when a leg opens, since its registration burst starts there. */
    private armAnswerFallback;
    /** Registers, once, a redial on the other port of a leg the relay never answered. */
    private registerOnFallbackPort;
    /**
     * A leg of an older generation at `relayKey`'s address under another auth token id, which
     * a newer generation re-issued; `null` when there is none or the batch still names it.
     */
    private olderLegAtSameAddress;
    /** The leg of the configured relay `relayKey`, on either port, if it has one. */
    private legFor;
    /** Gives back the connected count a leg took on open; every way out of `Open` passes here. */
    private releaseConnected;
    /**
     * Whether any leg is open or still dialling; a dialling leg fails on its own after
     * `CONNECTION_TIMEOUT`, so it counts only that long.
     */
    private hasLiveLeg;
    /**
     * Tells the owner the call has no leg left, open or dialling. `cleanup` empties
     * `connections` before closing anything, so a teardown never lands here.
     */
    private announceLastLegLost;
    /**
     * Marks a leg open and registers it, then starts its keepalive and announces it; the
     * announcement starts the uplink, which is what makes the relay forward anything back.
     */
    private onLegOpen;
    /** Moves every leg's keepalive to the cadence of an accepted call; later legs start on it. */
    setMediaFlowing(): void;
    /** Closes a leg the call still holds; an old leg under a reused id is not this one. */
    private closeConnection;
    private sendToChannel;
    private handleRelayMessage;
    private handleStun;
    /**
     * Registers relays and dials each one with no leg. A `generation` above the current one
     * (absent: the current one, 0 at first) moves the call onto this batch: it is dialled even
     * with legs open and media is elected among its legs while one is open. Older legs stay up
     * until a leg of the batch hears authenticated peer media, then each is closed for good once
     * it hears none; until then the peer is followed back to them if only they hear it. A batch
     * below the current generation is stale and ignored.
     */
    configureRelays(relays: RelayEndpoint[], options?: {
        readonly generation?: number;
    }): Promise<void>;
    /**
     * Moves a leg onto a newer generation's credentials for the same address and registers it
     * again over the same socket or data channel, keeping its 5-tuple, counters and return path.
     */
    private reregisterInPlace;
    /**
     * Takes a leg out of the call without announcing a loss or redialling it: its keepalive,
     * registration replays and dial stop, and its socket or peer connection closes.
     */
    private endLegQuietly;
    /**
     * Sends on the one leg elected for media and reports whether it took it; with no leg open
     * nothing goes out. Allocates and keepalives keep reaching every leg, so any can take over.
     */
    sendMedia(data: ArrayBuffer): boolean;
    private stalledWebRtcLegs;
    private reallocateStalledLegs;
    /** Redials the newest generation's WebRTC legs on new peer connections; whether any was. */
    private redialStalledLegs;
    /**
     * Records that the peer's media authenticated on a leg, and follows the peer there: when
     * our media leg has not heard the peer for `RX_ELECTION_HOLD_MS`, this leg takes it over.
     * A leg of the newest generation takes over a leg of an older one at once; an older leg
     * takes over a newest one only once the newest carried our media that long unheard.
     */
    notePeerMedia(connectionId: string): void;
    /**
     * Sends to every open connection and reports whether any of them took it. Not for media:
     * the peer's SRTP replay window is per SSRC, so every copy past the first is dropped.
     */
    broadcast(data: ArrayBuffer): boolean;
    hasConnection(): boolean;
    getConnectedCount(): number;
    cleanup(): void;
}
