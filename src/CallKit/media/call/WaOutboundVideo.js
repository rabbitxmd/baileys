import { packetizeH264Frame } from '../media/h264.js';
import { WA_RTP_EXTENSION_PROFILE } from '../media/rtp.js';
import { HostCaptureTimeMapper } from '../media/WaMediaClock.js';
import { VIDEO_CLOCK_RATE } from '../types.js';
import { buildExtensionViews, VIDEO_EXTENSION_SCRATCH_LENGTH, writeVideoExtension } from './video-extension.js';
/**
 * Turns H.264 access units into RTP packets carrying WhatsApp's video extension. The stream
 * opens on a key frame, closes on a hold, and its timestamps only move forward.
 */
export class WaOutboundVideo {
    logger;
    clock;
    sendRtp;
    onFrameSent;
    /** Maps the host's video capture timestamps onto the clock, one video tick apart at least. */
    captureTimes = new HostCaptureTimeMapper(1000 / VIDEO_CLOCK_RATE);
    /** Whether our video is held for the peer; see `WaCallMediaVideo.sendHeld`. */
    sendHeld = false;
    /** Whether our video stream went out yet: it opens on a key frame, never on a delta. */
    streamOpen = false;
    videoPacketCount = 0;
    videoOctetCount = 0;
    /** Timestamp of the last video frame sent, valid once one was. */
    videoTimestamp = 0;
    videoFrameNumber = 0;
    videoTransportSequence = 0;
    videoSendFrames = 0;
    /** The video RTP header extension, rewritten in place per packet. */
    videoExtensionScratch = new Uint8Array(VIDEO_EXTENSION_SCRATCH_LENGTH);
    videoExtensionViews = buildExtensionViews(this.videoExtensionScratch);
    constructor(options) {
        this.logger = options.logger;
        this.clock = options.clock;
        this.sendRtp = options.sendRtp;
        this.onFrameSent = options.onFrameSent;
    }
    get held() {
        return this.sendHeld;
    }
    get packetCount() {
        return this.videoPacketCount;
    }
    get octetCount() {
        return this.videoOctetCount;
    }
    get framesSent() {
        return this.videoSendFrames;
    }
    /** Holds or releases our frames; a hold closes the stream so it reopens on a key frame. */
    setHeld(held) {
        if (held === this.sendHeld)
            return;
        this.sendHeld = held;
        if (held)
            this.streamOpen = false;
        this.logger.debug('video send hold changed', { held });
    }
    /**
     * Packetizes and sends one access unit on `rtpSession` and returns the packet count, or 0
     * while the stream waits for a key frame. `receiverEstimate` rides on the first packet.
     */
    sendFrame(rtpSession, data, timestampUs, receiverEstimate) {
        const { payloads, keyFrame } = packetizeH264Frame(data, 800);
        if (!this.streamOpen) {
            if (!keyFrame)
                return 0;
            this.streamOpen = true;
        }
        const now = this.clock.now();
        const captureMs = this.captureTimes.map(timestampUs / 1000, now);
        let timestamp = this.clock.ticksAt(captureMs, VIDEO_CLOCK_RATE);
        // Rounding can collapse two mapped instants; keep the wire strictly increasing.
        if (this.videoSendFrames > 0 && ((timestamp - this.videoTimestamp) | 0) <= 0) {
            timestamp = (this.videoTimestamp + 1) >>> 0;
        }
        this.videoTimestamp = timestamp;
        for (let index = 0; index < payloads.length; index++) {
            const firstPacket = index === 0;
            const packet = rtpSession.createPacketAtTimestamp(payloads[index], timestamp, index === payloads.length - 1);
            packet.header.extension = true;
            packet.header.extensionProfile = WA_RTP_EXTENSION_PROFILE;
            packet.header.extensionData = this.buildVideoExtension(keyFrame, firstPacket, this.videoTransportSequence++, firstPacket ? receiverEstimate : 0);
            this.sendRtp(packet);
            this.videoPacketCount++;
            this.videoOctetCount += payloads[index].length;
        }
        this.onFrameSent(rtpSession.getSsrc(), timestamp, captureMs, now);
        this.videoFrameNumber = (this.videoFrameNumber + 1) & 0xffff;
        this.videoSendFrames++;
        if (this.videoSendFrames === 1 || this.videoSendFrames % 30 === 0) {
            this.logger.debug('video sent', {
                frames: this.videoSendFrames,
                bytes: data.length,
                packets: payloads.length
            });
        }
        return payloads.length;
    }
    /**
     * Writes a video packet's header extension into the scratch and returns the slice, valid
     * until the next call. A `receiverEstimate` above zero appends the REMB element.
     */
    buildVideoExtension(keyFrame, firstPacket, transportSequence, receiverEstimate) {
        const padded = writeVideoExtension(this.videoExtensionScratch, keyFrame, firstPacket, this.videoFrameNumber, transportSequence, receiverEstimate);
        return this.videoExtensionViews[padded >>> 2];
    }
}
