import { type Logger } from '../logger.js';
export interface WaJitterBufferStats {
    /** Samples currently queued for playout. */
    readonly buffered: number;
    /** Samples the buffer can hold. */
    readonly capacity: number;
    /** Samples dropped because the buffer was full. */
    readonly dropped: number;
    /** Reads that found less audio queued than they asked for. */
    readonly underruns: number;
}
/**
 * The playout queue between the decoder and the speaker, read on the host's clock: when
 * full it drops the oldest samples, and a short read is padded with silence.
 */
export declare class WaJitterBuffer {
    private readonly logger;
    private readonly traceEnabled;
    private readonly ring;
    private writePosition;
    private readPosition;
    private length;
    private droppedSamples;
    private underruns;
    /**
     * @throws RangeError unless `capacitySamples` is a positive integer: an empty queue would
     * drop every sample and play silence.
     */
    constructor(capacitySamples: number, logger: Logger);
    write(samples: Float32Array): void;
    /**
     * Fills `out` from the queue and returns how many samples were real audio.
     * Whatever the queue could not cover is silence.
     */
    read(out: Float32Array): number;
    /** Empties the queue; the counters keep running. */
    reset(): void;
    /** Samples currently queued, without building {@link stats}. */
    get buffered(): number;
    get stats(): WaJitterBufferStats;
}
