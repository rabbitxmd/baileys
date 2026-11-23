import { type SenderReportReception } from './rtcp.js';
/**
 * Reception statistics of one inbound RTP stream, for the report block of the matching
 * outbound stream's sender report. One per stream, at that stream's `clockRate`; a packet from
 * another SSRC restarts the statistics under it.
 */
export declare class RtpStreamReception {
    private readonly clockRate;
    private readonly stats;
    private baseSequence;
    private lastSequence;
    private cycles;
    private extendedHighest;
    private received;
    private expectedPrior;
    private receivedPrior;
    private lastRtpTimestamp;
    private lastArrivalTicks;
    private jitter;
    private senderReportArrivalMs;
    private pendingJumpSequence;
    private expectedPriorLoss;
    private receivedPriorLoss;
    constructor(clockRate: number);
    /** SSRC the stream turned out to carry, or 0 before the first packet. */
    get sourceSsrc(): number;
    /** Cumulative loss as a percentage of the packets expected so far. */
    get lossPercent(): number;
    /** Loss since the previous call, in percent, on an interval apart from the one {@link report} consumes. */
    takeLossPercent(): number;
    /** Records one received packet; `arrivalMs` is the wall clock at reception. */
    observe(ssrc: number, sequenceNumber: number, rtpTimestamp: number, arrivalMs: number): void;
    /**
     * Records an inbound RTCP packet: one opening with a sender report from the tracked source
     * sets the LSR/DLSR pair the next report block echoes.
     */
    observeSenderReport(rtcp: Uint8Array, arrivalMs: number): void;
    /**
     * Statistics for the next report block as of `nowMs`. Consumes the loss interval; the returned
     * object is reused, so read it before the next call.
     */
    report(nowMs: number): SenderReportReception;
    /** Drops every statistic, as at the start of a call. */
    reset(): void;
    /** Interarrival jitter of RFC 3550 A.8, the timestamp step taken as signed 32 bits. */
    private updateJitter;
    /**
     * Starts tracking `ssrc` from this packet. On the same source, a sequence resync, the sender
     * report state survives, so LSR and DLSR do not drop to zero.
     */
    private restart;
}
