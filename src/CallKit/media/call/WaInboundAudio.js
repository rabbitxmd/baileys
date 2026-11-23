import { bytesToHex, hexSsrc } from '../bytes.js';
import { MlowPacketRead } from '../media/mlow-packet.js';
import { RtpStreamReception } from '../media/rtp-stream-reception.js';
import { AUDIO_SAMPLE_RATE, PayloadType } from '../types.js';
/**
 * Decodes inbound PT 120, 121 and 122 on the 1:1 decoder, or on the group sender's own, and
 * keeps the 1:1 reception and the receive counters.
 */
export class WaInboundAudio {
    logger;
    playout;
    group;
    codec;
    onPeerAudio;
    sendReceiverEstimate;
    /** The peer stream of a 1:1 call, as the report blocks and the audio REMB see it. */
    reception = new RtpStreamReception(AUDIO_SAMPLE_RATE);
    audioRecvCount = 0;
    audioRedDiscardCount = 0;
    /** The PT 121 packet being received, read once for the check and the decode. */
    pt121Read = new MlowPacketRead();
    recvRealCount = 0;
    recvDtxCount = 0;
    /** Queues one decoded frame for playout; bound once so the decode path allocates no closure. */
    onDecodedAudio = (pcm) => {
        this.playout.write(pcm);
    };
    constructor(options) {
        this.logger = options.logger;
        this.playout = options.playout;
        this.group = options.group;
        this.codec = options.codec;
        this.onPeerAudio = options.onPeerAudio;
        this.sendReceiverEstimate = options.sendReceiverEstimate;
    }
    get received() {
        return this.audioRecvCount;
    }
    get redDiscarded() {
        return this.audioRedDiscardCount;
    }
    /** Takes one authenticated audio packet of payload type `pt`: 120, 121 or 122. */
    receive(pt, header, payload) {
        if (pt === PayloadType.WhatsAppOpus) {
            this.onAudioPacket(header, payload, 0);
        }
        else if (pt === PayloadType.WhatsAppMlowRed) {
            if (this.pt121Read.read(payload)) {
                this.onAudioPacket(header, payload, 1, this.pt121Read);
            }
            else {
                this.discardRedAudio(payload, header.ssrc);
            }
        }
        else {
            const outcome = this.onAudioPacket(header, payload, 0);
            this.group.audio?.countPt122(header.ssrc, outcome);
        }
    }
    /**
     * Decodes one peer audio packet: `stream` 0 is PT 120, 1 is PT 121, numbered apart on the
     * one timeline. PT 121 on an SSRC other than the one the reception follows stays out of it.
     */
    onAudioPacket(header, payload, stream, read) {
        const group = this.group.audio;
        if (group) {
            return this.onGroupAudioPacket(group, header, payload, stream, read);
        }
        const ssrc = header.ssrc;
        this.onPeerAudio(ssrc);
        const codec = this.codec();
        if (!codec)
            return null;
        this.audioRecvCount++;
        const seq = header.sequenceNumber;
        const followed = this.reception.sourceSsrc;
        if (stream === 0 || followed === 0 || followed === ssrc) {
            this.reception.observe(ssrc, seq, header.timestamp, Date.now());
            this.sendReceiverEstimate(ssrc);
        }
        if (payload.length === 0)
            return 'empty';
        this.countAudioPayload(payload);
        const outcome = codec.decodeSequenced(seq, payload, this.onDecodedAudio, header.timestamp, stream, read);
        if (this.audioRecvCount % 100 === 0) {
            const stats = codec.getStats();
            this.reportAudioRecvStats('audio recv stats', this.reception.lossPercent, {
                decodeOk: stats.success,
                decodeErr: stats.errors,
                plc: stats.plc,
                fec: stats.fec,
                late: stats.late,
                redundant: stats.redundant,
                redRecovered: stats.redRecovered
            });
        }
        return outcome;
    }
    countAudioPayload(payload) {
        if (payload.length <= 2)
            this.recvDtxCount++;
        else
            this.recvRealCount++;
    }
    /** Hands the encoder the loss its FEC plans for, and logs the receive counters. */
    reportAudioRecvStats(message, lossPercent, details) {
        this.codec()?.setExpectedPacketLossPercent(lossPercent);
        this.logger.debug(message, {
            recvCount: this.audioRecvCount,
            real: this.recvRealCount,
            dtx: this.recvDtxCount,
            ...details
        });
    }
    /**
     * Decodes one group sender's audio on that sender's own decoder. Nothing latches: every
     * sender's SSRC comes from the plan.
     */
    onGroupAudioPacket(group, header, payload, stream, read) {
        const ssrc = header.ssrc;
        this.audioRecvCount++;
        this.countAudioPayload(payload);
        const outcome = group.receive(ssrc, header.sequenceNumber, header.timestamp, payload, stream, Date.now(), read);
        if (this.group.takesAudioRemb(ssrc))
            this.sendReceiverEstimate(ssrc);
        if (this.audioRecvCount % 100 === 0) {
            this.reportAudioRecvStats('group audio recv stats', group.peakLossPercent(), {
                senders: group.size
            });
        }
        return outcome;
    }
    /** Counts a PT 121 packet that does not parse as MLow; the first ones log their header. */
    discardRedAudio(payload, ssrc) {
        const packets = ++this.audioRedDiscardCount;
        if (packets > 5 && packets % 500 !== 0)
            return;
        this.logger.debug('pt 121 packet discarded, not mlow', {
            packets,
            ssrc: hexSsrc(ssrc),
            bytes: payload.length,
            header: bytesToHex(payload.subarray(0, 4))
        });
    }
}
