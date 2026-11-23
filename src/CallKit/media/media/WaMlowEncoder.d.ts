import type { Logger } from '../logger.js';
import { type MlowModule } from './mlow-binding.js';
/**
 * MLow-specific encoder control requests. The WhatsApp client writes all four,
 * but neither their meaning nor the values it writes are known, so they stay
 * unset unless a caller supplies one.
 */
export declare const MLOW_ENCODER_CTL: Readonly<{
    /** `OPUS_SET_MLOW_SUBFRAME_IMP` */
    readonly SUBFRAME_IMPORTANCE: 4060;
    /** `OPUS_SET_MLOW_USE_SP_ACT_FLAT` */
    readonly USE_SPEECH_ACTIVITY_FLATNESS: 4062;
    /** `OPUS_SET_MLOW_VAD_NON_BINARY` */
    readonly VAD_NON_BINARY: 4066;
    /** `OPUS_SET_MLOW_VAD_HP_SHARPNESS` */
    readonly VAD_HIGHPASS_SHARPNESS: 4068;
}>;
/**
 * Raw values for the requests in {@link MLOW_ENCODER_CTL}, written verbatim; an
 * absent field leaves the encoder default in place. A value outside the ranges
 * below is reported as a warning, not thrown.
 */
export interface MLowEncoderTunables {
    /** {@link MLOW_ENCODER_CTL.SUBFRAME_IMPORTANCE}, 0 to 300. */
    readonly subframeImportance?: number;
    /** {@link MLOW_ENCODER_CTL.USE_SPEECH_ACTIVITY_FLATNESS}, 0 or 1. */
    readonly useSpeechActivityFlatness?: number;
    /** {@link MLOW_ENCODER_CTL.VAD_NON_BINARY}, 0 to 100. */
    readonly vadNonBinary?: number;
    /** {@link MLOW_ENCODER_CTL.VAD_HIGHPASS_SHARPNESS}, 0 to 100. */
    readonly vadHighpassSharpness?: number;
}
/** What the encoder opens with; `red` null leaves the secondary off and DTX on. */
export interface MLowEncoderSetup {
    readonly bitrate?: number;
    readonly complexity?: number;
    readonly fec?: boolean;
    readonly packetLossPercent?: number;
    readonly red: {
        readonly secondaryBitrate: number;
        readonly secondaryComplexity: number;
    } | null;
    readonly tunables?: MLowEncoderTunables;
}
/** Encodes 60 ms frames, with the RED secondary copy, and packs them into multiframes. */
export declare class WaMlowEncoder {
    private readonly encoder;
    private readonly repacketizer;
    private readonly logger;
    private packetLossPercent;
    private red;
    private secondary;
    /** Reused PCM staging buffer for the encoder, one full frame wide. */
    private readonly pcmScratch;
    /** Encode target behind {@link encode}, which hands back a copy. */
    private readonly packetScratch;
    private constructor();
    /** Creates the encoder then the repacketizer; the encoder is freed if the second fails. */
    static open(lib: MlowModule, setup: MLowEncoderSetup, logger: Logger): Promise<WaMlowEncoder>;
    encode(float32Audio: Float32Array): Uint8Array;
    encodeInto(float32Audio: Float32Array, target: Uint8Array): number;
    get redActive(): boolean;
    get lastSecondary(): Uint8Array | null;
    packFrames(frames: readonly Uint8Array[]): Uint8Array;
    setExpectedPacketLossPercent(percent: number): void;
    free(): void;
    /** DTX stays off on a failure: turning it back on is the call that can abort the module. */
    private enableRed;
    private encodeSecondary;
    /** Writes the requests in {@link MLOW_ENCODER_CTL}; absent fields are left untouched. */
    private applyTunables;
    private writeCtl;
}
