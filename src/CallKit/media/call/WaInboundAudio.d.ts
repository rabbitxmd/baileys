import type { Logger } from '../logger.js';
import type { MLowCodec } from '../media/mlow-codec.js';
import { RtpStreamReception } from '../media/rtp-stream-reception.js';
import type { RtpHeader } from '../media/rtp.js';
import type { WaJitterBuffer } from '../media/WaJitterBuffer.js';
import type { WaGroupSenders } from './WaGroupSenders.js';
export interface WaInboundAudioOptions {
    readonly logger: Logger;
    /** The 1:1 playout the decoded frames go to. */
    readonly playout: WaJitterBuffer;
    readonly group: Pick<WaGroupSenders, 'audio' | 'takesAudioRemb'>;
    /** The call's codec as it is when read: it decodes 1:1 audio and takes the loss reports. */
    readonly codec: () => MLowCodec | null;
    /** Peer audio authenticated on `ssrc`, on a 1:1 call. */
    readonly onPeerAudio: (ssrc: number) => void;
    /** Sends the audio REMB naming `ssrc`, when one is due. */
    readonly sendReceiverEstimate: (ssrc: number) => void;
}
/**
 * Decodes inbound PT 120, 121 and 122 on the 1:1 decoder, or on the group sender's own, and
 * keeps the 1:1 reception and the receive counters.
 */
export declare class WaInboundAudio {
    private readonly logger;
    private readonly playout;
    private readonly group;
    private readonly codec;
    private readonly onPeerAudio;
    private readonly sendReceiverEstimate;
    /** The peer stream of a 1:1 call, as the report blocks and the audio REMB see it. */
    readonly reception: RtpStreamReception;
    private audioRecvCount;
    private audioRedDiscardCount;
    /** The PT 121 packet being received, read once for the check and the decode. */
    private readonly pt121Read;
    private recvRealCount;
    private recvDtxCount;
    /** Queues one decoded frame for playout; bound once so the decode path allocates no closure. */
    private readonly onDecodedAudio;
    constructor(options: WaInboundAudioOptions);
    get received(): number;
    get redDiscarded(): number;
    /** Takes one authenticated audio packet of payload type `pt`: 120, 121 or 122. */
    receive(pt: number, header: RtpHeader, payload: Uint8Array): void;
    /**
     * Decodes one peer audio packet: `stream` 0 is PT 120, 1 is PT 121, numbered apart on the
     * one timeline. PT 121 on an SSRC other than the one the reception follows stays out of it.
     */
    private onAudioPacket;
    private countAudioPayload;
    /** Hands the encoder the loss its FEC plans for, and logs the receive counters. */
    private reportAudioRecvStats;
    /**
     * Decodes one group sender's audio on that sender's own decoder. Nothing latches: every
     * sender's SSRC comes from the plan.
     */
    private onGroupAudioPacket;
    /** Counts a PT 121 packet that does not parse as MLow; the first ones log their header. */
    private discardRedAudio;
}
