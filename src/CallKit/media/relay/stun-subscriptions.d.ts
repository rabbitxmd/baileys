export declare function buildSenderSubscriptions(ssrc: number): Uint8Array;
/** One stream this side sends: its layer and its SSRCs in payload order (media, FEC, NACK). */
export interface StreamLayerSsrcs {
    readonly layer: number;
    readonly ssrcs: readonly number[];
}
/**
 * Builds the self-only `0x4024` stream descriptor: one `{1: layer, 2: payload type, 3: ssrc}`
 * entry per SSRC, fields at their default omitted and field 4 never written. A zero SSRC drops
 * its entry without shifting the rest, and positions past NACK are dropped (past the first on
 * the app-data layer).
 */
export declare function buildStreamDescriptor(layers: readonly StreamLayerSsrcs[]): Uint8Array;
/** One participant whose video this side asks the relay for, at a `VideoQuality` value. */
export interface RxVideoSubscription {
    readonly pid: number;
    readonly quality: number;
}
/**
 * Builds the `0x4021` `RxSubscriptions`: one field-2 `{1: pid, 2: quality}` entry per
 * participant, fields at their default omitted. Field 1 (`vid_rx_pids`) is never written.
 */
export declare function buildRxSubscriptions(infos: readonly RxVideoSubscription[]): Uint8Array;
/** The 1:1 `0x4024`: every self and peer SSRC under its participant id, payload type 1. */
export declare function buildSSRCSubscriptionList(selfSsrcs: number[], peerSsrcs: number[], selfPid: number, peerPid: number): Uint8Array;
