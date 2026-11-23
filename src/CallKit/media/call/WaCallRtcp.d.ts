import type { SrtcpContext } from '../crypto/srtp.js';
import { type Logger } from '../logger.js';
import { AudioReceiveSet } from '../media/audio-receive-set.js';
import { SenderReportSchedule } from '../media/rtcp-policy.js';
import type { RtpStreamReception } from '../media/rtp-stream-reception.js';
import type { RtpSession } from '../media/rtp.js';
import type { WaMediaClock } from '../media/WaMediaClock.js';
export interface WaCallRtcpOptions {
    readonly logger: Logger;
    readonly clock: WaMediaClock;
    /** Puts one protected RTCP datagram on the media socket. */
    readonly sendMedia: (datagram: Uint8Array) => boolean;
}
/**
 * Paces and builds our outbound RTCP: sender reports, the audio and video REMB, PLI and FIR.
 * The keys and sessions are the caller's, handed in on every call.
 */
export declare class WaCallRtcp {
    private readonly logger;
    private readonly traceEnabled;
    private readonly clock;
    private readonly sendMedia;
    /** RTCP interval in force: the compiled one, or the server's; the schedules below follow it. */
    private rtcpIntervalMs;
    /** Audio reports pace on RTP timestamp ticks, video reports on wall time. */
    audioReportSchedule: SenderReportSchedule;
    videoReportSchedule: SenderReportSchedule;
    /** Paced from the receive path, unlike the video report, which the send path drives. */
    receiverEstimateSchedule: SenderReportSchedule;
    audioReceiverEstimateSchedule: SenderReportSchedule;
    /** Whether the server turned the RTCP REMB off; gates the video REMB send. */
    private rtcpRembDisabled;
    /** CNAME of every sender report, binding the call's audio and video to one participant. */
    private rtcpCname;
    /** Video payload bytes in the open REMB window, and when it opened. */
    private videoRecvOctets;
    private receiverEstimateWindowStartedAt;
    /** Ceiling announced in the last REMB, or 0 before the first; it carries across windows. */
    private receiverEstimateBitrate;
    private audioReceiverEstimateBitrate;
    private videoFirSequence;
    constructor(options: WaCallRtcpOptions);
    get intervalMs(): number;
    get rembDisabled(): boolean;
    /** Applies the REMB gate and the RTCP interval; a `null` interval restores the compiled one. */
    configure(intervalMs: number | null, rembDisabled: boolean): void;
    private resetSchedules;
    /** Whether the audio packet stamped `timestamp` is due a sender report. */
    audioReportDue(timestamp: number): boolean;
    /** Whether the video frame sent at `now` is due a sender report. */
    videoReportDue(now: number): boolean;
    /** Ceiling the video extension announces: the last REMB window's, or the initial one. */
    get announcedReceiverEstimate(): number;
    /**
     * The stream's timestamp carried forward from the frame captured at `captureMs` to now,
     * so audio and video reports pair timestamp and wall time at the same instant.
     */
    timestampAtAssembly(timestamp: number, captureMs: number, clockRate: number): number;
    /**
     * Emits one compound sender report for `senderSsrc` with the report blocks of the inbound
     * stream it pairs with. `whatsappVideoProfile` sets WhatsApp's profile bit (byte 0 0x91) on
     * a video report; only a single block carries the packet trailer.
     */
    sendSenderReport(srtcpContext: SrtcpContext | null, senderSsrc: number, packetCount: number, octetCount: number, rtpTimestamp: number, reception: RtpStreamReception | AudioReceiveSet, whatsappVideoProfile?: boolean): void;
    /**
     * The audio REMB once per RTCP interval, which the peer's quality control needs to leave
     * probing; the video REMB gate does not apply. A group call sends one, on one sender's stream.
     */
    sendAudioReceiverEstimate(srtcpContext: SrtcpContext | null, rtpSession: RtpSession | null, mediaSsrc: number, group: AudioReceiveSet | null, reception: RtpStreamReception): void;
    /**
     * Counts one inbound video payload into the REMB window and sends the video REMB when the
     * interval closes: the capacity we estimate, not the rate arriving. The ceiling updates even
     * with the REMB off: the extension carries it.
     */
    noteVideoReceived(octets: number, mediaSsrc: number, now: number, srtcpContext: SrtcpContext | null, videoRtpSession: RtpSession | null, group: AudioReceiveSet | null, reception: RtpStreamReception): void;
    /** Asks the sender of `mediaSsrc` for a key frame: a PLI, then a FIR. */
    requestKeyFrame(srtcpContext: SrtcpContext | null, videoRtpSession: RtpSession | null, mediaSsrc: number): void;
    private send;
}
