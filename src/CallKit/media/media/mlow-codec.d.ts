import { type Logger } from '../logger.js';
import type { MlowPacketRead } from './mlow-packet.js';
import { type MLowCodecStats, type MLowDecodeOutcome } from './WaMlowDecoder.js';
import { type MLowEncoderTunables } from './WaMlowEncoder.js';
/**
 * The MLow Companion's weights: the `DNNw` container WhatsApp downloads at runtime
 * (`mlow_companion_v1`), as bytes or as a loader called each time the codec loads.
 */
export type MLowCompanionModelSource = Uint8Array | ArrayBuffer | (() => Promise<Uint8Array | ArrayBuffer>);
/** The RED secondary encoder. Unset fields take the client's defaults, 4200 bps and complexity 5. */
export interface MLowRedOptions {
    readonly secondaryBitrate?: number;
    readonly secondaryComplexity?: number;
}
export interface MLowCodecOptions {
    /** Encoder bitrate in bps, default 15000; `<voip_settings>` may hand down another rung. */
    readonly bitrate?: number;
    /** Encoder complexity, 0 to 10, default 5. */
    readonly complexity?: number;
    /** In-band FEC, default `true`; it only emits while {@link packetLossPercent} is above 0. */
    readonly fec?: boolean;
    /** Loss the encoder protects against, 0 to 100, default 0. */
    readonly packetLossPercent?: number;
    /** Most concealment frames for one gap, default 5; a longer outage goes silent. */
    readonly maxConcealFrames?: number;
    /** MLow-specific encoder control requests. Unset requests are not written. */
    readonly tunables?: MLowEncoderTunables;
    /** The MLow Companion's weights; ones that fail to load are skipped with a warning. */
    readonly companionModel?: MLowCompanionModelSource;
    /** Runs the RED secondary encoder, its copy in {@link MLowCodec.lastSecondary}; DTX goes off. */
    readonly red?: boolean | MLowRedOptions;
    /** Builds the decoder alone, for one inbound stream of a group call: encode and pack throw. */
    readonly decodeOnly?: boolean;
    readonly logger?: Logger;
}
/** The public MLow codec: one stream decoder and, unless decode-only, an encoder. */
export declare class MLowCodec {
    private readonly logger;
    private readonly decoder;
    private encoder;
    private constructor();
    static create(opts?: MLowCodecOptions): Promise<MLowCodec>;
    encode(float32Audio: Float32Array): Uint8Array;
    /**
     * Encodes one frame into `target` and returns its byte count; `target` needs
     * {@link MLOW_MAX_PACKET_BYTES}. With RED on, the frame's redundant copy is then
     * {@link lastSecondary}.
     */
    encodeInto(float32Audio: Float32Array, target: Uint8Array): number;
    /** Whether RED runs: every encode then yields a redundant copy. */
    get redActive(): boolean;
    /** RED copy of the frame the last encode took, a fresh array, or `null` with RED off. */
    get lastSecondary(): Uint8Array | null;
    /** Packs encoded frames into one multiframe packet, a fresh array. */
    packFrames(frames: readonly Uint8Array[]): Uint8Array;
    /**
     * Decode a single packet. `null` runs packet loss concealment for one
     * frame instead. Prefer {@link MLowCodec.decodeSequenced} on a live stream:
     * it detects the gaps this entry point cannot see.
     */
    decode(mlowFrame: Uint8Array | null): Float32Array;
    /**
     * Decodes one inbound packet by its RTP sequence number and hands every PCM frame to
     * `onFrame`, oldest first, as a view valid only during the callback. Gaps are filled first:
     * the frame right before from the packet's FEC, older ones by PLC, up to `maxConcealFrames`.
     * With `timestamp`, sub-frames are placed on the RTP timeline: one whose stretch already
     * played is dropped, one landing in a lost packet's hole plays in its place. `stream` 1
     * (PT 121) numbers its own gaps and may carry in-band RED ({@link readMlowRed}). A rejected
     * packet advances its stream to just behind it, leaving only its own slot to the next FEC.
     * `read`, when it holds this packet, stands in for reading the PT 121 layout again.
     */
    decodeSequenced(seq: number, packet: Uint8Array, onFrame: (pcm: Float32Array) => void, timestamp?: number, stream?: 0 | 1, read?: MlowPacketRead): MLowDecodeOutcome;
    /**
     * Forget the inbound sequence position, for example after an SSRC change. The
     * Companion's recurrent state restarts with it.
     */
    resetSequence(): void;
    /**
     * Tell the encoder how much loss to protect against, 0 to 100. FEC only
     * emits a redundant copy while this is above zero.
     */
    setExpectedPacketLossPercent(percent: number): void;
    getStats(): MLowCodecStats;
    getFrameSize(): number;
    destroy(): void;
    private attachCompanion;
}
