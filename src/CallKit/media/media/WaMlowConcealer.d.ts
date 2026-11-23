import { type Logger } from '../logger.js';
import { type MlowDecoder } from './mlow-binding.js';
/**
 * Fills lost audio by PLC, or from the next packet's FEC, in steps sized to the last decoded
 * frame and capped per gap. Writes into the decoder's own scratch; the decoder owns `lib`.
 */
export declare class WaMlowConcealer {
    private lib;
    private readonly scratch;
    private readonly logger;
    private readonly traceEnabled;
    private readonly maxConcealFrames;
    private lastDecodedSamples;
    private plcFrames;
    private fecFrames;
    private concealCapped;
    /** Shared read-only zero frame handed out when a decode cannot be salvaged. */
    private readonly silenceScratch;
    constructor(lib: MlowDecoder, scratch: Float32Array, maxConcealFrames: number | undefined, logger: Logger);
    get plc(): number;
    get fec(): number;
    get capped(): number;
    /** Records the length of a frame the decoder produced, the size the next concealment takes. */
    noteDecoded(samples: number): void;
    resetFrameSize(): void;
    /** Stops using the library decoder; freeing it is the owner's. */
    free(): void;
    /**
     * Conceals `samples` in steps no longer than the last decoded frame, `maxConcealFrames` at
     * most, the step that ends the span from `fecPacket`'s FEC when given; returns those emitted.
     */
    concealSpan(samples: number, fecPacket: Uint8Array | null, onFrame: (pcm: Float32Array) => void): number;
    /**
     * Conceals `missing` frames, the last from `nextPacket`'s FEC (by PLC without one), and
     * returns the samples emitted.
     */
    concealGap(missing: number, nextPacket: Uint8Array | null, onFrame: (pcm: Float32Array) => void): number;
    private recoverPrevious;
    conceal(frameSize: number): Float32Array;
    /**
     * Length to conceal with, tracking the last packet the peer actually sent so
     * a stream of 20 ms frames is not patched with 60 ms of audio.
     */
    frameSize(): number;
    silence(frameSize: number): Float32Array;
}
