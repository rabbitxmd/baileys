import { isLogLevelEnabled } from '../logger.js';
/**
 * The playout queue between the decoder and the speaker, read on the host's clock: when
 * full it drops the oldest samples, and a short read is padded with silence.
 */
export class WaJitterBuffer {
    logger;
    traceEnabled;
    ring;
    writePosition = 0;
    readPosition = 0;
    length = 0;
    droppedSamples = 0;
    underruns = 0;
    /**
     * @throws RangeError unless `capacitySamples` is a positive integer: an empty queue would
     * drop every sample and play silence.
     */
    constructor(capacitySamples, logger) {
        if (!Number.isInteger(capacitySamples) || capacitySamples <= 0) {
            throw new RangeError(`jitter buffer capacity must be a positive integer, got ${capacitySamples}`);
        }
        this.ring = new Float32Array(capacitySamples);
        this.logger = logger;
        this.traceEnabled = isLogLevelEnabled(logger, 'trace');
    }
    write(samples) {
        const capacity = this.ring.length;
        let source = samples;
        if (source.length > capacity) {
            const truncated = source.length - capacity;
            this.droppedSamples += truncated;
            source = source.subarray(truncated);
        }
        if (source.length === 0) {
            return;
        }
        const overflow = this.length + source.length - capacity;
        if (overflow > 0) {
            this.readPosition = (this.readPosition + overflow) % capacity;
            this.length -= overflow;
            this.droppedSamples += overflow;
            if (this.traceEnabled)
                this.logger.trace('jitter buffer overflow, dropped oldest', {
                    droppedSamples: overflow,
                    totalDropped: this.droppedSamples
                });
        }
        const head = Math.min(source.length, capacity - this.writePosition);
        this.ring.set(source.subarray(0, head), this.writePosition);
        if (head < source.length) {
            this.ring.set(source.subarray(head), 0);
        }
        this.writePosition = (this.writePosition + source.length) % capacity;
        this.length += source.length;
    }
    /**
     * Fills `out` from the queue and returns how many samples were real audio.
     * Whatever the queue could not cover is silence.
     */
    read(out) {
        const wanted = out.length;
        const drained = Math.min(wanted, this.length);
        if (drained < wanted) {
            this.underruns++;
            out.fill(0, drained, wanted);
        }
        if (drained > 0) {
            const capacity = this.ring.length;
            const head = Math.min(drained, capacity - this.readPosition);
            out.set(this.ring.subarray(this.readPosition, this.readPosition + head), 0);
            if (head < drained) {
                out.set(this.ring.subarray(0, drained - head), head);
            }
            this.readPosition = (this.readPosition + drained) % capacity;
            this.length -= drained;
        }
        return drained;
    }
    /** Empties the queue; the counters keep running. */
    reset() {
        this.writePosition = 0;
        this.readPosition = 0;
        this.length = 0;
    }
    /** Samples currently queued, without building {@link stats}. */
    get buffered() {
        return this.length;
    }
    get stats() {
        return {
            buffered: this.length,
            capacity: this.ring.length,
            dropped: this.droppedSamples,
            underruns: this.underruns
        };
    }
}
