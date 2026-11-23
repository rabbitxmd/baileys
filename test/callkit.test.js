// Drives CallKit against a fake socket: no network, no WhatsApp account. Media runs in 'remote' mode,
// so no wrtc or libmlow is needed. Covers the socket <-> call-core seam: stanza hooks, acks,
// call-key decrypt/encrypt and device sync. Derived from the baileys-call-kit flow test (MIT).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { attachCalls } from '../src/CallKit/index.js';
import { proto } from '../src/CallKit/compat/proto.js';
import { writeRandomPadMax16 } from '../src/CallKit/compat/index.js';

const ME = '911111111111:5@s.whatsapp.net';
const PEER = '922222222222:3@s.whatsapp.net';
const CALL_KEY = new Uint8Array(32).map((_, i) => i + 1);

function makeFakeSock() {
    const ws = new EventEmitter();
    const sent = [];
    const encrypted = [];
    const sock = {
        ws,
        authState: {
            creds: {
                me: { id: ME },
                account: {
                    details: new Uint8Array([1, 2, 3]),
                    accountSignatureKey: new Uint8Array([9, 9]),
                    accountSignature: new Uint8Array([4, 5]),
                    deviceSignature: new Uint8Array([6, 7])
                }
            },
            keys: { get: async () => ({}) }
        },
        sendNode: async (node) => {
            sent.push(node);
        },
        assertSessions: async () => true,
        getUSyncDevices: async (jids) => jids.flatMap((jid) => {
            const user = jid.split('@')[0].split(':')[0];
            return [{ user, device: 0 }, { user, device: 3 }];
        }),
        signalRepository: {
            encryptMessage: async ({ jid, data }) => {
                encrypted.push(jid);
                return { type: 'msg', ciphertext: data };
            },
            // The "ciphertext" in this fake is the padded plaintext itself.
            decryptMessage: async ({ ciphertext }) => ciphertext
        }
    };
    return { sock, ws, sent, encrypted };
}

async function waitFor(fn, what) {
    for (let i = 0; i < 100; i++) {
        const value = fn();
        if (value !== undefined) {
            return value;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(`timed out waiting for ${what}`);
}

test('incoming offer is acked, its call key decrypted, an event emitted, and reject is sent', async () => {
    const { sock, ws, sent } = makeFakeSock();
    const calls = await attachCalls(sock, { media: { mode: 'remote' } });
    const incoming = [];
    calls.events.on('voip_call_incoming', (call) => incoming.push(call.callId));
    const padded = await writeRandomPadMax16(proto.Message.encode({ call: { callKey: CALL_KEY } }).finish());
    ws.emit('CB:call', {
        tag: 'call',
        attrs: { from: PEER, id: 'stanza-1', t: '1700000000' },
        content: [{
            tag: 'offer',
            attrs: { 'call-id': 'A'.repeat(32), 'call-creator': PEER },
            content: [
                { tag: 'audio', attrs: { enc: 'opus', rate: '16000' } },
                { tag: 'enc', attrs: { type: 'msg', v: '2', count: '0' }, content: padded }
            ]
        }]
    });
    await waitFor(() => (incoming.length ? true : undefined), 'voip_call_incoming');
    assert.equal(incoming[0], 'A'.repeat(32));
    const ack = sent.find((n) => n.tag === 'ack');
    assert.ok(ack, 'an ack for the offer stanza was sent');
    assert.equal(ack.attrs.class, 'call');
    assert.equal(ack.attrs.type, 'offer');
    assert.equal(ack.attrs.id, 'stanza-1');
    const info = calls.voip.getCall('A'.repeat(32));
    assert.ok(info, 'the call is tracked');
    assert.deepEqual([...(info.encryptionKey ?? [])], [...CALL_KEY], 'call key decrypted');
    await calls.voip.rejectCall('A'.repeat(32));
    const reject = await waitFor(() => sent.find((n) => n.tag === 'call' && n.content?.[0]?.tag === 'reject'), 'reject stanza');
    assert.ok(reject);
    calls.voip.dispose();
    calls.detach();
});

test('startCall syncs peer devices, encrypts per device and sends the offer', async () => {
    const { sock, sent, encrypted } = makeFakeSock();
    const calls = await attachCalls(sock, { media: { mode: 'remote' } });
    const callId = await calls.voip.startCall({ peerJid: '922222222222@s.whatsapp.net' });
    assert.match(callId, /^[0-9A-F]{32}$/i);
    const offer = await waitFor(() => sent.find((n) => n.tag === 'call' && n.content?.[0]?.tag === 'offer'), 'offer stanza');
    const inner = offer.content[0];
    const destination = inner.content.find((n) => n.tag === 'destination');
    assert.ok(destination, 'offer has <destination>');
    const recipients = destination.content.map((n) => n.attrs.jid);
    assert.deepEqual(recipients.sort(), ['922222222222:3@s.whatsapp.net', '922222222222@s.whatsapp.net']);
    assert.equal(encrypted.length, 2, 'one Signal encrypt per peer device');
    calls.voip.dispose();
    calls.detach();
});
