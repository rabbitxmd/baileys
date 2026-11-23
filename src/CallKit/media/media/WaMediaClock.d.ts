/**
 * Milliseconds the clock's origin sits before its start, so a capture stamped just before
 * the start still gets its own positive tick instead of clamping to zero.
 */
export declare const MEDIA_CLOCK_ORIGIN_LEAD_MS = 250;
/**
 * The media clock of one call: audio and video timestamps count from one origin, because
 * the receiver holds the A/V offset in microseconds in an int32 that unrelated origins overflow.
 */
export declare class WaMediaClock {
    /** The time source, in milliseconds on a monotonic scale. */
    readonly now: () => number;
    private origin;
    private started;
    constructor(now?: () => number);
    /** Whether the origin is fixed. */
    get isStarted(): boolean;
    /** Fixes the origin at `atMs` (default now) minus the lead; only the first call counts. */
    start(atMs?: number): void;
    /**
     * The 32-bit RTP timestamp of `instantMs` at `clockRate`; an instant before the origin is
     * tick zero. A clock not started yet starts now.
     */
    ticksAt(instantMs: number, clockRate: number): number;
}
/**
 * Maps host capture timestamps (any epoch) onto the plane's clock, learning the offset and
 * tracking the host clock's drift. Instants are strictly increasing, `minStepMs` apart.
 */
export declare class HostCaptureTimeMapper {
    private readonly minStepMs;
    private offsetMs;
    private lastHostMs;
    private lastNowMs;
    private lastInstantMs;
    private learned;
    /** Least lag of the current block (and the previous one), relative to the current offset. */
    private blockLagMs;
    private previousBlockLagMs;
    private blockStartMs;
    /** `minStepMs` is one tick of the clock the instants feed. */
    constructor(minStepMs: number);
    /** The plane-clock instant of a frame the host stamped `hostMs`, mapped at `nowMs`. */
    map(hostMs: number, nowMs: number): number;
    /** Moves the offset, and the lags kept against it the other way. */
    private moveOffset;
    /** Holds `instantMs` a step past the last one and records the frame. */
    private accept;
}
