import { toError } from '../errors.js';
import { MLOW_CHANNELS, MLOW_FRAME_SIZE, MLOW_MAX_PACKET_BYTES, MLOW_SAMPLE_RATE } from './mlow-binding.js';
const APPLICATION_VOIP = 2048;
const SIGNAL_VOICE = 3001;
const DEFAULT_BITRATE = 15_000;
const DEFAULT_COMPLEXITY = 5;
/**
 * MLow-specific encoder control requests. The WhatsApp client writes all four,
 * but neither their meaning nor the values it writes are known, so they stay
 * unset unless a caller supplies one.
 */
export const MLOW_ENCODER_CTL = Object.freeze({
    /** `OPUS_SET_MLOW_SUBFRAME_IMP` */
    SUBFRAME_IMPORTANCE: 4060,
    /** `OPUS_SET_MLOW_USE_SP_ACT_FLAT` */
    USE_SPEECH_ACTIVITY_FLATNESS: 4062,
    /** `OPUS_SET_MLOW_VAD_NON_BINARY` */
    VAD_NON_BINARY: 4066,
    /** `OPUS_SET_MLOW_VAD_HP_SHARPNESS` */
    VAD_HIGHPASS_SHARPNESS: 4068
});
/** Encodes 60 ms frames, with the RED secondary copy, and packs them into multiframes. */
export class WaMlowEncoder {
    encoder;
    repacketizer;
    logger;
    packetLossPercent;
    red = false;
    secondary = null;
    /** Reused PCM staging buffer for the encoder, one full frame wide. */
    pcmScratch = new Int16Array(MLOW_FRAME_SIZE);
    /** Encode target behind {@link encode}, which hands back a copy. */
    packetScratch = new Uint8Array(MLOW_MAX_PACKET_BYTES);
    constructor(encoder, repacketizer, packetLossPercent, logger) {
        this.encoder = encoder;
        this.repacketizer = repacketizer;
        this.packetLossPercent = packetLossPercent;
        this.logger = logger;
    }
    /** Creates the encoder then the repacketizer; the encoder is freed if the second fails. */
    static async open(lib, setup, logger) {
        const packetLossPercent = clampPercent(setup.packetLossPercent ?? 0);
        const encoder = await lib.createEncoder({
            channels: MLOW_CHANNELS,
            sampleRate: MLOW_SAMPLE_RATE,
            application: APPLICATION_VOIP,
            frameSize: MLOW_FRAME_SIZE,
            useSmpl: true,
            // The secondary encoder aborts the shared WASM module on a DTX frame.
            dtx: setup.red === null,
            fec: setup.fec ?? true,
            packetLossPercent,
            bitrate: setup.bitrate ?? DEFAULT_BITRATE,
            complexity: setup.complexity ?? DEFAULT_COMPLEXITY,
            signal: SIGNAL_VOICE
        });
        let repacketizer;
        try {
            repacketizer = await lib.createRepacketizer();
        }
        catch (err) {
            encoder.free();
            throw err;
        }
        const codec = new WaMlowEncoder(encoder, repacketizer, packetLossPercent, logger);
        if (setup.red) {
            codec.enableRed(setup.red);
        }
        if (setup.tunables) {
            codec.applyTunables(setup.tunables);
        }
        return codec;
    }
    encode(float32Audio) {
        const length = this.encodeInto(float32Audio, this.packetScratch);
        return this.packetScratch.slice(0, length);
    }
    encodeInto(float32Audio, target) {
        if (float32Audio.length !== MLOW_FRAME_SIZE) {
            throw new Error(`[MLowCodec] encode expects ${MLOW_FRAME_SIZE} samples, got ${float32Audio.length}`);
        }
        this.secondary = null;
        const pcm = this.pcmScratch;
        for (let i = 0; i < pcm.length; i++) {
            const sample = Math.max(-1, Math.min(1, float32Audio[i]));
            pcm[i] = Math.round(sample * 32_767);
        }
        const length = this.encoder.encodeInto(pcm, target);
        if (this.red) {
            this.encodeSecondary();
        }
        return length;
    }
    get redActive() {
        return this.red;
    }
    get lastSecondary() {
        return this.secondary;
    }
    packFrames(frames) {
        return this.repacketizer.pack(frames);
    }
    setExpectedPacketLossPercent(percent) {
        const next = clampPercent(percent);
        if (next === this.packetLossPercent) {
            return;
        }
        this.packetLossPercent = next;
        try {
            this.encoder.setPacketLossPercent(next);
        }
        catch (err) {
            this.logger.warn('mlow packet loss percent rejected', {
                percent: next,
                message: toError(err).message
            });
        }
    }
    free() {
        this.encoder.free();
        this.repacketizer.free();
    }
    /** DTX stays off on a failure: turning it back on is the call that can abort the module. */
    enableRed(red) {
        try {
            this.encoder.setSecondaryBitrate(red.secondaryBitrate);
            this.encoder.setSecondaryComplexity(red.secondaryComplexity);
            this.red = true;
        }
        catch (err) {
            this.logger.warn('mlow red unavailable, sending without it', {
                message: toError(err).message
            });
        }
    }
    encodeSecondary() {
        try {
            this.secondary = this.encoder.encodeSecondary();
        }
        catch (err) {
            // The secondary has to follow every frame, so one miss ends RED for this encoder.
            this.red = false;
            this.logger.warn('mlow red secondary failed, sending without it', {
                message: toError(err).message
            });
        }
    }
    /** Writes the requests in {@link MLOW_ENCODER_CTL}; absent fields are left untouched. */
    applyTunables(tunables) {
        this.writeCtl(MLOW_ENCODER_CTL.SUBFRAME_IMPORTANCE, tunables.subframeImportance);
        this.writeCtl(MLOW_ENCODER_CTL.USE_SPEECH_ACTIVITY_FLATNESS, tunables.useSpeechActivityFlatness);
        this.writeCtl(MLOW_ENCODER_CTL.VAD_NON_BINARY, tunables.vadNonBinary);
        this.writeCtl(MLOW_ENCODER_CTL.VAD_HIGHPASS_SHARPNESS, tunables.vadHighpassSharpness);
    }
    writeCtl(request, value) {
        if (value === undefined) {
            return;
        }
        try {
            this.encoder.encoderCtl(request, value);
        }
        catch (err) {
            this.logger.warn('mlow encoder ctl rejected', {
                request,
                value,
                message: toError(err).message
            });
        }
    }
}
function clampPercent(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    const rounded = Math.round(value);
    if (rounded < 0) {
        return 0;
    }
    return rounded > 100 ? 100 : rounded;
}
