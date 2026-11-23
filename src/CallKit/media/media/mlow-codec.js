import { toError } from '../errors.js';
import { createNoopLogger } from '../logger.js';
import { loadMlowModule, MLOW_FRAME_SIZE } from './mlow-binding.js';
import { WaMlowDecoder } from './WaMlowDecoder.js';
import { WaMlowEncoder } from './WaMlowEncoder.js';
/** The client's own defaults for the RED secondary encoder. */
const DEFAULT_RED_SECONDARY_BITRATE = 4_200;
const DEFAULT_RED_SECONDARY_COMPLEXITY = 5;
/** The RED settings the options ask for, or `null` when RED stays off. */
function resolveRed(red) {
    if (!red)
        return null;
    const options = red === true ? {} : red;
    return {
        secondaryBitrate: options.secondaryBitrate ?? DEFAULT_RED_SECONDARY_BITRATE,
        secondaryComplexity: options.secondaryComplexity ?? DEFAULT_RED_SECONDARY_COMPLEXITY
    };
}
/** The public MLow codec: one stream decoder and, unless decode-only, an encoder. */
export class MLowCodec {
    logger;
    decoder;
    encoder = null;
    constructor(decoder, logger) {
        this.decoder = decoder;
        this.logger = logger;
    }
    static async create(opts = {}) {
        const logger = opts.logger ?? createNoopLogger();
        const red = resolveRed(opts.red);
        const lib = await loadMlowModule();
        const codec = new MLowCodec(await WaMlowDecoder.open(lib, opts.maxConcealFrames, logger), logger);
        try {
            if (opts.companionModel !== undefined) {
                await codec.attachCompanion(opts.companionModel);
            }
            if (!opts.decodeOnly) {
                codec.encoder = await WaMlowEncoder.open(lib, {
                    bitrate: opts.bitrate,
                    complexity: opts.complexity,
                    fec: opts.fec,
                    packetLossPercent: opts.packetLossPercent,
                    red,
                    tunables: opts.tunables
                }, logger);
            }
        }
        catch (err) {
            codec.destroy();
            throw err;
        }
        return codec;
    }
    encode(float32Audio) {
        const encoder = this.encoder;
        if (!encoder) {
            throw new Error('[MLowCodec] encoder not initialized');
        }
        return encoder.encode(float32Audio);
    }
    /**
     * Encodes one frame into `target` and returns its byte count; `target` needs
     * {@link MLOW_MAX_PACKET_BYTES}. With RED on, the frame's redundant copy is then
     * {@link lastSecondary}.
     */
    encodeInto(float32Audio, target) {
        const encoder = this.encoder;
        if (!encoder) {
            throw new Error('[MLowCodec] encoder not initialized');
        }
        return encoder.encodeInto(float32Audio, target);
    }
    /** Whether RED runs: every encode then yields a redundant copy. */
    get redActive() {
        return this.encoder?.redActive ?? false;
    }
    /** RED copy of the frame the last encode took, a fresh array, or `null` with RED off. */
    get lastSecondary() {
        return this.encoder?.lastSecondary ?? null;
    }
    /** Packs encoded frames into one multiframe packet, a fresh array. */
    packFrames(frames) {
        const encoder = this.encoder;
        if (!encoder) {
            throw new Error('[MLowCodec] repacketizer not initialized');
        }
        return encoder.packFrames(frames);
    }
    /**
     * Decode a single packet. `null` runs packet loss concealment for one
     * frame instead. Prefer {@link MLowCodec.decodeSequenced} on a live stream:
     * it detects the gaps this entry point cannot see.
     */
    decode(mlowFrame) {
        return this.decoder.decode(mlowFrame);
    }
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
    decodeSequenced(seq, packet, onFrame, timestamp, stream = 0, read) {
        return this.decoder.decodeSequenced(seq, packet, onFrame, timestamp, stream, read);
    }
    /**
     * Forget the inbound sequence position, for example after an SSRC change. The
     * Companion's recurrent state restarts with it.
     */
    resetSequence() {
        this.decoder.resetSequence();
    }
    /**
     * Tell the encoder how much loss to protect against, 0 to 100. FEC only
     * emits a redundant copy while this is above zero.
     */
    setExpectedPacketLossPercent(percent) {
        this.encoder?.setExpectedPacketLossPercent(percent);
    }
    getStats() {
        return this.decoder.getStats();
    }
    getFrameSize() {
        return MLOW_FRAME_SIZE;
    }
    destroy() {
        this.encoder?.free();
        this.encoder = null;
        this.decoder.free();
    }
    async attachCompanion(source) {
        try {
            const model = typeof source === 'function' ? await source() : source;
            this.decoder.setCompanionModel(model instanceof Uint8Array ? model : new Uint8Array(model));
        }
        catch (err) {
            this.logger.warn('mlow companion unavailable, decoding without it', {
                message: toError(err).message
            });
        }
    }
}
