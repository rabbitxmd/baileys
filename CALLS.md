# Calls (VoIP) with RabbitXmd Baileys

> **Made by Rabbit Xmd · Mr Rabbit.** Don't claim this code. Do not remove this credit.

Voice, video and group calls on a Baileys socket: place calls, answer or reject them, play audio into a
call, hear the other side, join and leave group calls, react, raise a hand, mute, switch to video and
share the screen.

This is the bundled **Call Kit** (`src/CallKit/`): the `baileys-call-kit` adapter on top of a bundled VoIP
stack (MIT, see `src/CallKit/NOTICE.md`); this page is the Baileys guide to it.

> **Not yet run against a real WhatsApp call.** The socket seam is covered by an offline test
> (`test/callkit.test.js`), but audio, video, group calls and every in-call feature still need a live
> check. Try it between two of your own numbers before you rely on it.

Contents: [Install](#install) · [Attach](#attach-to-a-socket) · [Place a call](#place-a-call) ·
[Incoming calls](#incoming-calls) · [Audio](#audio) · [Group calls](#group-calls) ·
[React](#react) · [Raise hand](#raise-hand) · [Mute](#mute) · [Video](#video) ·
[Screen share](#screen-share) · [API](#api) · [Events](#events) · [Options](#options) ·
[Bot plugin](#bot-plugin) · [Troubleshooting](#troubleshooting)

## Install

```bash
npm i github:rabbitxmd/baileys
```

That is all. `@roamhq/wrtc`, `libmlow-wasm-fork` and `ffmpeg-static` are optional dependencies and are
installed with the package. If one cannot build on your platform npm skips it; a system `ffmpeg` is used
before `ffmpeg-static`. Only audio **files** need ffmpeg (live PCM does not).

Call Kit loads lazily, so a bot that never calls `attachCalls` pays nothing at startup.

## Attach to a socket

```js
import makeWASocket, { attachCalls, loadCallKit } from '@whiskeysockets/baileys'

const { EndCallReason } = await loadCallKit()   // enums: EndCallReason, CallState, WA_VIDEO_STATE, ...
const sock = makeWASocket({ /* ... */ })
const calls = await attachCalls(sock)      // { voip, events, detach }
```

- `calls.voip` is the call API (`startCall`, `acceptCall`, ...).
- `calls.events` is an `EventEmitter` carrying every `voip_*` event.
- **Attach once per socket.** After a reconnect creates a new socket, call `calls.voip.dispose()` and
  `calls.detach()` on the old one, then `attachCalls` on the new one.
- Do not use this together with the older `makeVoipClient` on the same socket.
- The enums (`EndCallReason`, `CallState`, `WA_VIDEO_STATE`, ...) come from `await loadCallKit()`.

## Place a call

```js
const callId = await calls.voip.startCall({ peerJid: '919812345678@s.whatsapp.net' })
```

Resolves with the call id as soon as the offer is sent; progress arrives on `voip_call_state`. Options:
`isVideo`, `audioFile` (preload a file), `peerDevices`.

```js
calls.events.on('voip_call_state', (call) => console.log(call.callId, call.stateData.state))

await calls.voip.endCall(callId)           // hang up
```

By default only **one** call can be live at a time (`maxConcurrentCalls: 1`). Raise it in the options to
allow parallel calls.

## Incoming calls

```js
calls.events.on('voip_call_incoming', async (call) => {
  console.log('ringing from', call.callerPn || call.peerJid, call.callId, call.mediaType)

  await calls.voip.acceptCall(call.callId)
  // or
  await calls.voip.rejectCall(call.callId, EndCallReason.Declined)
})
```

`call.isGroupCall`, `call.groupJid`, `call.mediaType` (audio/video), `call.canAccept` and `call.canReject`
tell you what you are looking at. `calls.voip.getCalls()` lists every tracked call and
`calls.voip.getCall(callId)` returns one or `null`.

## Audio

**Play a file** (needs ffmpeg; converted to 16 kHz mono before sending):

```js
await calls.voip.loadAudio(callId, './hello.mp3')
calls.events.on('voip_call_outbound_audio_finished', (call) => calls.voip.endCall(call.callId))
```

Call it after `startCall` (or after `acceptCall`); it plays once the call is active.

**Live audio** (a microphone, TTS, another call, a stream), 16 kHz mono `Float32Array`:

```js
calls.voip.setExternalAudioMode(callId, true)
const bufferedMs = calls.voip.feedLiveAudio(callId, pcmChunk)

const { pauseMs, resumeMs } = calls.voip.getFeedWatermarksMs()   // backpressure: pause above pauseMs
calls.voip.getLiveBufferMs(callId)
```

**Hear the other side:**

```js
calls.events.on('voip_call_inbound_audio', ({ call, pcm }) => {
  // Float32Array, 16 kHz mono
})
```

## Group calls

Ring a group. Participants must be **LIDs** (`...@lid`), and you leave yourself out:

```js
const meta = await sock.groupMetadata(groupJid)
const me = new Set([sock.user.id, sock.user.lid].filter(Boolean).map((j) => j.split('@')[0].split(':')[0]))

const participants = []
for (const p of meta.participants) {
  const user = p.id.split('@')[0].split(':')[0]
  if (me.has(user)) continue
  const lid = p.lid || await sock.signalRepository.lidMapping.getLIDForPN(p.id)
  if (lid) participants.push({ jid: lid })
}

const callId = await calls.voip.startCall({ groupJid, participants })
```

An incoming group call arrives on `voip_call_incoming` with `call.isGroupCall`; answer it with `acceptCall`.

**Who is on the call** is `call.groupComposition`, and every change is an event:

```js
calls.events.on('voip_call_participants_changed', ({ call, diff }) => {
  console.log('joined', diff.added.map((p) => p.jid))
  console.log('left', diff.removed.map((r) => r.jid))
})
```

**Leave or end.** On a group call `endCall` and `leaveCall` do the same thing: they take *you* off the call.
Nobody can end a group call for everyone; it ends when the last member leaves.

```js
await calls.voip.leaveCall(callId)     // throws on a 1:1 call
```

**Join a call in progress** that you declined, missed, left or were dropped from:

```js
await calls.voip.joinCall(callId)
```

It only knows calls whose offer reached your account, and throws otherwise. Example, join one you missed:

```js
calls.events.on('voip_call_ended', async (call) => {
  if (call.isGroupCall && call.stateData.endReason === EndCallReason.Timeout) {
    await calls.voip.joinCall(call.callId)
  }
})
```

A ring you let go unanswered is ended by the server after about 45 seconds while the call carries on for
the others. If another member rings you again, a new `voip_call_incoming` arrives with the same call id.
Inviting or removing someone mid-call is not supported.

## React

An emoji reaction on a live call. Needs the call to be active.

```js
calls.voip.sendReaction(callId, '❤️')      // true if it went out, false if the call is not active yet

calls.events.on('voip_call_reaction', ({ call, reaction, participantJid }) => {
  console.log(participantJid, 'reacted', reaction.reaction)   // the glyph itself
})
```

Reactions are momentary: nothing is stored on the call, so a missed event cannot be read back.

## Raise hand

Durable state: the others keep seeing your hand until you lower it.

```js
await calls.voip.setHandRaised(callId, true)
await calls.voip.setHandRaised(callId, false)

calls.events.on('voip_call_hand_raise', ({ call, participantJid, raised }) => {
  console.log(participantJid, raised ? 'raised a hand' : 'lowered a hand')
  console.log('hands up:', [...call.raisedHands])
})
```

Your own state is `call.stateData.handRaised`. The call must be active, otherwise it is a no-op.

## Mute

```js
calls.voip.setMute(callId, true)     // mic off, the other side sees it
calls.voip.setMute(callId, false)

calls.events.on('voip_call_peer_mute', ({ call, muted, participantJid }) => { /* ... */ })
```

On a 1:1 call the other side's state is also `call.stateData.peerAudioMuted`.

Asking **someone else** to mute works on group calls only:

```js
await calls.voip.requestParticipantMute(callId, participantDeviceJid)   // they decide

calls.events.on('voip_call_mute_requested', ({ call, participantJid }) => {
  calls.voip.setMute(call.callId, true)      // nothing is applied for you; comply yourself
})
```

## Video

**Turn a voice call into video** (1:1). It is a handshake and nothing is sent before the peer accepts:

```js
import { loadCallKit } from '@whiskeysockets/baileys'
const { WA_VIDEO_UPGRADE_RESULT, WA_VIDEO_STATE } = await loadCallKit()

const result = await calls.voip.requestVideoUpgrade(callId)
if (result === WA_VIDEO_UPGRADE_RESULT.Accepted) {
  calls.voip.feedLiveVideo(callId, h264AccessUnit, timestampUs)
}
```

Results: `accepted`, `rejected`, `rejected_by_timeout`, `error`, `timeout`. It gives up after about five
seconds. `cancelVideoUpgrade(callId)` withdraws a request before it is answered.

**Answer the other side's request:**

```js
calls.events.on('voip_call_peer_video_state', async ({ call, change }) => {
  if (change.state === WA_VIDEO_STATE.UpgradeRequestV2) {
    await calls.voip.acceptVideoUpgrade(call.callId)    // or rejectVideoUpgrade
  }
})
```

Answer within about five seconds, or the peer withdraws. After you accept, `feedLiveVideo` returns `0`
until the peer's camera is on (three seconds at most), then the stream starts at your next key frame.

**Group calls:** `setVideoEnabled(callId, true|false)` is your camera; `requestVideoUpgrade` asks the
server to make the whole call a video call, and every member then gets `voip_call_video_upgraded`.

**Frames in, frames out.** The picture is **H.264 Annex-B access units**, in both directions. Nothing
captures a camera for you: no frames fed means no picture.

```js
calls.events.on('voip_call_inbound_video', ({ call, frame, participantJid }) => { /* one H.264 AU per frame */ })
```

`setVideoSubscriptions(callId, subs | null)` chooses whose video you ask for, but is not sent to the relay
yet; video arrives without it.

## Screen share

A share is video: you encode what you want to show as H.264 and feed it into the call. Nothing captures
a screen for you, so the example below shows an image or a video file (a screenshot, a slideshow, a
recording). To share a live desktop, feed `feedLiveVideo` from your own capture source in the same way.

```js
calls.events.on('voip_call_screen_share', ({ participantJid, share }) => {
  console.log(participantJid, share.state, share.screenWidth, share.screenHeight)
})
```

Steps, in order:

1. The call must already carry video. Place it with `isVideo: true` (or `.vcall` in the bot), or turn a
   voice call into video first ([Video](#video)). Otherwise `setScreenShare(callId, true)` throws.
2. `await calls.voip.setScreenShare(callId, true)` announces the share.
3. Feed H.264 access units with `feedLiveVideo(callId, au, timestampUs)`. What you feed is what they see.
4. `await calls.voip.setScreenShare(callId, false)` when done. Stop feeding the camera while sharing:
   the screen replaces it on the same video stream.

**Helper: turn an image or video into access units** (needs `ffmpeg` with libx264 on the PATH):

```js
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

async function* h264AccessUnits(input, { fps = 10, width = 640, height = 360, image = false } = {}) {
  const ff = spawn('ffmpeg', ['-v', 'error', ...(image ? ['-loop', '1'] : []), '-i', input, '-an',
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=${fps},format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'baseline', '-preset', 'veryfast', '-tune', 'zerolatency',
    '-x264-params', `aud=1:keyint=${fps * 2}:repeat-headers=1`, '-f', 'h264', 'pipe:1'],
    { stdio: ['ignore', 'pipe', 'inherit'] })
  // access-unit delimiters (NAL type 9) mark where one picture ends and the next begins
  const isAud = (b, i) => b[i] === 0 && b[i + 1] === 0 &&
    ((b[i + 2] === 1 && (b[i + 3] & 0x1f) === 9) || (b[i + 2] === 0 && b[i + 3] === 1 && (b[i + 4] & 0x1f) === 9))
  const find = (b, from) => { for (let i = from; i < b.length - 4; i++) if (isAud(b, i)) return i; return -1 }
  let buf = Buffer.alloc(0)
  try {
    for await (const chunk of ff.stdout) {
      buf = Buffer.concat([buf, chunk])
      for (let start = find(buf, 0); start !== -1; start = 0) {
        const next = find(buf, start + 4)
        if (next === -1) break
        yield buf.subarray(start, next)
        buf = buf.subarray(next)
      }
    }
    if (buf.length) yield buf
  } finally { ff.kill() }
}

/** Shares `source` into the call until it ends, `signal` aborts, or the call goes away. */
async function shareScreen(calls, callId, source, { fps = 10, image = false, signal } = {}) {
  await calls.voip.setScreenShare(callId, true)
  const t0 = Date.now()
  let frame = 0
  try {
    for await (const au of h264AccessUnits(source, { fps, image })) {
      if (signal?.aborted || !calls.voip.getCall(callId)) break
      const wait = t0 + (frame * 1000) / fps - Date.now()      // pace to real time
      if (wait > 0) await sleep(wait)
      calls.voip.feedLiveVideo(callId, au, Math.round((frame * 1e6) / fps))
      frame++
    }
  } finally {
    await calls.voip.setScreenShare(callId, false).catch(() => {})
  }
}

// share a picture for as long as you like, stop it with the controller
const stop = new AbortController()
shareScreen(calls, callId, './slide.png', { image: true, signal: stop.signal })
// ... later: stop.abort()
```

The helper was checked offline (ffmpeg produced one access unit per frame, with a key frame every two
seconds), but **never inside a real WhatsApp call**.

Things to know:
- `feedLiveVideo` returns the number of RTP packets sent. `0` means video is not active yet, is waiting
  for the other side, or is waiting for the next key frame. The first picture appears at a key frame.
- On a call you accepted a video upgrade for, frames are held until the peer's camera is on (three
  seconds at most).
- WhatsApp's desktop clients refuse to show a share in a group call; mobile ones are not confirmed.

## API

`calls.voip`:

| Method | What it does |
| --- | --- |
| `startCall({ peerJid, isVideo?, audioFile?, peerDevices? })` | Place a 1:1 call, returns `callId` |
| `startCall({ groupJid, participants, isVideo? })` | Place a group call (participants are LIDs) |
| `acceptCall(callId)` / `rejectCall(callId, reason?)` | Answer or decline an incoming call |
| `endCall(callId, reason?)` | Hang up (on a group call, step out) |
| `leaveCall(callId)` / `joinCall(callId)` | Leave a group call that goes on / join one in progress |
| `loadAudio(callId, path)` | Play a file into the call (ffmpeg) |
| `setExternalAudioMode(callId, on)` / `feedLiveAudio(callId, pcm)` | Live PCM input; returns buffered ms |
| `getLiveBufferMs(callId)` / `getFeedWatermarksMs()` | Backpressure for the live feed |
| `setMute(callId, muted)` | Mute or unmute yourself |
| `requestParticipantMute(callId, jid)` | Ask a group participant to mute |
| `sendReaction(callId, emoji)` | Emoji reaction; `false` if nothing went out |
| `setHandRaised(callId, raised)` | Raise or lower your hand |
| `requestVideoUpgrade(callId)` | Ask to make the call video; resolves with the outcome |
| `acceptVideoUpgrade(callId)` / `rejectVideoUpgrade(callId)` | Answer the peer's request |
| `cancelVideoUpgrade(callId)` | Withdraw your request |
| `setVideoEnabled(callId, on)` | Camera on/off on a group call |
| `setVideoSubscriptions(callId, subs \| null)` | Choose whose video to ask for (not sent to the relay yet) |
| `feedLiveVideo(callId, h264AU, timestampUs)` | Send a video frame; returns packets sent (`0` = not active or held) |
| `setScreenShare(callId, sharing)` | Start or stop a screen share |
| `getCall(callId)` / `getCalls()` | Call snapshots |
| `on` / `off` / `once` | Manager-level events |
| `dispose()` | Tear down the coordinator and destroy every call |

`EndCallReason`: `user_ended`, `declined`, `timeout`, `busy`, `cancelled`, `failed`, `relay_lost`,
`setup_failed`, `invisible`, `do_not_disturb`, `accepted_elsewhere`, `rejected_elsewhere`, `unknown`.

## Events

All on `calls.events`:

| Event | Payload | When |
| --- | --- | --- |
| `voip_call_incoming` | `CallInfo` | An offer arrived |
| `voip_call_state` | `CallInfo` | State change |
| `voip_call_ended` | `CallInfo` | Call finished (`call.stateData.endReason`) |
| `voip_call_inbound_audio` | `{ call, pcm }` | Decoded peer audio, 16 kHz mono |
| `voip_call_outbound_audio_finished` | `CallInfo` | A loaded file finished playing |
| `voip_call_peer_mute` | `{ call, muted, participantJid? }` | Someone muted or unmuted |
| `voip_call_mute_requested` | `{ call, participantJid, requestState }` | Someone asked you to mute |
| `voip_call_reaction` | `{ call, reaction, participantJid? }` | Emoji reaction |
| `voip_call_hand_raise` | `{ call, participantJid, raised }` | Hand raised or lowered |
| `voip_call_peer_video_state` | `{ call, change, participantJid? }` | Video state change; also the upgrade request |
| `voip_call_video_upgraded` | `{ call, participantJid }` | A group call became video |
| `voip_call_inbound_video` | `{ call, frame, participantJid? }` | One H.264 access unit |
| `voip_call_inbound_video_rtp` | `{ call, packet, participantJid? }` | Raw video RTP packet |
| `voip_call_screen_share` | `{ call, share, participantJid? }` | Screen-share state |
| `voip_call_participants_changed` | `{ call, diff }` | Group roster change |
| `voip_call_participant_media` | `{ call, participantJid, receiving }` | A member's media started or stopped |
| `voip_call_participant_audio` | `{ call, participantJid, pcm }` | One member's audio before the mix (`participantAudio` option) |
| `voip_call_error` | `Error` | Engine error |

## Options

```js
const calls = await attachCalls(sock, {
  logger,                       // your pino logger; silent when omitted
  maxConcurrentCalls: 2,        // default 1
  participantAudio: true,       // emit voip_call_participant_audio (costs a copy per frame)
  useOriginalRelayPort: true,   // relay port choice; the default is picked per account type
  logLevel: 'warn',             // cap the chatty call diagnostics
})
```

Other options (`mlowRed`, `mlowCompanionModel`, `useRawUdpTransport`, `media: { mode: 'remote' }`) are
advanced; see `src/CallKit/core/WaVoipCoordinator.d.ts`.

## Bot plugin

`call.js` (delivered alongside this file) is a ready command that wraps everything above:

```
.call 919812345678          call a number and play the audio you replied to
.call group                 group call from inside a group
.call accept|reject|end|leave|join [id]
.call mute|unmute | play [file]
.call hand up|down | react 👍 | askmute <jid>
.call cam on|off | upgrade [yes|no] | share on|off
.call list | mode reject|answer|notify|off
```

## Troubleshooting

- **Calls ring but there is no audio:** check that `@roamhq/wrtc` and `libmlow-wasm-fork` installed
  (`npm ls @roamhq/wrtc libmlow-wasm-fork`). Media loads when the call starts, so a missing package shows
  up on `voip_call_error`.
- **`ffmpeg not found`:** install `ffmpeg`, or make sure `ffmpeg-static` installed.
- **Group call: nobody rings:** participants must be LIDs, and you must leave yourself out.
- **Offers acked twice:** Baileys acks `<call>` stanzas itself and Call Kit does too. Not known to hurt,
  but unconfirmed; report it if incoming calls misbehave.
- **`cam on` shows nothing:** video needs H.264 frames fed with `feedLiveVideo`.
- **A second call is refused or not answerable:** only one call at a time by default; end the other or
  raise `maxConcurrentCalls`.
- **Connection trouble after updating:** the WhatsApp Web version was bumped; revert with
  `git revert f49bbd5` if it misbehaves.

## Credits

The call code is MIT licensed; see `src/CallKit/NOTICE.md` and the licence files next to it.
