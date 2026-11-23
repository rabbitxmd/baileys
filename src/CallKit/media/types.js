/** Sample rate of call audio, mono, and the clock rate of its RTP timestamps. */
export const AUDIO_SAMPLE_RATE = 16_000;
/** Clock rate of the H.264 stream, the unit of its RTP timestamps. */
export const VIDEO_CLOCK_RATE = 90_000;
export var PayloadType;
(function (PayloadType) {
    PayloadType[PayloadType["WhatsAppOpus"] = 120] = "WhatsAppOpus";
    /** `mlow-red-1`: MLow, plain or with in-band RED, numbered apart from PT 120. */
    PayloadType[PayloadType["WhatsAppMlowRed"] = 121] = "WhatsAppMlowRed";
    /** `mlow-1`: plain MLow on PT 120's clock, SSRC and numbering. */
    PayloadType[PayloadType["WhatsAppMlowAlt"] = 122] = "WhatsAppMlowAlt";
    PayloadType[PayloadType["WhatsAppH264"] = 97] = "WhatsAppH264";
    /** Base of WhatsApp's Reed-Solomon video FEC, `103 + 3k`: opaque parity on its own SSRC. */
    PayloadType[PayloadType["WhatsAppVideoFec"] = 103] = "WhatsAppVideoFec";
})(PayloadType || (PayloadType = {}));
export const SRTP_AUTH_TAG_LEN = 4;
export const SRTP_LABEL = {
    ENCRYPTION: 0x00,
    AUTH: 0x01,
    SALT: 0x02
};
