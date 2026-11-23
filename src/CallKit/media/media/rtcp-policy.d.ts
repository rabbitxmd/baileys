/** When RTCP goes out (randomized report pacing) and what bitrate the REMB announces. */
/**
 * Paces the sender reports of one outbound stream on a counter that only moves forward: the RTP
 * timestamp for audio, wall-clock milliseconds for video. Differences are taken modulo 2^32.
 */
export declare class SenderReportSchedule {
    private readonly interval;
    private threshold;
    private last;
    private started;
    private constructor();
    /** Schedule on the outgoing RTP timestamp; the interval converts to ticks of `clockRate` once. */
    static onMediaClock(intervalMs: number, clockRate: number): SenderReportSchedule;
    /** Schedule driven by elapsed wall time, the counter a video stream uses. */
    static onWallClock(intervalMs: number): SenderReportSchedule;
    /**
     * Whether `current` closes the interval, consuming it when it does. The first call only opens
     * the interval.
     */
    shouldReport(current: number): boolean;
    /** Drops the interval and redraws the threshold, as at the start of a call. */
    reset(): void;
}
/**
 * Next REMB ceiling: the bandwidth this endpoint estimates it can receive, not what arrives, since
 * the peer takes it as its estimator's ceiling. Under 2% cumulative loss it climbs 1.5x (or to
 * 1.5x the measured rate), up to 10% it holds, past that it backs off 15% from the lower of the
 * ceiling and the measured rate. `previous` 0 starts at the initial ceiling.
 */
export declare function nextReceiverMaxBitrate(previous: number, octets: number, elapsedMs: number, lossPercent: number): number;
/**
 * Next audio REMB in bps, a rule of ours: 10% up per interval under 2% loss
 * to 30 kbps and steady there, held up to 10%, 15% down from there, never below 16 kbps.
 */
export declare function nextAudioReceiverEstimate(previous: number, lossPercent: number): number;
