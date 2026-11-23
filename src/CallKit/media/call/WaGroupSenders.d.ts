import { type SrtcpSession, type SrtpSession } from '../crypto/srtp.js';
import type { Logger } from '../logger.js';
import { AudioReceiveSet } from '../media/audio-receive-set.js';
import { MLowCodec, type MLowCompanionModelSource } from '../media/mlow-codec.js';
import type { WaMediaClock } from '../media/WaMediaClock.js';
import type { WaCallMediaSender } from './plan.js';
export interface WaGroupSendersOptions {
    readonly logger: Logger;
    readonly clock: WaMediaClock;
    readonly companionModel: MLowCompanionModelSource | undefined;
    readonly playoutCapacity: number;
    readonly silenceMs?: number;
    readonly onSenderAudio?: (senderId: string, pcm: Float32Array) => void;
    /** A sender's media started (`true`) or went silent (`false`). */
    readonly onSenderMedia: (senderId: string, receiving: boolean) => void;
    /** `ssrc` lost its receive keying: no sender of the plan owns it any more. */
    readonly onUnkeyed: (ssrc: number) => void;
}
/**
 * The remote senders of a group call: their receive set and decoders, the SSRCs keyed for them,
 * the gate on unplanned SSRCs, the stream the audio REMB names, and the silence watch.
 */
export declare class WaGroupSenders {
    private readonly logger;
    private readonly clock;
    private readonly companionModel;
    private readonly playoutCapacity;
    private readonly silenceMs;
    private readonly onSenderAudio;
    private readonly onSenderMedia;
    private readonly onUnkeyed;
    /** Set by a non-null `group` section: a decoder per remote sender, mixed for playout. */
    private receiveSet;
    private senders;
    /** SSRCs the group's receive keying is installed on, in SRTP and SRTCP alike. */
    private readonly keyed;
    /** The one group stream the audio REMB names: the first heard, until its sender leaves. */
    private rembSsrc;
    private silenceTimer;
    private closed;
    /** Group packets on an SSRC the plan keys for no sender, dropped before SRTP. */
    private unplannedPacketCount;
    constructor(options: WaGroupSendersOptions);
    /** The receive set while in group mode, or `null` on a 1:1 call. */
    get audio(): AudioReceiveSet | null;
    get keyedCount(): number;
    get unplannedPackets(): number;
    /** Enters group mode with a fresh receive set; returns whether it was not in it already. */
    open(): boolean;
    /**
     * Applies the plan's senders, past the ceiling dropped, to the set {@link open} made: each
     * gets a decoder and its receive keying on every one of its SSRCs. Returns the kept senders.
     */
    update(listed: readonly WaCallMediaSender[], srtp: SrtpSession | null, srtcp: SrtcpSession | null): readonly WaCallMediaSender[];
    /** Leaves group mode, unkeying every sender; returns whether it was in it. */
    leave(srtp: SrtpSession | null, srtcp: SrtcpSession | null): boolean;
    /** Keys every sender again on new receive sessions. */
    rekey(srtp: SrtpSession | null, srtcp: SrtcpSession | null): void;
    /**
     * In a group call, drops a packet on an SSRC the plan keys for no sender before SRTP sees
     * it: a context keyed lazily with the call's own key could evict one of a sender's.
     */
    dropsUnplanned(ssrc: number): boolean;
    /** Whether the audio REMB names `ssrc`, the first stream heard following it from then on. */
    takesAudioRemb(ssrc: number): boolean;
    /** Starts the silence watch, once; each check reports the senders gone quiet. */
    watchSilence(): void;
    /** Stops the silence watch for good. */
    close(): void;
    clear(): void;
    /** The decoder of one group sender: no encoder, the call's Companion if it has one. */
    createSenderDecoder(): Promise<MLowCodec>;
    private stopSilenceWatch;
    /**
     * Keys every SSRC of the group's senders on the receive sessions and drops the ones no longer
     * listed. Same material keeps a context and its replay window; the bound grows first.
     */
    private installRecvKeys;
}
