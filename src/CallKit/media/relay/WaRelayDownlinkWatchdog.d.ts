/** Redials of stalled WebRTC legs per call. */
export declare const DOWNLINK_MAX_REDIALS = 3;
export interface WaRelayDownlinkWatchdogOptions {
    readonly now: () => number;
    /** Re-allocates the open WebRTC legs on their connections. */
    readonly reallocate: (stalledMs: number) => void;
    /** Redials the newest WebRTC legs; whether any was. `attempt` counts from 1. */
    readonly redial: (stalledMs: number, attempt: number) => boolean;
}
/**
 * Recovers WebRTC legs that keep answering while no peer media arrives on any leg: past
 * `DOWNLINK_REALLOCATE_AFTER_MS` they re-allocate on the same connection, and
 * `DOWNLINK_REDIAL_AFTER_MS` later the newest generation's WebRTC legs are redialled, with
 * backoff and at most `DOWNLINK_MAX_REDIALS` times per call. Raw legs police their own
 * return path.
 */
export declare class WaRelayDownlinkWatchdog {
    private readonly now;
    private readonly reallocate;
    private readonly redial;
    /**
     * Since when no leg heard authenticated peer media (RTP or SRTCP) while the accepted call
     * sends; `null` until the next send after the call is accepted or the peer is heard.
     */
    private stalledSince;
    private reallocated;
    private redials;
    constructor(options: WaRelayDownlinkWatchdogOptions);
    /** Called on each media send of an accepted call. */
    onSend(): void;
    notePeerMedia(): void;
    reset(): void;
}
