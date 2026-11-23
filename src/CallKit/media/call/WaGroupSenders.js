import { hexSsrc } from '../bytes.js';
import { SRTP_MAX_RECV_CONTEXTS } from '../crypto/srtp.js';
import { AudioReceiveSet } from '../media/audio-receive-set.js';
import { MLowCodec } from '../media/mlow-codec.js';
import { unrefTimer } from '../timers.js';
import { AUDIO_SAMPLE_RATE, VIDEO_CLOCK_RATE } from '../types.js';
/**
 * Silence after which a group sender counts as no longer received, by default: the time a peer
 * waits before it reports another participant invisible.
 */
const DEFAULT_SENDER_SILENCE_MS = 20_000;
/** How often group senders are checked for that silence, at most. */
const SENDER_SILENCE_CHECK_MS = 1_000;
/**
 * Remote senders of a group call given a decoder at once: the compiled participant ceiling.
 * A sender is a device, so a roster of many multi-device accounts can pass it.
 */
const MAX_GROUP_SENDERS = 64;
/**
 * The remote senders of a group call: their receive set and decoders, the SSRCs keyed for them,
 * the gate on unplanned SSRCs, the stream the audio REMB names, and the silence watch.
 */
export class WaGroupSenders {
    logger;
    clock;
    companionModel;
    playoutCapacity;
    silenceMs;
    onSenderAudio;
    onSenderMedia;
    onUnkeyed;
    /** Set by a non-null `group` section: a decoder per remote sender, mixed for playout. */
    receiveSet = null;
    senders = [];
    /** SSRCs the group's receive keying is installed on, in SRTP and SRTCP alike. */
    keyed = new Set();
    /** The one group stream the audio REMB names: the first heard, until its sender leaves. */
    rembSsrc = 0;
    silenceTimer = null;
    closed = false;
    /** Group packets on an SSRC the plan keys for no sender, dropped before SRTP. */
    unplannedPacketCount = 0;
    constructor(options) {
        this.logger = options.logger;
        this.clock = options.clock;
        this.companionModel = options.companionModel;
        this.playoutCapacity = options.playoutCapacity;
        this.silenceMs = options.silenceMs ?? DEFAULT_SENDER_SILENCE_MS;
        this.onSenderAudio = options.onSenderAudio;
        this.onSenderMedia = options.onSenderMedia;
        this.onUnkeyed = options.onUnkeyed;
    }
    /** The receive set while in group mode, or `null` on a 1:1 call. */
    get audio() {
        return this.receiveSet;
    }
    get keyedCount() {
        return this.keyed.size;
    }
    get unplannedPackets() {
        return this.unplannedPacketCount;
    }
    /** Enters group mode with a fresh receive set; returns whether it was not in it already. */
    open() {
        if (this.receiveSet)
            return false;
        this.receiveSet = new AudioReceiveSet({
            clockRate: AUDIO_SAMPLE_RATE,
            videoClockRate: VIDEO_CLOCK_RATE,
            playoutCapacity: this.playoutCapacity,
            maxSenders: MAX_GROUP_SENDERS,
            createDecoder: () => this.createSenderDecoder(),
            onSenderAudio: this.onSenderAudio,
            logger: this.logger.child({ component: 'group-audio' })
        });
        return true;
    }
    /**
     * Applies the plan's senders, past the ceiling dropped, to the set {@link open} made: each
     * gets a decoder and its receive keying on every one of its SSRCs. Returns the kept senders.
     */
    update(listed, srtp, srtcp) {
        const senders = listed.length > MAX_GROUP_SENDERS ? listed.slice(0, MAX_GROUP_SENDERS) : listed;
        const audio = this.receiveSet;
        this.senders = senders;
        for (const senderId of audio.sync(senders))
            this.onSenderMedia(senderId, false);
        if (!audio.has(this.rembSsrc))
            this.rembSsrc = 0;
        this.installRecvKeys(srtp, srtcp);
        return senders;
    }
    /** Leaves group mode, unkeying every sender; returns whether it was in it. */
    leave(srtp, srtcp) {
        const audio = this.receiveSet;
        if (!audio)
            return false;
        this.senders = [];
        this.installRecvKeys(srtp, srtcp);
        for (const senderId of audio.sync([]))
            this.onSenderMedia(senderId, false);
        audio.clear();
        this.receiveSet = null;
        this.rembSsrc = 0;
        this.stopSilenceWatch();
        return true;
    }
    /** Keys every sender again on new receive sessions. */
    rekey(srtp, srtcp) {
        this.keyed.clear();
        this.installRecvKeys(srtp, srtcp);
    }
    /**
     * In a group call, drops a packet on an SSRC the plan keys for no sender before SRTP sees
     * it: a context keyed lazily with the call's own key could evict one of a sender's.
     */
    dropsUnplanned(ssrc) {
        if (!this.receiveSet || this.keyed.has(ssrc))
            return false;
        const dropped = ++this.unplannedPacketCount;
        if (dropped === 1 || dropped % 500 === 0) {
            this.logger.debug('group packet on an unplanned ssrc dropped', {
                packets: dropped,
                ssrc: hexSsrc(ssrc)
            });
        }
        return true;
    }
    /** Whether the audio REMB names `ssrc`, the first stream heard following it from then on. */
    takesAudioRemb(ssrc) {
        if (this.rembSsrc === 0)
            this.rembSsrc = ssrc;
        return ssrc === this.rembSsrc;
    }
    /** Starts the silence watch, once; each check reports the senders gone quiet. */
    watchSilence() {
        if (this.silenceTimer || this.closed)
            return;
        this.silenceTimer = setInterval(() => {
            const group = this.receiveSet;
            if (!group)
                return;
            for (const senderId of group.takeSilent(this.clock.now(), this.silenceMs)) {
                this.onSenderMedia(senderId, false);
            }
        }, Math.min(SENDER_SILENCE_CHECK_MS, this.silenceMs));
        unrefTimer(this.silenceTimer);
    }
    /** Stops the silence watch for good. */
    close() {
        this.closed = true;
        this.stopSilenceWatch();
    }
    clear() {
        this.receiveSet?.clear();
        this.receiveSet = null;
        this.keyed.clear();
    }
    /** The decoder of one group sender: no encoder, the call's Companion if it has one. */
    createSenderDecoder() {
        return MLowCodec.create({
            logger: this.logger.child({ component: 'mlow' }),
            companionModel: this.companionModel,
            decodeOnly: true
        });
    }
    stopSilenceWatch() {
        if (!this.silenceTimer)
            return;
        clearInterval(this.silenceTimer);
        this.silenceTimer = null;
    }
    /**
     * Keys every SSRC of the group's senders on the receive sessions and drops the ones no longer
     * listed. Same material keeps a context and its replay window; the bound grows first.
     */
    installRecvKeys(srtp, srtcp) {
        if (!srtp || !srtcp)
            return;
        const wanted = new Map();
        for (const sender of this.senders) {
            wanted.set(sender.audio, sender.recv);
            for (const ssrc of sender.streams)
                wanted.set(ssrc, sender.recv);
        }
        for (const ssrc of this.keyed) {
            if (wanted.has(ssrc))
                continue;
            srtp.deleteRecvContext(ssrc);
            srtcp.deleteRecvContext(ssrc);
            this.keyed.delete(ssrc);
            this.onUnkeyed(ssrc);
        }
        const bound = wanted.size + SRTP_MAX_RECV_CONTEXTS;
        if (bound > srtp.maxRecvContexts) {
            srtp.setMaxRecvContexts(bound);
            srtcp.setMaxRecvContexts(bound);
        }
        for (const [ssrc, keying] of wanted) {
            srtp.setRecvKeying(ssrc, keying);
            srtcp.setRecvKeying(ssrc, keying);
            this.keyed.add(ssrc);
        }
        if (bound < srtp.maxRecvContexts) {
            srtp.setMaxRecvContexts(bound);
            srtcp.setMaxRecvContexts(bound);
        }
    }
}
