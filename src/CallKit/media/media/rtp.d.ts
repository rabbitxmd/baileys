/**
 * Profile of the one-byte RFC 8285 extension as the official client emits it: `0xDEBE`,
 * not the RFC's `0xBEDE`. Changing it is a protocol change.
 */
export declare const WA_RTP_EXTENSION_PROFILE = 57022;
export declare class RtpHeader {
    version: number;
    padding: boolean;
    extension: boolean;
    marker: boolean;
    payloadType: number;
    sequenceNumber: number;
    timestamp: number;
    ssrc: number;
    csrc: readonly number[];
    extensionProfile: number;
    extensionData: Uint8Array;
    get csrcCount(): number;
    constructor(payloadType: number, sequenceNumber: number, timestamp: number, ssrc: number);
    size(): number;
    encode(buf: Uint8Array): number;
    /** `extensionData` is a view into `buf`, not a copy. */
    static decode(buf: Uint8Array): RtpHeader;
}
export declare class RtpPacket {
    header: RtpHeader;
    payload: Uint8Array;
    constructor(header: RtpHeader, payload: Uint8Array);
    size(): number;
    encode(): Uint8Array;
    static decode(buf: Uint8Array): RtpPacket;
}
/**
 * The numbering of one outbound RTP stream: SSRC, payload type and a sequence starting at
 * a random point. Timestamps come from the caller's `WaMediaClock`, shared by both streams.
 */
export declare class RtpSession {
    private readonly ssrc;
    private readonly payloadType;
    private sequenceNumber;
    constructor(ssrc: number, payloadType: number);
    getSsrc(): number;
    static whatsappOpus(ssrc: number): RtpSession;
    /** The next packet of the stream, stamped `timestamp`, which is taken modulo 2^32. */
    createPacketAtTimestamp(payload: Uint8Array, timestamp: number, marker?: boolean): RtpPacket;
}
