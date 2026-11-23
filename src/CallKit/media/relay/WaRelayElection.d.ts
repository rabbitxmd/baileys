import type { Logger } from '../logger.js';
import { type Connection } from './leg.js';
export interface WaRelayElectionOptions {
    /** The call's legs, in dial order. */
    readonly legs: ReadonlyMap<string, Connection>;
    readonly logger: Logger;
    readonly now: () => number;
    /** Takes an older leg out of the call, with no loss announced and no redial. */
    readonly retire: (conn: Connection) => void;
}
/**
 * Tracks the relay generations and elects the one leg media goes out on: the newest
 * generation's while one of its legs is open, following the peer, and older generations retired
 * once the newest is proved.
 */
export declare class WaRelayElection {
    private readonly legs;
    private readonly logger;
    private readonly now;
    private readonly retire;
    /** The newest relay generation; media is elected among its legs while one is open. */
    private newestGeneration;
    /** The newest generation proved below this one; see {@link retireOlderGenerations}. */
    private retiredBelow;
    /** Whether older legs hearing the peer outlived the proof; see {@link retireQuietOlderLegs}. */
    private olderLegsHearing;
    /**
     * When media first went out on a leg of the newest generation before any of its legs heard
     * the peer; `RX_ELECTION_HOLD_MS` after it, the peer is followed back to an older leg.
     */
    private newestSendingSince;
    /** The scope of the last election, logged when it changes. */
    private electionScope;
    /** The one leg media goes out on; see {@link elect}. */
    private mediaLeg;
    constructor(options: WaRelayElectionOptions);
    /** The newest relay generation; media is elected among its legs while one is open. */
    get generation(): number;
    isElected(conn: Connection): boolean;
    /** Moves the call onto a newer generation, whose legs have yet to send or hear anything. */
    advance(generation: number): void;
    /** Notes media that went out on `leg`, the leg {@link elect} returned. */
    noteSent(leg: Connection): void;
    /**
     * Follows the peer to `conn`, whose peer media just authenticated at `now`: when our media
     * leg has not heard the peer for `RX_ELECTION_HOLD_MS`, this leg takes it over. A leg of the
     * newest generation takes over a leg of an older one at once; an older leg takes over a
     * newest one only once {@link followsPeerToOlder}.
     */
    notePeerMedia(conn: Connection, now: number): void;
    /**
     * Proves the newest generation once `conn`, an open leg of it, heard authenticated peer media
     * (an answered allocate is no proof), and retires the older legs not hearing the peer.
     */
    private retireOlderGenerations;
    /**
     * Closes each older leg that has not heard authenticated peer media for `OLDER_LEG_QUIET_MS`;
     * one still hearing a sender stays, receive-only, until it goes quiet.
     */
    private retireQuietOlderLegs;
    /** Whether a leg of the newest generation heard the peer, or there is no older one. */
    private newestProved;
    /**
     * Whether the peer is followed back to an older generation: the newest one carried our media
     * for `RX_ELECTION_HOLD_MS` and none of its legs heard the peer.
     */
    private followsPeerToOlder;
    private isElectable;
    private hasOpenLegOf;
    /**
     * Keeps the leg in use while it is open and answering pings, since the peer's stream
     * returns where our media leaves. Else the first such leg in dial order, off the dropped
     * leg's relay, which never re-points; with none answering, any open leg. While a leg of
     * the newest generation is open, only those legs are candidates.
     */
    elect(): Connection | null;
    /**
     * Logs where media is elected once a newer generation exists, on change only: its legs,
     * an older leg while they still dial, or an older leg because none of them is left (never
     * once the older legs were retired).
     */
    private noteElectionScope;
    reset(): void;
}
