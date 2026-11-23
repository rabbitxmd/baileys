import type { WaCallReaction } from '../app-data/protocol.js';
import type { WaCallMediaPlanUpdate } from './plan.js';
import { WaCallMediaPlane, type WaCallMediaPlaneOptions, type WaCallMediaStats } from './WaCallMediaPlane.js';
/** Version of the wire shape below. Only a breaking change moves it; a new field is optional. */
export declare const WA_CALL_MEDIA_WIRE_VERSION = 1;
/**
 * Host feature: applies `group`, `relays.generation`, per-relay `transport` and
 * `ssrcs.selfLayers`, and takes the relay's frame off inbound media.
 */
export declare const WA_CALL_MEDIA_FEATURE_GROUP = "group/1";
/** Host feature: can dial raw UDP relay legs. */
export declare const WA_CALL_MEDIA_FEATURE_RAW_UDP = "raw-udp";
/** Host feature: names the group sender on reactions and video, and sends `sender_media`. */
export declare const WA_CALL_MEDIA_FEATURE_GROUP_ATTRIBUTION = "group-attribution/1";
/** Host feature: asks the relay for `group.videoSubscriptions`. */
export declare const WA_CALL_MEDIA_FEATURE_GROUP_VIDEO = "group-video/1";
/**
 * One plan change sent from signaling to the media host, numbered per call from 0. A
 * `full` message holds the whole plan; the others hold only the sections that changed.
 *
 * @sensitive `plan.keys` and the relay credentials in `plan.relays`.
 */
export interface WaCallMediaMessage {
    readonly v: typeof WA_CALL_MEDIA_WIRE_VERSION;
    readonly callId: string;
    readonly seq: number;
    readonly full: boolean;
    readonly plan: WaCallMediaPlanUpdate;
}
/** What the host carrying the media tells signaling. */
export type WaCallMediaEvent = 
/**
 * Media started flowing: the call is accepted and a relay leg is up. `reportsRelayAnswers`
 * is set by a host that sends `relay_answered`; an older one leaves it out.
 */
{
    readonly type: 'active';
    readonly reportsRelayAnswers?: boolean;
}
/** The call has no relay leg left; signaling ends the call. */
 | {
    readonly type: 'relay_lost';
    readonly reason: string;
}
/** A relay answered one of the host's legs for the first time, once per relay name. */
 | {
    readonly type: 'relay_answered';
    readonly name: string;
    readonly rttMs?: number;
}
/** An in-band reaction from the peer; `senderId` names the group sender it came from. */
 | {
    readonly type: 'reaction';
    readonly reaction: WaCallReaction;
    readonly senderId?: string;
}
/**
 * A group sender's media started or stopped arriving, edge-triggered: `false` after a
 * silence the host chose, not a state the peer announced.
 */
 | {
    readonly type: 'sender_media';
    readonly senderId: string;
    readonly receiving: boolean;
}
/** The host missed a message and needs the whole plan again. */
 | {
    readonly type: 'resync';
    readonly lastSeq: number | null;
}
/**
 * What the host can apply, sent once before any other event. A host older than this
 * event sends none, and an older signaling ignores it.
 */
 | {
    readonly type: 'host';
    readonly features: readonly string[];
};
export interface WaCallMediaEventMessage {
    readonly v: typeof WA_CALL_MEDIA_WIRE_VERSION;
    readonly callId: string;
    readonly event: WaCallMediaEvent;
}
/** The text form of a message, for whatever transport the integrator runs. */
export declare function encodeCallMediaMessage(message: WaCallMediaMessage): string;
export declare function decodeCallMediaMessage(text: string): WaCallMediaMessage;
export declare function encodeCallMediaEvent(message: WaCallMediaEventMessage): string;
export declare function decodeCallMediaEvent(text: string): WaCallMediaEventMessage;
/** Numbers a call's plan changes on the signaling side; {@link snapshot} resyncs a host. */
export declare class WaCallMediaMessageSequencer {
    private readonly callId;
    private readonly plan;
    private seq;
    constructor(callId: string);
    /** Folds a change into the plan and returns the message that carries it. */
    next(update: WaCallMediaPlanUpdate): WaCallMediaMessage;
    /** The whole plan as it stands, under the number of the last change. */
    snapshot(): WaCallMediaMessage;
}
export interface WaCallMediaReceiverOptions extends Omit<WaCallMediaPlaneOptions, 'onActive' | 'onRelayLost' | 'onRelayAnswered' | 'onReaction'> {
    readonly callId: string;
    /** Hands an event back to signaling, over whatever transport the integrator runs. */
    readonly send: (message: WaCallMediaEventMessage) => void;
    /** Also told of the reactions sent to signaling, for a host that shows them itself. */
    readonly onReaction?: (reaction: WaCallReaction, senderId?: string) => void;
}
/**
 * Host side of a call whose signaling runs elsewhere: applies messages to its own
 * {@link WaCallMediaPlane} in order, drops stale ones and asks for a resync after a gap. Its
 * first event, sent from the constructor, is `host` with the features it applies.
 */
export declare class WaCallMediaReceiver {
    readonly plane: WaCallMediaPlane;
    private readonly callId;
    private readonly send;
    private lastSeq;
    private receiving;
    constructor(options: WaCallMediaReceiverOptions);
    /** Loads the codec; see {@link WaCallMediaPlane.start}. */
    start(): Promise<void>;
    /**
     * Applies one message, one at a time in call order. A message whose apply rejects is not
     * counted as received, so the next one finds the gap and asks for a resync.
     */
    receive(message: WaCallMediaMessage): Promise<void>;
    private receiveNow;
    stop(): WaCallMediaStats;
    private emit;
}
