export interface H264AccessUnit {
    readonly timestamp: number;
    readonly data: Uint8Array;
    readonly keyFrame: boolean;
}
export interface H264PacketizedFrame {
    readonly payloads: Uint8Array[];
    /** Whether the access unit carries an IDR slice, as {@link isH264KeyFrame} reports. */
    readonly keyFrame: boolean;
}
/**
 * Packetizes an Annex-B access unit into RFC 6184 payloads and reports whether it is a key
 * frame, in one scan. A key frame leaves as WhatsApp sends it: the whole unit in one STAP-A
 * when it fits, else from its SPS to the end as one FU-A typed SPS, inner start codes kept.
 * Single-NAL payloads are views into `data`, valid only until the caller reuses that buffer.
 */
export declare function packetizeH264Frame(data: Uint8Array, maxPayload?: number): H264PacketizedFrame;
/**
 * Reports whether an Annex-B access unit carries an IDR slice. SPS and PPS do not count:
 * encoders repeat them ahead of every frame.
 */
export declare function isH264KeyFrame(data: Uint8Array): boolean;
/** WebCodecs codec string of H.264 Constrained Baseline 3.1. */
export declare const H264_CONSTRAINED_BASELINE_CODEC = "avc1.42E01F";
/** The WebCodecs codec string read off an access unit's SPS, or `null` without one. */
export declare function readH264Codec(data: Uint8Array): string | null;
/**
 * RFC 6184 depacketizer for single NAL, STAP-A and FU-A payloads. The key-frame flag comes
 * from what made it into the access unit at flush time, including an IDR carried inside an
 * FU-A typed SPS. Payloads are held as views until their frame flushes, so a caller must not
 * reuse a pushed buffer before then.
 */
export declare class H264Depacketizer {
    private static readonly MAX_BUFFERED_BYTES;
    private static readonly NO_FU_RUN;
    private timestamp;
    private parts;
    private readonly nalHeaders;
    private fuParts;
    private fuNalType;
    private fuLastSequence;
    private bufferedBytes;
    /**
     * @param sequenceNumber RTP sequence number of `payload`: an FU-A continuation is only
     * accepted right after the last fragment of its run.
     */
    push(payload: Uint8Array, timestamp: number, marker: boolean, sequenceNumber: number): readonly H264AccessUnit[];
    reset(): void;
    private resetFrame;
    private clearFuRun;
    private exceedsCap;
    private appendNal;
    private appendStapA;
    /** A continuation off sequence abandons its run; one of another type leaves the run alone. */
    private appendFuA;
    private dropFuBytes;
    private flush;
    /**
     * Whether an SPS of `data` carries an IDR after an embedded start code, reading only SPS
     * bytes. Every NAL in `parts` opens with the shared `START_CODE`, which marks its bounds.
     */
    private spsCarriesIdr;
}
