import { WaCallMediaPlane } from './WaCallMediaPlane.js';
/** Version of the wire shape below. Only a breaking change moves it; a new field is optional. */
export const WA_CALL_MEDIA_WIRE_VERSION = 1;
/**
 * Host feature: applies `group`, `relays.generation`, per-relay `transport` and
 * `ssrcs.selfLayers`, and takes the relay's frame off inbound media.
 */
export const WA_CALL_MEDIA_FEATURE_GROUP = 'group/1';
/** Host feature: can dial raw UDP relay legs. */
export const WA_CALL_MEDIA_FEATURE_RAW_UDP = 'raw-udp';
/** Host feature: names the group sender on reactions and video, and sends `sender_media`. */
export const WA_CALL_MEDIA_FEATURE_GROUP_ATTRIBUTION = 'group-attribution/1';
/** Host feature: asks the relay for `group.videoSubscriptions`. */
export const WA_CALL_MEDIA_FEATURE_GROUP_VIDEO = 'group-video/1';
/** Marks a byte array in the JSON text, which has no binary type of its own. */
const BYTES_KEY = '$bytes';
/** Marks a `bigint`, which JSON cannot carry: a reaction's transaction id is a `uint64`. */
const BIGINT_KEY = '$bigint';
function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function base64ToBytes(text) {
    const binary = atob(text);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
    }
    return out;
}
function encode(value) {
    return JSON.stringify(value, (_key, field) => {
        if (field instanceof Uint8Array)
            return { [BYTES_KEY]: bytesToBase64(field) };
        if (typeof field === 'bigint')
            return { [BIGINT_KEY]: field.toString() };
        return field;
    });
}
function decode(text) {
    return JSON.parse(text, (_key, field) => {
        if (field && typeof field === 'object' && !Array.isArray(field)) {
            const record = field;
            if (Object.keys(record).length === 1) {
                if (typeof record[BYTES_KEY] === 'string')
                    return base64ToBytes(record[BYTES_KEY]);
                if (typeof record[BIGINT_KEY] === 'string')
                    return BigInt(record[BIGINT_KEY]);
            }
        }
        return field;
    });
}
function assertWire(value, what) {
    if (!value || typeof value !== 'object') {
        throw new Error(`${what} is not an object`);
    }
    const record = value;
    if (record.v !== WA_CALL_MEDIA_WIRE_VERSION) {
        throw new Error(`${what} has wire version ${String(record.v)}, expected ${WA_CALL_MEDIA_WIRE_VERSION}`);
    }
    if (typeof record.callId !== 'string' || record.callId.length === 0) {
        throw new Error(`${what} has no call id`);
    }
    return record;
}
/** The text form of a message, for whatever transport the integrator runs. */
export function encodeCallMediaMessage(message) {
    return encode(message);
}
export function decodeCallMediaMessage(text) {
    const record = assertWire(decode(text), 'media message');
    if (!Number.isSafeInteger(record.seq) || record.seq < 0) {
        throw new Error('media message has no valid seq');
    }
    if (typeof record.full !== 'boolean' || !record.plan || typeof record.plan !== 'object') {
        throw new Error('media message has no plan');
    }
    return record;
}
export function encodeCallMediaEvent(message) {
    return encode(message);
}
export function decodeCallMediaEvent(text) {
    const record = assertWire(decode(text), 'media event');
    const event = record.event;
    if (!event || typeof event.type !== 'string') {
        throw new Error('media event has no type');
    }
    return record;
}
/** Numbers a call's plan changes on the signaling side; {@link snapshot} resyncs a host. */
export class WaCallMediaMessageSequencer {
    callId;
    plan = {};
    seq = -1;
    constructor(callId) {
        this.callId = callId;
    }
    /** Folds a change into the plan and returns the message that carries it. */
    next(update) {
        Object.assign(this.plan, update);
        this.seq++;
        return {
            v: WA_CALL_MEDIA_WIRE_VERSION,
            callId: this.callId,
            seq: this.seq,
            full: this.seq === 0,
            plan: this.seq === 0 ? { ...this.plan } : update
        };
    }
    /** The whole plan as it stands, under the number of the last change. */
    snapshot() {
        return {
            v: WA_CALL_MEDIA_WIRE_VERSION,
            callId: this.callId,
            seq: Math.max(0, this.seq),
            full: true,
            plan: { ...this.plan }
        };
    }
}
/**
 * Host side of a call whose signaling runs elsewhere: applies messages to its own
 * {@link WaCallMediaPlane} in order, drops stale ones and asks for a resync after a gap. Its
 * first event, sent from the constructor, is `host` with the features it applies.
 */
export class WaCallMediaReceiver {
    plane;
    callId;
    send;
    lastSeq = null;
    receiving = Promise.resolve();
    constructor(options) {
        this.callId = options.callId;
        this.send = options.send;
        this.plane = new WaCallMediaPlane({
            ...options,
            onActive: () => this.emit({ type: 'active', reportsRelayAnswers: true }),
            onRelayLost: (reason) => this.emit({ type: 'relay_lost', reason }),
            onRelayAnswered: (name, rttMs) => this.emit({ type: 'relay_answered', name, rttMs }),
            onReaction: (reaction, senderId) => {
                options.onReaction?.(reaction, senderId);
                this.emit(senderId === undefined
                    ? { type: 'reaction', reaction }
                    : { type: 'reaction', reaction, senderId });
            },
            onSenderMedia: (senderId, receiving) => {
                options.onSenderMedia?.(senderId, receiving);
                this.emit({ type: 'sender_media', senderId, receiving });
            }
        });
        const features = [WA_CALL_MEDIA_FEATURE_GROUP, WA_CALL_MEDIA_FEATURE_GROUP_ATTRIBUTION];
        if (options.createRawUdpLeg)
            features.push(WA_CALL_MEDIA_FEATURE_RAW_UDP);
        if (options.videoSubscriptions)
            features.push(WA_CALL_MEDIA_FEATURE_GROUP_VIDEO);
        this.emit({ type: 'host', features });
    }
    /** Loads the codec; see {@link WaCallMediaPlane.start}. */
    start() {
        return this.plane.start();
    }
    /**
     * Applies one message, one at a time in call order. A message whose apply rejects is not
     * counted as received, so the next one finds the gap and asks for a resync.
     */
    receive(message) {
        const run = this.receiving.then(() => this.receiveNow(message));
        this.receiving = run.catch(() => { });
        return run;
    }
    async receiveNow(message) {
        if (message.callId !== this.callId) {
            throw new Error(`media message for call ${message.callId}, expected ${this.callId}`);
        }
        if (message.full) {
            if (this.lastSeq !== null && message.seq < this.lastSeq)
                return;
        }
        else {
            if (this.lastSeq !== null && message.seq <= this.lastSeq)
                return;
            if (this.lastSeq === null || message.seq > this.lastSeq + 1) {
                this.emit({ type: 'resync', lastSeq: this.lastSeq });
            }
        }
        await this.plane.apply(message.plan);
        this.lastSeq = message.seq;
    }
    stop() {
        return this.plane.stop();
    }
    emit(event) {
        this.send({ v: WA_CALL_MEDIA_WIRE_VERSION, callId: this.callId, event });
    }
}
