/** One emoji reaction of one participant, as it travels in `reactionInfo`. */
export interface WaCallReaction {
    /** Dedup key of the retransmission burst that carries this reaction. */
    readonly transactionId: bigint;
    /** The emoji itself, as a UTF-8 glyph. Never an index into a set. */
    readonly reaction: string;
}
/** One AR effect attribution, which shares the reaction's envelope. */
export interface WaCallArEffect {
    readonly transactionId: bigint;
    readonly arEffectId: string;
}
/** Everything one `appDataMessage` may carry that this package understands. */
interface WaAppDataItem {
    readonly reaction?: WaCallReaction;
    readonly arEffect?: WaCallArEffect;
}
/**
 * One app-data RTP payload read. `shape` is the nesting that matched: the official receive
 * path reads a list and its send path writes a bare message.
 */
export interface WaAppDataPayload {
    readonly shape: 'payloads' | 'message';
    readonly items: readonly WaAppDataItem[];
    /** Whether the local {@link MAX_MESSAGES_PER_PAYLOAD} guard cut the list short. */
    readonly truncated: boolean;
}
/**
 * Serializes one emoji reaction into an app-data RTP payload, in the list nesting the
 * official receive path parses. No sender, recipient or routing mode: the relay routes app
 * data by the SSRC it arrives on, and routing fields belong to `dataChannelMessage`, a
 * different transport.
 */
export declare function encodeReactionPayload(reaction: WaCallReaction): Uint8Array;
/**
 * Reads the payload of one inbound app-data RTP packet. Returns `null` when the bytes
 * carry nothing this package models, including a well-formed payload holding only unread
 * kinds such as live transcription. The list nesting is tried first because the two shapes
 * are only told apart by which one yields a message.
 */
export declare function decodeAppDataPayload(data: Uint8Array): WaAppDataPayload | null;
export {};
