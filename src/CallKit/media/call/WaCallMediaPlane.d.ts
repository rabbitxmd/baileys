import type { WaCallReaction } from '../app-data/protocol.js';
import type { WaMediaHost } from '../host.js';
import { type Logger } from '../logger.js';
import type { AudioReceiveSenderStats } from '../media/audio-receive-set.js';
import { type MLowCompanionModelSource, type MLowRedOptions } from '../media/mlow-codec.js';
import { type WaJitterBufferStats } from '../media/WaJitterBuffer.js';
import type { RawUdpLeg, RawUdpLegOptions } from '../relay/leg.js';
import { type InboundVideoFrame, type InboundVideoRtpPacket } from '../types.js';
import { type WaCallMediaPlanUpdate } from './plan.js';
export interface WaCallMediaPlaneEvents {
    /** Media started flowing: the call is accepted and a relay leg is up. Fired once. */
    readonly onActive?: () => void;
    /**
     * The call has no relay leg left, open or dialling, and nothing redials. The
     * media is gone; ending the call is signaling's decision.
     */
    readonly onRelayLost?: (reason: string) => void;
    /** A relay answered one of our legs for the first time; see `WaSctpRelayOptions.onRelayAnswered`. */
    readonly onRelayAnswered?: (name: string, rttMs?: number) => void;
    /**
     * One in-band emoji reaction, deduplicated: the sender repeats it, this fires once. In a
     * group call `senderId` names the sender whose stream carried it.
     */
    readonly onReaction?: (reaction: WaCallReaction, senderId?: string) => void;
    readonly onInboundVideoRtp?: (packet: InboundVideoRtpPacket) => void;
    readonly onInboundVideo?: (frame: InboundVideoFrame) => void;
    /**
     * One group sender's decoded audio, before the mix {@link WaCallMediaPlane.pullPlayout}
     * plays. `pcm` is reused after the call returns.
     */
    readonly onSenderAudio?: (senderId: string, pcm: Float32Array) => void;
    /**
     * A group sender's media started arriving (`true`, on its first authenticated packet) or
     * stopped (`false`, after {@link WaCallMediaPlaneOptions.senderSilenceMs} without one).
     */
    readonly onSenderMedia?: (senderId: string, receiving: boolean) => void;
}
export interface WaCallMediaPlaneOptions extends WaMediaHost, WaCallMediaPlaneEvents {
    readonly logger?: Logger;
    /** See `WaSctpRelayOptions.createRawUdpLeg`. */
    readonly createRawUdpLeg?: (options: RawUdpLegOptions) => RawUdpLeg;
    /**
     * Which relays `createRawUdpLeg` dials: `all` (the default), or only the endpoints the plan
     * marks `transport: 'raw-udp'`, the others going over the peer connection.
     */
    readonly rawUdpLegs?: 'all' | 'required';
    /**
     * Silence after which a group sender counts as no longer received; a local choice, 20 s by
     * default.
     */
    readonly senderSilenceMs?: number;
    /**
     * Asks the relay for `group.videoSubscriptions`. Off by default, until the relay's handling
     * of them is confirmed; off, the plan's subscriptions are ignored.
     */
    readonly videoSubscriptions?: boolean;
    /** Dials every relay on the port it advertises instead of the web client's port. */
    readonly useOriginalRelayPort?: boolean;
    /**
     * Monotonic time source of the media clock, in ms; `performance.now()` by default.
     * Every `capturedAtMs` given to {@link WaCallMediaPlane.pushCapture} is on this scale.
     */
    readonly now?: () => number;
    /**
     * Weights of the MLow Companion, the neural post-filter WhatsApp runs in its MLow decoder:
     * its `mlow_companion_v1.pte` (a `DNNw` blob), as bytes or a loader called each time a call
     * loads the codec. Not shipped with any package; weights that fail to load are skipped.
     */
    readonly mlowCompanionModel?: MLowCompanionModelSource;
    /**
     * Sends MLow RED as a plain multiframe, the low-rate copy of the previous frame then the
     * frame, stamped on the copy. Off by default. Turns DTX off and overrides the bundling the
     * plan asks for.
     */
    readonly mlowRed?: boolean | MLowRedOptions;
}
export interface WaCallMediaStats {
    readonly relayPackets: number;
    readonly audioSent: number;
    readonly audioDropped: number;
    /** Capture pauses the audio timeline jumped over, each sent with the marker set. */
    readonly audioTimelineResyncs: number;
    /** Captured audio frames discarded because the host delivered them ahead of the clock. */
    readonly audioFramesShed: number;
    /**
     * Capture instant minus timestamp of the last audio frame sent, in ms: positive when the
     * timeline runs behind. Bounded by the timeline's slack.
     */
    readonly audioCaptureSkewMs: number;
    readonly audioReceived: number;
    /** PT 121 packets discarded for not parsing as MLow; the rest decode with the PT 120 audio. */
    readonly audioRedDiscarded: number;
    /** Inbound RTP dropped by SRTP: the sum of the three below. */
    readonly srtpErrors: number;
    /** Packets already received, as is every copy after the first that another relay leg delivers. */
    readonly srtpReplays: number;
    /** Packets whose SRTP auth tag did not verify. */
    readonly srtpAuthFailures: number;
    /** Any other failure: a malformed packet, or an exception past decryption. */
    readonly srtpOtherErrors: number;
    readonly videoFramesSent: number;
    readonly videoPacketsReceived: number;
    readonly videoFecDiscarded: number;
    readonly decoded: number;
    readonly decodeErrors: number;
    readonly playout: WaJitterBufferStats;
    /** Per remote sender of a group call; absent on a 1:1 call. */
    readonly senders?: readonly WaCallMediaSenderStats[];
    /** Group packets on an SSRC the plan keys for no sender, dropped; absent on a 1:1 call. */
    readonly unplannedPackets?: number;
    /** Inbound datagrams the relay framed around RTP, unframed and passed on. */
    readonly warpFrames?: number;
    /** Relay frames with no RTP inside, dropped. */
    readonly warpControlFrames?: number;
    /** Relay frames whose header ran past the datagram, dropped. */
    readonly warpOverruns?: number;
}
/** The audio of one remote sender of a group call. */
export type WaCallMediaSenderStats = AudioReceiveSenderStats;
/**
 * The media of one call, driven by a plan from signaling ({@link apply}) and by the host's
 * capture and playout. Audio and video are stamped on one {@link WaMediaClock} per call.
 */
export declare class WaCallMediaPlane {
    private readonly logger;
    private readonly traceEnabled;
    private readonly events;
    private readonly crypto;
    private readonly sctpRelay;
    private readonly useOriginalRelayPort;
    private readonly companionModel;
    private readonly videoSubscriptionsEnabled;
    private readonly redOptions;
    private readonly playout;
    /** The call's media clock; its origin is the caller's warmup or the start of the flow. */
    private readonly clock;
    private mediaType;
    private accepted;
    private muted;
    private relays;
    private ssrcs;
    private keyEpoch;
    /** Generation of the relays held; see `WaCallMediaRelays.generation`. */
    private relayGeneration;
    /** The remote senders of a group call; its `audio` is set while in group mode. */
    private readonly group;
    /** Whether the relay was handed a video subscription; see `WaCallMediaGroup.videoSubscriptions`. */
    private rxSubscriptionsDeclared;
    private codec;
    private rtpSession;
    private videoRtpSession;
    private srtpSession;
    private srtcpContext;
    private srtcpRecvSession;
    /** Our streams and the peer's the relay is told about, plan plus what video opened. */
    private selfStreams;
    /** `selfStreams` as a set, for the echo filter on every inbound packet. */
    private selfStreamSet;
    private peerStreams;
    /** The peer stream the relay subscription names: the plan's, or the one that arrived. */
    private subscriptionSsrc;
    /** Our stream the relay registration names, as last handed to the relay. */
    private registeredSelfSsrc;
    /** Whether the relay was handed our streams by layer; see `WaCallMediaSsrcs.selfLayers`. */
    private selfLayersDeclared;
    /** Set while an update is applied, so the relay replays its registrations once at the end. */
    private deferResend;
    private resendPending;
    /** The in-band app-data stream of this call; see {@link WaAppDataStream}. */
    private appDataStream;
    /**
     * App-data SSRCs of the peer's devices: inbound app data is recognized by SSRC,
     * never by payload type, which nothing negotiates.
     */
    private readonly peerAppDataSsrcs;
    /** Whether the peer's video was let in on a call negotiated as audio. */
    private videoReceivePathOpened;
    /**
     * Whether an accepted upgrade opened our video sender on a call negotiated as
     * audio. Until it does {@link sendVideoFrame} drops every frame.
     */
    private videoSendPathOpened;
    private applying;
    private starting;
    private flowing;
    private stopped;
    /**
     * Set when a leg is up before the call is accepted, the caller's warmup: captured
     * audio then goes out as silence until the flow starts for real.
     */
    private silenceWarmup;
    private audioSendCount;
    private audioOctetCount;
    private videoRecvPackets;
    /** Video Reed-Solomon FEC packets, discarded; another stream, so not in `videoRecvPackets`. */
    private reedSolomonFecPackets;
    private srtpReplayCount;
    private srtpAuthFailureCount;
    private srtpOtherErrorCount;
    private relayPacketCount;
    private warpFrameCount;
    private warpControlFrameCount;
    private warpOverrunCount;
    private subscriptionRefreshTimer;
    private readonly videoReception;
    private actualPeerSsrc;
    /** Our outbound RTCP: the report and REMB schedules, key frame requests, the CNAME. */
    private readonly rtcp;
    /** Our audio stream: framing, the timeline, bundling and RED. */
    private readonly outboundAudio;
    /** Our video stream: packetization, the WA extension, the hold. */
    private readonly outboundVideo;
    /** Peer video: per-SSRC reassembly and key frame requests. */
    private readonly inboundVideo;
    /** Peer audio: the 1:1 decode and reception, and the receive counters. */
    private readonly inboundAudio;
    /** Protects and sends one RTP packet on the keys and relay held when it is called. */
    private readonly sendProtectedRtp;
    constructor(options: WaCallMediaPlaneOptions);
    /** Whether media is flowing: accepted, a leg up, and not stopped. */
    get isFlowing(): boolean;
    /**
     * Whether a leg came up before the accept (the caller's warmup): capture pushed now goes
     * out as silence, so a host must run its capture clock before media flows.
     */
    get isWarmingUp(): boolean;
    /** Loads the codec. Nothing is encoded or decoded before it resolves. */
    start(): Promise<void>;
    private loadCodec;
    /**
     * Applies a plan change. Updates run one at a time in call order, even while one dials
     * relays; a failed update rejects for its caller and leaves the queue running.
     */
    apply(update: WaCallMediaPlanUpdate): Promise<void>;
    private applyNow;
    /** Replays the registrations on the open legs; inside an update it waits for its end. */
    private requestResend;
    /**
     * Applies the REMB gate, RTCP interval and audio bundling; a `null` section changes nothing,
     * a `null` interval inside one restores the compiled interval.
     */
    private applySettings;
    private applySsrcs;
    /** Points the relay subscription at the peer stream `ssrc`. */
    private setSubscription;
    private applyKeys;
    /**
     * Applies a group call's senders: each gets a decoder and its receive keying on every one
     * of its SSRCs. `null` leaves group mode, the 1:1 receive path taking over again.
     */
    private applyGroup;
    /**
     * Recognizes inbound app data by the plan's SSRCs: a group plan's list replaces the set
     * whole, a 1:1 one only adds to it, up to its bound.
     */
    private refreshPeerAppData;
    /**
     * Hands the relay the video asked of each sender, by the sender's pid; a sender without one
     * yet is left out. Off unless the plane was built with `videoSubscriptions`.
     */
    private applyVideoSubscriptions;
    private emitSenderMedia;
    private applyVideo;
    private applyRelays;
    private applyAccepted;
    /**
     * Hands in captured 16 kHz mono audio, any length, sent as whole codec frames. Dropped
     * before media flows; sent as silence during the warmup or while muted. `capturedAtMs` is
     * when `samples[0]` was captured, on the `now` scale; absent, the block ends now.
     */
    pushCapture(samples: Float32Array, capturedAtMs?: number): void;
    /**
     * Fills `out` with the next speaker samples and returns how many are the peer's audio;
     * the rest is silence. In a group call it is every sender's audio, summed and clipped.
     * Called on the host's own clock, any block size.
     */
    pullPlayout(out: Float32Array): number;
    /**
     * Sends one Annex-B H.264 access unit and returns the RTP packet count, or 0 when video
     * cannot go out yet or is held for the peer. The stream opens on a key frame.
     * `timestampUs` may use any epoch: it is mapped onto the call's media clock.
     */
    sendVideoFrame(data: Uint8Array, timestampUs: number): number;
    /** A video frame went out: its sender report, when one is due. */
    private onVideoFrameSent;
    /**
     * Sends one emoji reaction in-band on the media socket. Returns whether the first
     * packet left; a `false` does not lose it, the retransmission carries it.
     */
    sendReaction(reaction: string): boolean;
    getStats(): WaCallMediaStats;
    /** Tears the media down for good and returns what it carried. */
    stop(): WaCallMediaStats;
    private get carriesVideo();
    private get videoSendActive();
    private ensureVideoRtpSession;
    /** Tells the relay our streams and the peer's to forward; an unchanged list is not replayed. */
    private refreshStreams;
    /**
     * Opens the video receive path on a call negotiated as audio: the relay subscription and the
     * video RTP session key frame requests and the REMB ride on. Idempotent; a no-op on video.
     */
    private ensureVideoReceivePath;
    /**
     * Opens our video sender on a call negotiated as audio, once both sides agreed the upgrade,
     * and registers our video SSRCs with the relay. Idempotent; a no-op on video.
     */
    private openVideoSendPath;
    private openVideoPath;
    /**
     * Frames `data` (first sample captured at `capturedAtMs`) and sends each complete frame.
     * A drop discards the partial frame, so the timeline steps over exactly what was lost.
     */
    private encodeCaptured;
    /** Sends one encoded audio payload; `captureMs` lets the sender report carry its timestamp. */
    private sendAudioPacket;
    private sendRtp;
    /**
     * Opens this device's app-data stream on its own SSRC, reusing the plane's SRTP and relay.
     * Reopening on the same SSRC is a no-op, so a plan update confirming the guess keeps it.
     */
    private openAppDataStream;
    /**
     * Reads one inbound app-data packet and hands the reactions in it over; it was
     * recognized by SSRC, so its payload type is whatever the peer chose.
     */
    private onAppDataPacket;
    private resetEncodeState;
    private startFlow;
    private onRelayConnected;
    /** No relay leg is left and nothing redials: the call is mute until signaling ends it. */
    private onRelayLost;
    /**
     * Peer media on `ssrc` that authenticated on a relay leg, which the relay follows (see
     * `notePeerMedia`); in a group call it also marks the sender as heard.
     */
    private notePeerMedia;
    /** Takes the conference relay's frame off a datagram; `null` for a frame with no media in it. */
    private unframeRelayData;
    private onRelayData;
    private onRtcpPacket;
    /** Counts an inbound RTP packet SRTP refused with an error: a bad auth tag, or else. */
    private countReceiveError;
    /** Counts an inbound RTP packet already received, such as a copy from another relay leg. */
    private countReplay;
    private logReceiveError;
    /**
     * Subscribes the call to the first peer audio stream that authenticated, once. The
     * subscription names the peer's audio, so its video and FEC streams never latch.
     */
    private latchPeerSsrc;
    private onVideoPacket;
    private connectRelays;
    /** The audio REMB, while media flows; see {@link WaCallRtcp.sendAudioReceiverEstimate}. */
    private sendAudioReceiverEstimate;
}
