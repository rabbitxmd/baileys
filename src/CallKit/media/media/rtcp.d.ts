export declare const PT_SENDER_REPORT = 200;
/** CNAME bytes an SDES chunk carries; one CNAME serves every stream of a call. */
export declare const RTCP_CNAME_LENGTH = 18;
/** Sender report header plus sender info, where the first report block starts. */
export declare const SR_REPORT_BLOCK_OFFSET = 28;
/**
 * Reception statistics for one report block: what this endpoint received from `ssrc`, from
 * the caller's receive path. WhatsApp fills these for real, so an all-zero block diverges.
 */
export interface SenderReportReception {
    /** Source being reported on: the SSRC of the peer stream this endpoint receives. */
    readonly ssrc: number;
    /** Packets lost over packets expected since the previous report, as a fraction of 256. */
    readonly fractionLost?: number;
    /** Cumulative packets lost, negative on duplicates, saturated to signed 24 bits. */
    readonly packetsLost?: number;
    /** Highest 16-bit sequence number received, the low half of the extended number. */
    readonly highestSequence?: number;
    /** Sequence wraps counted so far, the high half of the extended number. */
    readonly cycles?: number;
    /** Interarrival jitter, in the time units of the RTP timestamp. */
    readonly jitter?: number;
    /** Middle 32 bits of the NTP timestamp of the last sender report from `ssrc`. */
    readonly lastSenderReport?: number;
    /** Delay between receiving that sender report and sending this one, in 1/65536 s. */
    readonly delaySinceLastSenderReport?: number;
}
/**
 * The SSRC a compound RTCP packet's opening sender report describes, or `null` when it does not
 * open with one: in a group call it names the sender whose reception tracker the report feeds.
 */
export declare function senderReportSourceSsrc(rtcp: Uint8Array): number | null;
/**
 * Compound RTCP: a sender report then an SDES CNAME chunk. The report is header and sender info,
 * one 32-byte block per source (at least one), then with `withPacketTrailer` four trailer words;
 * the length word counts them all. The WhatsApp words are reproduced as measured.
 * `blockCounter` must not go backwards within a call; its default scales off `packetCount`.
 * `whatsappVideoProfile` raises {@link WA_VIDEO_PROFILE_BIT}, capping the blocks at
 * {@link MAX_VIDEO_REPORT_BLOCKS}.
 */
export declare function buildSenderReportWithSdes(ssrc: number, packetCount: number, octetCount: number, rtpTimestamp: number, cname?: Uint8Array<ArrayBufferLike>, reception?: SenderReportReception | readonly SenderReportReception[], blockCounter?: number, withPacketTrailer?: boolean, whatsappVideoProfile?: boolean): Uint8Array;
/** RFC 4585 PLI; `whatsappVideoProfile` raises {@link WA_VIDEO_PROFILE_BIT}, as the video key-frame request does. */
export declare function buildPictureLossIndication(senderSsrc: number, mediaSsrc: number, whatsappVideoProfile?: boolean): Uint8Array;
/** RFC 5104 FIR; the media SSRC lives in the FCI entry, so the header field stays zero. */
export declare function buildFullIntraRequest(senderSsrc: number, mediaSsrc: number, sequenceNumber: number): Uint8Array;
/**
 * Standard REMB: PSFB FMT 15, `REMB`, the source count and the exponent/mantissa bitrate. Byte 0
 * is 0x8f, without {@link WA_VIDEO_PROFILE_BIT}. The header media SSRC stays zero; the sources the
 * one bitrate covers are listed in the FCI, at most 255.
 */
export declare function buildReceiverEstimatedMaxBitrate(senderSsrc: number, mediaSsrc: number | readonly number[], bitsPerSecond: number): Uint8Array;
