# RabbitXmd Baileys

**RabbitXmd Baileys** is an ESM-first Node.js library for WhatsApp Web Multi-Device development. It combines the socket and protocol layers, LID-aware addressing, session helpers, message utilities, integrated interactive-message builders, and extensive group, channel, media, status, business, call, and modern message APIs.

- **Repository:** [github.com/RabbitXmd/baileys](https://github.com/RabbitXmd/baileys)
- **Import compatibility name:** `@whiskeysockets/baileys`
- **Install this repository:** `npm install github:RabbitXmd/baileys`
- **Runtime:** Node.js 20 or newer; Node.js 22+ is recommended

> [!IMPORTANT]
> `@whiskeysockets/baileys` is the requested import/package identifier for compatibility with existing code. It does not mean this repository is the official WhiskeySockets distribution, and it does not identify the maintainers of that project. Install the RabbitXmd build from this repository URL shown above; a bare `npm install @whiskeysockets/baileys` may resolve to a different registry package.
>
> This is an unofficial, independently maintained WhatsApp Web client library. It is not affiliated with, authorized, sponsored, or supported by WhatsApp or Meta. Use it responsibly, follow applicable laws and WhatsApp terms, and protect account credentials. WhatsApp can change server behavior at any time.

> [!NOTE]
> This guide describes APIs and features present in the current source. Availability, rendering, and server acceptance can depend on WhatsApp Web versions, account eligibility, rollout state, permissions, and client platform. Read [`EXPERIMENTAL.md`](./EXPERIMENTAL.md) before depending on reconstructed or experimental message formats. Feature presence in the code is not a guarantee that WhatsApp will accept or render it.

## Contents

- [📌 Overview](#readme-section-01)
- [⚙️ Requirements](#readme-section-02)
- [📦 Installation](#readme-section-03)
- [📥 Import](#readme-section-04)
- [🚀 Basic Connection](#readme-section-05)
- [💾 Session Storage](#readme-section-06)
- [🔐 Pairing Code](#readme-section-07)
- [📩 Receiving Messages](#readme-section-08)
- [📡 Event](#readme-section-09)
- [Event reference, bot-address checks, and anti-link moderation](#readme-event-moderation)
- [🪪 LID / PN / JID Addressing](#readme-section-10)
- [💬 Sending Messages](#readme-section-11)
- [📰 External Ad Reply](#readme-section-12)
- [🖼️ Rich Link Card](#readme-section-13)
- [🧱 Integrated MessageBuilder](#readme-section-14)
- [💸 Split Payment and Reminders](#readme-section-15)
- [📊 Link Preview Status Style](#readme-section-16)
- [🎬 Reading Social Link Previews](#readme-section-17)
- [Button](#readme-section-18)
- [Selection / List](#readme-section-19)
- [ButtonV2](#readme-section-20)
- [Carousel](#readme-section-21)
- [AIRich](#readme-section-22)
- [🖼️ Album Messages](#readme-section-23)
- [🎞️ Paired Photo + Video (imgvid)](#readme-section-24)
- [📸 Status](#readme-section-25)
- [📢 Newsletter / Channel](#readme-section-26)
- [🪪 Username & Info](#readme-section-27)
- [👥 Group Management](#readme-section-28)
- [🏘️ Communities](#readme-section-29)
- [🔒 Privacy Settings](#readme-section-30)
- [📨 All Message Types](#readme-section-31)
- [👀 Presence and Read Receipts](#readme-section-32)
- [🗂️ Chat State](#readme-section-33)
- [🏷️ Label](#readme-section-34)
- [🛍️ Business and Catalog](#readme-section-35)
- [📞 Calls](#readme-section-36)
- [📷 Profile Photo](#readme-section-37)
- [🧰 Useful Exports](#readme-section-38)
- [🔄 Updating the WhatsApp Web Version](#readme-section-39)
- [⏰ Scheduled Messages](#readme-section-40)
- [🧪 Modern WhatsApp Message API](#readme-section-41)
- [🛡️ Account Health Signals](#readme-section-42)
- [🐞 Troubleshooting](#readme-section-43)
- [License and attribution](#license-and-attribution)

---

<a id="readme-section-01"></a>
<a id="-ringkasan"></a>
## 📌 Overview

`@whiskeysockets/baileys` is a modern, ESM-oriented Baileys fork for WhatsApp Multi-Device development.

This package combines the socket layer, protocol utilities, LID-aware addressing support, and a built-in MessageBuilder in a single dependency. Buttons, native-flow messages, carousels, and AIRich layouts can be used directly from this package without installing a separate builder dependency.

<a id="-yang-menonjol"></a>
### ✨ Highlights

| Feature | Description |
|---|---|
| 🔌 Multi-Device | Connects to WhatsApp through the Baileys Multi-Device protocol. |
| 🔐 Pairing Code | Supports both regular and custom 8-character pairing codes. |
| 🖱️ Interactive Buttons | Quick replies, URLs, copy, calls, lists/selects, locations, and other native-flow buttons. |
| 🧱 Integrated MessageBuilder | `Button`, `ButtonV2`, `Carousel`, `AIRich`, and `Toolkit` are included in the same package. |
| 🖼️ Albums | Sends multiple images/videos as a single album message. |
| 📢 Channels | Creates, follows, edits, reacts to, and fetches data from WhatsApp Channels. |
| 👥 Groups | Group creation, member management, metadata, description editing, and more. |
| 🪪 LID / PN Addressing | Supports the newer LID addressing while also exposing the PN/JID alternatives provided by WhatsApp when available. |
| 📷 Profile Photos | Fetches, changes, and removes profile photos. |
| 🤖 AI Rich | An experimental rich-response builder for text, code, tables, media, suggestions, and other layouts. |
| 📞 Voice & Video Calls | Makes audio, video, and screen-sharing calls in sessions the bot already has, with a playlist that drives the calls. |
| 🗄️ Database Sessions | Stores sessions in SQLite, PostgreSQL, MySQL, MongoDB, Redis, or NekoDB instead of files. |
| 📦 ESM | ESM-first package; requires Node.js 20+, with Node.js 22 or later recommended. |

<a id="-apa-saja-yang-bisa-dilakukan"></a>
### 🗺️ What Can You Do?

New here? This is the whole library at a glance. Each row links to the section that shows the code.

| I want to… | Use | Read |
|---|---|---|
| Log in and stay logged in | `useMultiFileAuthState`, `usePostgresAuthState`, … | [Session Storage](#-penyimpanan-sesi) |
| Log in without scanning a QR code | pairing code | [Pairing Code](#-kode-pairing) |
| Respond to incoming messages | `messages.upsert` | [Receiving Messages](#-menerima-pesan), [Events](#-event) |
| Send text, images, videos, files, locations, polls | `sock.sendMessage` | [Sending Messages](#-mengirim-pesan) |
| Send buttons, lists, carousels | `Button`, `ButtonV2`, `Carousel` | [Built-in MessageBuilder](#-messagebuilder-terintegrasi) |
| Send AI-style cards | `AIRich`, A2UI | [AIRich](#airich), [A2UI Cards](#kartu-a2ui) |
| Read rich messages sent by other bots | `readRichMessage` | [Reading Rich Messages](#membaca-balik-pesan-rich) |
| Send multiple photos as a single post | album message | [Album Messages](#-pesan-album) |
| Manage channels | channel helper | [Newsletter / Channel](#-newsletter--channel) |
| Manage groups | `groupCreate`, `groupParticipantsUpdate`, … | [Group Management](#-pengelolaan-grup) |
| Manage communities | community helper | [Communities](#-komunitas) |
| Block, unblock, report spam | `updateBlockStatus`, `reportSpam` | [Privacy Settings](#-pengaturan-privasi) |
| Show typing, read receipts, presence | `sendPresenceUpdate`, `readMessages` | [Presence and Read Receipts](#-presence-dan-tanda-dibaca) |
| Pin, archive, mute, star chats | `chatModify` | [Chat State](#-keadaan-chat) |
| Use business labels and catalogs | label and catalog helpers | [Labels](#-label), [Business and Catalogs](#-bisnis-dan-katalog) |
| Create call links, reject calls | `createCallLink`, `rejectCall` | [Calls](#-panggilan) |
| Call people and play audio | `makeVoipClient`, `voip.call` | [Making Voice Calls](#melakukan-panggilan-suara) |
| Play a song queue during a call | `playlist`, `enqueue`, `idle` | [Playing an Audio Queue](#memainkan-antrean-audio) |
| Send video or share your screen during a call | `video: true`, `screenShare: true` | [Video Calls](#panggilan-video), [Screen Sharing](#berbagi-layar) |
| Call an entire group at once | `voip.callGroup` | [Group Calls](#panggilan-grup) |
| Change or read a profile photo | profile photo helper | [Profile Photos](#-foto-profil) |
| Schedule messages for later | scheduled messages | [Scheduled Messages](#-pesan-terjadwal) |
| Keep up with WhatsApp Web changes | `npm run wa:update` | [Updating the WhatsApp Web Version](#-memperbarui-versi-whatsapp-web) |
| Know when my number is having problems | account health signals | [Account Health Signals](#-sinyal-kesehatan-akun) |
| Understand the difference between LID and PN jids | addressing helper | [LID / PN / JID Addressing](#-pengalamatan-lid--pn--jid) |
| Know why `conversation` is empty | `normalizeMessageContent` | [All Message Types](#-semua-jenis-pesan) |
| Fix what's broken | — | [Troubleshooting](#-penanganan-masalah) |

---

<a id="readme-section-02"></a>
<a id="-kebutuhan"></a>
## ⚙️ Requirements

- Node.js **20 or newer** — that is what `package.json` declares and `preinstall` enforces, so lower versions are rejected during installation
- **Node.js 22 or newer is recommended**, and **24** for development and release workflows
- npm
- One WhatsApp account for pairing

Check your Node.js version:

```bash
node -v
```

---

<a id="readme-section-03"></a>
<a id="-pemasangan"></a>
## 📦 Installation

Install from the RabbitXmd GitHub repository:

```bash
npm install github:RabbitXmd/baileys
```

<a id="paket-yang-disarankan"></a>
### Recommended package

Install the GitHub repository under the requested compatibility import name:

```json
{
  "type": "module",
  "dependencies": {
    "@whiskeysockets/baileys": "github:RabbitXmd/baileys"
  }
}
```

This package is ESM-first. Use the `import` syntax, not `require()`.

<a id="paket-media-opsional"></a>
### Optional Media Packages

The basic installation does not include image or video processing libraries. This makes it about 45 MB smaller, and leaves the choice of `sharp` builds up to you—they won't conflict with versions pinned by your project.

```bash
npm i sharp            # thumbnail, resize, MessageBuilder Toolkit.resize
npm i fluent-ffmpeg    # frame preview video, MessageBuilder Toolkit.getMp4Preview
```

Media handling uses whichever image library is found, in this order:

| Package | Used for |
|---|---|
| `sharp` | primary choice, fastest |
| `@napi-rs/image` | fallback |
| `jimp` | pure JS fallback, no native build |

Sending plain text, buttons, polls, channels, and AI Rich messages does not require any of them. Sending media without all three throws `No image processing library available`; calling `Toolkit.resize` or `Toolkit.getMp4Preview` without its package throws a message that says what to install.

Check at runtime before relying on either:

```js
import { hasOptionalMedia } from '@whiskeysockets/baileys'

await hasOptionalMedia('sharp')          // false if not installed yet
await hasOptionalMedia('fluent-ffmpeg')
```

---

<a id="readme-section-04"></a>
<a id="-impor"></a>
## 📥 Import

```js
import makeWASocket from '@whiskeysockets/baileys'
```

Importing additional utilities:

```js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Button,
  ButtonV2,
  Carousel,
  AIRich,
  Toolkit,
  MessageBuilder,
  MB
} from '@whiskeysockets/baileys'
```

> [!NOTE]
> MessageBuilder is already integrated. You don't need to install `baileys-mbuilder` separately.

---

<a id="readme-section-05"></a>
<a id="-koneksi-dasar"></a>
## 🚀 Basic Connection

```js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys'
import pino from 'pino'

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('WhatsApp tersambung')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) {
        startSock()
      } else {
        console.log('Sesi ter-logout')
      }
    }
  })

  return sock
}

startSock()
```

<a id="opsi-percobaan-ulang-dan-pairing"></a>
### Retry and pairing options

In addition to the usual Baileys options, these control how the socket handles messages that cannot be decrypted, rejected sends, and pairing:

| Option | Default | Purpose |
|---|---|---|
| `maxMsgRetryCount` | `3` | number of decryption attempts requested per incoming message |
| `retryRequestDelayMs` | `250` | delay before asking the sender to encrypt again |
| `maxRetryQueueSize` | `64` | number of messages that can be queued for retry at once |
| `ackRetryDelayMs` | `750` | delay before resending after a retryable nack |
| `maxAckRetryCount` | `3` | number of resend attempts after a retryable nack |
| `pairingCodeTimeoutMs` | `180000` | how long a pairing code remains valid |

`maxRetryQueueSize` is a safety valve, not a throughput knob. Without this limit, a burst of messages that cannot be decrypted will queue endlessly and inflate the heap; anything above the limit is acked without being retried. Raising it will not save more messages — `retryRequestDelayMs` is what does that, at the cost of putting more pressure on the sender.

<a id="opsi-socket"></a>
### Socket options

Everything accepted by `makeWASocket`, along with its defaults:

| Option | Default | Function |
|---|---|---|
| `auth` | — | required; auth state from one of the session stores below |
| `logger` | pino instance | any logger compatible with pino |
| `version` | pinned WA Web version | protocol version claimed by the socket |
| `browser` | `['Mac OS', 'Chrome', '14.4.1']` | name displayed in Linked Devices |
| `markOnlineOnConnect` | `true` | set `false` so notifications on the phone keep working |
| `syncFullHistory` | `true` | request the entire history, not just the latest chunk |
| `shouldSyncHistoryMessage` | `() => true` | decide whether to store each history batch |
| `shouldIgnoreJid` | `() => false` | drop events from matching jids before emitting them |
| `getMessage` | `async () => undefined` | provide old messages so the socket can answer resend requests |
| `cachedGroupMetadata` | `async () => undefined` | reuse your own group metadata cache |
| `emitOwnEvents` | `true` | emit events for actions performed by this device |
| `AnchorGuard` | `false` | enable anti-crash/anti-ban protection via the `@rexxhayanasi/elaina-anchorguard` package |
| `AnchorGuardConfig` | `{}` | options passed to AnchorGuard (see below) |
| `fireInitQueries` | `true` | run initial queries (props, blocklist, privacy) |
| `generateHighQualityLinkPreview` | `true` | fetch larger link preview thumbnails |
| `linkPreviewImageThumbnailWidth` | `192` | link preview thumbnail width |
| `connectTimeoutMs` | `20000` | timeout for giving up on the socket handshake |
| `keepAliveIntervalMs` | `15000` | ping interval |
| `defaultQueryTimeoutMs` | `60000` | timeout for giving up on iq queries |
| `countryCode` | `'US'` | country hint sent during registration |
| `patchMessageBeforeSending` | identity | last chance to rewrite a message before relaying it |
| `enableAutoSessionRecreation` | `true` | rebuild Signal sessions after repeated failures |
| `enableRecentMessageCache` | `true` | store recent outgoing messages to answer resend requests |
| `appStateMacVerification` | `{ patch: false, snapshot: false }` | app-state MAC verification |
| `waWebSocketUrl` | WA Web endpoint | replace the socket URL |
| `customUploadHosts` | `[]` | additional media upload host |
| `inlineSenderKeyDistribution` | `true` | include the sender key distribution message in every group message, as the official client does; set `false` to send it only as a separate message |
| `transactionOpts` | `{ maxCommitRetries: 10, delayBetweenTriesMs: 3000 }` | retry policy for app-state transactions |
| `options` | `{}` | axios options for each HTTP request (proxy, timeout, headers) |
| `makeSignalRepository` | default | replace the Signal protocol storage implementation |

`getMessage` is more important than its default behavior might suggest: without it, recipients who request that a message be resent receive nothing, and the message appears as "waiting for this message". Point it to any storage you have.

<a id="anchorguard-anti-crash-anti-ban"></a>
### AnchorGuard (anti-crash / anti-ban)

Anti-force-close and anti-spam-add protections are not bundled in the library; they live in a separate package [`@rexxhayanasi/elaina-anchorguard`](https://github.com/rexxzyid/Elaina-AnchorGuard). Install it, then enable it with the toggle:

```bash
npm install @rexxhayanasi/elaina-anchorguard
```

```js
const sock = makeWASocket({
  auth: state,
  AnchorGuard: true,
  AnchorGuardConfig: {
    autoDelete: true,
    blockOnBug: true,
    revokeForEveryoneIfAdmin: true,
    kickOnBug: true,
    burstThreshold: 2,
    guardGroupAdds: true,
    metaAiNumbers: true,
    addWatchlist: []
  }
})
```

When `AnchorGuard: true`, the socket automatically loads the package and installs the guard (crash message detection + deletion, burst circuit breaker, and anti-spam-add protection against Meta AI numbers in groups). If the package isn’t installed, the socket continues running normally and only logs a warning. The guard instance is available at `sock.anchorGuard`. All `AnchorGuardConfig` options are in the package README.

---

<a id="readme-section-06"></a>
<a id="-penyimpanan-sesi"></a>
## 💾 Session Storage

The auth state stores your credentials and Signal keys. Losing it means scanning the QR code again; leaking it means someone else can use your account. This package includes several storage options, all of which return the same `{ state, saveCreds }` form.

Whichever one you choose, connect `saveCreds` to the `creds.update` event — otherwise, nothing will be saved:

```js
sock.ev.on('creds.update', saveCreds)
```

<a id="multi-berkas-bawaan"></a>
### Multi-file (built-in)

One folder, one file per key. Simple, dependency-free, and the right choice for one bot on one machine.

```js
import { useMultiFileAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useMultiFileAuthState('./session')
```

It writes many small files — a busy account generates thousands of pre-key files. That's normal; deleting them mid-session breaks the session.

<a id="satu-berkas"></a>
### One file

Everything is in a single JSON file. Easier to back up or move between hosts, but it slows down as the key collection grows because the entire file is rewritten whenever there's a change.

```js
import { useSingleFileAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useSingleFileAuthState('./session.json')
```

<a id="sqlite"></a>
### SQLite

Keys are stored in a real database, so concurrent reads and large key sets stay fast. Requires `better-sqlite3` v11, v12, or v13.

```bash
npm i better-sqlite3
```

```js
import { useSqliteAuthState } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useSqliteAuthState({ dbPath: './session.db' })
```

If another part of your bot already has a connection, just pass that connection in:

```js
import Database from 'better-sqlite3'

const database = new Database('./bot.db')
const { state, saveCreds } = await useSqliteAuthState({ database })
```

Two tables are created when first used: `creds` and `signal_keys`.

<a id="postgresql-mysql-mongodb-redis"></a>
### PostgreSQL, MySQL, MongoDB, Redis

For bots that already use a database, or multiple bots that share one database. Each accepts a connection you already have or the details to open its own connection, and each stores its rows under a single `session` name, so one database can hold many accounts.

```bash
npm i pg        # PostgreSQL
npm i mysql2    # MySQL or MariaDB
npm i mongodb   # MongoDB
npm i ioredis   # Redis (node-redis works too)
```

```js
import {
    usePostgresAuthState,
    useMySQLAuthState,
    useMongoAuthState,
    useRedisAuthState
} from '@whiskeysockets/baileys'

const { state, saveCreds } = await usePostgresAuthState({
    connectionString: 'postgres://user:pass@localhost:5432/bot'
})

const { state, saveCreds } = await useMySQLAuthState({
    uri: 'mysql://user:pass@localhost:3306/bot'
})

const { state, saveCreds } = await useMongoAuthState({
    uri: 'mongodb://localhost:27017',
    dbName: 'bot'
})

const { state, saveCreds } = await useRedisAuthState({
    uri: 'redis://localhost:6379'
})
```

Provide your own connection if other parts of the bot already have one, and name the session if multiple accounts share the same database:

```js
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const { state, saveCreds } = await usePostgresAuthState({ pool, session: 'sales-bot' })
```

`useMySQLAuthState` accepts `pool`, `useMongoAuthState` accepts `db` or `collection`, and `useRedisAuthState` accepts `client` — both node-redis and ioredis are supported, with command names detected at startup.

All four return `clearAuth()` to delete the session and `close()` to release connections they opened themselves; connections you provide are left untouched. `useSqliteAuthState` also returns both.

| Backend | Where the keys go | Table or key |
|---|---|---|
| PostgreSQL | one table | `baileys_auth (session, type, id, value)` |
| MySQL | one table | `baileys_auth (session, type, id, value)` |
| MongoDB | one collection | `baileys_auth`, indexed on session + type + id |
| Redis | one hash per key type | `baileys_auth:<session>:<type>` |

Rename them with `table`, `collectionName`, or `prefix`. SQL backends write a batch of keys in a single transaction, MongoDB uses a single `bulkWrite`, and Redis pipelines them through `MULTI`, so one decryption that saves thirty pre-keys takes one round trip, not thirty.

<a id="nekodb"></a>
### NekoDB

For bots whose state is already in NekoDB, so their sessions live alongside the rest of their data.

```js
import { useNekoDBAuth } from '@whiskeysockets/baileys'

const { state, saveCreds } = await useNekoDBAuth(db)
```

The first argument must be a connected NekoDB instance; the collection defaults to `baileys_rabbitxmd_auth`. Provide a second argument to store multiple sessions in one database:

```js
const { state, saveCreds } = await useNekoDBAuth(db, 'my_sessions')
```

<a id="menyimpan-kunci-signal-di-cache"></a>
### Caching Signal Key Stores

Each key store reads keys from disk or a database for every decryption. Wrapping the key store with a cache eliminates that round trip:

```js
import makeWASocket, { makeCacheableSignalKeyStore, useMultiFileAuthState } from '@whiskeysockets/baileys'
import pino from 'pino'

const logger = pino({ level: 'silent' })
const { state, saveCreds } = await useMultiFileAuthState('./session')

const sock = makeWASocket({
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger)
  },
  logger
})
```

Suitable for any storage, and almost essential for file-based storage used by busy group bots.

<a id="menyimpan-chat-dan-pesan"></a>
### Storing Chats and Messages

Auth state stores keys, not conversations. For chats, contacts, and message history, install an in-memory store:

```js
import { makeInMemoryStore } from '@whiskeysockets/baileys'

const store = makeInMemoryStore({ logger })
store.readFromFile('./store.json')
setInterval(() => store.writeToFile('./store.json'), 10_000)

const sock = makeWASocket({
  auth: state,
  logger,
  getMessage: async (key) => (await store.loadMessage(key.remoteJid, key.id))?.message
})

store.bind(sock.ev)
```

From that point, `store.chats`, `store.contacts`, `store.messages`, and `store.groupMetadata` will stay in sync, and `loadMessage` is exactly what `getMessage` needs. It lives in memory, so size it according to your traffic — bots in large groups will keep making it grow.

---

<a id="readme-section-07"></a>
<a id="-kode-pairing"></a>
## 🔐 Pairing Code

A pairing code can be requested after the socket is created.

```js
const phoneNumber = '6281234567890'

if (!state.creds.registered) {
  const code = await sock.requestPairingCode(phoneNumber)
  console.log('Kode pairing:', code)
}
```

Numbers are normalized before use, so `+62 812-3456-7890` and `6281234567890` are the same request. Numbers that cannot possibly be valid are rejected: fewer than 6 or more than 15 digits, or starting with `0` — country codes never start with zero, so `081234567890` is a local format, not the international format WhatsApp expects.

```js
await sock.requestPairingCode('081234567890')
// Boom 400: phoneNumber must be in international format:
// country code followed by the national number, digits only
```

<a id="permintaannya-dikonfirmasi-server"></a>
### The request is confirmed by the server

`requestPairingCode` waits for a response from WhatsApp and only returns after the server registers its code. Rejections are thrown, not swallowed, so the code you receive is one the server actually knows:

```js
try {
  const code = await sock.requestPairingCode(phoneNumber)
  console.log('Kode pairing:', code)
} catch (error) {
  console.log(error.message)   // misalnya rate-overlimit, not-allowed
  console.log(error.data)      // misalnya 429
}
```

The two most common rejections you'll encounter: `rate-overlimit` — too many attempts; wait before trying again — and the not-allowed variant, meaning phone-number linking is not enabled for that account.

<a id="satu-kode-dalam-satu-waktu"></a>
### One code at a time

A pairing response can only be decrypted by the key that produced it, so a second request while the first is still pending will invalidate the first. That is rejected with `409`:

```js
try {
  await sock.requestPairingCode(phoneNumber)
} catch (error) {
  if (error.output?.statusCode === 409) {
    console.log('masih menggantung, sisa detik:', error.data.secondsLeft)
  }
}
```

Call `cancelPairingCode()` to abandon any pending attempt and immediately request a new one. It returns whether anything was actually canceled:

```js
sock.cancelPairingCode()
const code = await sock.requestPairingCode(phoneNumber)
```

The safeguard clears itself once the code expires. WhatsApp rotates pairing codes every 3 minutes; adjust it with `pairingCodeTimeoutMs` if you need a different window.

<a id="kode-pairing-kustom"></a>
### Custom Pairing Code

A custom pairing code must contain exactly **8 characters**.

```js
const code = await sock.requestPairingCode(
  '6281234567890',
  'RABBITXMD01'
)

console.log(code)
```

<a id="memeriksa-pairing-tanpa-menyentuh-bot-yang-jalan"></a>
### Checking pairing without touching the running bot

`script/testpairing.js` runs a single pairing request in a disposable session directory, so credentials for an already-connected bot are never overwritten:

```bash
node script/testpairing.js 6281234567890 --check-only
```

`--check-only` reports whether the server accepted its registration and never prints its code — use it anywhere the output can be read by others. Remove the flag to print the code and wait for linking to complete.

---

<a id="readme-section-08"></a>
<a id="-menerima-pesan"></a>
## 📩 Receiving Messages

```js
sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return

  const message = messages[0]
  if (!message?.message) return

  console.log('From:', message.key.remoteJid)
  console.log('Message:', message.message)
})
```

Getting the text simply:

```js
sock.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0]
  if (!m?.message) return

  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    ''

  console.log(text)
})
```

---

<a id="readme-section-09"></a>
<a id="-event"></a>
## 📡 Event

Everything emitted by the socket goes through `sock.ev`. Subscribe to events individually, or all at once with `sock.ev.process`.

```js
sock.ev.process(async (events) => {
  if (events['messages.upsert']) { /* ... */ }
  if (events['connection.update']) { /* ... */ }
})
```

`process` gives you one object per flush, not one callback per event, so history synchronization bursts don’t overwhelm your handler.

<a id="koneksi-dan-kredensial"></a>
### Connection and credentials

| Event | Emitted when |
|---|---|
| `connection.update` | connection state, QR, pairing code, timelock reachout |
| `creds.update` | credentials change — always connect this to `saveCreds` |

<a id="pesan"></a>
### Messages

| Event | Emitted when |
|---|---|
| `messages.upsert` | new or additional messages, with `type: 'notify' \| 'append'` |
| `messages.update` | status, edits, poll updates |
| `messages.delete` | messages are revoked |
| `messages.reaction` | reactions are added or removed |
| `messages.media-update` | media reupload completes |
| `message-receipt.update` | delivery / read receipts |
| `message-capping.update` | new chat quota changes |
| `messaging-history.set` | a history sync batch arrives |
| `messaging-history.status` | history sync progress |

<a id="chat-dan-kontak"></a>
### Chats and contacts

| Event | Emitted when |
|---|---|
| `chats.upsert` / `chats.update` / `chats.delete` | chat list changes |
| `chats.lock` | a chat is locked or unlocked |
| `contacts.upsert` / `contacts.update` | contacts change |
| `presence.update` | typing, recording, online |
| `blocklist.update` | block list changes |
| `settings.update` | privacy or account settings change |
| `labels.edit` / `labels.association` | business labels |
| `lid-mapping.update` | a phone number is mapped to an LID |

<a id="grup-dan-komunitas"></a>
### Groups and communities

| Event | Emitted when |
|---|---|
| `groups.upsert` / `groups.update` | group metadata |
| `group-participants.update` | someone joins, leaves, is promoted, or is demoted |
| `group.join-request` | someone requests to join |
| `group.member-tag.update` | a member’s label changes |

<a id="channel"></a>
### Channels

| Event | Emitted when |
|---|---|
| `newsletter.reaction` | a follower reacts |
| `newsletter.view` | the view count changes |
| `newsletter-settings.update` | channel settings change |
| `newsletter-participants.update` | an admin is promoted or demoted |
| `newsletter-admin-profile.update` | an admin updates their channel profile |

<a id="panggilan-dan-suara"></a>
### Calls and voice

| Event | Emitted when |
|---|---|
| `call` | a call comes in or is updated |
| `voice.transcription` | a voice message is transcribed |
| `voice.command` | a transcription matches a trigger phrase |

<a id="lain-lain"></a>
### Miscellaneous

| Event | Emitted when |
|---|---|
| `event` | an event message is created or updated |
| `mex.notification` | an MEX notification that this library does not yet model |

`mex.notification` is the escape hatch: anything WhatsApp adds that this library does not yet model arrives there with its operation name and raw payload, so new features are never lost without a trace.

---

<a id="readme-event-moderation"></a>
## Event reference, bot-address checks, and anti-link moderation

Listen with `sock.ev.on(eventName, handler)`. Event payloads differ by event and can contain protocol data, message keys, metadata, or arrays. The emitted event surface found in this source includes:

| Event | What it reports |
|---|---|
| `connection.update` | QR/pairing, connection state, disconnect/reconnect and online-state changes. |
| `creds.update` | Updated login credentials or account key state; save these to the selected auth store. |
| `messages.upsert` | New or synchronized messages, including whether an item is a notification or history append. |
| `messages.update` | Message status or message-content updates. |
| `messages.delete` | Message deletion events. |
| `messages.reaction` | Reactions associated with messages. |
| `message-receipt.update` | Delivery/read receipt updates. |
| `messages.media-update` | Media upload/download processing updates. |
| `message-capping.update` | Message capping or limit-related updates when provided. |
| `chats.upsert`, `chats.update`, `chats.delete`, `chats.lock` | Chat creation/sync, changes, removal and lock state. |
| `contacts.upsert`, `contacts.update` | Contact records and contact changes. |
| `groups.upsert`, `groups.update` | Group creation/sync and group metadata changes. |
| `group-participants.update` | Participants added, removed, promoted, demoted, or otherwise updated. |
| `group.join-request`, `group.member-tag.update` | Group join requests and member-tag changes. |
| `presence.update` | Available/unavailable, composing/recording and other presence changes. |
| `lid-mapping.update` | LID/phone-number address mappings. |
| `messaging-history.set`, `messaging-history.status` | History synchronization data and sync status. |
| `newsletter-admin-profile.update`, `newsletter-participants.update`, `newsletter-settings.update` | Channel admin, follower/participant and settings changes. |
| `newsletter.reaction`, `newsletter.view` | Channel message reactions and view-related updates. |
| `labels.edit`, `labels.association` | Business label edits and label-to-chat associations. |
| `blocklist.update`, `settings.update` | Blocklist and account setting changes. |
| `mex.notification` | MEX-related notifications. |
| `call` | Incoming call signaling/events. |
| `voice.transcription`, `voice.command` | Events from the optional voice-recognition/command path when configured. |

Not every event occurs in every session. Availability and payload shape depend on the server, account, permissions, and feature being used. The generated TypeScript declarations and the relevant socket implementation are the authority for exact payload details.

### Checking whether a JID is a bot address

The package exports `isJidBot()` from its JID utilities. It identifies JIDs that match the WhatsApp bot-address pattern. It does **not** inspect message wording, prove that a human account is automated, or detect arbitrary third-party bots from their behavior.

```js
import { isJidBot } from '@whiskeysockets/baileys'

sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return
  for (const message of messages) {
    const senderJid = message.key.participant ?? message.key.remoteJid
    if (isJidBot(senderJid)) {
      console.log('Message is from a WhatsApp bot-address JID:', senderJid)
    }
  }
})
```

Treat this as an address-type check only. Do not use it as proof of a sender's identity or intent.

### Anti-link moderation example

There is no built-in `antiLink` switch that automatically deletes links. A bot can implement a group rule by inspecting incoming message text in `messages.upsert`, checking the author's permissions, and then using the delete operation. This simple example catches visible URLs and common WhatsApp invite links; it is not a complete URL/security filter.

```js
import { normalizeMessageContent } from '@whiskeysockets/baileys'

const LINK_PATTERN = /(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/)/i

sock.ev.on('messages.upsert', async ({ messages, type }) => {
  if (type !== 'notify') return

  for (const message of messages) {
    const jid = message.key.remoteJid
    if (!jid?.endsWith('@g.us') || message.key.fromMe) continue

    const content = normalizeMessageContent(message.message)
    const text = content?.conversation
      ?? content?.extendedTextMessage?.text
      ?? content?.imageMessage?.caption
      ?? content?.videoMessage?.caption
      ?? ''
    if (!LINK_PATTERN.test(text)) continue

    // Add a group-admin/allow-list check here before removing anything.
    // The bot must have permission to delete other participants' messages.
    await sock.sendMessage(jid, { delete: message.key })
    await sock.sendMessage(jid, { text: 'Links are not allowed in this group.' })
  }
})
```

For a real moderation rule, account for group admins, allowed domains, URL shorteners, Unicode/obfuscated links, link-bearing media and quoted/forwarded content. Verify the bot is an administrator before attempting moderation. Do not remove members or delete messages solely from an untested regular expression. `reportSpam()` is a separate server-side reporting helper; it is not a local anti-link detector and should only be used when appropriate.

<a id="readme-section-10"></a>
<a id="-pengalamatan-lid--pn--jid"></a>
<a id="-pengalamatan-lid-pn-jid"></a>

<a id="readme-section-10"></a>
<a id="-pengalamatan-lid--pn--jid"></a>
<a id="-pengalamatan-lid-pn-jid"></a>

<a id="readme-section-10"></a>
<a id="-pengalamatan-lid--pn--jid"></a>
<a id="-pengalamatan-lid-pn-jid"></a>
## 🪪 LID / PN / JID Addressing

New versions of the WhatsApp protocol can identify users with LID addresses, not just phone-number JIDs. Don't assume every incoming user identifier ends in `@s.whatsapp.net`.

Common forms include:

```text
6281234567890@s.whatsapp.net
123456789012345@lid
120363xxxxxxxxxx@g.us
123456789@newsletter
```

For incoming messages, check the key field provided by WhatsApp:

```js
const key = message.key

console.log('remoteJid:', key.remoteJid)
console.log('remoteJidAlt:', key.remoteJidAlt)
console.log('participant:', key.participant)
console.log('participantAlt:', key.participantAlt)
```

If WhatsApp provides an alternative PN/JID, `remoteJidAlt` or `participantAlt` can be used by applications that prefer phone-number JIDs. Keep the original LID as well, because some protocol operations may still require the address originally provided by WhatsApp.

Use the built-in JID helper when normalizing markers:

```js
import { jidDecode, jidEncode, jidNormalizedUser } from '@whiskeysockets/baileys'

const normalized = jidNormalizedUser(jid)
const decoded = jidDecode(jid)

console.log(normalized)
console.log(decoded)
```

> [!IMPORTANT]
> LID and PN are two address forms for the same account **only** if WhatsApp provides the mapping or your app already knows the mapping. Do not create a fake PN by changing the suffix `@lid`.

---

<a id="readme-section-11"></a>
<a id="-mengirim-pesan"></a>
## 💬 Sending Messages

<a id="teks"></a>
### Text

```js
await sock.sendMessage(jid, {
  text: 'Greetings from RabbitXmd 💜'
})
```

**View once for text — already implemented, but displayed as unsupported.** `ExtendedTextMessage` has a `viewOnce` field, and the Android client carries a whole module around it: `FMessageViewOnceText`, `ConversationRowViewOnceText`, `ViewOnceTextRowFactory`, a dedicated `ViewOnceTextFragment`, plus its own counters `VIEW_ONCE_TEXT_MESSAGES_SENT` / `_RECEIVED` / `_OPENED`. The client encoder itself sets `extendedTextMessage.viewOnce` and then wraps the result in `viewOnceMessageV2Extension`.

`sendMessage(jid, { text, viewOnceV2Extension: true })` produces exactly that shape:

```js
{ viewOnceMessageV2Extension: { message: { extendedTextMessage: { text, viewOnce: true } } } }
```

**Measured on device 2.26.34, what still appears is "you received a message that is not supported by your WhatsApp version."** The payload is the same as the one the client writes for itself, so its format isn't the problem — the feature exists in the binary but isn't enabled for ordinary senders in that build. Consider it unavailable until a device proves otherwise.

`viewOnce: true` and `viewOnceV2: true` wrap it in `viewOnceMessage` / `viewOnceMessageV2`; those are the wrappers used by media. The plain `conversation` field can't carry all this — it's just a string with nowhere to put its flags — so the text has to be sent as `extendedTextMessage`, and this fork always does that.

<a id="mention-orang--grup"></a>
<a id="mention-orang-grup"></a>
### Mentions (people & groups)

**Person mentions** — put `@<nomor>` in the text and list the full JID in `mentions`:

```js
await sock.sendMessage(jid, {
  text: 'Hello @628123456789',
  mentions: ['628123456789@s.whatsapp.net']
})
```

`mentionAll: true` sets `contextInfo.nonJidMentions = 1` for the mention-all pattern.

**Group mention** — mention the entire group as a clickable chip. WhatsApp matches the `@<groupJid>@g.us` token in the text (client regex: `/@\d+@g.us/`), then replaces it on screen with `groupSubject`. This fork inserts the token automatically if it isn’t already present, so just:

```js
await sock.sendMessage(jid, {
  text: 'Check this group',
  groupMentions: [{ groupJid: '120363XXXXXXXXXXXX@g.us', groupSubject: 'Group Name' }]
})
```

Wire result: `text` becomes `Cek grup ini @120363XXXXXXXXXXXX@g.us`, and the recipient sees a clickable `Cek grup ini @Nama Grup`. Notes:

- `groupJid` is normalized automatically; you can enter a full JID (`...@g.us`) or just the number.
- If you have already placed the `@<groupJid>@g.us` token in the text yourself, it will not be duplicated.
- `groupSubject` is the **displayed** label, not the one used for matching — the token in the text still uses the JID.
- Can be combined with media (attached to `caption`) and with regular `mentions` in a single message.

<a id="teruskan-dari-channel-forwardednewsletter"></a>
### Forward from a channel (forwardedNewsletter)

Repost channel content with the label **"Forwarded from [Channel Name]"**. Set `contextInfo.forwardedNewsletterMessageInfo` and mark `isForwarded`:

```js
await sock.sendMessage(jid, {
  text: 'Repost from channel',
  forwardedNewsletter: {
    newsletterJid: '120363XXXXXXXXXXXX@newsletter',
    serverMessageId: 42,
    newsletterName: 'Nama Channel',
    contentType: 0
  }
})
```

- `newsletterJid` is required; the rest are optional.
- `contentType`: `0` = DEFAULT, `1` = CAROUSEL.
- Works on both text and media (attached to the type of message being created).

<a id="gambar"></a>
### Images

```js
await sock.sendMessage(jid, {
  image: { url: 'https://example.com/image.jpg' },
  caption: 'RabbitXmd image'
})
```

<a id="video"></a>
### Video

```js
await sock.sendMessage(jid, {
  video: { url: 'https://example.com/video.mp4' },
  caption: 'Video RabbitXmd'
})
```

<a id="dokumen"></a>
### Documents

```js
await sock.sendMessage(jid, {
  document: { url: 'https://example.com/file.pdf' },
  fileName: 'dokumen.pdf',
  mimetype: 'application/pdf'
})
```

<a id="lokasi"></a>
### Location

```js
await sock.sendMessage(jid, {
  location: {
    degreesLatitude: -6.200000,
    degreesLongitude: 106.816666,
    name: 'Jakarta',
    address: 'Jakarta, Indonesia'
  }
})
```

<a id="polling"></a>
### Polling

```js
await sock.sendMessage(jid, {
  poll: {
    name: 'Choose one',
    values: ['Opsi A', 'Opsi B', 'Opsi C'],
    selectableCount: 1
  }
})
```

<a id="pengaturan-polling"></a>
#### Poll settings

Every toggle WhatsApp displays in its own poll composer is available here. The option names don’t match the protobuf field names, so both are listed side by side:

| Option | Protobuf field | Default | What it does |
|---|---|---|---|
| `selectableCount` | `selectableOptionsCount` | `1` | how many answers one person can select |
| `hideVoter` | `hideParticipantName` | `false` | hides who voted for what |
| `canAddOption` | `allowAddOption` | `false` | allows recipients to add their own options |
| `endDate` | `endTime` | none | `Date` after which the poll closes |

> **These four options are gated on the recipient’s account.** WhatsApp checks each one against a server-controlled flag, and if the flag is off, the recipient doesn’t just ignore the setting — the **entire poll** is rendered as *"You received a message that isn’t supported by your version of WhatsApp"*. Option images are relayed separately, so a failed poll can look like only its images came through.
>
> What’s checked is the *presence* of the field, not its value. That’s why this library omits `hideParticipantName` and `allowAddOption` entirely if you don’t enable them, instead of sending `false`.
>
> `canAddOption` is the least available of the four: WhatsApp Web has no send gate for it at all, meaning its composer never offers it, and the recipient flag `poll_add_option_receiving_enabled` still defaults to off. Treat it as experimental. `selectableCount` is the only setting that is never gated.
>
> To find out what an account supports, send one poll per setting and see which ones arrive as actual polls.

`hideVoter` and `endDate` also work with image polls. All poll versions carry the same `PollCreationMessage`, so `pollCreationMessageV3` holds those fields exactly as in V6, and the recipient reads them from whichever version arrives—but option images are only attached to V3. That’s why this library keeps image polls on V3 and reserves V6 for text polls:

| Poll | Version sent |
|---|---|
| an option carries `image` | V3, with its settings |
| text options + `hideVoter` / `endDate` | V6 |
| text options, single answer | V3 |
| text options, multiple answers | `pollCreationMessage` |

`canAddOption` remains the exception: it fails every poll wherever its recipient flag is off, with or without images.

```js
 await conn.sendMessage(jid, {
  poll: {
    name: 'Which one tastes good?',
    values: [
  { name: 'Nasi Padang', image: { url: global.RabbitXmd } },
  { name: 'Nasi Goreng', image: { url: global.RabbitXmd } }
],
    selectableCount: 1,
    hideVoter: true,
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
})
```

`canAddOption` is deliberately left out of the example — add it only after you confirm the recipient supports it, because it is the most likely to turn the entire poll into an unsupported placeholder.

Text and image options can be mixed in a single poll, exactly as the composer allows. An option that carries `image` turns the poll into a [photo poll](#polling-foto); once `canAddOption` is set, the recipient can expand it via [Adding Poll Options](#menambah-opsi-polling).

`endDate` accepts `Date`, not a timestamp — it is converted to epoch milliseconds when sent.

Photo polls are rendered in both groups and one-on-one chats — mobile clients receive them there.

Two notes to keep in mind. WhatsApp **Web** recipients are stricter than mobile recipients. The gate, read from the Web bundle, looks roughly like this — this is WhatsApp code, not an export from this library, so nothing here can be imported or called:

```text
isPhotoPollReceiverEnabled(msg) =
  isNewsletterMsg({ from: msg.from, to: msg.to }) && isNewsletterPhotoPollsReceiverEnabled()
```

In other words, Web only accepts photo polls in channels, so a photo poll that looks correct on a phone may appear unsupported in a browser session. And mixing image options with `hideVoter` or `endDate` moves the message to `pollCreationMessageV6`; if the image stops appearing after you add either switch, send the photo poll without them.

---

<a id="readme-section-12"></a>
<a id="-external-ad-reply"></a>
## 📰 External Ad Reply

`externalAdReply` can be attached via `contextInfo` if you want a standard WhatsApp link-preview-style card.

```js
await sock.sendMessage(jid, {
  text: 'RabbitXmd Baileys',
  contextInfo: {
    externalAdReply: {
      title: 'RabbitXmd Baileys',
      body: 'Library WhatsApp Multi-Device modern',
      mediaType: 1,
      thumbnailUrl: 'https://example.com/RabbitXmd.jpg',
      sourceUrl: 'https://github.com/RabbitXmd/baileys',
      renderLargerThumbnail: true,
      showAdAttribution: false
    }
  }
})
```

The payload can also be passed to the builder via `.setContextInfo(...)` if the builder supports context info.

There is also a shorthand form that sits alongside the content, not inside `contextInfo`:

```js
await sock.sendMessage(jid, {
  text: 'RabbitXmd Baileys',
  externalAdReply: {
    title: 'RabbitXmd Baileys',
    body: 'Library WhatsApp Multi-Device modern',
    thumbnail: await fs.promises.readFile('./cover.jpg'),
    url: 'https://github.com/RabbitXmd/baileys',
    largeThumbnail: true
  }
})
```

`url` there fills `sourceUrl`, the link opened by the card. It is not an image, so it is no longer copied into `thumbnailUrl` or `mediaUrl` — these are separate keys that you set yourself if the image is fetched over the network. Give the card either an inline `thumbnail` buffer or `thumbnailUrl`; without either, the card is rendered without an image and a warning is logged.

<a id="kenapa-kartunya-bisa-tidak-muncul-sama-sekali"></a>
### Why the card might not appear at all

The field is still active — the current WhatsApp build still parses `externalAdReply` and still traverses it during validation. What changed is the receiver’s side. Both clients discard **the entire message**, not just the card, if it arrives in a consumer account. WA Web:

```js
if (!isSMB() && !getIsSentByMe(t) && r != null
    && getABPropConfigValue("ctwa_suppress_message_with_external_ad_reply_consumer_db_level_enabled"))
  throw new MessageValidationError("This is a spam message sent to consumer number with externalAdReply", INVALID_MESSAGE)
```

Android has the same gate, logged as `ctwa-message-suppressed-external-ad-reply` next to "message suppressed due to ExternalAdReply, mitigation enabled" in `CoreMessageStore`, just before the message is dropped and replaced with a placeholder.

Read all three conditions:

- `!isSMB()` — WhatsApp Business recipients still see the card. Only consumer WhatsApp drops it.
- `!getIsSentByMe` — your own copy on your own device is exempt. That’s why a card can look perfect on the sender’s phone while nobody else receives the message.
- Its AB prop — controlled server-side per account, so the same payload can work for one recipient and disappear for another, and can start failing without a single line of your code changing.

No payload content changes this. This isn’t about having the right `mediaType`, a valid thumbnail, or `showAdAttribution`; the message is dropped after decryption, before it’s rendered. If the card is carrying your message content, send that content in the message body too so the message remains useful on its own.

The default for this prop in the `false` client table means it isn’t enabled everywhere — it’s turned on per account from the server. Verify first before assuming: send the same card to a WhatsApp Business number. If the Business copy shows the card and the consumer copy shows no message at all, this is the gate. If neither shows the card but both show the message, the card itself is malformed and [Rich Link Cards](#-kartu-rich-link) isn’t what you need — check the thumbnail first.

<a id="click-to-whatsapp-bentuk-yang-benar-benar-dikirim-saat-iklan-diklik"></a>
### Click-to-WhatsApp, the exact form sent when an ad is clicked

The example above uses `externalAdReply` as decoration. Click-to-WhatsApp is the original use case this field was built for: someone taps an ad on Facebook or Instagram, WhatsApp opens to a thread with the advertiser, and the first message that person sends carries the ad it came from. Those are the additional keys left blank by the decorative card.

```js
import { proto } from '@whiskeysockets/baileys'

await sock.sendMessage(jid, {
  text: 'Hi, I have a question about the promotion',
  contextInfo: {
    conversionSource: 'FB_Ads',
    conversionData: Buffer.from('120210000000000000'),
    conversionDelaySeconds: 3,
    externalAdReply: {
      sourceType: 'ad',
      sourceId: '120210000000000000',
      sourceUrl: 'https://fb.me/1a2b3c4d5e',
      sourceApp: 'facebook',
      ctwaClid: 'AbQ1kZ8xR2mNpL7vT0yUwE',
      title: '50% off all menu items',
      body: 'Berlaku sampai akhir bulan',
      mediaType: proto.ContextInfo.ExternalAdReplyInfo.MediaType.IMAGE,
      thumbnailUrl: 'https://example.com/promo.jpg',
      renderLargerThumbnail: true,
      showAdAttribution: true,
      containsAutoReply: true,
      automatedGreetingMessageShown: true,
      greetingMessageBody: 'Hi, I have a question about the promotion',
      ctaPayload: 'promo_bulan_ini',
      adType: proto.ContextInfo.ExternalAdReplyInfo.AdType.CTWA,
      containsCtwaFlowsAutoLabel: true
    }
  }
})
```

Uses of each CTWA-specific key:

| Key | Meaning |
|---|---|
| `contextInfo.conversionSource` | which surface generated the click. `FB_Ads` is a value written by the client itself |
| `contextInfo.conversionData` | opaque bytes returned to the advertiser for attribution — in practice, its ad id. `ctwaPayload` (55) takes precedence over this one if `ctwaSignals` is also set |
| `contextInfo.conversionDelaySeconds` | the number of seconds between the ad tap and its delivery. This is field **20**, not `entryPointConversionDelaySeconds` (31) — the CTWA parser only reads 20 |
| `sourceType` | `"ad"` for ads, `"post"` for organic posts |
| `sourceId` | the id of the ad or post |
| `ctwaClid` | the click id that binds this conversation to a single ad click |
| `sourceApp` | `"facebook"`, `"instagram"`, … |
| `containsAutoReply` / `greetingMessageBody` | the pre-filled greeting from the ad, and whether the sender saw it |
| `ctaPayload` | the ad's call-to-action payload, defined by you |
| `adType` | `CTWA` (0) or `CAWC` (1) |
| `containsCtwaFlowsAutoLabel` | new in revision `1047203841`: the thread carries an auto-label for CTWA Flows |

`AdType.CTWA` has the value `0`, so protobuf does not write it to the wire and it reads back as `0` — that is its default value, not a missing field.

<a id="kartu-dan-label-via-ad-itu-dua-hal-berbeda"></a>
### The card and the "via ad" label are two different things

When received, the client folds `contextInfo` into `ctwaContext` in its message, and only some of the keys above survive that journey:

```js
n.alwaysShowAdAttribution = contextInfo.alwaysShowAdAttribution
n.conversionSource        = contextInfo.conversionSource
n.conversionDelaySeconds  = contextInfo.conversionDelaySeconds
n.conversionData          = ctwaSignals != null && ctwaPayload != null ? ctwaPayload : conversionData
const d = contextInfo.externalAdReply
if (d != null) {
  n.sourceUrl = d.sourceUrl, n.title = d.title, n.description = d.body
  n.thumbnail = decodeBytes(d.thumbnail), n.thumbnailUrl = d.thumbnailUrl
  n.mediaType = d.mediaType, n.mediaUrl = d.mediaUrl
  n.isSuspiciousLink = findLink(d.sourceUrl).suspiciousCharacters.size > 0
  // lalu sourceApp, dan greetingMessageBody / automatedGreetingMessageShown / ctaPayload
  // only if isWamoAGMIntegrationEnabled(d.sourceApp)
}
```

`sourceType`, `sourceId`, and `ctwaClid` are **not** copied to `ctwaContext` — they are included for attribution purposes and do not draw anything.

**The card** — image, title, subtitle — is then drawn under conditions that do not mention any Business or AB props:

```js
if (ctwaContext == null
    || ctwaContext.sourceUrl == null
    || ctwaContext.mediaType === MediaType.NONE
    || (ctwaContext.adContextPreviewDismissed === true && isHideAdContextIfSoftDismissed()))
  return null
```

So a regular consumer account does draw it, as long as `sourceUrl` is set and `mediaType` is `IMAGE` or `VIDEO`. `mediaType: 0` doesn’t draw anything.

The **"Message via ad" label** is a separate element, and it relies on `contextInfo.alwaysShowAdAttribution` (field **48**)—not `externalAdReply.showAdAttribution`, which is a different field and is never read by the label. One render path checks only the field; another goes through `shouldShowAdAttribution`, which adds `isSMB() || getABPropConfigValue("wa_ctwa_web_thread_ad_attribution_enabled")` (`2898`, default `false`) and immediately rejects forwarded messages.

<a id="jangan-pernah-menyetel-alwaysshowadattribution-dari-bot"></a>
### Never set `alwaysShowAdAttribution` from a bot

Setting it sacrifices your entire message, without involving any props:

```js
function D(msg) {
  const n = msg.ctwaContext?.alwaysShowAdAttribution
  if (!isSMB() && !isMeAccount(getSender(msg)) && n === true)
    throw new MessageValidationError("This is a spam message sent to consumer number with 'Message Via Ad' header", INVALID_MESSAGE)
}
```

No AB prop, no rollout — the consumer recipient always drops any message carrying that flag from anyone other than itself. It lives in the same module as the documented `externalAdReply` emphasis above, and the two are neatly separated:

| What you send | Consumer recipient |
|---|---|
| `externalAdReply` with `sourceUrl` + `mediaType` 1/2 | the card is rendered |
| `externalAdReply`, `21819` prop enabled for that account | all messages are dropped (server-controlled, off by default) |
| `contextInfo.alwaysShowAdAttribution: true` | all messages are dropped, **always** |

So the card half of the CTWA is ordinary and safe; its ad attribution half is intended for Business accounts.

---

<a id="readme-section-13"></a>
<a id="-kartu-rich-link"></a>
## 🖼️ Rich Link Card

A card WhatsApp renders itself for a link. Its large image, title, and subtitle are the same as `externalAdReply`, but it is built from `extendedTextMessage`, the ordinary link preview all users send throughout the day — with no ad fields, so the emphasis above cannot affect it.

```js
await sock.sendMessage(jid, {
  richLink: {
    text: 'dengerin ini',
    url: 'https://example.com/track',
    title: 'Judul Lagu',
    description: 'Penyanyi',
    image: { url: './sampul.jpg' }
  }
})
```

`url` is required. `text` is your message; the link is added to it if it isn't already there, because the client only renders previews for links in the message body. Remove `text` and its link as the message body.

`image` is the part that does the work. WhatsApp's own composer doesn't put the image in the message — it uploads it to the media server as a `thumbnail-link` blob and then sends the key, so the recipient downloads and decrypts the full-size cover. That's what makes the preview large rather than a small box, and that's what happens here:

| sent over the wire | from |
| --- | --- |
| `jpegThumbnail` | 192px inline copy, shown while the download is in progress |
| `thumbnailDirectPath`, `mediaKey`, `mediaKeyTimestamp` | upload result |
| `thumbnailSha256`, `thumbnailEncSha256` | upload result |
| `thumbnailWidth`, `thumbnailHeight` | actual encoded image dimensions |

The last two aren't decorative. The client's own guard looks like this:

```js
var n = !!(e.thumbnailDirectPath || e.thumbnailHQ) && e.thumbnailHeight != null && e.thumbnailWidth != null;
if (!n) return false;
```

If one of the dimensions is missing, it draws a small card and never downloads its blob, and comparing the two determines whether the bubble is portrait or landscape. So the dimensions here are measured from the encoded bytes, not the source: images wider than the target are scaled down, while images that are already narrower are left as they are, rather than being stretched to 640 and becoming blurry. If no image library is installed, nothing can be measured, so there is no upload at all and you get a small card — an upload without dimensions next to it is one the client will reject.

Use `large: false` if you really want a small card; this also skips the upload. `thumbnailWidth` changes the number 640; `previewType` accepts `proto.Message.ExtendedTextMessage.PreviewType` if you want `VIDEO` for an inline-rotated link. Any other key is passed through to the message, so `contextInfo` works as usual.

One case where the large card is rejected no matter what you send: in status, the client also requires `thumbnailWidth / thumbnailHeight >= 1.4`, so portrait or square covers fall back to a small card there.

If you already have your own preview pipeline, `linkPreview` accepts the same `image` and uploads it the same way:

```js
await sock.sendMessage(jid, {
  text: 'lihat https://example.com/a',
  linkPreview: {
    'matched-text': 'https://example.com/a',
    title: 'Judul',
    description: 'Keterangan',
    image: { url: './image.jpg' }
  }
})
```

`linkPreview` also accepts `large: false` for small cards, and it doesn’t need its link to be in your text at all:

```js
await sock.sendMessage(jid, {
  text: 'no link here',
  linkPreview: {
    'matched-text': 'https://example.com',
    title: 'Judul',
    description: 'Keterangan',
    image: { url: './image.jpg' }
  }
})
```

The client decides that a message carries a preview via `isUrlExtendedTextMessage`, which is `!!matchedText || !!description || !!title` — the message body is never seen. So the card is rendered, tapping it opens `matchedText`, and the chat only shows your words. `richLink` adds its link because a normal link preview belongs to a link that readers can see; if you want the card without it, use `linkPreview` directly.

The `upload` function must be available for large cards, because its thumbnail is actually uploaded — sending it via socket already gives you that. The image library (`sharp`, `@napi-rs/image`, or `jimp`) measures and scales the cover, and without it the card is always the small one.

---

<a id="readme-section-14"></a>
<a id="messagebuilder-terintegrasi"></a>
<a id="-messagebuilder-terintegrasi"></a>
## 🧱 Integrated MessageBuilder

MessageBuilder v4.7 is included directly in `@whiskeysockets/baileys`.

<a id="satu-impor-seluruh-builder"></a>
### One import, the entire builder

The builder surface consists of 212 names spread across four modules, which is why a single bot can end up with an entire paragraph of imports just to render one card. `MB` (its full name: `MessageBuilder`) brings everything together — all five builder classes, all section and item factories, all enums, the native flow checker, signature helpers. Nothing else needs to be included in the import line:

```js
import { MB } from '@whiskeysockets/baileys'

await new MB.Button(sock)
  .setTitle('RabbitXmd Menu')
  .addReply('Ping', 'ping')
  .send(jid)

const rich = new MB.AIRich(sock)
rich.addText('*Laporan*')
rich.addSection(MB.dividerSection())
rich.addSection(MB.taskSection({ taskId: 'job-1', title: 'Rendering', status: MB.TaskStatus.RUNNING }))
await rich.send(jid)

MB.checkNativeFlowButtons([{ name: 'single_select' }])
```

Each `MB` member is the same function as its named export, not a copy, so nothing changes if you already import them individually — `MB.dividerSection === dividerSection`. The builder class also exposes the same members as static methods (`AIRich.dividerSection`, `Button.checkNativeFlowButtons`), which is useful if the class is the only thing you import.

All examples in this chapter are written this way, `MB` and nothing else, right through the A2UI and HTML mini app pages. The long list is still available and nothing has been deprecated, so existing bots don’t need to be changed:

```js
import {
  Button,
  ButtonV2,
  Carousel,
  AIRich,
  Toolkit,
  MessageBuilder,
  MB,
  MESSAGE_BUILDER_VERSION,
  AIRichError,
  ItemNotFoundError,
  DuplicateIdError,
  InvalidTargetError,
  ContentValidationError
} from '@whiskeysockets/baileys'
```

---

<a id="readme-section-15"></a>
<a id="-split-payment-dan-pengingat"></a>
## 💸 Split Payment and Reminders

Both are represented on Android as their own bubbles. Amounts are human-scale numbers — the value on the wire is scaled by `offset` (default 1000), and passing a manually scaled number makes the charge a thousand times larger.

```js
import { SplitPaymentStatus, ReminderFrequency } from '@whiskeysockets/baileys'

await sock.sendMessage(jid, {
  splitPayment: {
    splitId: 'makan-01',
    total: 150000,
    currency: 'IDR',
    description: 'Makan bareng',
    requesterJid: '628xxxx@s.whatsapp.net',
    participants: [
      { jid: '6281xxxx@s.whatsapp.net', amount: 50000 },
      { jid: '6282xxxx@s.whatsapp.net', amount: 100000, status: SplitPaymentStatus.PAID }
    ]
  }
})

await sock.sendMessage(jid, {
  splitPaymentUpdate: { splitId: 'makan-01', participantJid: '6281xxxx@s.whatsapp.net' }
})

await sock.sendMessage(jid, {
  paymentReminder: {
    reminderId: 'sewa-01',
    description: 'Sewa bulanan',
    amount: 500000,
    currency: 'IDR',
    frequency: ReminderFrequency.MONTHLY
  }
})
```

`splitId` is required, and that is what its update message is called later. Participants default to `PENDING` and `createdAt` are tagged for you. The reminder defaults to `ACTIVE` and accepts `WEEKLY`, `BI_WEEKLY`, `MONTHLY`, or `QUARTERLY`; `payeeVpa`, `payeeJid`, and `payerJid` are available for the UPI flow.

Read it back with `readSplitPayment(msg)` and `readPaymentReminder(msg)`, which return `null` for anything else and pass the amount as a human-readable number. `money(amount, code)` and `readMoney(value)` handle the scaling themselves if you need it elsewhere.

This is an ordinary message sent by your own account, appearing under your own name — it does not move money and is not a payment request acted upon by the network. Treat this split card as a note, because that is exactly what it is.

<a id="readme-section-16"></a>
<a id="-gaya-link-preview-di-status"></a>
## 📊 Link Preview Status Style

`statusLinkPreviewMetadata` sits at the top of the message, beside its text, and tells you which link preview card status to draw:

```js
await sock.sendMessage('status@broadcast', {
  text: 'baca ini https://example.com/artikel',
  statusLinkPreview: { style: 1 }
})
```

The client does not publish any names for these values, so the numbers are passed through as-is here rather than inventing an enum — `statusLinkPreview: 1` alone produces the same result. Negative or non-integer styles are rejected.

<a id="readme-section-17"></a>
<a id="-membaca-social-link-preview"></a>
## 🎬 Reading Social Link Previews

When the Meta client itself sends a link preview for a reel or post, it attaches additional nodes next to the usual title and thumbnail: `linkPreviewMetadata` contains the post type, inline video, and its duration, along with `endCardTiles` and `videoContentUrl`. `readSocialPreview(msg)` pulls all of these back out, and returns `null` for messages that don't include any of them.

```js
import { readSocialPreview } from '@whiskeysockets/baileys'

sock.ev.on('messages.upsert', ({ messages }) => {
  for (const msg of messages) {
    const social = readSocialPreview(msg)
    if (social) console.log(social.postType, social.videoUrl, social.endCards)
  }
})
```

**There is deliberately no sender-side recipe here.** `socialPreview` and `videoEndCard` still exist and are still encoded correctly, but as of revision `1047301412`, nothing draws them from a message you send, so documenting them as a way to create a card would mean documenting a message that arrives empty.

Here’s the evidence, so you don’t have to derive it again: in WA Web, the proto-to-model mapper for `extendedTextMessage` copies `matchedText`, `description`, `title`, `jpegThumbnail`, `previewType`, `doNotPlayInline`, `mediaKey`, `mediaKeyTimestamp`, `thumbnailDirectPath`, `thumbnailSha256`, and `thumbnailEncSha256` — nothing else. `linkPreviewMetadata`, `endCardTiles`, and `videoContentUrl` are discarded at that boundary before any component can read them, and direct read counts across the entire bundle agree: `matchedText` 66, `thumbnailDirectPath` 51, those three **0** each. In the app, `endCardTiles_` is absent from every dex, so the tile can’t even be decoded there.

For a card that actually renders, with a large thumbnail and no link pasted into the message body, use [Rich Link Card](#-kartu-rich-link) or the `linkPreview` option on a plain text message.

<a id="readme-section-18"></a>
<a id="button"></a>
## Button

The `Button` builder is used for native-flow interactive messages.

<a id="quick-reply--url--copy"></a>
<a id="quick-reply-url-copy"></a>
### Quick Reply + URL + Copy

```js
import { MB } from '@whiskeysockets/baileys'

const message = new MB.Button(sock)
  .setTitle('RabbitXmd Menu')
  .setBody('Choose one below.')
  .setFooter('@whiskeysockets/baileys')
  .addReply('Ping', 'ping')
  .addUrl('Open Website', 'https://example.com')
  .addCopy('Salin Kode', 'RABBITXMD2026')

await message.send(jid)
```

<a id="button-dengan-gambar"></a>
### Button with an Image

```js
const message = new MB.Button(sock)
  .setImage('https://example.com/RabbitXmd.jpg')
  .setTitle('RabbitXmd')
  .setBody('Interactive message with an image header.')
  .setFooter('Powered by RabbitXmd Baileys')
  .addReply('Menu', 'menu')
  .addUrl('Website', 'https://example.com')

await message.send(jid)
```

<a id="daftar-helper-button"></a>
### Button Helper List

```js
.addReply(displayText, id)
.addUrl(displayText, url)
.addCopy(displayText, copyCode)
.addCall(displayText, id)
.addReminder(displayText, id)
.addCancelReminder(displayText, id)
.addAddress(displayText, id)
.addLocation(options)
.addSelection(title, options)
.addButton(name, params)
```

The builder also provides:

```js
.setTitle(text)
.setSubtitle(text)
.setBody(text)
.setFooter(text)
.setImage(urlOrBuffer)
.setVideo(urlOrBuffer)
.setDocument(urlOrBuffer)
.setMedia(object)
.setContextInfo(object)
.addPayload(object)
.clearButtons()
.setParams(object)
.build(jid)
.send(jid)
```

---

<a id="readme-section-19"></a>
<a id="selection--list"></a>
<a id="selection-list"></a>
## Selection / List

Create a native single-select list with `addSelection`, `makeSection`, and `makeRow`.

```js
const list = new MB.Button(sock)
  .setTitle('RabbitXmd Menu')
  .setBody('Choose a menu.')
  .setFooter('RabbitXmd Baileys')
  .addSelection('Open Menu')
  .makeSection('Menu Utama')
  .makeRow('', 'Profil', 'Open profile menu', 'profile')
  .makeRow('', 'Pengaturan', 'Open settings menu', 'settings')
  .makeSection('More')
  .makeRow('', 'Tentang', 'Tentang bot ini', 'about')

await list.send(jid)
```

> [!IMPORTANT]
> `single_select` is only rendered on **Android**. WhatsApp Web and iOS don't have its code — its name isn't in their native-flow list, so the message falls back to a plain text card and the list disappears. This isn't something that can be patched in the library. See [Native Flow Support](#dukungan-native-flow) for what is actually rendered everywhere.

<a id="dukungan-native-flow"></a>
### Native Flow Support

WhatsApp Web maintains a fixed list of native-flow button names. Anything outside that list is discarded and the message is downgraded to `phone_only_feature` — the text still gets through, but the button doesn't.

```js
import { MB } from '@whiskeysockets/baileys'

MB.checkNativeFlowButtons([{ name: 'single_select' }])
// { ok: false, unsupported: ['single_select'], problems: ['"single_select" is not a native flow WhatsApp Web or iOS can render, only Android shows it'] }

MB.isWebSupportedButtonName('quick_reply')  // true
```

Displayed everywhere: `quick_reply`, `cta_url`, `cta_call`, `cta_copy`, `cta_catalog`, `catalog_message`, `galaxy_message`, `order_status`, `payment_reminder`, `booking_confirmation`, `payment_request`, `api_signup`, `inapp_signup`, `cta_app`, `form_message`.

Android only: `single_select`, `send_location`, `address_message`, `cta_reminder`, `cta_cancel_reminder`.

Two limits, read from the client, not guessed:

| First button | Maximum buttons |
|---|---|
| `quick_reply` | 10 |
| otherwise | 3 |

Quick replies cannot be mixed with other button types in one message — the client rejects the entire set, not just the offending button.

If you need one menu that works on all platforms, use up to 10 `addReply` buttons, or send the options as text and let users respond. No protocol trick can make a single-select list appear on Web.

---

<a id="readme-section-20"></a>
<a id="buttonv2"></a>
## ButtonV2

`ButtonV2` provides a simpler classic button builder.

```js
import { MB } from '@whiskeysockets/baileys'

const message = new MB.ButtonV2(sock)
  .setTitle('RabbitXmd')
  .setSubtitle('WhatsApp Bot')
  .setBody('Choose an action.')
  .setFooter('RabbitXmd Baileys')
  .setThumbnail('https://example.com/RabbitXmd.jpg')
  .addButton('Menu', 'menu')
  .addButton('Ping', 'ping')

await message.send(jid)
```

---

<a id="readme-section-21"></a>
<a id="carousel"></a>
## Carousel

Carousel cards can be created from `Button.toCard()` and then passed to `Carousel`.

```js
import { MB } from '@whiskeysockets/baileys'

const card1 = await new MB.Button(sock)
  .setImage('https://example.com/card1.jpg')
  .setBody('Kartu pertama')
  .addReply('Choose', 'card_1')
  .toCard()

const card2 = await new MB.Button(sock)
  .setImage('https://example.com/card2.jpg')
  .setBody('Kartu kedua')
  .addUrl('Open', 'https://example.com')
  .toCard()

const carousel = new MB.Carousel(sock)
  .setBody('Choose one of the cards below.')
  .setFooter('RabbitXmd Carousel')
  .addCard([card1, card2])

await carousel.send(jid)
```

> [!IMPORTANT]
> Every carousel card must have an image or video media attachment in its header.

---

<a id="readme-section-22"></a>
<a id="airich"></a>
## AIRich

`AIRich` is the built-in rich response builder for various layouts and content types.

It doesn't go through `sock.sendMessage`, and it can't. `send` relays its message and then immediately sends one `protocolMessage` edit for that message itself — the unified response is only rendered once that second stanza lands. That's two stanzas from one call, and not something `sendMessage` can return; it gives you one `WebMessageInfo` for one message. So rich responses are built on an instance and relayed by its own builder, and all the examples below start with `new MB.AIRich(sock)` and end with `await rich.send(jid)`.

**`import { MB }` is the only import in this section**, including HTML mini app pages, A2UI, and all its readers — `MB.htmlSection(…)`, `MB.sendHtmlApp(…)`, `MB.a2uiText(…)`, `MB.decodeAIRich(…)`, `MB.TaskStatus.RUNNING`. See [One import, all builders](#satu-impor-seluruh-builder). The named export still works unchanged if you prefer it; both are the same function, not copies.

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock)
rich.addText('Hello')
await rich.send(jid)
```

`send` accepts the same options as `build` — `quoted`, `messageId`, `forwardWrapper`, `notification` — and `sendEdit` replaces the message already displayed on screen. Pass the bot's own jid via `botJid` if you want the forward attribution to mention something other than its default.

A single `send` call sends two stanzas: the message, followed by an edit `protocolMessage` type 14 carrying the same content. The second one makes the card render without a download, so if it fails, `send` also throws — the error carries `relayedKey`, the key of the first stanza that was already sent, so you can retry `sendEdit` yourself. Previously, this failure was silently swallowed and `send` still returned the key as if everything were fine, even though only an empty message arrived.

<a id="teks--kode--tabel"></a>
<a id="teks-kode-tabel"></a>
### Text + Code + Table

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock)
  .setTitle('RabbitXmd AI')
  .setFooter('Made with AIRich')
  .addText('Hello! This is a rich response.')
  .addCode('javascript', `console.log('Hello RabbitXmd')`)
  .addTable([
    ['Fitur', 'Status'],
    ['Button', 'Tersedia'],
    ['Carousel', 'Tersedia'],
    ['AIRich', 'Eksperimental']
  ])
  .addSuggest(['Lihat menu', 'Help me', 'Tentang RabbitXmd'])

await rich.send(jid)
```

<a id="kenapa-bisa-tidak-muncul-sama-sekali"></a>
### Why it might not appear at all

AI Rich messages are sent wrapped in `botForwardedMessage`, exactly like original Meta AI forwards, and that's by design.

It wasn't always like that. `build` and `send` once put `richResponseMessage` at the top level, because in the WA Web bundle, the wrapper is only unwrapped behind one gate:

```js
: n && o("WAWebBotBaseGating").isRichResponseForwardReceivingEnabled() ? n : u || null
```

`n` is there `botForwardedMessage`, the gate is AB prop `ai_rich_response_forward_receiving_enabled` (id 16682), and its default is **false** — in `WAWebABPropsConfigs` the value is `[16682,"bool",!1,!0]` and `getABPropConfigValue` reads the third element.

But that’s the WA **Web** table, while these messages are read on phones. The Android dex doesn’t contain the prop name at all; it only has storage column names — `ai_rich_response_core_blob`, `ai_rich_response_message_type`, and so on. The unwrapped form isn’t rendered there: the relay succeeds, the message ID comes back, and nothing appears on screen. So the default is wrapped again, the same as the v4.7 MessageBuilder send path — two stanzas, `botForwardedMessage` in both, the second one `protocolMessage` type 14.

Pass `forwardWrapper: false` to `build`, `send`, `buildEdit`, or `forwardRichResponse` if you’re targeting WA Web and know that the prop is enabled there.

<a id="kenapa-cuma-judulnya-yang-muncul"></a>
### Why only the title appears

The bubble appears, the title appears, but the body is empty. In the Android dex `2.26.37.1`, the conversation row selector (`LX/Dox;->A00`) has three paths for a rich response:

1. **Masked** — only if the message verification status is **FAILED**, behind prop `ai_rich_response_unknown_sender_verification_masking_enabled` (id 27635). Client log: `ConversationRowAiUnknownSenderMasked: signature verification failed`.
2. **Preview** — unknown sender with unapproved content, prop `ai_rich_response_unknown_sender_preview_enabled` (id 27355).
3. **Full** — `ConversationRowBotRichResponse`, body rendered from `unifiedResponse`.

The key is the `LX/ANE;->A00` classifier: it reads the message verification status as one of four enums, `LX/9sz;` — `UNKNOWN`, `VALID`, `FAILED`, `DOWNLOAD_CONSENT_ACCEPTED` — and **defaults to `UNKNOWN`** when no proof is present. Across all row selectors, this enum is only ever compared with one value: **`FAILED`**. So the masking branch only applies when proof is **present but invalid**.

That’s where the old version went wrong: `AIRich` always attached an `verificationMetadata` placeholder (marked random bytes), so its status was always `FAILED` and it was therefore always masked on accounts with the prop enabled. Only Meta can create a valid signature (`CN=Meta WA Feature Root CA`, ECDSA P-256), so a placeholder could never become `VALID`.

The fix: **don’t send any proof at all.** Without proof, the status is `UNKNOWN`, not `FAILED`, and the masking branch has no path to `UNKNOWN`. That is now the default for `build`/`send` (`verification: 'auto'`):

| `verification` | verificationMetadata | Status on client | Effect in prop 27635 |
|---|---|---|---|
| `'auto'` (default) | not sent (except when genuinely forwarded) | `UNKNOWN` | **not masked** |
| `'placeholder'` | fake proof | `FAILED` | masked |
| genuine Meta AI forward | Meta signature included | `VALID` | fully visible |

```js
const msg = await rich.send(jid)                          // auto: proof dihilangkan
msg.aiVerification   // 'omitted'     = tanpa proof, status UNKNOWN (bawaan)
                     // 'placeholder' = proof palsu, status FAILED (opt-in)
                     // 'preserved'   = tanda tangan Meta asli, status VALID
```

Honestly, about the limitation: this **bypasses the masking branch (27635)**, which is the most common cause of “title only.” But it does **not** bypass the preview branch (27355) — if the recipient’s account has that unknown-sender gate enabled, the card can still be trimmed, and nothing in the payload changes that because it depends on whether the sender is a registered Meta bot. `UNKNOWN` is never worse than `FAILED`; on many accounts, it’s what makes the difference between title-only and full display. This is inferred from the control flow in dex, not tested on a device — so test it on your account, and if it’s still trimmed, the two paths below are guaranteed.

`send()` warns once per process only if you **intentionally** choose `verification: 'placeholder'`. `AIRich.isMetaSignature(verificationMetadata)` checks the authenticity of a message’s signature.

Only these two **guarantee full display**:

| What you want | Use |
| --- | --- |
| A rich card guaranteed to appear for anyone | `Button`, `ButtonV2`, `Carousel` (`interactiveMessage`) — a different rendering path that doesn’t go through this gate |
| Forwarding an actual Meta AI response | `forwardRichResponse(sock, jid, msg)` — Meta’s bytes and signature are carried over as-is, so its `aiVerification` is `preserved` |

The homemade AIRich is still useful for developing/testing card layouts and for recipients whose prop has not been enabled, but don’t rely on it to render fully for just any account.

Other available AIRich helpers include:

```js
.addText(text)
.addCode(language, code)
.addTable(rows)
.addSource(sources)
.addReels(items)
.addImage(imageUrl, options)
.addVideo(videoUrl, options)
.addProduct(data)
.addPost(data)
.addTip(text)
.addSuggest(suggestion, options)
.addFOAText(text)
.addMetadata(text)
.addWidget(data, options)
.addFooterAction(data, options)
.addSection(section)
.addSubmessage(submessage)
```

<a id="apa-yang-bisa-dicampur-dengan-apa"></a>
### What Can Be Mixed With What

Rich responses and interactive messages seem like they should be combinable, and the bot menu that pairs `nativeFlowMessage` with `bloksWidget` gives the impression that anything goes. Read the client, and everything neatly divides into one thing that cannot be mixed and two that can.

<a id="kunci-konten-tingkat-atas-tidak-pernah-bisa-dicampur"></a>
#### Top-level content keys can never be mixed

`richResponseMessage` is field **97** of `Message`. `interactiveMessage` is **45**, `extendedTextMessage` is **6**, `conversation` is **1**. Protobuf is happy to encode two of them side by side, and both survive the trip — but each resolver selects exactly one, following field order, and the rest is just dead weight on the wire:

```js
proto.Message.encode({ richResponseMessage, interactiveMessage }).finish()
// kunci di wire   : interactiveMessage, richResponseMessage
// getContentType() : interactiveMessage        ← respons rich-nya diabaikan
```

So there is no such thing as a “rich response with buttons.” Send two messages, or choose one format.

<a id="di-dalam-interactivemessage-tiga-slot-ikut-dan-tiga-saling-berebut"></a>
#### Inside `interactiveMessage`, three slots are involved, and all three compete with each other

The client determines the interactive type by iterating through its own enum and taking the first field that exists:

```js
InteractiveMessageType = { NATIVE_FLOW: 'nativeFlowMessage', SHOPS_STOREFRONT: 'shopStorefrontMessage', CAROUSEL: 'carouselMessage' }
getInteractiveMessageTypeForProto = f => members().find(t => fieldNameFor(t) in f)
```

So `nativeFlowMessage`, `shopStorefrontMessage`, and `carouselMessage` **compete** — whichever comes first wins and determines `interactiveType`, regardless of the order you write them in. And all three are indeed real protobuf `oneof` (fields 4, 5, 6, 7), enforced by the app's protobuf runtime during parsing by retaining only the last one on the wire: set two, and Web takes field 6 while the app takes field 7. Never set two.

`header` (1), `body` (2), `footer` (3), `bloksWidget` (8), and `contextInfo` (15) sit **outside** that oneof, so they all accompany whichever payload wins. That's why pairing `nativeFlowMessage` with `bloksWidget` is structurally sound, not a trick.

Two details that only come up during parsing:

- **On Web, `carouselMessage` is still parsed even when `nativeFlowMessage` wins.** The carousel is read into `carouselCardsParsed` separately, so the cards and button arrive together there — but if the carousel fails to parse, the entire message falls back to an unsupported node, button included. Don't build on this: the oneof above means the app never sees both halves.
- **A valid A2UI widget defers the native-flow name check.** The guard reads `if (!S && (msgContext === 'relay' || msgContext === 'history'))`, where `S` is `bloksWidget.type === 'im_a2ui' && isBloksWidgetEnabled()`. With that widget in place and its prop active, `isValidNativeFlowName` and `isValidNativeFlowMessage` are skipped entirely.

Both rest on one strict requirement:

```js
isSupportedInteractiveMessageVersion(type, payload) {
  const n = payload?.messageVersion
  if (n == null || type == null) return false
  switch (type) { case NATIVE_FLOW: return n <= 1; case SHOPS_STOREFRONT: return n <= 1; case CAROUSEL: return n <= 1 }
}
```

`messageVersion` **must** be in the winning slot, and its value must be `1` or less. Remove it and the message is unsupported before anything above runs — there is no version 9. The content key `nativeFlow` sets it for you.

<a id="constraint-tombol-dan-kenapa-itu-menentukan-segalanya"></a>
#### Button constraints, and why they determine everything

`nativeFlowMessage.name` is **not** what the client reads. The flow name is derived from the button, and only if the button passes the checks:

```js
getBizNativeFlowName = ({ interactiveMessage: m }) => {
  const p = m?.nativeFlowMessage?.buttons
  if (p?.length > 0 && !buttonsViolateButtonImprovementsConstraints(p.map(b => ({ nativeFlowButton: b }))))
      return MB.getNativeFlowNameByButtonName(p[0].name)          // ← the only branch the bot reaches
  if (e.buttonsMessage?.buttons?.length === 1) return …          // buttonsMessage lama
  const f = !(p?.length) && (body.text || header.title || footer.text || header.imageMessage) && !m?.shopStorefrontMessage
  if (f) return MIXED                                            // ← only if there is NO button
  // selain itu: undefined
}
```

Pay attention to what `MIXED` actually means here: it is the name for an interactive message **with no buttons at all**. Not a “mix of button types,” and `name: 'mixed'` in the protobuf is never seen.

Here’s the full check:

```js
const QUICK_REPLY_LIMIT = 10, OTHER_LIMIT = 3
const SUPPORTED = [QUICK_REPLY, CTA_CALL, CTA_URL, CTA_CATALOG, CATALOG_MESSAGE, CTA_COPY_CODE, CTA_FLOW,
                   ORDER_STATUS, PAYMENT_REMINDER, BOOKING_CONFIRMATION, PAYMENT_REQUEST,
                   API_SIGNUP, INAPP_SIGNUP, CTA_APP, FORM_MESSAGE]

const isQuickReply = b => b.nativeFlowButton?.name === String(QUICK_REPLY)

buttonsViolateButtonImprovementsConstraints = e => {
  if (e.length === 0) return false
  const firstIsQR = isQuickReply(e[0])
  if (e.length > (firstIsQR ? QUICK_REPLY_LIMIT : OTHER_LIMIT)) return true
  return !e.slice(1).every(b => {
    const mapped = MB.getNativeFlowNameByButtonName(b.nativeFlowButton?.name)
    return (mapped != null ? SUPPORTED.includes(mapped) : true) && firstIsQR === isQuickReply(b)
  })
}
```

Three rules follow from that:

1. **Every button must be the same type as the first button** — quick reply or not. One `cta_url` next to `quick_reply` breaks the entire list.
2. **Maximum 10 buttons if the first is `quick_reply`, maximum 3 otherwise.**
3. The next button whose name maps to a known flow must be one of the fifteen above. Unrecognized names pass this particular rule.

**All of this is specific to WA Web.** `buttonsViolateButtonImprovementsConstraints` and `isValidNativeFlowName` do not appear anywhere in the Android APK — not in any dex. The app makes its own unsupported decision in `FMessageInteractiveFactory/isUnknownInteractiveMessage`, and the surrounding predicates (`interactiveMessageCase_`, plus one `buttons.size() == 1` test used only for payment flows) look at the oneof case and the first button's name. There is no count limit and no type-matching rule. So a message carrying `cta_url`, `cta_call`, `send_location`, `quick_reply`, and `single_select` all at once is indeed rendered on the phone — and that is also the only place where some of those names exist, as described in [Native Flow Support](#dukungan-native-flow).

Violate one of its rules and the flow name reverts to `undefined`, and on the Web that becomes fatal one step later:

```js
isValidNativeFlowName = ({ bizInfo, msgContext, name }) => {
  if (msgContext !== 'relay' && name != null) return true
  const a = bizInfo?.nativeFlowName
  if (a == null || name == null) return false            // ← undefined name, before anything else
  return cast(a) === MIXED || … ? true : cast(a) === name
}
```

The incoming message is a relay, so `name == null` returns false and the message becomes an unsupported node on the Web — buttons, text, footer, everything — while the same message renders normally on mobile. Note the order: the emergency exit `MIXED` is checked **after** the null test, so a node `<biz>` claiming to be `mixed` does not save a button list that violates the rules.

Node `<biz>` is the other half, and this library already sends it. If its first button isn’t one of the few flows that need its own name, what gets sent is:

```xml
<biz actual_actors="2" host_storage="2" privacy_mode_ts="…">
  <interactive type="native_flow" v="1">
    <native_flow v="9" name="mixed"/>
  </interactive>
  <quality_control decision_id="…" source_type="third_party">…</quality_control>
</biz>
```

`v="9" name="mixed"` is a stanza attribute, unrelated to `messageVersion` in protobuf — which still has to be `1`. With the node naming `mixed`, any flow name your button generates is accepted, so the button constraint above is the only one that can still fail.

`nativeFlowButtonsViolateConstraints` is exported so you can check a list against the Web rules yourself, and submitting a list that violates them will log a warning specifying the limit and the types found. It’s a warning rather than an error precisely because the app still renders it: think “this will be empty for anyone reading on desktop,” not “it’s broken.”

Here’s the complete mix via `sendMessage`, with no imports — one button type, still within the limit, so it renders everywhere:

```js
const teks = '✨ RabbitXmd MENU\\n\\nChoose a category below.'

await sock.sendMessage(jid, {
  text: teks,
  footer: 'RabbitXmd - MultiDevice',
  nativeFlow: [
    { text: 'All Menu Items', id: '.allmenu' },
    { text: 'Downloader', id: '.menu downloader' },
    { text: 'Sticker', id: '.menu sticker' }
  ],
  optionText: 'Choose a Category',
  optionTitle: 'Kategori',
  bloksWidget: {
    type: 'im_a2ui',
    uuid: crypto.randomUUID(),
    fallback: teks,
    data: JSON.stringify({ type: 'info_card', title: '✨ MENU RabbitXmd', body: 'Choose a category below.' })
  }
})
```

Mixing types in a single message is fine for readers on mobile, and it looks like this — five types, five names, four of which don’t have flow names in WA Web:

```js
await sock.sendMessage(jid, {
  text: 'All types of buttons in one message',
  footer: 'RabbitXmd - MultiDevice',
  nativeFlow: [
    { text: 'Balas', id: '.menu' },
    { text: 'Website', url: 'https://nixel.dev' },
    { text: 'Telepon', call: '+628000000000' },
    { name: 'send_location', buttonParamsJson: '' },
    { text: 'Choose', sections: [{ title: 'Kategori', rows: [{ title: 'Downloader', id: '.menu downloader' }] }] }
  ]
})
```

It logs the constraint warnings and is displayed on the phone. If the same messages also need to run in a browser tab, split them so that each message carries only one type, with a maximum of three for non-quick-reply types:

```js
await sock.sendMessage(jid, {
  text: 'Tautan penting',
  nativeFlow: [
    { text: 'Website', url: 'https://nixel.dev' },
    { text: 'Channel', url: 'https://whatsapp.com/channel/xxxx' }
  ]
})
```

There is one way around all these checks, and that’s why menus with A2UI cards can be more flexible than those without: `if (!S && (msgContext === 'relay' || …))`. With a valid `im_a2ui` widget and `im_bloks_widget_enable` enabled, flow-name validation is never run. That’s a gate you don’t control, so keep building the button according to the rules and treat the widget as a bonus.

Keep `bloksWidget.fallback` byte-for-byte identical to `text`. The client hides the bubble text only when the widget is active **and** the two are identical (`if (S && k === msg.bloksWidget?.fallback) k = null`), so the same payload draws the widget where its prop is active and plain text where it isn’t, rather than showing the contents twice.

<a id="di-dalam-richresponsemessage-semuanya-bisa-dicampur"></a>
#### Inside `richResponseMessage`, everything can be mixed

This is where rich responses can really be composed. Four lists work together, and none compete with the others:

| Slot | Carries |
|---|---|
| `sections` | the view model — one per `addText`, `addCode`, `addSection`, … |
| `submessages` | the protobuf half that pairs `addTable`, `addCode`, and `addMap` with their section |
| `footer_sections` | `addFooterSection`, drawn below the message body |
| `embedded_screens` | `addEmbeddedScreen`; WhatsApp calls `stripEmbeddedScreens` before drawing, so this reaches the model but draws nothing |

`messageContextInfo` sits alongside it at the top level, rather than competing with it, because the content-key scan only matches `conversation` or names containing `Message` — and `messageContextInfo` contains neither. That’s how `botMetadata` and its verification proof can travel with the rich response.

Bloks widgets can also live **inside** the rich response, rather than alongside it, as a section instead of a `interactiveMessage` field:

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addText('*Statistik hari ini*')
rich.addSection(MB.bloksSection('im_a2ui', { type: 'info_card', title: 'Penjualan', body: 'Rp 1.250.000' }))

await rich.send(jid)
```

It emits `FOABloksPrimitive`, one of the eighteen names that WA Web also draws — so unlike the `interactiveMessage.bloksWidget` path, this one isn't behind `im_bloks_widget_enable`.

<a id="inline-entity-di-dalam-teks"></a>
### Inline Entities in Text

`addText` and `addTable` scan their strings for four markdown-like forms, then turn them into **inline entities** — parts that the client renders as links, quotes, and formulas within a single paragraph, rather than as separate sections.

| You write | Becomes | `__typename` |
| --- | --- | --- |
| `[label](https://x.test)` | tappable link | `GenAIInlineLinkItem` |
| `[label](!https://x.test)` | same, but marked untrusted | `GenAIInlineLinkItem` |
| `[label](>whatsapp://settings)` | deeplink to an app | `GenAIDeeplinkItem` |
| `[](https://x.test)` | numbered source quote | `GenAISearchCitationItem` |
| `[x^2]<https://img.test>` | rendered formula | `GenAILatexItem` |

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addText('buka [Setelan](>whatsapp://settings), atau lihat [situsnya](https://nixel.dev)')

await rich.send(jid)
```

The two prefixes are markers on the **target**, not the label, and are removed before sending:

- `!` — the link is untrusted, so `is_trusted: false` is sent along too.
- `>` — this is a deeplink, so it is sent as `deeplink_url` in `GenAIDeeplinkItem`, not as `url` in `GenAIInlineLinkItem`.

Deeplinks are for schemes that the phone hands off to an app (`whatsapp://`, `fb://`, `instagram://`), not to a web page. The client parses the two into different node types, so sending an app scheme as a regular link is not the same thing.

```js
rich.addText(text, { deeplink: false })
rich.addText(text, { hyperlink: false, citation: false, latex: false })
rich.addText(text, { extract: false })
```

Those three lines are options in a single call, not a sequence to run as-is — choose the flags you want, then send them as above.

`AI_RICH_INLINE_ENTITIES` registers all four. The list is deliberately closed — the Web parser selects a path based on `__typename` and **throws** `inline entity <name>` for anything outside it, so inventing a fifth name breaks the entire message rather than degrading gracefully.

```js
import { MB } from '@whiskeysockets/baileys'

const info = MB.decodeAIRich(m.message)
const inline = info.sections.flatMap(s => s.view_model?.primitive?.inline_entities ?? [])
console.log(inline.map(e => e.metadata.__typename))
```

<a id="menyunting-pesan-yang-sudah-tampil"></a>
### Editing Messages That Have Already Been Displayed

Each call to `add*` accepts `id`, `insertAt`, and `replace`, so a message that has already been sent can keep changing instead of being sent again.

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock)
  .setTitle('RabbitXmd AI')
  .addText('Sedang dikerjakan…', { id: 'intro' })

await rich.send(jid)

rich.addImage('', { status: 'GENERATING', update_text: 'Generating image…', insertAt: 'intro', id: 'pic' })
await rich.sendEdit()

rich.addImage('https://example.com/result.jpg', { replace: 'pic' })
await rich.sendEdit()
```

`sendEdit()` reuses the key from the latest `send()`, so for common cases you don’t need a jid or message ID; pass both explicitly if you want to edit another message. `buildEdit(jid, id)` returns the edited payload without sending it.

Item bookkeeping:

```js
rich.getIds()          // [ 'intro', 'pic' ]
rich.hasId('pic')      // true
rich.peek('pic')       // node di balik id itu
rich.assignId(0, 'first')  // give a name to an item that doesn't have an id yet
rich.delete('pic')
```

`assignId` rejects renaming items that already have an id, and rejects ids currently used by another item.

An incorrect target throws typed errors rather than failing silently — `ItemNotFoundError`, `DuplicateIdError`, `InvalidTargetError`, and `ContentValidationError` are all subclasses of `AIRichError` with the `code` field.

<a id="mencampur-instance"></a>
### Mixing Instances

`sections` and `items` expose what a builder holds, so content built in one instance can be dropped into another.

```js
const cards = new MB.AIRich(sock)
  .addProduct({ title: 'RabbitXmd', brand: 'Baileys', product_url: 'https://example.com' })
  .addPost({ username: 'RabbitXmd', caption: 'Hello', url: 'https://example.com' })
  .items

rich.addSection(MB.newLayout('HScroll', cards), { id: 'mixed' })
await rich.sendEdit()
```

<a id="membaca-pesan-yang-sudah-ada"></a>
### Reading Existing Messages

`loadFrom` rebuilds a builder from a message you received, so incoming interactive messages can be edited and sent again.

```js
const rich = new MB.AIRich(sock).loadFrom(m.message)
const button = new MB.Button(sock).loadFrom(m.message)
const carousel = new MB.Carousel(sock).loadFrom(m.message)
const buttonV2 = new MB.ButtonV2(sock).loadFrom(m.message)
```

<a id="primitif-yang-belum-punya-helper"></a>
### Primitives Without Helpers

MessageBuilder covers 11 of the primitives drawn directly by WA Web. The rest are exposed here as regular section builders that you can drop into `addSection`; the broader Meta AI catalog is available in [The Rest of the Meta AI Catalog](#sisa-katalog-meta-ai).

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock)
  .setTitle('RabbitXmd AI')
  .setFooter('Made with AIRich')

rich.addText('*Laporan render*')
rich.addSection(MB.dividerSection(), { id: 'rule' })
rich.addSection(MB.spacerSection({ spacing: 3 }))
rich.addSection(MB.imageSection('https://example.com/photo.jpg'))
rich.addSection(MB.taskSection({ taskId: 'job-1', title: 'Rendering', subtitle: 'frame 12/60', status: MB.TaskStatus.RUNNING }))
rich.addSection(MB.latexSection('E = mc^2'))
rich.addSection(MB.thinkingSection('Mencari di web…', { icon: MB.ThinkingIcon.WEB_SEARCH }))
rich.addSection(MB.progressSection('Hampir selesai', { inProgress: false }))

await rich.send(jid)
```

| Builder | Primitive | Field |
|---|---|---|
| `dividerSection` | `GenAIDividerPrimitive` | `divider_type` — `HORIZONTAL_LINE` or `DOT` |
| `spacerSection` | `GenAISpacerPrimitive` | `spacing`; a value of 1 or less draws a line, while a higher value draws that many blank rows |
| `imageSection` | `GenAIImagePrimitive` | `full_image` / `preview_image`, each with `url` and `url_fallback` |
| `taskSection` | `GenAITaskPrimitive` | `task_id`, `title`, `subtitle`, `status`; an empty `task_id` makes the client drop its item |
| `latexSection` | `GenAILatexUXPrimitive` | `latex_expression`, plus an optional rendered `latex_image` |
| `thinkingSection` | `GenAIBotThinkingStatusPrimitive` | `title`, `icon`, `is_in_progress`, `meta_search_apps`, `thought_duration_sec` |
| `progressSection` | `GenAIBotProgressStatusPrimitive` | same fields as thinking |

`FOABloksPrimitive` does have a factory: `bloksSection`. Its primitive carries a single Bloks screen (`type: "im_a2ui"`), with its components included in `data` rather than fetched by the client from Meta’s server — and this is the wrapper used by the official WhatsApp Web A2UI fixture. See [A2UI Cards](#kartu-a2ui). `GenAIMetaSubsQuotaUpsellPrimitive` was previously excluded for the same reason, and that was also a mistake: its parser reads the entire card from the wire — it now has a factory; see [Subscription Offer Cards](#kartu-penawaran-langganan).

<a id="sisa-katalog-meta-ai"></a>
### Remaining Meta AI Catalog

`AIRichMessage` are the forms sent by Meta AI itself, and the bot reaches them by forwarding one of them. So its catalog is much larger than what the section above covers: the WhatsApp client parses around forty primitives, and `AI_RICH_PRIMITIVES` now lists them all, with `AI_RICH_ITEMS` for item nodes carried by a layout.

The `AIRichMessage` surface assembles the full form, including the submessage and forwarding context stamped by the official generator (`WAWebGenerateRichResponseMessageProto`). `sendAIRichMessage(sock, jid, options)` accepts `sections`, `text`, `nativeFlow`, and `submessages` all at once:

```js
await MB.sendAIRichMessage(sock, jid, {
    text: 'Hello from AIRichMessage',
    submessages: [
        MB.AIRichMessage.inlineImage({ previewUrl: 'https://x/y.jpg', highResUrl: 'https://x/y-hi.jpg' }),
        MB.AIRichMessage.table({ rows: [{ items: ['Harga', '10'], isHeading: true }] })
    ]
})
```

`AIRichMessage.text`, `inlineImage`, `table`, and `contentItems` are submessage factories; `AIRichMessage.textSection` and `nativeFlowSection` are section factories. `AIRichMessage.submessage(kind, payload)` selects a factory based on `AI_RICH_SUBMESSAGE_KINDS` (`text`, `inline_image`, `table`, `content_items`). The forwarding context installed by `AIRich.build` now includes `botMessageSharingInfo` with `botEntryPointOrigin: 31` (`META_AI_FORWARD`) and the same `forwardScore` as `forwardingScore`, exactly the two fields populated by the official generator; both can be disabled via the `messageSharing`/`forwarded` options. `AIRich.addSubmessage` can also now be used without a section, so a submessage can be attached to a message whose section is empty.

The A2UI rendering warning still applies to any form: see [A2UI Cards](#kartu-a2ui).

One note to know before you build a card around one of them: the full catalog is rendered in the WhatsApp app, where your recipients are. WA Web desktop is lagging behind—it has a renderer for eighteen names and maps the rest to empty nodes. The message still arrives either way, and the other sections are still rendered, so desktop viewers see a gap, not a failure.

<a id="bagian-yang-juga-tergambar-di-desktop"></a>
#### Also rendered on desktop

`AI_RICH_PRIMITIVES_WEB_RENDERED` is the catalog section that WA Web can also render, so cards built only from these names look the same in the app and in the browser. The list is read from `getPlainTextFromUnifiedResponse`, the only module that enumerates every primitive known to the Web client, plus `WAWebUnifiedResponseUtils` for two more names. As of revision `1047301412`, there are eighteen primitives, plus three layouts:

| | |
|---|---|
| Text & structure | `GenAIMarkdownTextUXPrimitive`, `GenAICodeUXPrimitive`, `GenAILatexUXPrimitive`, `GenATableUXPrimitive`, `GenAIMetadataTextPrimitive`, `GenAIDividerPrimitive`, `GenAISpacerPrimitive` |
| Media & cards | `GenAIImagePrimitive`, `GenAIImaginePrimitive`, `GenAIReelPrimitive`, `GenAIPostPrimitive`, `GenAIProductItemCardPrimitive`, `GenAISearchResultPrimitive` |
| Status | `GenAIBotThinkingStatusPrimitive`, `GenAIBotProgressStatusPrimitive` |
| Offers | `GenAIMetaSubsQuotaUpsellPrimitive` |
| FOA | `FOATextPrimitive`, `FOABloksPrimitive` |
| Layout | `GenAISingleLayoutViewModel`, `GenAIGridLayoutViewModel`, `GenAIHScrollLayoutViewModel` |

The remaining `AI_RICH_PRIMITIVES` — maps, video, reminders, sports, search-planner steps, 3P and Clippy surfaces, HTML sections, and layouts `VStack`, `ActionRow`, `AddonAction`, `FlexibleCountGrid`, `RichListItem`, `MultipleResponse`, and `IGSuggestedBloomCard` — render in the app and come out as empty nodes in the browser.

Two odd names sit in the middle: `GenAIFollowUpSuggestionPillPrimitive` and `GenAITaskPrimitive` have parsers only in `cometComposedTextV2GenAiUxPrimitiveParser`, Facebook’s Comet renderer, and in no `WAWeb*` module — but both names are in the Android dex, so that app is where to test them. On desktop, both land on empty nodes, like everything outside the table above.

Inline entities are the only place where an unknown name becomes fatal instead of being ignored — see the warning in [Inline Entity di Dalam Teks](#inline-entity-di-dalam-teks). `AI_RICH_INLINE_ENTITIES` remains closed at four for that reason.

<a id="sub-node-di-dalam-primitifnya"></a>
#### Sub-nodes inside primitives

Because Meta AI messages are **forwarded** from Meta AI rather than built locally, what matters isn’t whether a name is rendered, but whether the decoder recognizes it. The three lists above only mention section-level nodes. Under each primitive are still nested objects with their own `__typename` — table rows, team icons, a place’s opening hours — and `AI_RICH_NODES` lists **50** of them.

Each entry in that list has the same evidence: the APK contains a Kotlin model class `<nama>Impl.kt` for it. That’s also the distinction that sets them apart from AB flags and telemetry names, which look similar but never have model classes.

Four of them have just appeared in the Android beta `2.26.37.1`: `GenAIStepDeepResearchEntry`, `GenAIStepSkillEntry`, `GenAIStepSubagentEntry`, and `GenAIStepWebLinkSource` — all siblings of `GenAIStepThoughtEntry` on the reasoning surface, and none of them appear in the WA Web bundle, so they are purely names to decode.

| Group | Node |
|---|---|
| Table | `GenAITableRow`, `GenAITableCell` |
| Place | `GenAIPlaceDetailsItemCategory`, `GenAIPlaceDetailsItemRating`, `GenAIPlaceDetailsItemOpeningHours`, `GenAIPlaceDetailsItemOpeningHoursTime`, `GenAIWidgetPlacesItemAddress`, `GenAIMarketplaceMetadata` |
| Map | `GenAIMapItemLocation`, `GenAIMapItemStaticMap` |
| Sports | `GenAISportsTeamIcon`, `GenAISportsTeamRecord`, `GenAISoccerGameContent`, `GenAIAmericanFootballGameContent` |
| Video & imagine | `GenAIVideoMusicClipInfo`, `GenAIVideoTextToSpeechInfo`, `GenAIImagineThumbnail`, `GenAIImaginePrimitiveStatusUpdate` |
| Reasoning | `GenAIStepThoughtEntry`, `GenAIStepDeepResearchEntry`, `GenAIStepSkillEntry`, `GenAIStepSubagentEntry`, `GenAIStepWebLinkSource`, `GenAIChainOfThoughtStepMarkdownText`, `GenAISearchPlannerStep`, `GenAISearchPlannerInstruction` |
| 3P Widget | `GenAI3PExtWidgetCTA`, `GenAI3PExtWidgetToast`, `GenAI3PExtWidgetStandardHeader`, `GenAI3PExtArtifactConfirmation`, `GenAI3PExtConnectorPendingToolCall`, `GenAI3PExtCalendarAttendee`, `GenAI3PExtCalendarDateSection`, `GenAI3PExtCalendarEventList`, `GenAI3PAccountLinkingBottomsheet` |
| Miscellaneous | `GenAICodeBlockData`, `GenAITextInlineEntity`, `GenAIThreadSurfingPrompt`, `GenAIMetaSubsQuotaUpsellButton`, `GenAIP13nUiSignals`, `GenAIP13nUiSignalValue` |
| Structural | `GenAIUnifiedResponse`, `GenAINestedUnifiedResponse`, `FOAEmbeddedSingleScreen`, `GenAIEmbeddedContextualScreenContent` |

The four structural ones have the biggest impact on the code, not just the list:

- **`GenAINestedUnifiedResponse`** — one unified response inside another unified response. This means a single primitive can contain the entire response tree again beneath it.
- **`FOAEmbeddedSingleScreen`** and **`GenAIEmbeddedContextualScreenContent`** — siblings of `FOAEmbeddedScreenContentTabbed` for embedded screens without tabs. They carry `sections` directly, not `tabs`.
- **`GenAIUnifiedResponse`** — the root name in the app; on Web, the root is `XMSGGenAIUnifiedResponse`.

Both open up two real decoding holes, and both have been closed:

```js
const info = MB.decodeAIRich(msg)

info.typenames      // only section-level primitives, as before
info.allTypenames   // every __typename throughout the tree, no matter how deep
```

`info.typenames` stops at the outermost primitive, so a `GenAINestedUnifiedResponse` is read as a single name and its contents remain invisible. `allTypenames` traverses the entire tree — cycle-safe and capped at 20,000 nodes — so the sports widget inside a nested response, along with its team icons, is registered too. `MB.collectTypenames(objekApaPun)` performs the same traversal for a snippet you hold yourself.

The second gap is in `readEmbeddedSections`: it only picks up `content` entries that have `view_model` or `tabs`, so an embedded screen without tabs — which places `sections` directly in that entry — produces zero sections, and the HTML inside it is invisible to `readRichMessage(m).html`. Now entries containing `sections` are picked up too, selected by the shape of their fields rather than by `__typename`, exactly how Pando interprets its tree.

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addSection(MB.mapSection({
  staticMapUrl: 'https://example.com/static-map.png',
  motivation: 'Places to eat near you',
  items: [
    MB.placeItem({
      id: '1',
      name: 'Warung Sederhana',
      rating: 4.6,
      latitude: -6.2,
      longitude: 106.8,
      categoryName: 'Rumah makan'
    })
  ]
}))

rich.addSection(MB.sportsSection({
  gameId: 'g-1',
  league: MB.SportsLeague.EURO,
  status: MB.SportsGameStatus.LIVE,
  statusDetail: "72'",
  homeTeam: { name: 'Indonesia', abbreviation: 'IDN' },
  awayTeam: { name: 'Vietnam', abbreviation: 'VIE' },
  homeScore: 2,
  awayScore: 1
}))

rich.addSection(MB.actionListSection([
  MB.actionListRow({ title: 'Open map', url: 'https://maps.example.com' }),
  MB.actionListRow({ title: 'Telepon', action: 'tel:+62800000000' })
]))

rich.addSection(MB.searchPlannerSection({
  queryUrl: 'https://search.example.com?q=cuaca',
  steps: [
    MB.plannerStep({ title: 'Search for weather', status: MB.SearchPlannerStepStatus.COMPLETED }),
    MB.plannerStep({ title: 'Summarize the results', status: MB.SearchPlannerStepStatus.IN_PROGRESS })
  ]
}))

await rich.send(jid)
```

| Builder | Primitive | Main fields |
|---|---|---|
| `mapSection` | `GenAIMapPrimitive` | `map_query_status`, `static_map`, `items`, `motivation` — for a truly rendered map using `rich.addMap`, see below |
| `placeItem` | `GenAIPlaceDetailsItem` | `id`, `name`, `image_url`, `item_type`, `category`, `price_level`, `opening_status`, `opening_hours`, `rating`, `address`, `marketplace_metadata` |
| `sportsSection` | `GenAISportsWidgetPrimitive` | `game_id`, `league`, `status`, `status_detail`, `start_time_utc_seconds`, `venue`, `group`, `content` |
| `videoSection` | `GenAIVideoPrimitive` | `post_id`, `reels_url`, `reels_title`, `creator`, `video_delivery_response` |
| `reminderSection` | `GenAIReminderPrimitive` | `reminder_id`, `title`, `trigger_type`, `trigger_time`, `thumbnail_url` |
| `commentSection` | `GenAICommentPrimitive` | `comment_text`, `comment_url`, `actor_name`, `likes_count`, `replies_count` |
| `compactEntitySection` | `GenAICompactEntityPrimitive` | `title`, `subtitle`, `entity_id`, `entity_type`, `action_type` |
| `actionListSection` / `actionListRow` | `GenAIActionListPrimitive` | `rows` of `title`, `subtitle`, `action`, `icon`, `url`, `row_type` |
| `searchPlannerSection` / `plannerStep` | `GenAISearchPlannerStepsPrimitive` | `sources`, `steps`, `query_url`, `search_engine`, `facepile_favicons` |
| `searchResultV2Section` | `GenAISearchResultV2Primitive` | the same fields plus `response_id` |
| `plannerSnippetSection` | `GenAISearchPlannerStepSnippetPrimitive` | `header`, `current_step`, `total_steps`, `status` |
| `chainOfThoughtSection` | `GenAIChainOfThoughtStepPrimitive` | `header`, `subtitle`, `markdown_text` |
| `searchAdSection` | `GenAISearchAdPrimitive` | `story_id`, `actor_name`, `actor_image_url`, `image_url`, `message` |
| `chainingSuggestionSection` | `GenAIChainingSuggestionPrimitive` | `prompt_text`, `image_uri`, `external_conversation_id`, `topic`, `card_id` |
| `locationPermissionSection` | `GenAILocationPermissionPrimitive` | `placeholder` |
| `timestampPlaceholderSection` | `GenAITimestampPlaceholderPrimitive` | `placeholder` |
| `transparencySection` / `transparencySignal` | `GenAIP13NTransparencyPrimitive` | `annotation`, `signals`, `response_id` |
| `professionalConsentSection` | `GenAIProfessionalConsentPrimitive` | `title`, `body`, `status`, `provider_label`, `cta_label` |
| `accountLinkingSection` / `accountLinkingApp` | `GenAI3PAccountLinkingUpsellPrimitive` | `integration_type`, `integration_status`, `cta_url`, `bottomsheet.apps` |
| `calendarWidgetSection` / `calendarEvent` | `GenAI3PExtWidgetPrimitive` | `header`, `sections` containing dates and events, `ctas`, `toast` |

<a id="peta-digambar-dari-submessage-bukan-dari-section"></a>
#### The map is drawn from a submessage, not a section

`GenAIMapPrimitive` is the map node belonging to Meta AI’s own application. The WhatsApp client reads the map from an entirely different place: from the protobuf submessage list, as `AIRichResponseSubMessageType.AI_RICH_RESPONSE_MAP` (7) carrying `mapMetadata`. The standalone section does arrive, but it draws nothing.

`rich.addMap` emits both halves at once, just as `addTable` and `addCode` pair the section with its metadata:

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addText('*Places to eat near you*')
rich.addMap([
  { latitude: -6.2088, longitude: 106.8456, title: 'Warung Sederhana', body: 'Rumah makan padang' },
  { latitude: -6.2150, longitude: 106.8500, title: 'Bakso Pak Kumis', body: 'Bakso urat' }
])

await rich.send(jid)
```

Every place needs `latitude` and `longitude` as numbers—anything else throws an error instead of dropping a pin at 0,0. Pins are numbered from one, following the order you provide. The map is centered on the average of the places unless you provide `center`, and `latitudeDelta` / `longitudeDelta` (both default to `0.05`) determine how much of the area fits in the frame. `showInfoList` draws the list below the map, `motivation` rows above it, and `staticMapUrl` fills half the section for clients that read that instead.

This item is a node carried by a layout, not a standalone section, so build it first and then pass it to a layout:

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addSection(MB.mediaGridSection([
  MB.mediaItem({ previewUrl: 'https://example.com/1-small.jpg', fullUrl: 'https://example.com/1.jpg' }),
  MB.mediaItem({ previewUrl: 'https://example.com/2-small.jpg', fullUrl: 'https://example.com/2.jpg' })
]))

rich.addSection(MB.contextualSourcesSection([
  { url: 'https://example.com/a', title: 'Sumber A', favicon: 'https://example.com/a.ico' }
]))

await rich.send(jid)
```

`mediaItem`, `placeEntityItem`, `socialEntityItem`, `productEntityItem`, `threadSurfingItem`, `sideBySideSurveyItem`, `accountLinkingApp`, `calendarEvent`, `actionListRow`, `plannerStep`, and `transparencySignal` all return item nodes.

Two layouts join the eight already supported: `multipleResponseSection(responses, { layoutType })` builds `GenAIMultipleResponseLayoutViewModel`, and `bloomCardSection(primitives)` builds `GenAIIGSuggestedBloomCardLayoutViewModel`. `addonActionSection(primitives, { actionType, alignment })` fills the `addon_action_alignment` field, which the previous addon helper did not set.

<a id="kenapa-addonactionsection-bisa-bikin-whatsapp-force-close"></a>
##### Why `addonActionSection` can force-close WhatsApp

`AddonAction` is not a regular content section; it is an interactive button overlay (copy to clipboard, send to chat, follow-up prompt). In the `2.26.37.1` dex, each item is built as `MetaAiOverlayButton` (`LX/3z3->A0x`), which requires a label or icon; otherwise, the client logs `Button has no label or icon.` and drops the button. If the overlay ends up empty, the group rendering path accesses a missing button, and the receiving app force-closes.

`GenAIFooterActionPrimitive` (with `cta_text` + `footer_action_type`) is not an overlay button, so putting it in `addonActionSection` produces a button with no label/icon and triggers a crash. That is why `addonActionSection` now rejects it up front: `actionType` must be one of `AddonActionType`, `primitives` cannot be empty, and `GenAIFooterActionPrimitive` throws `TypeError` instead of being sent raw.

`AddonAction` that actually appears is Meta AI’s own, attached to the artifact/embedded screen it created. To send it, forward the original AIRich message from the Meta AI bot via `forwardRichResponse`, rather than synthesizing it from general-purpose primitives.

<a id="kartu-penawaran-langganan"></a>
#### Subscription offer card

`quotaUpsellSection` builds `GenAIMetaSubsQuotaUpsellPrimitive`, the card Meta uses to offer a subscription when the quota runs out. Its field names are read directly from `cometComposedTextV2GenAiMetaSubsQuotaUpsellPrimitiveParser` in the WA Web bundle, so this is one of the few primitives whose shape is verified all the way down to its buttons:

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addSection(MB.quotaUpsellSection({
  title: 'Meta AI Plus',
  body: 'You\'ve run out of image quota',
  bodyLine1: 'Upgrade for 100 more images',
  bodyLine2: 'Batal kapan saja',
  meterUsageType: 'META_AI_IMAGINE',
  benefitType: 'IMAGINE_QUOTA',
  buttons: [MB.quotaUpsellButton({ label: 'Upgrade', action: 'UPGRADE', deeplink: 'https://meta.ai/plus' })]
}))

await rich.send(jid)
```

| Field wire | Contents |
|---|---|
| `title` | the card title |
| `body`, `body_line1`, `body_line2` | the three body lines, drawn separately |
| `meter_usage_type` | which meter runs out |
| `benefit_type` | the benefit offered |
| `buttons` | a list of `GenAIMetaSubsQuotaUpsellButton`, each `label`, `action`, `deeplink` |

One parser gotcha: the entire card is discarded if `meter_usage_type` has the value `META_AI_THINK_HARD` or `benefit_type` contains `THINK_HARD`. Its value is exported as `QuotaUpsellMeterUsageType` so it won't be used accidentally. An empty button list isn't sent as `[]` — the field is omitted entirely.

<a id="genaiuxprimitive-itu-interface-bukan-primitif"></a>
#### `GenAIUXPrimitive` is an interface, not a primitive

Its name appears in the dex as `GenAIUXPrimitiveImpl.kt` and was once also registered in `AI_RICH_PRIMITIVES`. That was wrong. `cometComposedTextV2GenAiUxPrimitiveParser` is a dispatcher that enumerates every concrete name, and the layout parser — `CometComposedTextV2GenAISingleLayoutViewModelParser.react` for `view_model.primitive`, `...GenAIGridLayoutViewModelParser.react` for `view_model.primitives` — calls that dispatcher for each of its contents. So `GenAIUXPrimitive` is the interface type of that field, not a `__typename` that ever appeared on the wire; sending it lands in `buildUnsupportedURTypeNode`. It now sits on its own in `AI_RICH_PRIMITIVE_INTERFACE`, and `AI_RICH_PRIMITIVES` is down to **48** names that can actually be sent.

<a id="dua-primitif-yang-bentuknya-belum-terbaca"></a>
#### Two primitives whose shapes are still unreadable

`AI_RICH_PRIMITIVES_WITHOUT_SCHEMA` mentions `GenAIClippyWidgetPrimitive` and `GenAIClippyFollowUpPrimitive`. Both are real — the dex contains `<nama>Impl.kt` for each — but their field names cannot be read from anywhere. The WA Web bundle does not include their typenames at all, and no code references their name strings in the dex, so there are no field reads to follow. The only verified piece is the `ClippyArtifactType` enum (`MINI_APP`, `STATIC_HTML`).

So there are no factories for either: guessing field names would mean making them up, and guessed fields would not be rendered. If you want to try their shapes yourself, `customSection` sends them as-is.

For anything not modeled here, `customSection` sends the node directly — the client chooses the path based on `__typename` and nothing else:

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('RabbitXmd AI')

rich.addSection(MB.customSection('GenAISourcedItem', { sourced_item_type: 'THREADS_POST' }))
rich.addSection(MB.customSection('GenAITopicLinkItem', { title: 'Bali' }, { layout: 'HScroll' }))

await rich.send(jid)
```

`addSection` and `addFooterSection` patch one easily overlooked issue when a section is built outside this factory: sections without `__typename` are stamped with `GenAIUnifiedResponseSection` before being passed in. The object you provide is not modified, objects that already have a typename are passed through unchanged, and `AIRich.normalizeSection(section)` is available if you need to patch it yourself. Without that stamp, the client has nothing to dispatch the section with, and all the cards come out empty.

The enums for everything above come with the builder: `MapQueryStatus`, `PlaceDetailsItemType`, `PlaceOpeningStatus`, `PlacePriceLevel`, `SportsLeague`, `SportsGameStatus`, `SportsSeasonType`, `CompactEntityType`, `CompactEntityActionType`, `ActionListRowType`, `SocialEntityItemType`, `SourceApp`, `PostType`, `PostOrientation`, `ProductSourceType`, `SearchPlannerStepStatus`, `OrchestratorSearchEngine`, `ProfessionalConsentStatus`, `AccountLinkingIntegration`, `AccountLinkingStatus`, `CalendarEventOperation`, `CalendarEventState`, `WidgetCtaKind`, `WidgetCtaState`, `MultipleResponseLayoutType`, `ThreadSurfingEntityType`, `ThreadSurfingActionType`, `MediaShape`, `MediaHorizontalAlignment`, `MediaVerticalAlignment`, `AddonActionAlignment`, `ImageAssetQueryStatus`, `CodeBlockType`, `FollowUpSuggestionCategory`, `InformTreatmentRenderingType`, `UnifiedResponseSectionType`, and `UnifiedResponseMessageGroupKind`.

`FooterActionType` also gets `COPY_LINK`, `REMIX_MEDIA`, and `USE_TEMPLATE`.

<a id="meneruskan-jawaban-meta-ai-yang-asli"></a>
### Forwarding the Original Meta AI Reply

Everything above builds a rich response from scratch. There is a second path that behaves differently in one important way: relaying a message that actually came from Meta AI.

The client verifies forwarded bot messages against its own bundled root certificate — `CN=Meta WA Feature Root CA`, ECDSA P-256, exported here as `BOT_SIGNATURE_ROOT_CERTIFICATE`. The signed payload is short:

```
version ("1")  ||  fbid bot  ||  byte unified response
```

There is nothing about the sender, message ID, timestamp, or recipient in it. That’s what makes forwarding possible at all: relay all three unchanged and the proof remains verifiable, whoever forwards it.

`forwardRichResponse` relays without touching any of them:

```js
import { MB } from '@whiskeysockets/baileys'

sock.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    if (MB.verifyRichResponseSignature(msg).status !== 'passed') continue
    await MB.forwardRichResponse(sock, '120363xxxx@g.us', msg, { quoted: msg })
  }
})
```

`contextInfo` is not part of the signed payload, so quotes, mentions, and everything else can change freely. The unified response bytes, its proof, and `forwardedAiBotMessageInfo.botJid` cannot.

`MB.loadFrom` also preserves its proof. If an incoming message carries an original certificate chain, its original bytes and verification metadata come straight back out when you call `build` — without being reserialized, without placeholders. `rich.isSignaturePreserved` tells you whether it is still valid.

The consequence matters more than the feature: **any edit invalidates it.** `addText`, `addSection`, `delete`, `addFooterSection`, `clearFooterSections`, `addEmbeddedScreen`, `setResponseId`, `refreshResponseId`, and `setResponseMeta` all discard the preserved signature, because the bytes it covers no longer match. After any of them, the build falls back to freshly serialized JSON and placeholder metadata, just as before.

So: relay or load and resend if you want the proof to survive, and treat `AIRich` as a writing tool once you change anything.

| Function | Answers |
|---|---|
| `readSignedRichResponse(msg)` | the parts covered by a proof: `unifiedResponseBytes`, `botJid`, `proof`, plus `hasProof` to simply check whether the field is populated |
| `verifyRichResponseSignature(msg)` | `{ status: 'passed' \| 'failed', reason }` — the real check: chain to the Meta root, validity window, then Ed25519 over the payload above |
| `verifyBotSignature({ botJid, unifiedResponseBytes, proof })` | the same check with the parts supplied manually |
| `constructSignaturePayload({ botFbid, messageDigest })` | the exact bytes that were signed |

Certificate revocation is not checked. The client fetches the CRL from Meta and treats an unavailable or expired list as revoked; `verifyRichResponseSignature` skips that step, so `passed` here means the chain and signature are good, not that the certificate is still valid.

<a id="yang-tidak-bisa-dimiliki-respons-bikinan-sendiri"></a>
#### What a fabricated response cannot have

A signature over content that Meta did not produce is not something a bot can print — it requires a leaf certificate issued under that root. `AIRich` fills `verificationMetadata` with placeholder bytes so the field exists and has the right shape; `verifyRichResponseSignature` on your own output returns `failed`, and that is correct.

Whether this hurts you depends on server-side switches you cannot see:

- `ai_rich_response_forwarding_verification_enabled_v1` — `none`, `log_only`, or `enforce_blocking`. Only the last one acts on failure.
- `ai_rich_response_unknown_sender_verification_masking_enabled` — determines when a failed message is replaced with a fallback bubble instead of being rendered.
- `ai_rich_response_unknown_sender_preview_enabled` — collapses rich responses carrying media if the sender is not in the recipient’s contacts, whether verification ran or not.
- `ai_unified_response_receiver_web_timestamp_v2` — WA Web only renders a unified response if the message timestamp is equal to or later than this value.

All four are configured per account by the server. A response can be structurally perfect and still be sent as a fallback bubble, with no way for the sender to know.

<a id="membaca-balik-pesan-rich"></a>
### Reading Rich Messages Back

Rich AI, A2UI, or Bloks messages arrive empty in the places bots normally look — `conversation` is empty, `extendedTextMessage` is absent, and `getContentType` only reports the wrapper (`botForwardedMessage` or `interactiveMessage`). `readRichMessage` normalizes them all into a single form.

```js
import { MB } from '@whiskeysockets/baileys'

sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
        const rich = MB.readRichMessage(msg)
        if (!rich) continue
        console.log(rich.kind, rich.text)
    }
})
```

It returns `null` for anything that isn't one of them, so it's safe to call on every message.

| Field | Contents |
|---|---|
| `kind` | `a2ui`, `airich`, `bloks`, or `interactive` |
| `text` | all readable strings, joined with newlines — AI Rich text primitives, `Text` A2UI components, and interactive body and footer |
| `title` | `botMetadata.messageDisclaimerText`, falling back to its interactive header title |
| `buttons` | native flow button with parsed `buttonParamsJson`; `params` is `null` if parsing fails |
| `html` | payload from any HTML primitive, including those inside an embedded screen |
| `a2ui` | `surfaceId`, `catalogId`, `version`, and its component list |
| `bloks` | `type`, `uuid`, `fallback`, and parsed `params` |
| `typenames`, `sections`, `footerSections`, `embeddedScreens`, `embeddedTabs`, `submessages`, `responseId` | its AI Rich section, empty if absent |

It opens view-once and other wrappers first, so a card inside `viewOnceMessageV2` is read the same as one without a wrapper.

<a id="kartu-a2ui"></a>
### A2UI cards

`interactiveMessage.bloksWidget` with `type: "im_a2ui"` is intended to produce a client-rendered card from the declarative spec carried by the message. Its components are included in `data` — but see the warning below: rendering is still handled by Meta's app `im_a2ui` Bloks, and there is a client-side gate that ordinary senders cannot bypass.

> [!WARNING]
> **No A2UI wrapper can be rendered by an ordinary account, and that is not a payload bug.** I tested both directly: `sendA2UI` (bloksWidget) only displays `fallback` as text, and `sendA2UIBloks` (richResponse/`FOABloksPrimitive`) produces an empty bubble. The cause is in the client, not the message:
>
> **(1) `bloksWidget` (`sendA2UI`).** `WAWebInteractiveBloksWidget.react` calculates `O = isA2UIWidget && !isBizBot1pMessage && im_a2ui_require_bot_attribution`. The `im_a2ui_require_bot_attribution` prop defaults to **true** (`WAWebABPropsConfigs`: `[34324,"bool",!1,!0]`; `getABPropConfigValue` returns the 3rd element as the default). When `O` is true, the client draws only `fallback`. `isBizBot1pMessage` comes from `WAWebMsgGetters.getBizBotType(...) === BIZ_1P`, which is protobuf field `WebMessageInfo.is1PBizBotMessage` number 56 — and that is **part of the `oneof` `WebMessageInfo`**, set by the **server** when the message arrives; the send path also explicitly drops it (`parseWebMessageInfo({ ...t, is1PBizBotMessage: void 0 })`). The sender cannot set it through `proto.Message`. That is why only `[3/10] null: Menu RabbitXmd` + fallback appears.
>
> **(2) `richResponse`/`FOABloksPrimitive` (`sendA2UIBloks`).** `cometComposedTextV2FoABloksPrimitiveParser` only calls `buildFoABloksNode` if `renderers.foABloksNodeRenderer` is present; otherwise, it builds an **"unsupported"** node that draws nothing (blank). That renderer is populated only if `isFoABloksNodeRendererEnabled()` — namely `gkx("6940")`, a gatekeeper **not present in the gkx table** snapshot — is true. Further in, `foABloksNodeRenderer` renders with `<WAWebBloksEntryPointLoadable componentType="im_a2ui" componentData=… />`, and `WAWebBloksEntryPointLoadable` loads the Bloks module **from Meta** (`JSResourceForInteraction("WAWebBloksEntryPoint.react").load()`). So the card is drawn by a server-provided Bloks app named `im_a2ui`, not by the message.
>
> The consequence: patching the payload will not get past these gates. The only combination that works is A2UI sent as a **reply to an original 1P bot message** (a real Meta AI message carrying `is1PBizBotMessage` from the server). To check the gates on your account, run this in the WhatsApp Web console:
>
> ```js
> (() => {
>   const t = __debug.modulesMap
>   const ab = t['WAWebABPropsConfigs']?.exports?.ABPropConfigs
>   const gkx = t['gkx']?.exports
>   let gk
>   try { gk = gkx('6940') } catch (e) { gk = 'undefined: ' + e.message }
>   return { im_a2ui_require_bot_attribution: ab?.im_a2ui_require_bot_attribution, im_bloks_widget_enable: ab?.im_bloks_widget_enable, gk_6940: gk }
> })()
> ```
>
> What **can** be verified on the payload side: my `richResponse` structure is identical to the official debug fixture (`WAWebInteractiveBloksWidgetDebug.injectRichResponseTestMessage` — `response_id` + `sections` → `GenAISingleLayoutViewModel` → `FOABloksPrimitive` with `type: "im_a2ui"`), and passes `proto.Message.encode/decode`. To test the `createSurface` form without a network connection, use the official fixture in the WA Web console:
>
> ```js
> __debug.modulesMap['WAWebInteractiveBloksWidgetDebug'].exports.injectRichResponseTestMessage()
> __debug.modulesMap['WAWebInteractiveBloksWidgetDebug'].exports.injectInteractiveMessageWithBloksWidget()
> ```
>
> The `bloksWidget` fixture sets `bizBotType: BizBotType.BIZ_1P` and the rich fixture sets nothing — exactly reflecting the two conditions above.

There are two forms of A2UI, and the distinction matters:

| Form | Contents of `data` | Evidence |
|---|---|---|
| Ready-to-use elements | `{"type":"info_card", …}` and `{"type":"list_card", …}` | Android recognizes exactly these two types, and WA Web's AB prop `a2ui_supported_elements` contains `"info_card, list_card"` |
| `createSurface` tree | `{version, createSurface:{surfaceId, root, components}}` | WA Web debug fixture; its renderer is lazy-loaded, so it has not been verified from the bundle |

`sendA2UI` and `sendA2UIBloks` send the same elements through two different wrappers. Both still depend on the client-side gate above, so treat them as tools for verifying the payload format—not as a guaranteed way to make it render:

```js
await MB.sendA2UIBloks(sock, jid, [
    MB.a2uiColumn('root', ['img', 't1']),
    MB.a2uiImage('img', 'https://files.catbox.moe/5hojci.jpg'),
    MB.a2uiText('t1', 'RabbitXmd Bot')
], { uuid: crypto.randomUUID() })
```

`sendA2UIBloks` accepts the same `components` tree as `sendA2UI` (including raw `data` objects), then wraps it with `AIRich` + `bloksSection`. `buildA2UISection(components, options)` returns the section if you want to assemble it yourself with the `AIRich` builder.

Because Android only draws `info_card` and `list_card`, use those elements for the most reliable path. The `a2uiInfoCard`/`a2uiListCard` helper assembles the object, and both `sendA2UI`/`sendA2UIBloks` accept any element through `data`:

```js
await MB.sendA2UI(sock, jid, [], {
    type: 'im_a2ui',
    uuid: crypto.randomUUID(),
    fallback: '✨ RabbitXmd MENU\\nChoose a category below.',
    data: MB.a2uiInfoCard({ title: '✨ MENU RabbitXmd', body: 'Choose a category below.' })
})
```

```js
import { MB } from '@whiskeysockets/baileys'

await MB.sendA2UI(sock, jid, [
    MB.a2uiColumn('root', ['card_image', 'card_title', 'card_body']),
    MB.a2uiImage('card_image', 'https://example.com/header.jpg'),
    MB.a2uiText('card_title', 'Welcome!', { variant: 'h1' }),
    MB.a2uiText('card_body', 'Glad you\'re here.')
], {
    buttons: [{
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ display_text: 'Join Group', url: 'https://chat.whatsapp.com/…' })
    }]
})
```

The layout is a flat list addressed by id: exactly one component must be named `root`, and containers refer to their children by id rather than nesting them. `sendA2UI` throws an error if the `root` component is missing. The `root` name can be changed via the `root` option, and `createSurface.root` adjusts accordingly.

| Builder | Emits |
|---|---|
| `a2uiColumn(id, children)` | `Column` — children are stacked vertically |
| `a2uiRow(id, children)` | `Row` |
| `a2uiText(id, text, { variant })` | `Text` — `variant` can be `h1`, `body`, and so on |
| `a2uiImage(id, url, { variant, fit })` | `Image` — defaults to `header` and `cover` |
| `a2uiCard(id, child)` | `Card` — accepts a single child id, not an array |
| `a2uiInfoCard({ title, body, … })` | `{"type":"info_card", …}` — a ready-to-use element, not a `createSurface` tree |
| `a2uiListCard({ title, body, … })` | `{"type":"list_card", …}` |

The `a2uiSurface` wrapper builds its own payload if you want to hand-write components not covered by the helpers. `root` is always included; `catalogId`, `sendDataModel`, and `version` are only sent if you provide them:

```js
{
  version: 'v0.9',
  createSurface: {
    surfaceId: 'card-<uuid>',
    root: 'root',
    components: [ … ]
  }
}
```

Fill in `catalogId` to name the component vocabulary. The WhatsApp debug fixture doesn’t send `catalogId` at all and still renders, so leave it blank if the component is from the base catalog. `Column`, `Row`, `Text`, `Image`, and `Card` have been confirmed on-device — `Card` wraps exactly one child and uses the single field `child`, which is why `a2uiCard` rejects arrays; the catalog lists more, and `a2uiSurface` will carry any object you give it, but treat the rest as untested.

A2UI cards and native-flow buttons live in the same `interactiveMessage`, and that’s how the card gets a button row underneath. `decodeBloksWidget(msg)` reads it back, with `params` already parsed.

<a id="mini-app-html"></a>
### Mini App HTML

`htmlSection` carries a complete HTML document — styles and `<script>` included — rendered by the WhatsApp app inside a WebView inside the chat bubble. That’s how an interactive page, a small canvas game, or a live chart reaches users without hosting anything. It’s part of `AI_RICH_PRIMITIVES` and not part of `AI_RICH_PRIMITIVES_WEB_RENDERED`: its name doesn’t appear anywhere in the WA Web bundle, so desktop viewers get an empty node where the page should be.

**The typename is not validated.** `GenAIaeacdsnwHtmlPrimitive` also does not appear anywhere in the APK—not in dex, resources, or native libraries. The client decodes the unified response through Meta’s Pando runtime (`com.facebook.pando.TreeJNI`), which reinterprets a tree node as a model class **without comparing `__typename`**. The renderer instead chooses a path based on the shape of the fields, and logs `JarvisRichContent/render skipped malformed HtmlSectionContent` if the shape doesn’t match. What actually has to be present is `payload` and `trusted_sources`—both field names, plus the `HtmlSectionContent(payload=, trustedSources=)` class, are in the APK. The Kotlin model for the section is `FOAHtmlPrimitive`, exported as `AI_RICH_HTML_PRIMITIVE_CLASS`. One thing to know before relying on that replacement: the only dex class containing the name `FOAHtmlPrimitive` is `FOAHtmlPrimitiveDemoDONOTUSEImpl`, while the render path that actually logs the line above is built around `HtmlSectionContent`. So the built-in typename is the one to use; the replacement is a fallback to try, not an equivalent.

Use `typename` to send the section under a different name:

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock).setTitle('Dashboard')

rich.addSection(MB.htmlSection(html, { typename: MB.AI_RICH_HTML_PRIMITIVE_CLASS }))

await rich.send(jid)
```

The default remains `GenAIaeacdsnwHtmlPrimitive` because that is the name observed to work in production.

| Client | Result |
|---|---|
| Android | rendered in the WebView, scripts run, taps and buttons work |
| Web / Desktop | the section arrives empty; `label` still appears |
| iOS | not tested |

The WebView where it is rendered is offline and has no storage — read [what it actually provides](#apa-yang-sebenarnya-disediakan-webview) before designing around it.

<a id="sendhtmlapp"></a>
#### sendHtmlApp

One call, without assembling the wrapper yourself.

```js
import { MB } from '@whiskeysockets/baileys'
import { readFileSync } from 'node:fs'

await MB.sendHtmlApp(sock, m.chat, readFileSync('./dino.html', 'utf8'), {
  title: 'NIXEL DINO',
  label: 'Dino Runner',
  trustedSources: ['nixel.dev']
})
```

```
MB.sendHtmlApp(sock, jid, html, options?) => Promise<WAMessage>
```

| Argument | Required | Meaning |
|---|---|---|
| `sock` | yes | socket returned by `makeWASocket` |
| `jid` | yes | destination chat |
| `html` | yes | the HTML document; must be a non-empty string |

| Option | Default | Meaning |
|---|---|---|
| `title` | `''` | bot disclaimer line above the card |
| `label` | none | plain-text submessage; the only part that can be displayed on Web and Desktop |
| `trustedSources` | `[]` | origin drawn as attribution below the card |
| `height` | none | pin its height to this many pixels so the host stops measuring it again |
| `id` | none | section id, so you can `replace` later in the same builder |

Anything else is passed through to `MB.send`, so `bypassDownload`, `forwarded`, `notification`, `includesUnifiedResponse`, `includesSubmessages`, `messageId`, and `additionalNodes` all work.

**`bypassDownload` defaults to `false` here**, unlike `MB.send`, which is `true`. When enabled, every send relays twice — the actual message, then a live edit (`protocolMessage` type 14) carrying identical content — and the client draws the card, then redraws it. For a static card that’s just a flicker; for a page running an animation loop, it restarts the entire WebView. So mini apps send only once by default. Turn it back on if a card fails to appear without it.

| What is provided | Number of relays | Result |
|---|---|---|
| *(default)* | 1 | one message, no follow-up edits |
| `bypassDownload: true` | 2 | message, then its edit — the page is redrawn |
| `includesUnifiedResponse: false` | 1 | clears `unifiedResponse` — **your HTML is gone** |
| `messageId: 'ABC123'` | 1 | uses your ID, not the generated one |
| `forwarded: false` | 1 | sends an empty `contextInfo`, discarding Meta AI forward metadata |

The edit only ever happens under `includesUnifiedResponse && bypassDownload`, so both must be enabled for a second relay.

The following is filled in for you, as the client expects:

```js
contextInfo: {
  forwardingScore: 1,
  isForwarded: true,
  forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
  forwardOrigin: 4
}
```

Added `messageType: 1`, one new `botResponseId`, and a `verificationMetadata` block.

<a id="htmlsection"></a>
#### htmlSection

Use its section builder if the HTML sits alongside other sections in a builder you control.

```js
import { MB } from '@whiskeysockets/baileys'

const rich = new MB.AIRich(sock)
rich.setTitle('Dashboard')
rich.addText('Penjualan hari ini')
rich.addSection(MB.dividerSection())
rich.addSection(MB.htmlSection(chartHtml, { trustedSources: ['nixel.dev'] }), { id: 'chart' })
await rich.send(m.chat)
```

```
MB.htmlSection(html, { trustedSources?, height? }) => section
```

| Builder | Primitive | Field |
|---|---|---|
| `htmlSection` | `GenAIaeacdsnwHtmlPrimitive` | `payload` — the HTML document; `trusted_sources` — origins for attribution |

It throws a `TypeError` if `html` is empty or not a string, or if `trustedSources` is not an array, so malformed cards fail at build time instead of arriving empty.

<a id="apa-yang-sebenarnya-disediakan-webview"></a>
#### What the WebView Actually Provides

Measured on an Android device, not guessed. The page is injected into an empty frame, so it runs on an opaque origin:

| Signal | Value |
|---|---|
| `location.origin` | `null` |
| `location.protocol` | `about:` |
| `document.baseURI` | `about:blank` |
| `window.isSecureContext` | `false` |
| `navigator.onLine` | `true` — it lies, ignore it |

Every remote subresource fails: images from four different hosts, `fetch`, `XMLHttpRequest`, a remote `<script>`, and an `<iframe>`. No `securitypolicyviolation` event is emitted for any of them.

`trustedSources` does not relax this. Tested on a device with one host listed in `trustedSources` and one that was not: **both images failed**. Whatever this option does, it does not give you remote images, so images still have to be `data:` URIs.

Loading is dead, but speaking isn’t. Two transports were measured on the same device in the same bubble:

| Transport | Result |
|---|---|
| `new WebSocket('wss://…')` | **connected** — `onopen` was emitted |
| `RTCPeerConnection` + STUN | **gathers candidates `srflx`**, so outbound UDP and NAT reflection work |
| `fetch` / `XMLHttpRequest` / `<img>` / `<script>` / `<iframe>` | dead |

So the mini app is offline for anything it wants to *load*, and online for anything it wants to *talk to*. That’s the whole difference, and it’s what makes networked mini apps possible at all. Why the two are split this way hasn’t been confirmed, so don’t reason from the mechanism here — follow the table.

That opaque origin then carries its storage with it. Every one of these throws `SecurityError`, including `indexedDB.open()`:

```
localStorage   THROW SecurityError
sessionStorage THROW SecurityError
cookie         THROW SecurityError
indexedDB.open THROW SecurityError
caches         undefined
```

So a mini app here **brings everything it needs and remembers nothing on its own**. Plan for that:

- Embed media as `data:` URIs. `data:` images load fine; `https:` ones never will.
- Don’t send storage fallbacks. Wrapping `localStorage` with `try/catch` is correct, but the catch block always runs — high scores can’t survive the bubble being redrawn.
- Persistence and any channels go back to your bot over WebSocket to a server you run. The page talks to your server, and your bot reads from the same place.
- As far as can be measured, nothing tells the page who’s watching it, and one message in a group means one page for everyone — so identity must be embedded per message or requested on screen.
- No `crypto.subtle`, because that requires a secure context. `wss://` remains TLS-encrypted; only the page is not a secure context.
- The entire app runs inside the message, so its size is your budget.

What does work: `canvas` 2D, WebGL and WebGL2, `OffscreenCanvas`, WebAssembly, Web Audio, `requestAnimationFrame`, and video or audio decoded from `data:` URIs.

<a id="menulis-html-yang-berperilaku-benar-di-webview"></a>
#### Writing HTML That Behaves Correctly in WebView

The page runs inside a bubble in a scrollable chat list, not in its own tab. Five things that are harmless in a browser become dangerous here.

**Give the page a fixed height.** This is what makes its card look like it’s shaking. If the content’s height depends on its width — `<canvas>` with `width:100%; height:auto`, images without dimensions, anything that uses `aspect-ratio` — then the host measures the bubble from its content while the content measures itself against the width the host just handed over, and the two keep chasing each other. A page measured at widths from 300px to 460px should report the same height every time.

Give `height` and its library the job of handling whatever the page does:

```js
await MB.sendHtmlApp(sock, m.chat, html, { height: 300 })
```

It inserts `lockHeight(300)` in front, which pins `html`/`body` to that many pixels and moves the page content itself into scroll container `#__wrap` on `DOMContentLoaded`. That container is what makes it work: pinning `body` alone isn’t enough, because `overflow:hidden` clips its display without shrinking `scrollHeight`, and the host still measures its overflow.

**Or let the page report its own height.** The host-injected bridge exposes exactly one method, and it works:

```js
window.AndroidBridge.updateSize(520)
```

The bubble resizes to that many pixels. Confirmed on-device by tapping a button that makes the call — so the mini app doesn’t need to be pinned from the outside at all. Note: the page must not pin `html`/`body` in CSS, or the frame will grow while the content stays where the stylesheet placed it.

`checkHtmlApp` treats the `AndroidBridge.updateSize` call as settling its height, so a self-reporting page no longer triggers the “no height settled” warning.

To do it manually, pin the outer height in pixels, give the canvas a fixed CSS size, and let anything longer scroll inside its own `overflow-y: auto` container rather than growing the page:

```css
#wrap { width: 100%; height: 300px; overflow: hidden }
#game { width: 312px; height: 106px }
```

**Stop the animation loop.** A plain `requestAnimationFrame` chain keeps drawing as long as its bubble is attached — after the game ends, after the user scrolls away, after the screen turns off. Add a gate:

```js
let rafId = null, running = true
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  } else if (!running) {
    running = true
    last = 0
    rafId = requestAnimationFrame(loop)
  }
})
```

then end `loop()` with `if (running) rafId = requestAnimationFrame(loop)`.

**Close IndexedDB.** `indexedDB.open` without a matching `close()` leaves one connection behind every time, without exception. Put it on a frequently traversed path and connections pile up:

```js
rq.onsuccess = () => {
  const db = rq.result
  const tx = db.transaction('kv', 'readwrite')
  tx.objectStore('kv').put(value, 'best')
  tx.oncomplete = () => db.close()
  tx.onerror = () => db.close()
}
```

**Scale the canvas to the device.** `<canvas width="560">` displayed at 352 CSS px on a phone with `devicePixelRatio: 3` needs 1056 physical pixels but gets only 560 — it looks blurry. Set its backing store size and keep your game coordinates in constants:

```js
const W = 560, H = 190
const dpr = Math.min(devicePixelRatio || 1, 3)
canvas.width = W * dpr
canvas.height = H * dpr
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
```

**Limit the scope of your input handler.** `document.addEventListener('pointerdown', e => e.preventDefault())` cancels gestures across the entire document, including padding around your app, so the host can lose the scroll it was just about to start. Bind it to the element that actually needs it:

```js
canvas.addEventListener('pointerdown', e => { e.preventDefault(); jump() })
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump() } })
```

**One escaping trap.** If you build its HTML as a JavaScript string literal, `"\d"` becomes `d` and `"\s"` becomes `s` before the page sees it — a regex like `/dino_best=(\d+)/` silently turns into a regex that matches a literal `d` character and never runs. Write `\\d` and `\\s`, or read the document from a file as in the first example and avoid the problem altogether.

<a id="membaca-balik-mini-app"></a>
#### Reading Back the Mini App

`decodeAIRich` handles this primitive like the others — there’s no whitelist to update:

```js
const rich = MB.decodeAIRich(msg)
const section = rich?.sections.find(s => s.view_model?.primitive?.__typename === MB.AI_RICH_HTML_PRIMITIVE)
if (section) {
  const html = section.view_model.primitive.payload
}
```

Don't take `sections[0]` — the HTML lands where you add it, so a card with text and a divider in front of it puts its page at index 2.

The enum values, read from the client rather than guessed:

```js
import { MB } from '@whiskeysockets/baileys'
```

`AI_RICH_LAYOUTS` lists all eight accepted layout names — `MB.newLayout`, `Single`, `HScroll`, and `ActionRow`, used by MessageBuilder; `VStack`, `Grid`, `FlexibleCountGrid`, `RichListItem`, and `AddonAction` are also available.

<a id="layar-tertanam"></a>
### Embedded Screens

An embedded screen is **a second surface carried by the same message**. Its chat bubble stays small — one line of text, one preview card — and tapping it opens a full sheet with its own sections, or several tabs containing sections. That’s how one message can be both a short answer and a full mini app.

Two things to know before building one:

- **WhatsApp Web doesn’t render it.** Its parser encounters the field and gives up, logging `CometComposedTextV2UnsupportedURType typename="embedded_screens"`. This is an Android and iOS surface. Test it on a phone.
- **Tabs are nested inside `content`, not beside it.** The screen holds `content[]`; each entry is a section (with its `view_model`) or a tab container (with its `tabs`). Reversing this is the most common reason a screen opens blank.

<a id="contoh-lengkap"></a>
#### Complete example

```js
import { MB } from '@whiskeysockets/baileys'

const gameHtml = `
<body style="margin:0;background:transparent;color:#eee;font-family:Arial">
  <canvas id="game" width="560" height="190" style="width:100%;height:auto"></canvas>
  <script>
    const x = document.getElementById('game').getContext('2d')
    x.fillStyle = '#6c5ce7'
    x.fillRect(20, 120, 27, 30)
  <\/script>
</body>`

const scoreHtml = '<body style="margin:0;color:#eee;font-family:Arial"><h3>Best: 00000</h3></body>'

const rich = new MB.AIRich(sock)
  .addSection(MB.htmlSection('<b>Dino Runner</b> — tap to play'))

rich.addEmbeddedScreen(MB.embeddedScreen({
  title: 'Preview',
  tabs: [
    MB.embeddedTab({ id: 'tab_0', tabHeader: 'Dino Runner', sections: [MB.htmlSection(gameHtml)] }),
    MB.embeddedTab({ id: 'tab_1', tabHeader: 'Skor', sections: [MB.htmlSection(scoreHtml)] })
  ]
}))

await rich.send(m.chat)
```

A screen without tabs is just as valid — provide `content` only, and the sheet displays a single page:

```js
rich.addEmbeddedScreen(MB.embeddedScreen({
  title: 'Rincian',
  content: [MB.htmlSection(detailHtml)]
}))
```

You can provide both. The tab container is added **after** any regular `content` you provide, so the flat section is drawn first and the tab strip below it.

<a id="apa-yang-benar-benar-dikirim"></a>
#### What is actually sent

`MB.send` encodes all of this in base64 into `botForwardedMessage.message.richResponseMessage.unifiedResponse.data`. The example above produces:

```jsonc
{
  "response_id": "183d0aee-fb35-4349-8bc5-7793b11859db",
  "sections": [
    {
      "__typename": "GenAIUnifiedResponseSection",
      "view_model": {
        "__typename": "GenAISingleLayoutViewModel",
        "primitive": {
          "__typename": "GenAIaeacdsnwHtmlPrimitive",
          "payload": "<b>Dino Runner</b> — tap to play",
          "trusted_sources": []
        }
      }
    }
  ],
  "embedded_screens": [
    {
      "id": "0f2c…",
      "title": "Preview",
      "content": [
        {
          "__typename": "FOAEmbeddedScreenContentTabbed",
          "tabs": [
            {
              "id": "tab_0",
              "tab_header": "Dino Runner",
              "sections": [
                {
                  "__typename": "GenAIUnifiedResponseSection",
                  "view_model": {
                    "__typename": "GenAISingleLayoutViewModel",
                    "primitive": { "__typename": "GenAIaeacdsnwHtmlPrimitive", "payload": "<body…>" }
                  }
                }
              ]
            },
            { "id": "tab_1", "tab_header": "Skor", "sections": [ /* … */ ] }
          ]
        }
      ]
    }
  ]
}
```

Read the nesting from the outside in: **screen → `content[]` → `tabs[]` → `sections[]` → `view_model` → `primitive`**. Every level except the tab and the screen itself carries `__typename`, and the builder fills them all.

<a id="hal-yang-sama-tanpa-builder"></a>
#### The same thing without a builder

If you prefer to assemble the payload by hand — or are moving one you received from another bot — here is the equivalent `relayMessage` call. There’s no magic here; this is exactly what `AIRich` produces:

```js
import { MB } from '@whiskeysockets/baileys'

await sock.relayMessage(m.chat, {
  messageContextInfo: {
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
    botMetadata: {
      messageDisclaimerText: '',
      botResponseId: 'f090cd0f-bad1-4a4a-b0c3-b8f8e852c197',
      verificationMetadata: MB.generateVerificationMetadata()
    }
  },
  botForwardedMessage: {
    message: {
      richResponseMessage: {
        messageType: 1,
        submessages: [{ messageType: 2, messageText: '> Dino Runner' }],
        unifiedResponse: {
          data: Buffer.from(JSON.stringify({
            response_id: '183d0aee-fb35-4349-8bc5-7793b11859db',
            sections: [
              {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                  __typename: 'GenAISingleLayoutViewModel',
                  primitive: { __typename: 'GenAIMarkdownTextUXPrimitive', text: '> Dino Runner' }
                }
              }
            ],
            embedded_screens: [
              {
                title: 'Preview',
                content: [
                  {
                    __typename: 'FOAEmbeddedScreenContentTabbed',
                    tabs: [
                      {
                        id: 'tab_0',
                        tab_header: 'Dino Runner',
                        sections: [
                          {
                            __typename: 'GenAIUnifiedResponseSection',
                            view_model: {
                              __typename: 'GenAISingleLayoutViewModel',
                              primitive: {
                                __typename: 'GenAIaeacdsnwHtmlPrimitive',
                                payload: gameHtml,
                                trusted_sources: ['nixel.dev']
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          })).toString('base64')
        },
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
          forwardOrigin: 4
        }
      }
    }
  }
}, {})
```

The builder is still worth using — it generates its id, drops empty fields instead of sending `null`, and keeps the typename in one place — but the payload is ordinary JSON, and nothing stops you from writing it yourself.

<a id="typename-nya"></a>
#### The typenames

| Constant | Value | Where it goes |
| --- | --- | --- |
| `AI_RICH_SECTION_TYPENAME` | `GenAIUnifiedResponseSection` | every section, top-level or nested |
| `AI_RICH_UNIFIED_RESPONSE_TYPENAME` | `XMSGGenAIUnifiedResponse` | the unified response root |
| `EMBEDDED_SCREEN_TABBED_TYPENAME` | `FOAEmbeddedScreenContentTabbed` | the `content` entry that holds the tab |
| `EMBEDDED_SCREEN_TAB_TYPENAME` | `FOAUnifiedResponseTab` | a tab, if you want to name it |
| `EMBEDDED_SCREEN_TYPENAME` | `FOAUnifiedResponseEmbeddedScreen` | the screen itself, if you want to name it |

Their origins, so you can check them yourself:

- `GenAIUnifiedResponseSection` and `XMSGGenAIUnifiedResponse` are in the WhatsApp Web bundle, in the `injectRichResponseTestMessage` debug command, which builds that exact section shape.
- The three `FOA…` names are models from the Android client’s Kotlin code: `FOAEmbeddedScreenContentTabbedImpl.kt`, `FOAUnifiedResponseTabImpl.kt`, `FOAUnifiedResponseEmbeddedScreenImpl.kt`. The field names `embedded_screens`, `tab_header`, `step_entries`, and `poll_id` are in the same dex.

Sections always get their typename. Screens and tabs remain untyped unless you request them:

```js
import { MB } from '@whiskeysockets/baileys'

MB.embeddedScreen({ typename: MB.EMBEDDED_SCREEN_TYPENAME, tabs: [tab] })
MB.embeddedTab({ typename: MB.EMBEDDED_SCREEN_TAB_TYPENAME, sections: [...] })

// for builds that expect a different container name
MB.embeddedScreen({ tabs: [tab], tabsTypename: 'FOAIDButtonSheets' })
```

That last line matters. As with `htmlSection`, **Android does not compare `__typename`** — Pando reinterprets its tree nodes based on field shapes, so payloads in the wild carry various container names and still render. `tabsTypename` is there so you can match whatever a build expects, rather than being locked to a single string.

<a id="opsi"></a>
#### Options

`embeddedScreen({ … })`:

| Option | Wire field | Notes |
| --- | --- | --- |
| `id` | `id` | UUID is generated if omitted |
| `title` | `title` | the sheet header |
| `content` | `content` | section array, or hand-built content entries |
| `tabs` | `content[n].tabs` | wrapped in a tab container and then added to `content` |
| `tabsTypename` | `content[n].__typename` | defaults to `FOAEmbeddedScreenContentTabbed` |
| `typename` | `__typename` | omitted unless provided |
| `header`, `body` | `header`, `body` | passed through as-is |
| `artifacts`, `steps`, `sources` | same names | must be arrays |
| `stepEntries` | `step_entries` | must be an array |
| `pollId` | `poll_id` | |

`embeddedTab({ … })`:

| Option | Wire field | Notes |
| --- | --- | --- |
| `id` | `id` | UUID is generated if omitted |
| `tabHeader` | `tab_header` | label on the tab strip |
| `header` | `header` | passed through as-is |
| `sections` | `sections` | each gets `GenAIUnifiedResponseSection` |
| `typename` | `__typename` | omitted unless provided |

`embeddedTabbedContent(tabs, { typename })` builds its own container, for when you want to place it inside `content` manually.

Anything left as `undefined` is discarded, never sent as `null`. Passing something that isn’t an array where an array is expected throws `TypeError` at build time, rather than producing a payload that the phone silently ignores.

`EMBEDDED_SCREEN_PRESENTATION` (`HALF_HEIGHT`, `FULL_HEIGHT`) are also exported. Both values and the `overwrite_first_screen_presentation` field exist in the Android client, but which object carries that field can’t be determined from the client alone, so the builder doesn’t set it — add it yourself if you know where a build expects it.

<a id="membaca-balik-layar-tertanam"></a>
#### Reading embedded screens

```js
import { MB } from '@whiskeysockets/baileys'

const info = MB.decodeAIRich(m.message)

info.embeddedScreens   // layar mentahnya, persis seperti saat tiba
info.embeddedTabs      // all tabs, flattened, from any nesting structure
info.embeddedSections  // all sections within those screens

// atau per layar
MB.readEmbeddedTabs(info.embeddedScreens[0])
MB.readEmbeddedSections(info.embeddedScreens[0])

// get the HTML carried by a tab
const html = MB.readEmbeddedSections(info.embeddedScreens[0])
  .map(section => section.view_model?.primitive?.payload)
  .filter(Boolean)
```

`readRichMessage(m).html` also collects the HTML inside an embedded screen, so pages sent via tabs are no longer invisible to it. `readEmbeddedTabs` reads both forms — the nested one under `content`, and the older flat `tabs` at the screen level — so payloads from other bots can be read either way.

<a id="kalau-sheet-nya-terbuka-kosong"></a>
#### If the sheet opens blank

| Symptom | Cause |
| --- | --- |
| Nothing opens at all | You’re viewing WhatsApp Web. It doesn’t render embedded screens; use a phone. |
| The sheet opens blank | The tab was placed next to `content`, not inside it. Pass it to `embeddedScreen({ tabs })` and let it nest it. |
| The tab strip appears, but the page is blank | A section is missing its `view_model`, or its primitive is missing `payload`. Log `readEmbeddedSections(screen)` and inspect its shape. |
| Text renders, but HTML doesn’t | The viewer is on desktop WA Web, which has no renderer for HTML sections. See [Mini App HTML](#mini-app-html) for the primitive and its `trusted_sources`. |

<a id="memeriksa-pesan-ai-rich-yang-diterima"></a>
### Inspecting Received Rich AI Messages

`decodeAIRich` decodes the base64 `unifiedResponse` so you can see exactly which primitive a message uses — useful for replicating something sent by another bot.

```js
import { MB } from '@whiskeysockets/baileys'

const info = MB.decodeAIRich(m.message)
console.log(info.layouts)     // [ 'Single', 'HScroll' ]
console.log(info.typenames)   // [ 'GenAIMarkdownTextUXPrimitive', 'GenAIProductItemCardPrimitive' ]
console.log(info.sections)
```

> [!WARNING]
> AIRich and some experimental interactive payloads depend on WhatsApp client/server compatibility. The image results may vary between WhatsApp versions.

---

<a id="readme-section-23"></a>
<a id="-pesan-album"></a>
## 🖼️ Album Messages

Send multiple images or videos as a single album.

```js
await sock.sendMessage(jid, {
  album: [
    {
      image: { url: 'https://example.com/1.jpg' },
      caption: 'Image 1'
    },
    {
      image: { url: 'https://example.com/2.jpg' },
      caption: 'Image 2'
    },
    {
      video: { url: 'https://example.com/3.mp4' },
      caption: 'Video 3'
    }
  ],
  caption: 'Caption for its own album'
})
```

`caption` per item is attached to each image or video. `caption` next to `album` belongs to the album itself — `AlbumMessage.caption`, field 1.

**This is intentionally opt-in.** The field was found by auditing the APK; WA Web's protobuf has no `caption` in `AlbumMessage` at all. That asymmetry is a sender-side issue, not a rendering issue: this library identifies as any Web device whose phone scanned the code, so a field the real Web client cannot even emit is a wire fingerprint. Leave the key out — as all existing callers do — and nothing is written. Set it only if you've decided the tradeoff is worthwhile.

An album needs at least two image/video media items.

---

<a id="readme-section-24"></a>
<a id="-foto-video-berpasangan-imgvid"></a>
## 🎞️ Paired Photo + Video (imgvid)

Send one photo as the parent, then one video as a child linked to that photo, similar to a motion photo. Just provide `image` and `video` together in one `sendMessage`:

```js
await sock.sendMessage(jid, {
  image: { url: 'https://files.catbox.moe/s72odd.jpeg' },
  video: { url: 'https://files.catbox.moe/ttpfrr.mp4' },
  caption: 'Playable photo'
})
```

`caption` is attached to the parent photo. Behind the scenes, the library sends two messages: the photo as the parent, then the video as the child, carrying `messageContextInfo.messageAssociation` with `associationType` `MOTION_PHOTO` and `parentMessageKey` pointing to the parent photo. Recipients with support for this will link the two so the photo can play its video.

This path is only active when both `image` and `video` are present and `jid` is not an array. If either is missing, the media is sent as usual.

**A note of honesty.** This links media via association; it is not a true motion photo in the form of a JPEG with an embedded MP4. Whether it appears as a "photo you can play" depends entirely on the recipient client's support — if it doesn't support this yet, they appear as separate photo and video. Nothing can be forced from the sender's side.

---

<a id="readme-section-25"></a>
<a id="-status"></a>
## 📸 Status

Status is sent to the special jid `status@broadcast`, and the recipients are the people you list in `statusJidList`. That list is the entire audience mechanism — there are no separate privacy settings that can be changed from here.

```js
await sock.sendMessage('status@broadcast', {
  text: 'Hello everyone'
}, {
  statusJidList: ['628xxxx@s.whatsapp.net', '628yyyy@s.whatsapp.net']
})
```

<a id="latar-warna-teks-dan-font"></a>
### Background, Text Color, and Font

The **text** status is `extendedTextMessage` with three styling fields, and all three are options in the third argument, not part of its content:

```js
import { StatusFont } from '@whiskeysockets/baileys'

await sock.sendMessage('status@broadcast', { text: 'Hello everyone' }, {
  statusJidList,
  backgroundColor: '#7C3AED',
  textColor: '#FFFFFF',
  font: StatusFont.CALISTOGA_REGULAR
})
```

| Option | Field on the wire | Tag |
| --- | --- | --- |
| `backgroundColor` | `backgroundArgb` | 8, `FIXED32` |
| `textColor` | `textArgb` | 7, `FIXED32` |
| `font` | `font` | 9, enum |

<a id="warna"></a>
#### Colors

Both colors accept the same formats:

| What you provide | What you get |
| --- | --- |
| `'#7C3AED'` or `'7C3AED'` | `0xFF7C3AED` — the hash mark is optional, and six digits are made opaque |
| `'807C3AED'` | `0x807C3AED` — eight digits preserve your alpha |
| `0xFF7C3AED` | used as-is |
| `-1` | wrapped into the unsigned range, so `0xFFFFFFFF` |

Omit either option and nothing at all is written to the message — the client chooses for itself.

<a id="font"></a>
#### Font

`StatusFont` is `ExtendedTextMessage.FontType`. These eight are the entire accepted set — WhatsApp Web validates against exactly this list and discards anything else, so a ninth value is the same as not sending a font at all.

| Constant | Value | Appearance | Font file on the Android client |
| --- | --- | --- | --- |
| `SYSTEM` | 0 | plain default — what you get if you don't provide `font` | platform typeface |
| `SYSTEM_TEXT` | 1 | the same plain typeface, stored as its own value | platform typeface |
| `FB_SCRIPT` | 2 | flowing handwriting, Meta's own cursive | `FacebookScriptWA-Regular.otf` |
| `SYSTEM_BOLD` | 6 | its plain typeface, bold | platform typeface, bold |
| `MORNINGBREEZE_REGULAR` | 7 | casual marker handwriting, loose and informal | `MorningBreeze-Regular.ttf` |
| `CALISTOGA_REGULAR` | 8 | chunky rounded display serif, warm and poster-like | `Calistoga-Regular.ttf` |
| `EXO2_EXTRABOLD` | 9 | geometric sans at its heaviest weight, bold and modern | `Exo2-ExtraBold.ttf` |
| `COURIERPRIME_BOLD` | 10 | monospace typewriter, every character the same width | `CourierPrime-Bold.ttf` |

How to choose:

- **Regular text** → clear `font`, or use `SYSTEM`. `SYSTEM_TEXT` the same typeface; the client stores both values, so there’s no obvious reason to choose one over the other.
- **Bold and short** → `EXO2_EXTRABOLD` for a bold modern shout, `CALISTOGA_REGULAR` for something rounder and friendlier. Both are display typefaces: great for a few words, poor for a paragraph.
- **Personal or handwritten** → `FB_SCRIPT` for neat cursive, `MORNINGBREEZE_REGULAR` for marker scrawl. Script typefaces suffer at small sizes and in long text.
- **Code, numbers, ASCII art** → `COURIERPRIME_BOLD`. It’s the only monospaced one, so it’s the only place where columns line up.

Two things to know before you settle on a typeface:

- **Only these names are certain from the file list alone.** `FB_SCRIPT`, `MORNINGBREEZE_REGULAR`, `CALISTOGA_REGULAR`, `EXO2_EXTRABOLD`, and `COURIERPRIME_BOLD` each match a bundled file one-to-one by name. The APK also contains `Roboto-Medium.ttf` and `RobotoMono-Regular.ttf`, which are almost certainly the targets of the three `SYSTEM*` values, but the dex doesn’t say which maps to which — so the table says “platform typeface” rather than guessing.
- **The gap in the numbering is real.** The values jump from 2 → 6, so 3, 4, and 5 are retired or unused. Don’t send them; they’re not in the accepted list and will be discarded like any other unknown value.

```js
import { StatusFont } from '@whiskeysockets/baileys'

await sock.sendMessage('status@broadcast', {
  text: 'PENGUMUMAN'
}, { statusJidList, backgroundColor: '#7C3AED', textColor: '#FFFFFF', font: StatusFont.EXO2_EXTRABOLD })
```

`font` also accepts raw numbers if you don't want to import anything — `font: 8` is `CALISTOGA_REGULAR`.

> [!NOTE]
> The font is bundled in the Android APK, in `assets/fonts/`. The WhatsApp Web bundle parses the field and validates all eight values, but **has no font-family mapping for any of them** — so the status you style will appear styled on phones and plain on the Web. That's the client, not the message.

<a id="status-gambar-video-dan-suara"></a>
### Image, Video and Audio Statuses

Media statuses are ordinary media messages sent to `status@broadcast`:

```js
await sock.sendMessage('status@broadcast', {
  image: { url: './foto.jpg' },
  caption: 'Hello everyone'
}, { statusJidList })

await sock.sendMessage('status@broadcast', {
  video: { url: './klip.mp4' },
  caption: 'Hello everyone'
}, { statusJidList })
```

The **voice message** status is the only media type that also receives a background color — `AudioMessage.backgroundArgb`, tag 20 — and only if `ptt` is enabled:

```js
await sock.sendMessage('status@broadcast', {
  audio: { url: './suara.ogg' },
  mimetype: 'audio/ogg; codecs=opus',
  ptt: true
}, {
  statusJidList,
  backgroundColor: '#7C3AED'
})
```

<a id="stiker-status"></a>
### Status Stickers

Image or video statuses can include tappable stickers — a place, a channel, a link, a song. They are attached to the media message as `interactiveAnnotations`, and each is positioned by a rectangle specified as a **fraction of the media**, not in pixels: the client multiplies each coordinate by the width and height of the rendered image.

```js
import {
  locationSticker,
  channelSticker,
  linkSticker,
  musicSticker,
  StatusLinkType
} from '@whiskeysockets/baileys'

await sock.sendMessage('status@broadcast', {
  image: { url: './liburan.jpg' },
  caption: 'Weekend',
  statusStickers: [
    locationSticker({
      latitude: -6.2088,
      longitude: 106.8456,
      name: 'Jakarta',
      area: { x: 0.1, y: 0.72, width: 0.5, height: 0.1 }
    }),
    linkSticker({
      url: 'https://example.com/blog',
      title: 'Baca ceritanya',
      linkType: StatusLinkType.RASTERIZED_LINK_FULL_URL,
      area: { x: 0.1, y: 0.06, width: 0.8, height: 0.09 }
    })
  ]
})
```

The option is `statusStickers`, not `stickers` — that key is already used to build the sticker pack. A single sticker doesn't need an array. Anything other than an image or video is rejected, because the field doesn't exist anywhere else.

| Builder | Sets | Requires |
|---|---|---|
| `locationSticker` | `location` | `latitude` and `longitude` as numbers, `name` optional |
| `channelSticker` | `newsletter` | `jid` ending in `@newsletter`, `name` and `serverMessageId` optional |
| `linkSticker` | `tapAction` + `statusLinkType` | `url`, `title` optional |
| `musicSticker` | `embeddedContent.embeddedMusic` | `songId` or `mediaId`, plus `title`, `author`, `startTimeMs`, `durationMs`, artwork field |
| `messageSticker` | `embeddedContent.embeddedMessage` | embedded `message`, `stanzaId` optional |

`location`, `newsletter`, `embeddedAction`, and `tapAction` are a single `oneof` in protobuf, so a sticker can have exactly one of them — providing two throws an error rather than silently discarding one. Music and embedded messages sit outside that group and can be paired with an action.

`stickerArea({ x, y, width, height })` builds all four corners by hand if you want; each value is between 0 and 1, and areas that extend beyond the edges are rejected. If omitted, the sticker lands at `STICKER_DEFAULT_AREA` in the center.

Read it back:

```js
import { readStickers } from '@whiskeysockets/baileys'

for (const sticker of readStickers(msg.message)) {
  if (sticker.kind === 'location') console.log(sticker.location.degreesLatitude)
  if (sticker.kind === 'music') console.log(sticker.music.title)
}
```

`readStickers` returns `[]` for anything without annotation, so it is safe to use in any message.

<a id="mengirim-lagu"></a>
#### Sending a Song

A regular audio message with cover art, title, and artist in `externalAdReply`. Nothing here depends on Meta’s music catalog, so it renders for any file you have:

```js
await sock.sendMessage(jid, {
  song: {
    audio: { url: './lagu.mp3' },
    artwork: { url: './sampul.jpg' },
    title: 'Judul Lagu',
    author: 'Penyanyi',
    url: 'https://example.com/track'
  }
})
```

`audio` is required; the rest are optional. The artwork is downscaled to a 640px JPEG before being uploaded, since full-size covers far exceed the weight a thumbnail can bear — provide `thumbnailWidth` to change this, and if no image library is installed, the file is sent untouched. `largeThumbnail` defaults to `true` for a large card; set `false` for a compact one. `url` fills both `sourceUrl` and `mediaUrl`, so tapping the card opens it. Any other key is passed through to the audio upload, so `ptt`, `seconds`, and `waveform` work as usual.

`mediaType` stays at `1` (IMAGE) unless you change it. `2` is VIDEO, which makes the client wait for a video and skip drawing a thumbnail entirely — the cover bytes are simply ignored.

`ptt: true` turns it into a voice message while preserving the card:

```js
await sock.sendMessage(jid, {
  song: {
    audio: { url: './audio.opus' },
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true,
    artwork: { url: './sampul.jpg' },
    title: 'Judul'
  }
})
```

Set the mimetype yourself if you do that. Voice messages are opus in an ogg container, by default here `audio/mpeg`, and nothing in this library transcodes — handing mp3 to `ptt: true` gives you a log warning and a bubble that may not play. The waveform is still computed for you if ffmpeg is available.

The card here is `externalAdReply`, so it carries the risk of sending that field: a consumer recipient whose account has the emphasis prop active will discard the entire audio message, not just its artwork. See [External Ad Reply](#-external-ad-reply) for the exact requirements, and [Rich Link Card](#-kartu-rich-link) for a cover that renders without involving the ad field — as its own message beside the audio, since the preview belongs to the text and the audio bubble has nowhere to put it.

Read incoming music with `readMusicMessage(msg.message)`, which returns `null` for anything that isn't that.

<a id="status-grup"></a>
### Group Status

Group status is the same message with `groupStatus: true` on it. It wraps the finished message inside `groupStatusMessageV2` and sets `contextInfo.isGroupStatus`, and that's what makes the relay layer attach the `<meta is_group_status="true">` node clients look for:

```js
await sock.sendMessage(groupJid, {
  text: 'hello group',
  groupStatus: true
})
```

**The styling works here too, and there’s nothing extra to hand off.** The wrapping happens after its message is built, so `backgroundColor`, `textColor`, and `font` land in `extendedTextMessage` inside the wrapper, exactly as they do in regular status:

```js
import { StatusFont } from '@whiskeysockets/baileys'

await sock.sendMessage(groupJid, {
  text: 'hello group',
  groupStatus: true,
  statusAudience: { listName: 'Besties', listEmoji: '💜' }
}, {
  backgroundColor: '#7C3AED',
  textColor: '#FFEE58',
  font: StatusFont.EXO2_EXTRABOLD
})
```

```jsonc
{
  "groupStatusMessageV2": {
    "message": {
      "extendedTextMessage": {
        "text": "hello group",
        "backgroundArgb": 4286331629,
        "textArgb": 4294962776,
        "font": 9,
        "contextInfo": {
          "statusAudienceMetadata": { "audienceType": 1, "listName": "Besties", "listEmoji": "💜" },
          "isGroupStatus": true
        }
      }
    }
  }
}
```

<a id="font-apa-saja-yang-bisa-dipakai-status-grup"></a>
#### Which fonts can group status use

The same eight as regular status, because underneath they use the same `extendedTextMessage` — the wrapper is added afterward and does not change anything about the styling. There are no group-specific typefaces and nothing extra to unlock.

| Constant | Value | Looks like |
| --- | --- | --- |
| `SYSTEM` | 0 | plain default, identical to not sending `font` |
| `SYSTEM_TEXT` | 1 | the same plain typeface, stored as its own value |
| `FB_SCRIPT` | 2 | flowing handwriting, Meta’s own cursive |
| `SYSTEM_BOLD` | 6 | its plain typeface, bold |
| `MORNINGBREEZE_REGULAR` | 7 | casual marker handwriting |
| `CALISTOGA_REGULAR` | 8 | chunky rounded display serif |
| `EXO2_EXTRABOLD` | 9 | geometric sans at its heaviest weight |
| `COURIERPRIME_BOLD` | 10 | monospace typewriter |

Three things work the same way as in [Backgrounds, Text Colors and Fonts](#latar-warna-teks-dan-font), where each typeface is described in full:

- **3, 4, and 5 are missing.** The values jump from 2 → 6. The client validates against the eight above and discards the others, so an unknown value behaves exactly like not sending a font.
- **`font` also accepts the raw numbers**, if you don’t want to import — `font: 8` is `CALISTOGA_REGULAR`.
- **The typefaces are in the Android APK**, in `assets/fonts/`. WA Web validates the field but has no font-family mapping for any of them, so a styled group status appears styled on phones and plain in the browser.

All eight survived wrapping, and that’s worth verifying rather than assuming — `SYSTEM` writes `font: 0` into its message, rather than being discarded as a falsy value:

```
SYSTEM                 nilai= 0 | font=0  | bg=0xff7c3aed | isGroupStatus=true
SYSTEM_TEXT            nilai= 1 | font=1  | bg=0xff7c3aed | isGroupStatus=true
FB_SCRIPT              nilai= 2 | font=2  | bg=0xff7c3aed | isGroupStatus=true
SYSTEM_BOLD            nilai= 6 | font=6  | bg=0xff7c3aed | isGroupStatus=true
MORNINGBREEZE_REGULAR  nilai= 7 | font=7  | bg=0xff7c3aed | isGroupStatus=true
CALISTOGA_REGULAR      nilai= 8 | font=8  | bg=0xff7c3aed | isGroupStatus=true
EXO2_EXTRABOLD         nilai= 9 | font=9  | bg=0xff7c3aed | isGroupStatus=true
COURIERPRIME_BOLD      nilai=10 | font=10 | bg=0xff7c3aed | isGroupStatus=true
```

The caption on a group status `image` or `video` is **not** `extendedTextMessage`, so it does not receive `font` at all — the three styling options only apply to text statuses. Voice messages retain `backgroundArgb` and nothing more.

Media works the same way — `groupStatus: true` together with `image`, `video`, or voice messages wraps whichever message is built, and voice messages retain their background color:

```js
await sock.sendMessage(groupJid, {
  audio: { url: './suara.ogg' },
  mimetype: 'audio/ogg; codecs=opus',
  ptt: true,
  groupStatus: true
}, { backgroundColor: '#7C3AED' })
```

Because its payload is wrapped, `message.conversation` is `undefined` on the receiving side, and the actual content is one layer underneath. Run it through `normalizeMessageContent` before reading it, just like any other wrapper — see [All Message Types](#-semua-jenis-pesan).

> [!NOTE]
> `groupStatusMessageV2` is field 103 of `Message`; the older `groupStatusMessage` is field 96. Both are `FutureProofMessage` wrappers, and the relay layer adds a meta node for each, but `groupStatus: true` always builds V2. WhatsApp Web only ever *parsed* this — it has no send path for group status at all, so on the official client, this is posted from a phone.

<a id="apa-saja-yang-benar-benar-bisa-digayakan"></a>
### What Can Actually Be Styled

It’s worth saying this plainly, because it’s the most common misconception:

| Status type | Background | Text color | Font | Caption |
| --- | --- | --- | --- | --- |
| Text | ✅ | ✅ | ✅ | — |
| Voice message (`ptt: true`) | ✅ | ❌ | ❌ | ❌ |
| Image | ❌ | ❌ | ❌ | ✅ |
| Video | ❌ | ❌ | ❌ | ✅ |
| Audio without `ptt` | ❌ | ❌ | ❌ | ❌ |

Group status isn’t a separate row: `groupStatus: true` wraps whichever of those you build, and the wrapped message retains any styling it already has.

`ImageMessage` and `VideoMessage` **do not have color or font fields in the protobuf** — not in the WhatsApp Web specification, and not on Android. Colored text that you see over a photo in the app is baked into the image by the media editor before upload, so if you want that from a bot, draw it onto the photo yourself and then send it as a regular image.

To add a custom audience badge to either one, see [Custom Status Audiences](#audiens-status-kustom-teman-dekat).

---

<a id="readme-section-26"></a>
<a id="-newsletter--channel"></a>
<a id="-newsletter-channel"></a>
## 📢 Newsletter / Channel

<a id="membuat-dan-menyunting-channel"></a>
### Creating and Editing Channels

<a id="membuat-channel"></a>
#### Creating a Channel

```js
const newsletter = await sock.newsletterCreate(
  'RabbitXmd Updates',
  'Channel update resmi'
)

console.log(newsletter)
```

<a id="mengubah-nama"></a>
#### Changing Names

```js
await sock.newsletterUpdateName(
  '123456789@newsletter',
  'RabbitXmd News'
)
```

<a id="mengubah-deskripsi"></a>
#### Changing Description

```js
await sock.newsletterUpdateDescription(
  '123456789@newsletter',
  'The latest news from RabbitXmd'
)
```

<a id="mengubah-foto"></a>
#### Changing a Photo

```js
await sock.newsletterUpdatePicture(
  '123456789@newsletter',
  { url: 'https://example.com/channel.jpg' }
)
```

<a id="pengaturan-reaksi"></a>
#### Reaction Settings

```js
await sock.newsletterUpdateReactions('123456789@newsletter', 'BASIC')
```

`ALL` allows any emoji, `BASIC` allows only the built-in set, `NONE` disables reactions, and `BLOCKLIST` uses a server-side blocklist. Otherwise, it is rejected before the request is sent.

<a id="mengikuti-channel"></a>
### Following Channels

<a id="follow-unfollow"></a>
#### Follow / Unfollow

```js
await sock.newsletterFollow('123456789@newsletter')
await sock.newsletterUnfollow('123456789@newsletter')
```

<a id="mute-unmute"></a>
#### Mute / Unmute

```js
await sock.newsletterMute('123456789@newsletter')
await sock.newsletterUnmute('123456789@newsletter')
```

<a id="membisukan-aktivitas-admin-atau-follower"></a>
#### Muting Admin or Follower Activity

WhatsApp Web replaced the old mute/unmute pair with a single setting that separates admin notifications from follower notifications.

```js
await sock.newsletterUpdateUserSetting('123456789@newsletter', 'ADMIN_NOTIFICATIONS', true)
await sock.newsletterUpdateUserSetting('123456789@newsletter', 'FOLLOWER_NOTIFICATIONS', false)
```

`newsletterMute` and `newsletterUnmute` are shorthand forms for the same mutation as `ADMIN_NOTIFICATIONS`, and that is exactly what WhatsApp Web's mute toggle sends. They used to call a separate pair of operations that are no longer present in either client, so now both return the same `{ id, state }` as the settings call.

<a id="mengambil-daftar-channel-yang-diikuti"></a>
#### Fetching the List of Followed Channels

```js
const newsletters = await sock.newsletterSubscribed()

const lengkap = await sock.newsletterSubscribed({
  fetchStatusMetadata: true,
  fetchWamoSub: true
})
```

The query, `WAWebMexFetchAllNewslettersMetadataJobQuery`, declares `fetch_status_metadata` and `fetch_wamo_sub` without default values, so both must be sent. Up to version `1.3.10`, this fork sent empty variables and the call failed on the server; now both are always sent, `false` unless you request otherwise.

<a id="membaca-channel"></a>
### Reading Channels

<a id="mengambil-metadata-channel"></a>
#### Fetching Channel Metadata

```js
const metadata = await sock.newsletterMetadata(
  'jid',
  '123456789@newsletter'
)

console.log(metadata.thread_metadata.handle)          // @username channel-nya
console.log(metadata.thread_metadata.subscribers_count)
console.log(metadata.thread_metadata.settings.reaction_codes.value)
```

`handle` is the channel's public username — the part after `wa.me/channel/`. It is returned on every call, whether or not you own the channel.

Three additional sections are disabled by default because they burden the server with extra work:

```js
const metadata = await sock.newsletterMetadata('jid', '123456789@newsletter', {
  fetchPinnedMessages: true,
  fetchStatusMetadata: true,
  fetchWamoSub: true
})

metadata.thread_metadata.pinned_messages   // [ { message_id, expiry_ts } ]
metadata.thread_metadata.wamo_sub          // { plan_id }
metadata.status_metadata                   // { last_status_server_id, last_status_sent_time }
```

<a id="pembaruan-pesan-bertahap"></a>
#### Incremental Message Updates

Only ask what has changed in a channel since a given timestamp, rather than fetching its history again.

```js
const { messages } = await sock.newsletterFetchMessageUpdates('123456789@newsletter', {
  count: 50,
  since: 1770000000
})
```

<a id="follower"></a>
#### Follower

```js
const followers = await sock.newsletterFollowers('123456789@newsletter', { count: 100 })
```

<a id="insight"></a>
#### Insight

Admin analytics for the channels you own.

```js
const insights = await sock.newsletterInsights('123456789@newsletter', {
  metrics: ['NET_FOLLOWS', 'UNFOLLOWS']
})
// { result: [{ id, values }], last_update_time, metrics_status }
```

`metrics_status` is `OK` or `MISSING`; `MISSING` means the server has no data for the requested window.

<a id="reaksi-dan-vote-milik-sendiri"></a>
#### Your Reactions and Votes

Everything you reacted to or voted on across channels, without browsing every message.

```js
const groups = await sock.newsletterMyAddOns({ limit: 100 })
const oneChannel = await sock.newsletterMyAddOns({ limit: 50, jid: '123456789@newsletter' })
const onStatuses = await sock.newsletterStatusMyAddOns({ limit: 50 })

for (const group of groups) {
  for (const m of group.messages) {
    console.log(group.jid, m.serverId, m.reaction?.code, m.pollVote?.hashes)
  }
}
```

`pollVote.hashes` is the SHA-256 hash of the option, encoded as hex — match it against the poll options to find out which one you selected.

<a id="memposting-dan-bereaksi"></a>
### Posting and Reacting

<a id="bereaksi-ke-pesan-channel"></a>
#### Reacting to Channel Messages

```js
await sock.newsletterReactMessage(
  '123456789@newsletter',
  '175',
  '🔥'
)
```

Remove the reaction by assigning an empty value:

```js
await sock.newsletterReactMessage(
  '123456789@newsletter',
  '175',
  ''
)
```

<a id="pin-unpin-pesan"></a>
#### Pin / Unpin Messages

Receives `server_id` the message, not its message key.

```js
await sock.newsletterPinMessages('123456789@newsletter', [175])
await sock.newsletterUnpinMessages('123456789@newsletter', 175)
```

<a id="label-konten"></a>
#### Content Label

```js
await sock.newsletterLabelAiContent('123456789@newsletter', 175)
await sock.newsletterLabelPaidPartnership('123456789@newsletter', 175)
```

`messageType` the third argument and its default `MESSAGE`; provide `STATUS` to label the channel status.

<a id="vote-di-polling-channel"></a>
#### Voting in Polling Channels

Channel votes are sent unencrypted as an option hash, unlike encrypted votes used in chats.

```js
await sock.newsletterSendPollVote('123456789@newsletter', pollServerId, ['Jakarta'])
```

<a id="pemberi-vote-polling"></a>
#### Polling Vote Provider

```js
const voters = await sock.newsletterPollVoters('123456789@newsletter', 175, {
  limit: 100,
  voteHash: undefined
})
```

The response groups voters by `vote_hash`, each with an array of `voter_list.edges`.

<a id="pengirim-reaksi"></a>
#### Reaction Sender

```js
const senders = await sock.newsletterReactionSenders('123456789@newsletter', 175)
```

<a id="status-channel"></a>
### Status Channel

<a id="memposting-status-channel"></a>
#### Posting a Channel Status

A channel can post its own status — a ring around its avatar that can be tapped through like a story. This is a real WhatsApp feature with its own stanza, not a `status@broadcast` post addressed to the channel.

```js
await sock.sendNewsletterStatus('123456789@newsletter', {
  image: { url: './poster.jpg' },
  caption: 'New release today'
})

await sock.sendNewsletterStatus('123456789@newsletter', {
  text: 'Thank you for 10 thousand followers'
})
```

React to one of them, or remove your reaction:

```js
await sock.sendNewsletterStatusReaction('123456789@newsletter', 175, '🔥')
await sock.sendNewsletterStatusReaction('123456789@newsletter', 175, undefined)
```

Delete one of them:

```js
await sock.revokeNewsletterStatus('123456789@newsletter', statusId)
```

<a id="status-channel-vs-statusbroadcast"></a>
##### Status Channel vs `status@broadcast`

They look the same to viewers and completely different on the wire.

| | `status@broadcast` | Status channel |
|---|---|---|
| Stanza | `<status to="status@broadcast" id t>` | `<status to="…@newsletter" id>` |
| Payload | node `<enc>`, one per recipient device | `<plaintext>` — the raw protobuf |
| Encryption | end-to-end, sender-key fanout | none, the channel is not E2EE |
| Audience | your contact list, `statusJidList` | everyone who follows the channel |
| Who can post | anyone | channel admins with producer capability |
| Media | regular media uploads | newsletter uploads, referenced via `media_id` |

The library handles the media difference for you: `sendNewsletterStatus` uploads through the newsletter path and automatically puts the returned handle into `media_id`. The supported types are text, images, videos, gifs, and audio — documents and stickers are rejected. WhatsApp Web itself only publishes images and videos, so the other two get a warning and may be rejected by the server.

<a id="dari-mana-server-id-datangnya"></a>
##### Where the Server Id Comes From

The `<ack>` that responds to a published status carries `from`, `class`, `id`, and `t` — and carries no server id at all. This is not a failure; the id arrives a moment later, in the `<status>` stanza echoed back to the publisher by the server, marked with `is_sender="true"`.

`sendNewsletterStatus` waits for that echo and then fills it, so the id you need to react or fetch your own status is in the result:

```js
const posted = await sock.sendNewsletterStatus('123456789@newsletter', {
  image: { url: 'https://example.com/drop.jpg' },
  caption: 'New release today'
})

posted.newsletterStatusServerId   // 175 — from its echo, not its ack
posted.newsletterStatusAck        // the ack itself, which never had an id
posted.newsletterStatusDelivered  // the raw <status> node the id came from

await sock.sendNewsletterStatusReaction('123456789@newsletter', posted.newsletterStatusServerId, '🔥')
```

The wait is bounded and never blocks delivery: if the echo doesn't arrive, `newsletterStatusServerId` is `undefined` and everything else remains unchanged. Configure it with `serverIdTimeoutMs`, or skip it with `resolveServerId: false` if you only care about whether it was sent.

<a id="memeriksa-apakah-channel-boleh-memposting"></a>
##### Checking Whether a Channel Can Post

WhatsApp gates channel status creation on server-provided, per-channel capabilities, not on a setting you can toggle. Check first before building a posting flow:

```js
const { canPost, canPostMusic, capabilities } = await sock.newsletterCanPostStatus('123456789@newsletter')
```

`canPost` is `CHANNEL_STATUS_PRODUCER` in its capability list. The full set of checks applied by WhatsApp Web is: the `channel_status_creation` flag is enabled, you are an admin or the owner, the channel is not suspended or terminated, and the channel has `CHANNEL_STATUS_PRODUCER`. Only the last one is visible to the client, and it’s the one that actually differs by channel — the rollout flag is off by default on Web, which is why the button isn’t there while it is on mobile.

<a id="status-pertanyaan"></a>
##### Question Status

A channel status can include a question box, and its followers answer it.

```js
await sock.sendNewsletterStatus('123456789@newsletter', {
  image: { url: './bg.jpg' },
  question: { text: 'Ask anything' }
})
```

The answer is returned as `questionResponseMessage`. Reshare one of them over a new status with `interactionType: 'question_reshare'` plus `parentServerId` and `responseServerId`; publish your own answer with `interactionType: 'question_response'` and `parentServerId`. Question statuses must sit above media—WhatsApp Web never publishes text-only ones.

<a id="membaca-status-channel"></a>
#### Reading Channel Statuses

```js
const list = await sock.getNewsletterStatuses('123456789@newsletter', { count: 20 })

for (const status of list.statuses) {
  console.log(status.serverId, status.type, status.viewsCount, status.responsesCount)
  console.log(status.adminProfile?.name)
  console.log(status.reactionCounts) // [ { code: '👍', count: 12 } ]
}
```

Look back with `{ before: serverId }` or forward with `{ after: serverId }`.

To ask only what has changed since a timestamp, use its update feed—it is sent to the channel's jid, not the server:

```js
const updates = await sock.getNewsletterStatusUpdates('123456789@newsletter', {
  count: 20,
  since: 1770000000
})
```

<a id="atribusi-status-channel"></a>
#### Channel Status Attribution

RabbitXmd Baileys opens `StatusAttribution.Type.NEWSLETTER_STATUS` with the existing channel redistribution metadata in WAProto.

```js
await sock.sendMessage('status@broadcast', {
  image: { url: 'https://example.com/status.jpg' },
  caption: 'Shared from RabbitXmd Updates',
  newsletterStatus: {
    newsletterJid: '123456789@newsletter',
    messageId: 42,
    duration: 24,
    hasMultipleReshares: false
  }
}, {
  statusJidList: audienceJids
})
```

Attribution can also be added manually.

```js
const attribution = makeNewsletterStatusAttribution({
  newsletterJid: '123456789@newsletter',
  messageId: 42
})

await sock.sendMessage('status@broadcast', {
  text: 'Status channel',
  contextInfo: {
    statusAttributions: [attribution]
  }
}, {
  statusJidList: audienceJids
})
```

<a id="siapa-yang-mengirim-pesan-channel"></a>
#### Who Sent the Channel Message

Channel messages carry the display name and photo of the admin who posted them in the `<meta>` block that used to be discarded. Now they’re decoded into `newsletterMeta`.

```js
sock.ev.on('messages.upsert', ({ messages }) => {
  for (const msg of messages) {
    if (!msg.newsletterMeta) continue
    console.log(msg.newsletterMeta.adminProfile.name)               // 'Rexx Hayanasi'
    console.log(msg.newsletterMeta.adminProfile.pictureDirectPath)
    console.log(msg.newsletterMeta.paidPartnership)                 // postingan bersponsor
    console.log(msg.newsletterMeta.aiContent)                       // self-declared AI content
    console.log(msg.newsletterMeta.editTimestamp)
  }
})
```

**There are no usernames here** — WhatsApp only provides `id`, `name`, and `picture` for channel admins. `name` is the admin profile name set by the channel owner, which is not the same as their `@username` account, and it is only present if the channel has admin profiles enabled. `pushName` falls back to that so older code that reads `msg.pushName` starts displaying the admin instead of displaying nothing.

Messages posted by the bot itself to a channel now arrive with `key.fromMe: true` (WhatsApp marks them as `is_sender`), plus `key.isNewsletterSender`. Previously, they looked like messages from someone else, so the bot could reply to its own channel posts.

<a id="pertanyaan"></a>
### Questions

<a id="jawaban-pertanyaan"></a>
#### Question Answers

Answers to channel questions, along with the followers behind each one.

```js
const { responses } = await sock.newsletterQuestionResponses('123456789@newsletter', 175, {
  count: 50,
  filter: 'starred',
  searchText: 'harga'
})

for (const r of responses) {
  console.log(r.sender.notifyName, r.sender.lid)
  console.log(r.message?.conversation)
  console.log(r.starred, r.replied)
}
```

`filter` accepts `contacts`, `replied`, or `starred`; `searchText` searches in the answer; `before` searches backward.

<a id="menyembunyikan-jawaban-pertanyaan"></a>
#### Hiding a Question’s Answer

Moderates a follower’s answer to a channel question.

```js
await sock.newsletterQuestionResponseState('123456789@newsletter', questionServerId, responseServerId, 'HIDDEN')
await sock.newsletterQuestionResponseState('123456789@newsletter', questionServerId, responseServerId, 'VISIBLE')
```

---

<a id="admin"></a>
### Admin

<a id="kemampuan-admin"></a>
#### Admin Capabilities

Which channel features the server has enabled for you. This is the gate that WhatsApp Web itself checks before offering a feature.

```js
const capabilities = await sock.newsletterAdminCapabilities('123456789@newsletter')
console.log(capabilities)
// [ 'INSIGHTS', 'ADMIN_NOTIFICATIONS', 'PHOTO_POLLS', 'QUESTIONS', 'QUIZ', 'THREAD_MENU' ]
```

You need admin or owner rights in the channel; other channels reply `Not Authorized`.

<a id="profil-admin"></a>
#### Admin Profile

Channel admins can set their own name and photo, which appear with every update they post, so followers can see who authored it, not just which channel it came from. WhatsApp calls its channel-level toggle **Show admin profile**.

Three parts of this can be read from the library:

```js
const info = await sock.newsletterAdminInfo('123456789@newsletter')
// {
//   id: '123456789@newsletter',
//   adminCount: 3,
//   adminProfile: { id, name, picture: { id, directPath } },
//   adminProfilesEnabled: true
// }

const caps = await sock.newsletterAdminCapabilities('123456789@newsletter')
caps.includes('ADMIN_PROFILE')   // whether WhatsApp has given this feature to its channel
```

Incoming updates now include the admin who posted in `newsletterMeta`, and the library also surfaces change notifications directly:

```js
sock.ev.on('newsletter-admin-profile.update', ({ id, adminProfile }) => {
  console.log(id, adminProfile)
  // { id, name, pictureId, pictureDirectPath } — or null if an admin removed theirs
})
```

Setting your own admin name or photo is **not possible from any client API**. WhatsApp Web has only ever *received* admin profiles: there is no mutation for that, `newsletterUpdate` only accepts name, description, photo, and reaction settings, and the "Show admin profile" toggle in the Web UI is rendered without a handler. It is set from the phone, and only in channels that have the `ADMIN_PROFILE` capability.

<a id="undangan-admin"></a>
#### Admin Invitations

```js
await sock.newsletterCreateAdminInvite('123456789@newsletter', '6281234567890@s.whatsapp.net')
await sock.newsletterRevokeAdminInvite('123456789@newsletter', '6281234567890@s.whatsapp.net')
await sock.newsletterAcceptAdminInvite('123456789@newsletter')
```

<a id="undangan-admin-yang-menggantung"></a>
#### Pending Admin Invitations

```js
const pending = await sock.newsletterPendingAdminInvites('123456789@newsletter')
// [ { id: '628xxxxxxxxx@s.whatsapp.net', phoneNumber: '628xxxxxxxxx' } ]
```

<a id="mencari-channel"></a>
### Searching for Channels

<a id="penemuan"></a>
#### Discovery

```js
const recommended = await sock.newsletterRecommended({ limit: 20, countryCodes: ['ID'] })
const similar = await sock.newsletterSimilar('123456789@newsletter', { limit: 20 })
```

<a id="direktori"></a>
#### Directory

Channel discovery, the same query used by the Updates tab. The categories are `BUSINESS`, `ENTERTAINMENT`, `LIFESTYLE`, `NEWS`, `ORGANIZATIONS`, `PEOPLE`, `SPORTS`, and `SPECIAL_EVENTS` through `SPECIAL_EVENTS_5`.

```js
const list = await sock.newsletterDirectoryList({
  view: 'RECOMMENDED',        // RECOMMENDED | NEW | POPULAR | FEATURED | TRENDING
  categories: ['NEWS'],
  countryCodes: ['ID'],
  limit: 20
})

const found = await sock.newsletterDirectorySearch('RabbitXmd', { limit: 20 })
const preview = await sock.newsletterDirectoryCategories({ categories: ['NEWS'], countryCode: 'ID' })
```

<a id="penindakan"></a>
### Enforcement

<a id="penindakan-dan-banding"></a>
#### Enforcement and Appeals

If a channel feature disappears without warning — admin profile settings, the status ring, posting ability — the cause is often enforcement action against the channel, not a rollout that hasn’t reached it yet. This shows what WhatsApp is restricting for it.

```js
const enf = await sock.newsletterEnforcements('123456789@newsletter')

console.log(enf.suspensions)
console.log(enf.adminProfiles)            // enforcement targeting the admin profile feature
console.log(enf.profilePictureDeletions)
console.log(enf.violatingMessages)
console.log(enf.geoSuspensions)
```

Each entry has the same structure:

```js
{
  enforcementId: '...',
  createdAt: 1770000000,
  violationCategory: 'GENERIC_VIOLATION',
  source: '...',
  appealState: '...',
  appealCreatedAt: undefined,
  appealReasonOptions: [ { reason: 'RM_COPS', label: 'Saya pemegang haknya' } ],
  appealFormUrl: 'https://...',
  policy: { headline, subtitle, overview, explanation, adminDisclaimer }
}
```

`appealReasonOptions` and `appealFormUrl` are the appeal paths offered by WhatsApp itself—there’s no other way to ask for a decision to be reviewed. An empty result in every bucket means the channel is clean, and anything missing is due to rollout, not a penalty.

The report you submitted, and appealing its result:

```js
const reports = await sock.newsletterReports()
await sock.newsletterAppealReport(reports[0].report_id, 'RESPONSE_VIOLATES_GUIDELINES')
```

<a id="readme-section-27"></a>
<a id="-username--info"></a>
<a id="-username-info"></a>
## 🪪 Username & Info

WhatsApp Web moved usernames and Info text to MEX queries. This calls the same persisted query used by the Web client.

<a id="username"></a>
### Username

```js
const current = await sock.getUsername()
console.log(current) // { username: 'RabbitXmd', state: 'ACTIVE', pin: '1234' }

await sock.setUsername('RabbitXmd')
await sock.setUsernamePin('1234')
await sock.removeUsernamePin()
await sock.removeUsername()
```

Check a name before claiming it:

```js
const { available, suggestions } = await sock.checkUsernameAvailability('RabbitXmd')
```

`setUsername` produces `true` only if the server responds with `SUCCESS`. `state` is either `ACTIVE` or `RESERVED`; provide `{ reserved: true }` when claiming a reserved name.

<a id="aturan-username"></a>
#### Username Rules

`setUsername` and `checkUsernameAvailability` reject invalid names locally before they reach the server, so you get the reason instead of a generic failure. The rules are read directly from the Web client:

| Rule | Error |
|---|---|
| Only `a-z`, `A-Z`, `0-9`, `_`, `.` | `INVALID_CHARACTER` |
| 3 to 35 characters | `INVALID_LENGTH` |
| At least one letter | `INVALID_NO_LETTERS` |
| Cannot start or end with `.`, no `..` | `INVALID_PERIODS` |
| Cannot start with `www.` | `INVALID_WWW_PREFIX` |
| Cannot end with `.com .org .net .int .edu .gov .mil .arpa .html .htm .txt .xml` | `INVALID_DOMAIN_SUFFIX` |
| Cannot contain `whatsapp`, `instagram`, `facebook`, `oculus` | `INVALID_WORD` |

The PIN is exactly four digits.

Validate without calling the server:

```js
import { validateUsername, isUsernamePin, displayUsername } from '@whiskeysockets/baileys'

validateUsername('rexx.hayanasi')  // { isValid: true }
validateUsername('rexx.com')       // { isValid: false, errorType: 'INVALID_DOMAIN_SUFFIX' }
isUsernamePin('1234')              // true
displayUsername('rexx')            // '@rexx'
```

`@` at the beginning is stripped for you, so `setUsername('@RabbitXmd')` and `setUsername('RabbitXmd')` are the same call.

<a id="info--status-teks"></a>
<a id="info-status-teks"></a>
### Text Info / Status

```js
await sock.updateTextStatus('Sedang bikin bot', { emoji: '🤖', ephemeralDurationSec: 0 })

const mine = await sock.fetchTextStatus(['6281234567890@s.whatsapp.net'])
const about = await sock.fetchAbout('6281234567890@s.whatsapp.net')
console.log(about.status)
```

`updateTextStatus()` without text will delete it. `fetchTextStatus` accepts one or more JIDs and responds for each JID with text, emoji, last update time, and its ephemeral duration. `fetchAbout` reads a user's Info via `xwa2_users_updates_since`.

The classic IQ `updateProfileStatus` still works and is untouched.

<a id="pemberitahuan-ketentuan-layanan"></a>
### Terms of Service Notices

WhatsApp gates some features behind notices that users must pass through. This reads the notice list and reports progress, using the same IQ as the Web client.

```js
const notices = await sock.fetchUserNotices()
// [ { id: '20601216', stage: '2', t: '...', version: '...', type: '...' } ]

await sock.updateUserNoticeStage('20601216', 5)
```

`stage` is the server-owned counter for that notification—read the current value from `fetchUserNotices` before advancing it.

<a id="daftar-opt-out-pemasaran"></a>
### Marketing Opt-Out List

```js
const list = await sock.fetchOptOutList({ category: 'marketing' })

await sock.updateOptOut({
  jid: '6281234567890@s.whatsapp.net',
  category: 'marketing',
  action: 'add',
  reason: 'user_request'
})
```

<a id="pengaturan-push"></a>
### Push Settings

```js
const settings = await sock.fetchPushSettings()
```

<a id="link-preview-dari-sisi-server"></a>
### Server-Side Link Preview

Let WhatsApp generate the preview instead of scraping the page yourself.

```js
const preview = await sock.fetchServerLinkPreview('https://example.com')
// { direct_path, hash, title, description, preview_type, thumb_data, width, height }
```

---

<a id="readme-section-28"></a>
<a id="-pengelolaan-grup"></a>
## 👥 Group Management

<a id="membuat-grup"></a>
### Creating a Group

```js
const group = await sock.groupCreate(
  'RabbitXmd Community',
  [
    '6281234567890@s.whatsapp.net',
    '6289876543210@s.whatsapp.net'
  ]
)

console.log(group.id)
```

<a id="menambah-anggota"></a>
### Adding Members

```js
await sock.groupParticipantsUpdate(
  groupJid,
  ['6281234567890@s.whatsapp.net'],
  'add'
)
```

<a id="mengeluarkan-anggota"></a>
### Removing Members

```js
await sock.groupParticipantsUpdate(
  groupJid,
  ['6281234567890@s.whatsapp.net'],
  'remove'
)
```

<a id="promote--demote"></a>
<a id="promote-demote"></a>
### Promote / Demote

```js
await sock.groupParticipantsUpdate(groupJid, [userJid], 'promote')
await sock.groupParticipantsUpdate(groupJid, [userJid], 'demote')
```

<a id="mengubah-deskripsi-grup"></a>
### Changing the Group Description

```js
await sock.groupUpdateDescription(
  groupJid,
  'Welcome to the RabbitXmd Community 💜'
)
```

<a id="subjek-dan-pengaturan"></a>
### Subject and Settings

```js
await sock.groupUpdateSubject(groupJid, 'New name')
await sock.groupSettingUpdate(groupJid, 'announcement')
```

`groupSettingUpdate` accepts one of `announcement` (only admins can send), `not_announcement`, `locked` (only admins can edit group info), or `unlocked`.

<a id="siapa-yang-boleh-masuk-dan-siapa-yang-boleh-menambah"></a>
### Who Can Join and Who Can Add

```js
await sock.groupMemberAddMode(groupJid, 'admin_add')
await sock.groupJoinApprovalMode(groupJid, 'on')
```

`groupMemberAddMode` is set to `admin_add` or `all_member_add`. `groupJoinApprovalMode` is set to `on` or `off`; when enabled, people using the invite link land in the request queue instead of going directly to the group.

<a id="toggle-riwayat-grup"></a>
### Group History Toggle

The latest WA Web revision adds the app-state action `groupHistoryToggleAction` (whether old message history is shared with new members). In this revision, WhatsApp Web only has the **receiving** side — there’s no sending flow yet — so the fork decodes it and forwards it through the `groups.update` event:

```js
import { GroupHistoryToggleMode } from '@whiskeysockets/baileys'
// GroupHistoryToggleMode = { DEFAULT: 0, ON: 1, OFF: 2 }

sock.ev.on('groups.update', ([update]) => {
  if (update.groupHistoryToggleMode !== undefined) {
    console.log(update.id, GroupHistoryToggleMode[update.groupHistoryToggleMode])
  }
})
```

When you (or another linked device) change this setting, the action is synced and the bot receives `{ id, groupHistoryToggleMode }`. A dedicated setter will be added once WA Web releases its send path, so the app-state index is guaranteed to be correct and the hash is not corrupted.

<a id="antrean-permintaan-masuk"></a>
### Incoming Request Queue

```js
const pending = await sock.groupRequestParticipantsList(groupJid)
await sock.groupRequestParticipantsUpdate(groupJid, [userJid], 'approve')
await sock.groupRequestParticipantsUpdate(groupJid, [userJid], 'reject')
```

<a id="link-undangan"></a>
### Invitation Link

```js
const code = await sock.groupInviteCode(groupJid)
console.log('https://chat.whatsapp.com/' + code)

const fresh = await sock.groupRevokeInvite(groupJid)

const preview = await sock.groupGetInviteInfo(code)
await sock.groupAcceptInvite(code)
```

`groupGetInviteInfo` reads the group behind a code without joining it. There’s also a pair of direct invitations — `groupRevokeInviteV4(groupJid, invitedJid)` and `groupAcceptInviteV4` — for invitations sent to one person rather than as a link.

<a id="pesan-sementara"></a>
### Temporary Messages

```js
await sock.groupToggleEphemeral(groupJid, 7 * 24 * 60 * 60)
await sock.groupToggleEphemeral(groupJid, 0)
```

The duration is in seconds; `0` disables it. WhatsApp’s own options are 24 hours, 7 days, and 90 days.

<a id="membaca-grup"></a>
### Reading Groups

```js
const metadata = await sock.groupMetadata(groupJid)
const all = await sock.groupFetchAllParticipating()

await sock.groupLeave(groupJid)
```

`groupFetchAllParticipating` returns all groups you belong to, keyed by jid. It’s one request for everything, so choose this instead of calling `groupMetadata` in a loop.

---

<a id="readme-section-29"></a>
<a id="-komunitas"></a>
## 🏘️ Communities

A community is a parent that owns groups. Each method mirrors its group counterpart, plus linking calls that have no group equivalent.

<a id="membuat-dan-menautkan"></a>
### Creating and Linking

```js
const community = await sock.communityCreate('RabbitXmd Community', 'What this community is for')

const group = await sock.communityCreateGroup('Pengumuman', [userJid], community.id)

await sock.communityLinkGroup(existingGroupJid, community.id)
await sock.communityUnlinkGroup(existingGroupJid, community.id)

const linked = await sock.communityFetchLinkedGroups(community.id)
```

`communityCreateGroup` creates a group that is already linked to its community. `communityLinkGroup` links an existing group — you must be an admin in both.

<a id="anggota-dan-pengaturan"></a>
### Members and Settings

```js
await sock.communityParticipantsUpdate(communityJid, [userJid], 'promote')
await sock.communityUpdateSubject(communityJid, 'New name')
await sock.communityUpdateDescription(communityJid, 'New description')
await sock.communitySettingUpdate(communityJid, 'announcement')
await sock.communityMemberAddMode(communityJid, 'admin_add')
await sock.communityJoinApprovalMode(communityJid, 'on')
await sock.communityToggleEphemeral(communityJid, 7 * 24 * 60 * 60)
```

Actions and their values are the same as those in the group above.

<a id="undangan-dan-pembacaan"></a>
### Invitations and Reading

```js
const code = await sock.communityInviteCode(communityJid)
await sock.communityRevokeInvite(communityJid)
await sock.communityAcceptInvite(code)
const preview = await sock.communityGetInviteInfo(code)

const metadata = await sock.communityMetadata(communityJid)
const all = await sock.communityFetchAllParticipating()
await sock.communityLeave(communityJid)
```

---

<a id="readme-section-30"></a>
<a id="-pengaturan-privasi"></a>
## 🔒 Privacy Settings

```js
const settings = await sock.fetchPrivacySettings(true)
```

Provide `true` to bypass its cache. Each setting has its own modifier, and its value is sent to the server unchanged — unknown values are rejected there, not here:

| Call | Accepts |
|---|---|
| `updateLastSeenPrivacy(value)` | `all`, `contacts`, `contact_blacklist`, `none` |
| `updateOnlinePrivacy(value)` | `all`, `match_last_seen` |
| `updateProfilePicturePrivacy(value)` | `all`, `contacts`, `contact_blacklist`, `none` |
| `updateStatusPrivacy(value)` | `all`, `contacts`, `contact_blacklist`, `none` |
| `updateReadReceiptsPrivacy(value)` | `all`, `none` |
| `updateGroupsAddPrivacy(value)` | `all`, `contacts`, `contact_blacklist` |
| `updateCallPrivacy(value)` | `all`, `known` |
| `updateMessagesPrivacy(value)` | `all`, `contacts` |
| `updateDisableLinkPreviewsPrivacy(disabled)` | a boolean |

```js
await sock.updateLastSeenPrivacy('contacts')
await sock.updateOnlinePrivacy('match_last_seen')
await sock.updateDisableLinkPreviewsPrivacy(true)
```

<a id="pesan-sementara-bawaan"></a>
### Default Temporary Message

```js
await sock.updateDefaultDisappearingMode(7 * 24 * 60 * 60)
const durations = await sock.fetchDisappearingDuration(jidA, jidB)
```

By default, this applies to new chats. `fetchDisappearingDuration` accepts any number of JIDs and reports each one's settings.

<a id="pemblokiran"></a>
### Blocking

```js
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')
const blocked = await sock.fetchBlocklist()
```

<a id="melaporkan-spam"></a>
### Reporting Spam

```js
import { SPAM_FLOWS } from '@whiskeysockets/baileys'

const laporan = await sock.reportSpam(jid)
// { jid: '628xxxx@s.whatsapp.net', flow: 'overflow_menu_report', reported: true, node }

await sock.reportSpam(groupJid, {
    flow: SPAM_FLOWS.GroupInfoReport,
    source: senderJid
})
```

`reportSpam` submits a chat-level report, the same kind WhatsApp Web sends when you report a contact or group without selecting a specific message. `flow` tells the server where the report came from and its payload `SPAM_FLOWS.OverflowMenuReport`; `SPAM_FLOWS` carries the value used by WhatsApp Web itself. `source` names the reported member within the group, `subject` carries the entity’s name, and `isKnownChat` states whether you already know the chat. Reporting a specific message is not covered — that requires a franking tag derived by the client when it receives the message.

It returns the jid and flow that were **actually sent** — not the ones you passed in: the device suffix is stripped from the contact jid, and `flow` is filled with its payload if you don’t specify one. If the server responds with `<error>`, the call throws `Boom` with the code from the server and `data` containing `jid`, `flow`, and `text` as its reason. Until version `1.3.10`, this function always `resolve` to `undefined`, so rejected reports could not be distinguished from accepted ones.

---

<a id="readme-section-31"></a>
<a id="-semua-jenis-pesan"></a>
## 📨 All Message Types

`message.message` is a box with exactly one key filled in, and that key
names the type. There are **115** of them. Two things trip up almost everyone
starting out, so read this section before hunting for bugs that aren’t there.

<a id="kenapa-conversation-kadang-kosong"></a>
### Why is `conversation` sometimes empty

**31 of 115 are wrappers.** They don’t carry content of their own — they hold
another message inside them. That view-once photo isn’t `imageMessage`, but
`viewOnceMessageV2` containing `imageMessage`. That group status reply is
`groupStatusMessageV2` containing whatever was actually said. Read its outer key
and you find nothing:

```js
const m = messages[0]
console.log(m.message.conversation)          // undefined
console.log(Object.keys(m.message))          // [ 'groupStatusMessageV2' ]
```

`normalizeMessageContent` unwraps it for you, up to five layers, because the wrappers are nested — an edited view-once photo inside a temporary chat has three wrappers stacked:

```js
import { normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

const content = normalizeMessageContent(m.message)
const type = getContentType(content)        // 'imageMessage'
const text = content?.conversation || content?.extendedTextMessage?.text
```

Always normalize before you look at it. Here’s the complete list of wrappers, so
you recognize them when you encounter them:

| Group | Wrappers |
|---|---|
| Ephemeral and view-once | `ephemeralMessage`, `viewOnceMessage`, `viewOnceMessageV2`, `viewOnceMessageV2Extension`, `limitSharingMessage` |
| Edits and replies | `editedMessage`, `associatedChildMessage`, `questionMessage`, `questionReplyMessage` |
| Status | `statusMentionMessage`, `statusAddYours`, `groupStatusMessage`, `groupStatusMessageV2`, `groupStatusMentionMessage` |
| Group | `groupMentionedMessage` |
| Bot | `botInvokeMessage`, `botTaskMessage`, `botForwardedMessage`, `botPlatformRegistrationSuccessMessage` |
| Channel | `newsletterAdminProfileMessage`, `newsletterAdminProfileMessageV2`, `newsletterAdminProfileStatusMessage`, `newsletterScheduledMessage` |
| Polling and media | `pollCreationMessageV4`, `pollCreationOptionImageMessage`, `documentWithCaptionMessage`, `lottieStickerMessage`, `audioStickerMessage`, `eventCoverImage`, `spoilerMessage` |
| Settings | `acp2SettingMessage` |

The list is kept honest by `npm run verify:proto`: it reads every
`FutureProofMessage` field from the live WhatsApp Web bundle and fails if
`normalizeMessageContent` would leave any of them wrapped.
That check caught `acp2SettingMessage` and `audioStickerMessage`
— both had been sitting in the protocol unopened for a long time, so a bot that received
either one would see only an opaque key and an empty `conversation`.

`audioStickerMessage` (field 134) comes with one sibling,
`stickerMessage.audioMessage` (field 26, inside the new oneof `audio`): a sticker
that carries an audio clip. Both can be decoded, and neither is rendered yet —
WhatsApp Web maps `audioStickerMessage` to no message type at all, and the sticker
parser does not read `audioMessage` back out. Treat both as fields to recognize
when they start arriving, not to send.

<a id="84-sisanya"></a>
### The remaining 84

These carry the content. You’ll use a handful constantly and never touch the
rest, but knowing they exist saves you from thinking a message is malformed
when it’s just a type you haven’t encountered before.

| Group | Types |
|---|---|
| Text and location | `conversation`, `extendedTextMessage`, `locationMessage`, `liveLocationMessage`, `contactMessage`, `contactsArrayMessage`, `groupInviteMessage`, `albumMessage`, `musicMessage`, `conditionalRevealMessage` |
| Media | `imageMessage`, `videoMessage`, `audioMessage`, `documentMessage`, `stickerMessage`, `stickerPackMessage`, `stickerSyncRmrMessage`, `ptvMessage` |
| Legacy | `chat` |
| Buttons and lists | `buttonsMessage`, `buttonsResponseMessage`, `listMessage`, `listResponseMessage`, `templateMessage`, `templateButtonReplyMessage`, `interactiveMessage`, `interactiveResponseMessage`, `highlyStructuredMessage` |
| Polls and events | `pollCreationMessage` … `pollCreationMessageV6`, `pollUpdateMessage`, `pollAddOptionMessage`, `pollResultSnapshotMessage`, `pollResultSnapshotMessageV3`, `eventMessage`, `eventInviteMessage`, `questionResponseMessage`, `keepInChatMessage` |
| Status | `statusNotificationMessage`, `statusQuestionAnswerMessage`, `statusQuotedMessage`, `statusStickerInteractionMessage`, `statusLinkPreviewMetadata` |
| Channel | `newsletterFollowerInviteMessage`, `newsletterFollowerInviteMessageV2`, `newsletterAdminInviteMessage` |
| Calls | `call`, `bcallMessage`, `callLogMesssage`, `scheduledCallCreationMessage`, `scheduledCallEditMessage` |
| Payments and store | `sendPaymentMessage`, `requestPaymentMessage`, `declinePaymentRequestMessage`, `cancelPaymentRequestMessage`, `paymentInviteMessage`, `paymentReminderMessage`, `splitPaymentMessage`, `splitPaymentUpdateMessage`, `productMessage`, `orderMessage`, `invoiceMessage` |
| Reactions and comments | `reactionMessage`, `encReactionMessage`, `commentMessage`, `encCommentMessage`, `pinInChatMessage`, `encEventResponseMessage` |
| Bots and AI | `richResponseMessage`, `placeholderMessage` |
| Protocol and synchronization | `protocolMessage`, `deviceSentMessage`, `senderKeyDistributionMessage`, `fastRatchetKeySenderKeyDistributionMessage`, `messageContextInfo`, `messageHistoryBundle`, `messageHistoryNotice`, `secretEncryptedMessage`, `requestPhoneNumberMessage`, `groupRootKeyShare`, `rootSecretDistributeMessage` |

`protocolMessage` merit special mention: deletions, edits, disappearing-message timer changes, and app-state synchronization all arrive as this single type, distinguished by its `type`. A bot that ignores it will appear never to notice when a message is deleted.

<a id="membaca-pesan-rich"></a>
### Reading rich messages

Messages from other bots — AI Rich, A2UI, Bloks — leave `conversation` empty and `getContentType` only reports the wrapper. `readRichMessage` normalizes them all into one form; see [Reading Rich Messages](#membaca-balik-pesan-rich).

---

<a id="readme-section-32"></a>
<a id="-presence-dan-tanda-dibaca"></a>
## 👀 Presence and Read Receipts

```js
await sock.presenceSubscribe(jid)

await sock.sendPresenceUpdate('composing', jid)
await sock.sendPresenceUpdate('recording', jid)
await sock.sendPresenceUpdate('paused', jid)

await sock.sendPresenceUpdate('available')
await sock.sendPresenceUpdate('unavailable')
```

You only receive someone's presence after `presenceSubscribe` on their JID. `available` and `unavailable` are your own global states and don't accept a JID; the rest are per-chat typing indicators. `recording` is sent over the wire as `composing` with `media: audio`, and that's what produces "recording audio…".

<a id="menandai-sudah-dibaca"></a>
### Marking as Read

```js
await sock.readMessages([msg.key])

await sock.sendReceipt(jid, participant, [messageId], 'read')
await sock.sendReceipts([msg.key], 'read')
```

`readMessages` that you should use. `sendReceipt` and `sendReceipts` are lower-level layers beneath it, with their receipt types explicitly named — `read`, `read-self`, `played`, or `undefined` for ordinary sent receipts.

<a id="memeriksa-nomor"></a>
### Checking Numbers

```js
const results = await sock.onWhatsApp('6281234567890', '6289876543210')
for (const entry of results) {
  console.log(entry.jid, entry.exists)
}
```

<a id="cari-lewat-username"></a>
#### Search by username

`onWhatsApp` only accepts phone numbers. To resolve **`@username` → JID** (start a chat via username), use `onWhatsAppUsername`:

```js
const found = await sock.onWhatsAppUsername('@RabbitXmd', 'namalain')
for (const entry of found) {
  console.log(entry.jid, entry.exists)
}

const withPin = await sock.onWhatsAppUsername({ username: 'RabbitXmd', pin: '1234' })
```

Accept one or many usernames at once: plain strings, or an `{ username, pin }` object if the username is PIN-protected. Returns `[{ jid, exists }]` — `jid` is the JID resolved by the server. Under the hood, this is a USync query using protocol `contact` with the `username`/`pin` attributes (the same node shape used by the official client), and the JID is read from the `jid` reply node.

The reverse direction — **JID → `@username`** — uses `getUsernames`:

```js
const names = await sock.getUsernames('628123@s.whatsapp.net', '234256710246613@lid')
for (const entry of names) {
  console.log(entry.jid, entry.username)
}
```

Accepts one or more JIDs. Returns `[{ jid, username }]` only for JIDs that actually have a public username. Under the hood, this is a USync query protocol `username` (`usync_username`); the username is read from the contents of the `<username>` node in the response.

---

<a id="readme-section-33"></a>
<a id="-keadaan-chat"></a>
## 🗂️ Chat State

`chatModify` writes to app state, so a single change is synced to the phone and every other linked device.

```js
await sock.chatModify({ archive: true, lastMessages: [msg] }, jid)
await sock.chatModify({ pin: true }, jid)
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid)
await sock.chatModify({ mute: null }, jid)
await sock.chatModify({ markRead: false, lastMessages: [msg] }, jid)
await sock.chatModify({ star: { messages: [{ id: msg.key.id, fromMe: msg.key.fromMe }], star: true } }, jid)
await sock.chatModify({ clear: true, lastMessages: [msg] }, jid)
await sock.chatModify({ delete: true, lastMessages: [msg] }, jid)
await sock.chatModify({ contact: { fullName: 'RabbitXmd' } }, jid)
```

`mute` is the duration in milliseconds, and `null` cancels the mute. Some of them require `lastMessages` — the server uses it to place the change on its chat timeline, and throws an error without it.

<a id="riwayat-dan-sinkronisasi-ulang"></a>
### History and Resynchronization

```js
await sock.fetchMessageHistory(50, oldestMsgKey, oldestMsgTimestamp)
await sock.requestPlaceholderResend(messageKey)
await sock.resyncAppState(['regular_high'], false)
```

`fetchMessageHistory` requests messages older than the key you provided from the phone; they arrive via `messaging-history.set`. `requestPlaceholderResend` requests one more message if it arrives as a placeholder.

---

<a id="readme-section-34"></a>
<a id="-label"></a>
## 🏷️ Label

Labels are a WhatsApp Business feature.

```js
await sock.addLabel(jid, { id: '1', name: 'Pelanggan', color: 0, deleted: false })

await sock.addChatLabel(jid, labelId)
await sock.removeChatLabel(jid, labelId)

await sock.addMessageLabel(jid, messageId, labelId)
await sock.removeMessageLabel(jid, messageId, labelId)
```

---

<a id="readme-section-35"></a>
<a id="-bisnis-dan-katalog"></a>
## 🛍️ Business and Catalog

```js
const profile = await sock.getBusinessProfile(jid)
await sock.updateBusinessProfile({ description: 'RabbitXmd Store', address: 'Jakarta', email: 'hello@example.com' })

const catalog = await sock.getCatalog({ jid, limit: 10 })
const collections = await sock.getCollections(jid, 51)
const order = await sock.getOrderDetails(orderId, tokenBase64)
```

`updateBusinessProfile` is also exported with its original misspelling, `updateBussinesProfile`; both are the same function.

<a id="mengelola-produk"></a>
### Managing Products

```js
const created = await sock.productCreate({
  name: 'Paket Stiker RabbitXmd',
  description: 'A sticker pack',
  price: 15000,
  currency: 'IDR',
  isHidden: false,
  images: [{ url: 'https://example.com/product.jpg' }]
})

await sock.productUpdate(created.id, { price: 20000 })
await sock.productDelete([created.id])
```

<a id="profil-dan-balasan-cepat"></a>
### Profile and Quick Replies

```js
await sock.updateProfileName('RabbitXmd')
await sock.updateCoverPhoto(buffer)
await sock.addOrEditQuickReply({ shortcut: 'hi', message: 'Hello!', keywords: ['hello'] })

await sock.addOrEditContact(jid, { fullName: 'RabbitXmd' })
await sock.removeContact(jid)
```

`removeContact` is `chatModify({ contact: null })` with a friendlier name, so it syncs to your phone just like other contact edits.

<a id="mengambil-ulang-media-kedaluwarsa"></a>
### Retrieving Expired Media

```js
const refreshed = await sock.updateMediaMessage(msg)
```

WhatsApp media URL expired. If a download fails for an old message, this requests a new `directPath` from the sender’s device and returns the message with that field filled in — then download again.

<a id="label-anggota-grup"></a>
### Group Member Labels

```js
await sock.updateMemberLabel(groupJid, 'Bendahara')
// { jid: '12345-67890@g.us', label: 'Bendahara', messageId: '3EB0...' }

await sock.removeMemberLabel(groupJid)
```

This label is **your own in that group** — in the app, the button says "Add your member tag". You can’t set a label for another member; you can only set your own label, and other members set theirs.

The message sent is a protocol message `GROUP_MEMBER_LABEL_CHANGE` (type 30) containing `memberLabel: { label, labelTimestamp }`, accompanied by one `<meta appdata="member_tag">` node. `tag_reason` in that node depends on the label’s contents: `user_update` when setting it, `user_delete` when clearing it — both are the names used by the official client, and `removeMemberLabel` is just a shortcut for an empty label.

| Rule | Behavior |
| --- | --- |
| jid is not a group | throws `Boom` 400; it is not sent to the server |
| label exceeds `MEMBER_LABEL_MAX_LENGTH` (30) | truncated, not rejected |
| label is empty, `null`, or no argument is provided | clears the label, `tag_reason: 'user_delete'` |

Labels for other members arrive through events, not queries:

```js
sock.ev.on('group.member-tag.update', ({ groupId, participant, label }) => {
  console.log(participant, 'di', groupId, 'sekarang', label)
})
```

---

<a id="readme-section-36"></a>
<a id="-panggilan"></a>
## 📞 Calls

```js
import { CALL_AUDIO_PREFIX, CALL_VIDEO_PREFIX } from '@whiskeysockets/baileys'

const token = await sock.createCallLink('video')
console.log(CALL_VIDEO_PREFIX + token)

const scheduled = await sock.createCallLink('audio', { startTime: Math.floor(Date.now() / 1000) + 3600 })
console.log(CALL_AUDIO_PREFIX + scheduled)

await sock.rejectCall(callId, callFrom)
```

`createCallLink` accepts `audio` or `video` and returns only its token. Both prefixes are exported because they differ from the media names — the video link is under `/video/` while the audio link is under `/voice/`. Provide `event` with `startTime` in Unix seconds to schedule the call instead of opening it now.

<a id="melakukan-panggilan-suara"></a>
### Making Voice Calls

Its VoIP stack runs the WhatsApp Web calling engine in the same process and uses **the socket you’re already logged in with**. There’s no second pairing and no second QR code: pair once, and the same session makes the call.

```js
import { makeVoipClient } from '@whiskeysockets/baileys'

sock.ev.on('connection.update', async ({ connection }) => {
    if (connection !== 'open') {
        return
    }

    const voip = await makeVoipClient(sock)
    const call = await voip.call('628123456789', {
        durationMs: 60000,
        audioSource: './hello.mp3'
    })

    call.on('ringing', () => console.log('berdering'))
    call.on('connected', () => console.log('dijawab'))
    call.on('ended', reason => console.log('berakhir:', reason))

    await call.waitForEnd()
})
```

`audioSource` can be anything ffmpeg can read—a file, URL, or `lavfi:sine=frequency=440` for a tone. Omit it and the call carries silence. `durationMs` closes on its own; pass `0` to stay connected until someone hangs up. `call.mute(true)` and `call.end()` do what their names say, and `call.on('audio', pcm)` hands back audio from the far end as mono 16 kHz `Float32Array` frames.

The audio is Opus at 16 kHz wideband. 48 kHz requires a native audio device hook that this pure-JS WASM build doesn’t have.

When its socket reconnects, hand over the new socket rather than building a second client:

```js
const voip = await makeVoipClient(sock)

sock.ev.on('connection.update', async ({ connection }) => {
    if (connection === 'open') {
        await voip.attach(sock)
    }
})
```

<a id="memainkan-antrean-audio"></a>
### Playing the Audio Queue

Each call receives a playlist, and the queue drives the call, not the other way around: play one track, hang up when it finishes; or play one, wait while the next track is being searched for, play that one, then hang up.

```js
const call = await voip.call('628123456789', {
    playlist: ['satu.mp3'],
    durationMs: 0
})
```

One song, then the call ends on its own — `endWhenQueueEmpty` is enabled by default, and `durationMs: 0` removes its hard timeout.

For queues where the next song still needs to be found, give the pause a tolerance window and let it fill in temporarily while keeping the call connected:

```js
const call = await voip.call('628123456789', {
    playlist: [await findTrack('lagu pertama')],
    idleGraceMs: 30000,
    durationMs: 0
})

call.on('track', track => console.log('memutar', track))
call.on('trackend', track => console.log('selesai', track))

call.on('idle', async () => {
    const next = await findTrack(queue.shift())
    if (next) {
        call.enqueue(next)
    }
})

await call.waitForEnd()
```

`idle` is emitted when the queue is empty. Anything queued before its tolerance window closes cancels the call closing and starts playing immediately; otherwise, the call ends. Set `endWhenQueueEmpty: false` to stay in the call indefinitely and close it yourself.

`enqueue` also accepts an array, `skip()` discards the currently playing track, `play()` replaces the queue with a single track immediately, and `queued()` and `nowPlaying()` report what remains and what is currently playing. Audio still buffered from a track that has finished playing drains completely before the next one starts, so a track is never cut off at the end because the queue advanced.

<a id="panggilan-video"></a>
### Video Calls

Both one-on-one and group calls support video. Frames come from ffmpeg just like audio, so video sources can be files, URLs, still images, or `lavfi:` generators.

```js
const call = await voip.call('628123456789', {
    video: true,
    videoPlaylist: ['klip.mp4'],
    playlist: ['lagu.mp3'],
    durationMs: 0
})

call.on('videotrack', track => console.log('sekarang menampilkan', track))
```

```js
const call = await voip.callGroup('12345-67890@g.us', {
    video: true,
    videoPlaylist: ['klip.mp4']
})
```

Video has its own queue, separate from the audio queue: `playVideo`, `enqueueVideo`, `skipVideo`, `queuedVideo`, and `nowPlayingVideo`, with events `videotrack` and `videotrackend`. The call termination rules remain tied to the audio queue, so the call ends when the audio runs out, not when the images do.

Still images are repeated continuously rather than displayed as a single frame, making them an easy way to send a static card:

```js
await voip.call('628123456789', { video: true, videoSource: './poster.jpg', playlist: ['lagu.mp3'] })
```

The engine selects a resolution and frame rate when the call connects, and the feed scales to fit, adding padding to preserve the aspect ratio. Frames are sent as I420 directly to the WASM encoder — there’s no WebCodecs in Node, so the browser’s encoding path isn’t used. When the queue runs dry, the last frame is held instead of cutting to black, so stuttering looks like a frozen image rather than a flicker.

Audio and video are two ffmpeg processes with two different clocks. Playing the same file through both will cause them to drift; if you need them locked together, pass the same file only to `playlist` and leave the video as a still image.

<a id="berbagi-layar"></a>
### Screen Sharing

The same video, sent as screen sharing rather than as a camera. This is a separate wasm entry point, so the recipient sees it labeled as a shared screen, rather than as the bot turning on its camera.

```js
const call = await voip.call('628123456789', {
    screenShare: true,
    videoPlaylist: ['slide.png'],
    playlist: ['narasi.mp3']
})
```

`screenShare: true` already contains `video: true`. Turn it on and off during a call with `call.startScreenShare()` and `call.stopScreenShare()`; `call.isScreenShare()` reports which one is currently on.

Which is better depends on what you’re sending, and it’s worth testing both on a real call:

- **Screen sharing** is best for static content — slides, lyrics, a single card. Its encoder prioritizes sharpness over motion, and a 16:9 source isn’t forced into a portrait camera frame.
- **Camera path** is best for moving images, and reaches everyone. Screen sharing is gated by `calling_screen_share_milestone_version`: recipients with an older version of WhatsApp get a “please update” dialog instead of your content. Groups also have a participant limit for sharing, and usually only one participant can share at a time.

<a id="panggilan-grup"></a>
### Group Calls

```js
const call = await voip.callGroup('12345-67890@g.us', {
    playlist: ['satu.mp3', 'dua.mp3'],
    idleGraceMs: 30000,
    durationMs: 0
})
```

`callGroup` reads the member list from the group’s metadata, resolves each member’s LID and device, then calls them all. Provide `participants` to call only some of them, or `metadata` if you already have it and want to skip fetching it.

To join a call started by someone else, pass `joinGroupCall` what the incoming offer specifies:

```js
const call = await voip.joinGroupCall({
    callId,
    callCreatorJid,
    groupJid,
    playlist: ['satu.mp3']
})
```

The queue behaves the same in group calls and one-on-one calls.

The stack includes `whatsapp.wasm`, `loader.js`, and `worker-modules.js` under `lib/assets/wasm/`, so it runs out of the box; `wasmPath`, `resourcesPath`, and `wasmBinary` are there for when you want to point it at a newer build, and `storageDir` moves its engine’s working directory from the system’s default temp directory. It needs `ffmpeg` for its output media; set `ffmpegPath` in the client or `FFMPEG_PATH` in the environment if the binary isn’t in `PATH`.

Those three files belong to WhatsApp Web itself, carried byte for byte. A supply-chain scanner will flag them as obfuscated code and a large binary, so `lib/assets/wasm/README.md` records their checksums, what they can and can’t access, and why they aren’t reformatted; `npm run verify:assets` checks everything again with one command.

Nothing is written to stdout unless you ask: pass `debug: true` for its built-in tracing, or `logger: (...args) => …` to direct it to your own logger.

<a id="keluar"></a>
### Exit

```js
await sock.logout()
```

This unlinks the device on WhatsApp’s side, rendering the stored credentials useless. To stop the socket without unlinking it, use `sock.end()`.

---

<a id="readme-section-37"></a>
<a id="-foto-profil"></a>
## 📷 Profile Photo

<a id="mengambil-url-foto-profil"></a>
### Getting the Profile Photo URL

```js
const url = await sock.profilePictureUrl(jid, 'image')
console.log(url)
```

<a id="mengubah-foto-profil"></a>
### Changing the Profile Photo

```js
await sock.updateProfilePicture(jid, {
  url: 'https://example.com/profile.jpg'
})
```

<a id="menghapus-foto-profil"></a>
### Removing Profile Photo

```js
await sock.removeProfilePicture(jid)
```

---

<a id="readme-section-38"></a>
<a id="-ekspor-yang-berguna"></a>
## 🧰 Useful Exports

Some commonly used exports:

```js
import {
  makeWASocket,
  useMultiFileAuthState,
  useSingleFileAuthState,
  useSqliteAuthState,
  usePostgresAuthState,
  useMySQLAuthState,
  useMongoAuthState,
  useRedisAuthState,
  useNekoDBAuth,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  DisconnectReason,
  jidDecode,
  jidEncode,
  jidNormalizedUser,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  Button,
  ButtonV2,
  Carousel,
  AIRich,
  Toolkit,
  MessageBuilder,
  MB,
  MESSAGE_BUILDER_VERSION,
  TTLCache
} from '@whiskeysockets/baileys'
```

Check the builder version:

```js
console.log(MESSAGE_BUILDER_VERSION)
console.log(MessageBuilder.VERSION)
```

<a id="cache-internal"></a>
### Internal Cache

> [!NOTE]
> **You don't need to import anything for this.** The cache is internal, and the library creates it itself. If your bot never handles the cache, not a single line needs to change.

There are eight short-lived caches inside the library — device lists, retry counts, call offers, outgoing messages remembered for resend, identity debounce, cached signal keys. They all run on `TTLCache`, a thin wrapper around `lru-cache`, which is already a dependency.

The pattern is the same everywhere: if you don't provide anything, the library creates it.

```js
const userDevicesCache = config.userDevicesCache || new TTLCache({ stdTTL: 300 })
```

So the regular `makeWASocket({ auth })` is already complete. Only the contents of the box change, not the door.

<a id="kapan-ttlcache-perlu-diimpor"></a>
#### When `TTLCache` needs to be imported

Only if you actually want to submit your own cache—and that's nothing new; it has always been possible:

```js
import makeWASocket, { TTLCache } from '@whiskeysockets/baileys'

const sock = makeWASocket({
  auth,
  userDevicesCache: new TTLCache({ stdTTL: 600, maxKeys: 50000 })
})
```

| Situation | Why it’s needed |
| --- | --- |
| Bot in a very large group | increase `maxKeys` so the device list isn’t evicted before its TTL expires |
| One cache shared by several sockets | create it once and pass it to all of them |
| Want to control the cache lifetime yourself | change `stdTTL`, for example, to keep the device list longer |
| Debugging | hold onto the cache yourself, then call `getStats()` or `keys()` |

Configs that accept it: `userDevicesCache`, `msgRetryCounterCache`, `callOfferCache`, `outboundResendCache`, `placeholderResendCache`, `mediaCache`, plus the third argument to `makeCacheableSignalKeyStore(store, logger, cache)`.

<a id="kalau-bot-mu-sudah-menyerahkan-cache-sendiri"></a>
#### If your bot already provides its own cache

It will keep working without changes, including if you provide `new NodeCache(...)` from `node-cache` or your own `@cacheable/node-cache`. The library only calls eight methods — `get`, `set`, `has`, `del`, `mget`, `mset`, `flushAll`, `close` — and NodeCache has them all. The contract is duck-typed, not `instanceof`.

`stdTTL` is measured in **seconds**, as before, and `TTLCache` is intentionally a superset: in addition to the eight methods above, it also has `take`, `keys`, `getStats`, as well as `on`, `off`, and `removeAllListeners`, which are no-ops — so code that accesses the built-in cache using the NodeCache style won’t break.

Two things differ from `node-cache`, and both are intentional:

| | `node-cache` | `TTLCache` |
| --- | --- | --- |
| When full | throws `ECACHEFULL` and the write is lost | evicts the least recently used entry; the new one is kept |
| Capacity limit | unlimited unless `maxKeys` is set | always has a cap; defaults to `DEFAULT_CACHE_MAX_KEYS` (20,000) |

The first is a real fix: `outboundResendCache` is capped at 512 entries, and the 513th message used to **not be remembered** because the write threw and was swallowed by `try/catch`. Now the oldest entry is evicted instead, and resend-after-nack is always about the newest message — so this is the right eviction direction.

The second prevents memory leaks in bots that run for weeks: the unbounded per-jid cache kept growing. If it reaches the cap before the TTL expires, the only consequence is one extra USync or one retry count reset — no state is corrupted. Raise it via `maxKeys` if your bot is particularly large.

The reason for switching wasn't just speed. Until version `1.3.10`, the cache used `@cacheable/node-cache`, which pulled in ten transitive packages (`cacheable`, `keyv`, `@keyv/serialize`, `@cacheable/memory`, `@cacheable/utils`, `@keyv/bigmap`, `hookified`, `hashery`, `qified`). On August 4, 2026, the maintainer account for that package family was compromised, and six trojanized versions were published — `@cacheable/node-cache@3.1.2`, `cacheable@2.5.1`, `keyv@6.0.0`, `@cacheable/utils@2.5.1`, `@cacheable/memory@2.2.1`, `@keyv/bigmap@6.0.0` — with an `preinstall` hook that downloaded the Bun runtime and ran an obfuscated payload (MAL-2026-11560 and later; all six have since been unpublished). The version pinned by this fork was never affected, but the transitive range `cacheable@^2.3.1` **did** include one of them, and the lockfile is not shipped to package users. Removing that one dependency removes all ten packages at once: the tree drops from 65 to 55.

Measurements at 200,000 operations with the same access pattern as real-world usage:

| Operation | `@cacheable/node-cache` | `TTLCache` |
| --- | --- | --- |
| `set` | 448 ms · 37,4 MB | **96 ms · 10,4 MB** |
| `get` | 49 ms | **28 ms** |
| `has` | **18,5 ms** | 31 ms |

`set` and `get` are the hottest paths, and both are much faster; `has` is slower because `lru-cache` also checks for expiration when called, and it is only used six times throughout the library, not inside a loop.

---

<a id="readme-section-39"></a>
<a id="-memperbarui-versi-whatsapp-web"></a>
## 🔄 Updating the WhatsApp Web Version

One command runs all its checks:

```bash
npm run wa:update
```

It reads the pinned revision, fetches the live one, downloads its bundle to `.wa-bundle/<revisi>/`, parses the WhatsApp Web protobuf specification and compares it with `WAProto`, compares the new snapshot with the previous one, passes every field through the encoder for a round-trip, then writes `.wa-bundle/report.md` and `report.json`.

The report ends with a single conclusion:

| Conclusion | Meaning |
|---|---|
| `no-change` | the live revision matches the pinned one |
| `bump-only` | the revision moved, but no wire surface changed |
| `bump-and-review` | the revision moved **and** a wire surface changed — read the diff |
| `needs-work` | WhatsApp declares a protobuf field that is missing from `WAProto` |
| `blocked` | the encoder round-trip failed; do not upgrade |

Add `--apply` to upgrade the pinned revision; this is rejected unless the conclusion is an upgrade and the encoder passes.

```bash
npm run wa:update -- --apply
```

Its supporting commands:

| Command | Purpose |
|---|---|
| `npm run wa:diff -- <lama> <baru>` | compare two bundle snapshots separately |
| `npm run check:proto` | check protobuf holes only |
| `npm run sync:proto` | add missing protobuf fields to `WAProto` |
| `npm run verify:proto` | encoder round-trip only |
| `npm run verify:mex` | match every `w:mex` query with a persisted query in the bundle |
| `npm run verify:assets` | checksum and scan the bundled VoIP resources |
| `npm run fetch:bundle -- <dir>` | download the raw bundle |
| `npm run update:version` | bump the pinned revision without any checks |
| `npm run audit:apk -- <dir>` | compare `WAProto` with an extracted Android APK |
| `npm run sync:proto -- --gaps <berkas>` | patch `WAProto` from an audit's `--json` output |
| `npm run proto:update` | the whole round: sync, verify, bump |

`proto:update` runs `sync:proto`, then `verify:proto`, then `verify:mex`, then `wa:update --apply`, then `update:version`, and that sequence does the heavy lifting. `wa:update` exits with a nonzero code on the `needs-work` conclusion and rejects `--apply`, so closing the protobuf holes must come first or the chain stops before it gets there.

**Checking `w:mex` queries.** Newsletter, username, text status, and both account health signals all go through persisted GraphQL queries — numeric IDs stored in `lib/Types/Mex.js`. If WhatsApp changes an ID, adds a required variable, or renames a root field, the call fails on the server and no test catches it. `verify:mex` reads `params:{id,name}` and `LocalArgument` for every query from the bundle snapshot, then checks them against every `executeWMexQuery` call in `lib/Socket`: IDs no longer served, missing or undeclared variables, and `dataPath` missing from the query response.

```bash
npm run verify:mex
PROTO_BUNDLE_DIR=.wa-bundle/1047416414 npm run verify:mex
```

Without `PROTO_BUNDLE_DIR`, it uses the highest-revision snapshot in `.wa-bundle`. This is what catches `newsletterSubscribed` sending empty variables and `fetchNewChatMessageCap` using `INDIVIDUAL_NEW_CHAT_MSG` that doesn’t exist on any client.

**Auditing against Android.** Everything above reads the WhatsApp **Web** bundle, so fields known to the Android client but unknown to Web never reach `WAProto`. `audit:apk` closes that blind spot: point it to the directory containing the extracted `classes*.dex`, and it parses the protobuf model classes directly from the dex — reading every `*_FIELD_NUMBER` constant and its value — then reports which fields and entire types are missing, along with their field numbers.

```
npm run audit:apk -- /path/to/extracted-apk
```

Add `--json <berkas>` and it writes the holes in the form consumed by `sync:proto`, so the same code generator that patches from a Web bundle can patch from an APK:

```
npm run audit:apk -- /path/to/extracted-apk /dev/null --json gaps.json
npm run sync:proto -- --gaps gaps.json
npm run verify:proto
```

Nothing is handwritten, so `npm run proto:update` will not overwrite it — `sync:proto` is additive and reads the existing `WAProto` as its baseline.

**Android is not the client this library presents itself as.** Baileys links as a WhatsApp Web device, so fields not declared in the Web bundle are fields a real Web client never sends — decoding them costs nothing, but sending them makes this client appear to be neither Web nor Android. The auditor cross-checks every candidate against the Web bundle and flags the differences:

```
ANDROID ONLY: Message.AlbumMessage.caption — safe to decode; send only if explicitly intended
```

Treat those markers as a reason to keep the field readable but disabled by default. All four fields patched so far carry a marker.

**Two other safeguards matter, because a name can match while the numbering does not.** The auditor keeps only the APK class with the greatest overlap for a given type — several classes carry similar field names, and the ones that lose are false positives — and it rejects any field whose number is already used in that type. Without the second safeguard, `CtwaContextData.canonicalUrl=3` would be written directly over `sourceUrl`, silently corrupting the wire format. Notes owned by libsignal itself are skipped entirely.

The diff covers every surface through which WhatsApp changes can reach the wire — protobuf schemas, stanza tags and attributes, `xmlns`, MEX operations, media paths — so a release that only moves UI code is reported exactly as such. `AGENTS.md` documents which surfaces matter and which are just client-side noise.

Set `PROTO_BUNDLE_DIR` to read from a local directory and `PROTO_OFFLINE=1` to skip the live revision lookup. Where the default `fetch` is denied, the script automatically falls back to `curl`.

For automated releases, commit only the files actually changed by the updater and `package.json`. Do not commit `node_modules`.

Suggested `.gitignore` entries:

```gitignore
node_modules/
npm-debug.log*
```

If your repo intentionally does not track lockfiles for this library package, add `package-lock.json` too. Otherwise, leave the lockfile tracked as usual.

---

<a id="readme-section-40"></a>
<a id="-pesan-terjadwal"></a>
## ⏰ Scheduled Messages

WhatsApp schedules messages by sending them **immediately, encrypted**, then letting the server release the key at the selected time. The wrapper is `conditionalRevealMessage`; the key travels on the `<meta type="scheduled_message">` node alongside the message.

The pieces are laid out as building blocks, reconstructed from the WhatsApp Web client:

```js
import {
  encodeScheduledMessage,
  decodeScheduledMessage,
  buildScheduledMsgMetaNode,
  buildUnscheduleProtocolMessage,
  isScheduledTimeValid,
  SCHEDULED_MSG_WINDOW
} from '@whiskeysockets/baileys'

const at = Math.floor(Date.now() / 1000) + 3600
if (!isScheduledTimeValid(at)) throw new Error('outside the allowed window')

const scheduled = encodeScheduledMessage({ conversation: 'sent later' })
// { revealKey, revealKeyId, encIv, encPayload, message: { conditionalRevealMessage } }

const meta = buildScheduledMsgMetaNode({
  scheduledTimestampS: at,
  revealKeyId: scheduled.revealKeyId,
  revealKey: scheduled.revealKey
})
// <meta type="scheduled_message" st="…"><key rkid="…">{32 byte}</key></meta>

await sock.relayMessage(jid, scheduled.message, {
  messageId: sock.generateMessageTag(),
  additionalNodes: [meta]
})
```

Reading it back, once you have its reveal key:

```js
const message = decodeScheduledMessage(msg.message, revealKey)
```

Canceling a scheduled message is a protocol message:

```js
await sock.relayMessage(jid, buildUnscheduleProtocolMessage(scheduledKey), { messageId })
```

Limits taken from the client, not guessed:

| | Chat | Channel |
|---|---|---|
| Earliest | 10 minutes from now | 10 minutes from now |
| Latest | 14 days | 30 days |
| Per chat | 30 scheduled messages | 30 |
| Media per schedule | 1 | 1 |

The reveal key uses AES-256-GCM, 32 bytes, with a 12-byte IV and the tag appended to `encPayload`. The server stores the reveal key for 30 days and responds with `419` if a chat exceeds its limit.

> [!WARNING]
> All gates for this feature are disabled by default in the WhatsApp clients being shipped (`scheduled_messages_sender_enabled`, `scheduled_messages_receiver_enabled`, `channels_scheduling_updates_enabled`). The builder here already matches the wire format used by the client, but until WhatsApp enables the feature for an account, the server may reject or ignore the request. Treat it as experimental.

<a id="readme-section-41"></a>
<a id="-api-pesan-whatsapp-modern"></a>
## 🧪 Modern WhatsApp Message API
RabbitXmd Baileys exposes helpers for newer protobuf message types already present in the bundled WAProto. This API is experimental because WhatsApp may gate server rendering or acceptance per account, per platform, or per rollout.

```js
import {
  makeNewsletterStatusAttribution,
  LOCATION_BROADCAST_JID,
  isJidLocationBroadcast
} from '@whiskeysockets/baileys'
```

<a id="message-key"></a>
### Message Key

Almost everything in this chapter accepts a **message key** — `addYours`, `statusMention`, `statusNotification`, `groupStatusReaction`, `statusQuoted`, `pollAddOption`, and so on. Examples like `myStatus.key` or `promptStatus.key` are easy to miss when reading quickly, so here’s where they come from.

A key consists of four fields, and identifies one message anywhere in the account:

```js
{
  remoteJid: 'status@broadcast',        // the chat it lives in
  fromMe: false,                        // whether this account sent it
  id: '3EB03AC13066A48D44FF59',         // id pesannya
  participant: '628000@s.whatsapp.net'  // who sent it, in a group or in a status
}
```

<a id="pesan-yang-kamu-kirim"></a>
#### The message you send

`sendMessage` returns the message it sent. Save it, then read `.key`:

```js
const myStatus = await sock.sendMessage('status@broadcast', {
  image: { url: './foto.jpg' },
  caption: 'hello everyone'
}, { statusJidList })

console.log(myStatus.key)
// { remoteJid: 'status@broadcast', fromMe: true, id: '3EB03AC13066A48D44FF59' }
```

Your own status key has no `participant` — you're the sender, so there's nothing to distinguish. Group status instead stores the group's JID:

```js
const myGroupStatus = await sock.sendMessage(groupJid, { text: 'hello group', groupStatus: true })
// key: { remoteJid: '120363000000000000@g.us', fromMe: true, id: '…' }
```

The return value is the entire `WebMessageInfo`, so `myStatus.message` and `myStatus.messageTimestamp` are also there if you need them.

<a id="pesan-yang-kamu-terima"></a>
#### Messages you receive

Each incoming message arrives with its key already attached, in the `messages.upsert` event:

```js
sock.ev.on('messages.upsert', async ({ messages }) => {
  for (const m of messages) {
    if (m.key.remoteJid !== 'status@broadcast') continue

    console.log(m.key)
    // { remoteJid: 'status@broadcast', fromMe: false, id: '…', participant: '628000@s.whatsapp.net' }
  }
})
```

Here, `participant` is **populated**, and it is the person who posted the status — that is what distinguishes one poster’s status from another, because their `remoteJid` is `status@broadcast` for everyone.

To respond to a specific prompt, you must hold on to its key when it arrives, because you cannot reconstruct it later:

```js
const prompts = new Map()

sock.ev.on('messages.upsert', ({ messages }) => {
  for (const m of messages) {
    if (m.key.remoteJid === 'status@broadcast' && !m.key.fromMe) {
      prompts.set(m.key.id, m.key)
    }
  }
})

// …nanti
await sock.sendMessage('status@broadcast', {
  text: 'ikutan!',
  addYours: prompts.get(chosenId)
}, { statusJidList })
```

The keys you store remain valid — they contain only four strings, so storing them in a database or JSON file is enough. Nothing here needs the original message body.

<a id="pesan-yang-dibalas-orang"></a>
#### Messages people reply to

If a message quotes another message, the quoted key is in its `contextInfo`:

```js
const context = m.message?.extendedTextMessage?.contextInfo
const quotedKey = context && {
  remoteJid: m.key.remoteJid,
  fromMe: context.participant === sock.user.id,
  id: context.stanzaId,
  participant: context.participant
}
```

<a id="key-mana-untuk-apa"></a>
#### Which key goes where

The most time-consuming mistakes happen when you provide your own key where someone else’s is expected, or vice versa. Here’s who owns each one:

| Field | Whose key |
| --- | --- |
| `addYours` | **them** — the prompt status you’re answering |
| `messageAssociation.parentMessageKey` | **them** — the status, poll, or question being answered |
| `statusMention.key` | **you** — the status you just posted and are announcing |
| `statusNotification.responseMessageKey` | **you** — your answer |
| `statusNotification.originalMessageKey` | **them** — the prompt |
| `groupStatusReaction.key` | **them** — the group status you’re reacting to |
| `statusQuoted.originalStatusId` | **them** — the status ID, not the full key |

Each builder checks its key before building anything and throws `TypeError` naming the exact field — `addYours.key must be an object` if it’s missing, `addYours.key.id is required` if it’s present but incomplete. Either way, it fails at build time rather than being sent and silently ignored.

<a id="polling-foto"></a>
### Photo Polling

Provide an `image` option, and the poll is sent as a photo poll: the option images are sent as related messages, and each option carries the hash expected by the server.

This works in groups, one-on-one chats, and channels, and `hideVoter` and `endDate` can be combined with it—the poll remains in `pollCreationMessageV3`, the version where images are attached to its options. See [Poll settings](#pengaturan-polling).

```js
await sock.sendMessage(jid, {
  poll: {
    name: 'Which cover?',
    values: [
      { name: 'Jakarta', image: { url: './jakarta.jpg' } },
      { name: 'Bandung', image: { url: './bandung.jpg' } }
    ],
    selectableCount: 1
  }
})
```

Each option image is uploaded and then sent as its own `pollCreationOptionImageMessage`, linked back to its poll through the `MEDIA_POLL` association. A poll with two image options is three messages on the wire.

Options that are plain strings still send a normal text poll, and the two can be mixed. The other poll switches — multiple answers, hidden voter, add options, expiration time — are listed in [Poll settings](#pengaturan-polling).

<a id="pesan-pertanyaan"></a>
### Question Messages

```js
await sock.sendMessage(jid, {
  question: {
    text: 'What feature should be added next?'
  }
})
```

The same payload can be sent to a channel JID. Channel queries are marked by the `<meta questiontype>` node, which the socket adds automatically:

```js
await sock.sendMessage('123456789@newsletter', {
  question: {
    text: 'Which update would you like next?'
  }
})
```

```xml
<message to="123456789@newsletter" id="MESSAGE_ID" type="text">
  <meta questiontype="question"/>
  <plaintext>PROTO_MESSAGE</plaintext>
</message>
```

`questiontype` is `question` when posting a question, `response` when a follower answers it, and `reply` when its channel replies to an answer.

<a id="jawaban-pertanyaan-masuk"></a>
### Incoming Question Answers

A follower answers a question. Sent with `questiontype="response"`.

```js
await sock.sendMessage(jid, {
  questionResponse: {
    key: questionMessage.key,
    text: 'MessageBuilder'
  }
})
```

<a id="balasan-pertanyaan"></a>
### Reply to a Question

The channel replies to an answer by quoting it via the question’s server ID. It is sent with `questiontype="reply"`.

```js
await sock.sendMessage('123456789@newsletter', {
  questionReply: {
    text: 'Good choice, here\'s what to work on next',
    serverQuestionId: 175,
    quotedQuestion: questionMessage.message,   // opsional
    quotedResponse: responseMessage.message    // opsional
  }
})
```

<a id="jawaban-pertanyaan-di-status"></a>
### Answers to Questions in Status

```js
await sock.sendMessage(jid, {
  statusQuestionAnswer: {
    key: statusQuestion.key,
    text: 'RabbitXmd Baileys'
  }
})
```

<a id="pesan-kutipan-status"></a>
### Quoted Status Message

```js
await sock.sendMessage(jid, {
  statusQuoted: {
    originalStatusId: statusMessage.key,
    type: 'QUESTION_ANSWER',
    text: 'Quoted status reply'
  }
})
```

<a id="interaksi-stiker-status"></a>
### Status Sticker Interactions

```js
await sock.sendMessage(jid, {
  statusStickerInteraction: {
    key: statusMessage.key,
    stickerKey: 'heart',
    type: 'REACTION'
  }
})
```

<a id="notifikasi-status"></a>
### Status Notifications

Supported notification types: `UNKNOWN` 0, `STATUS_ADD_YOURS` 1, `STATUS_RESHARE` 2, `STATUS_QUESTION_ANSWER_RESHARE` 3, and `STATUS_GROUP_STATUS_REPLY` 4, exported as `StatusNotificationType`.

`STATUS_GROUP_STATUS_REPLY` is present in the WhatsApp Web bundle but absent from the generated `WAProto` enum, which only includes the first four — the sync tool reads the message field, not the enum value. Both `StatusNotificationType` and `statusNotification` resolve their names against the list in the bundle, so their names work here even though `proto.Message.StatusNotificationMessage.StatusNotificationType.STATUS_GROUP_STATUS_REPLY` is `undefined`.

```js
await sock.sendMessage(jid, {
  statusNotification: {
    responseMessageKey: responseMessage.key,
    originalMessageKey: statusMessage.key,
    type: 'STATUS_RESHARE'
  }
})
```

<a id="undangan-admin-channel"></a>
### Channel Admin Invitation

```js
await sock.sendMessage(userJid, {
  newsletterAdminInvite: {
    newsletterJid: '123456789@newsletter',
    newsletterName: 'RabbitXmd Updates',
    caption: 'Join as admin',
    inviteExpiration: Math.floor(Date.now() / 1000) + 86400
  }
})
```

`jpegThumbnail` and `contextInfo` can also be provided.

<a id="undangan-follower-channel-v2"></a>
### Channel Follower Invite V2

```js
await sock.sendMessage(userJid, {
  newsletterFollowerInvite: {
    newsletterJid: '123456789@newsletter',
    newsletterName: 'RabbitXmd Updates',
    caption: 'Ikuti channel ini'
  }
})
```

<a id="audiens-status-kustom-teman-dekat"></a>
### Custom Status Audience (Close Friends)

This is a status that displays a badge containing an emoji and a list name, and opens a dialog that says **"You are in the custom audience {nama}"**. You choose the emoji and name, and that’s where the “custom emoji” part comes from.

This is **not** `groupStatusMessageV2`. Two different features are often confused here, so before the code:

| | Field | What viewers see |
| --- | --- | --- |
| **Custom audience** | `contextInfo.statusAudienceMetadata` | a purple ring around the status, a badge containing an emoji and your list name, and a “custom audience” dialog |
| **Group status** | wrapper `groupStatusMessageV2` + `contextInfo.isGroupStatus` | "Added by {nama}" below the poster’s name |

They are independent. A single status can be one, the other, or both.

<a id="audiens-kustomnya"></a>
#### The custom audience

```js
await sock.sendMessage('status@broadcast', {
  text: 'Hey besties 💜',
  statusAudience: {
    listName: 'Besties',
    listEmoji: '💜'
  }
}, {
  statusJidList: bestiesJids
})
```

A plain string is a shorthand for the list name:

```js
await sock.sendMessage('status@broadcast', {
  image: { url: './foto.jpg' },
  caption: 'buat kalian aja',
  statusAudience: 'Besties'
}, { statusJidList: bestiesJids })
```

Remove one of the fields and you get a backup of your own client — `⭐` and `Close friends`, exported as `STATUS_AUDIENCE_DEFAULT_EMOJI` and `STATUS_AUDIENCE_DEFAULT_LIST_NAME`:

```js
await sock.sendMessage('status@broadcast', { text: 'hello', statusAudience: {} }, { statusJidList })
// → { audienceType: 1, listName: 'Close friends', listEmoji: '⭐' }
```

> [!IMPORTANT]
> `statusAudience` is the **label**, not the key. Who actually receives the status is determined by `statusJidList` — the people you send it to. Setting its metadata without narrowing that list means posting to everyone with the "Besties" badge enabled.

<a id="status-grupnya"></a>
#### Group status

`groupStatus: true` wraps whatever you send inside `groupStatusMessageV2` and sets `contextInfo.isGroupStatus`, which is what makes the relay layer add the `is_group_status` meta node:

```js
await sock.sendMessage(groupJid, {
  text: 'hello group',
  groupStatus: true
})
```

Both at once, and that is the actual payload the question is referring to:

```js
await sock.sendMessage(groupJid, {
  text: 'hello group',
  groupStatus: true,
  statusAudience: { listName: 'Besties', listEmoji: '💜' }
})
```

produces:

```jsonc
{
  "groupStatusMessageV2": {
    "message": {
      "extendedTextMessage": {
        "text": "hello group",
        "contextInfo": {
          "statusAudienceMetadata": {
            "audienceType": 1,
            "listName": "Besties",
            "listEmoji": "💜"
          },
          "isGroupStatus": true
        }
      }
    }
  }
}
```

Note that `message.conversation` is `undefined` here — its text is two layers down. Run it through `normalizeMessageContent` first, like the other wrappers (see [All Message Types](#-semua-jenis-pesan)).

<a id="field-nya"></a>
#### Its fields

`contextInfo.statusAudienceMetadata` is field **69** of `ContextInfo`:

| Field | Tag | Value |
| --- | --- | --- |
| `audienceType` | 1 | `UNKNOWN` = 0, `CLOSE_FRIENDS` = 1 — defaults to `CLOSE_FRIENDS` |
| `listName` | 2 | free text, defaults to `Close friends` |
| `listEmoji` | 3 | free text, defaults to `⭐` |

`audienceType` accepts its enum name or number:

```js
import { makeStatusAudienceMetadata, proto } from '@whiskeysockets/baileys'

makeStatusAudienceMetadata({ listName: 'Kerja', listEmoji: '💼', audienceType: 'CLOSE_FRIENDS' })
makeStatusAudienceMetadata({ listName: 'Kerja', audienceType: proto.ContextInfo.StatusAudienceMetadata.AudienceType.CLOSE_FRIENDS })
```

Or write the contextInfo yourself if you're relaying rather than sending:

```js
await sock.sendMessage('status@broadcast', {
  text: 'Hey besties',
  contextInfo: {
    statusAudienceMetadata: makeStatusAudienceMetadata({ listName: 'Besties', listEmoji: '💜' })
  }
}, { statusJidList: bestiesJids })
```

<a id="membaca-yang-kamu-terima"></a>
#### Reading what you receive

```js
import { normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

const content = normalizeMessageContent(m.message)
const audience = content?.[getContentType(content)]?.contextInfo?.statusAudienceMetadata

if (audience) {
  console.log(audience.listEmoji, audience.listName)   // 💜 Besties
}
```

<a id="kalau-namanya-tetap-close-friends"></a>
#### If the name stays "Close friends"

The emoji and the name travel in the same submessage, so if one arrives, the other does too. Check what you actually put on the wire before blaming the phone — `sendMessage` returns the message it sent:

```js
const sent = await sock.sendMessage('status@broadcast', {
  text: 'Hey besties',
  statusAudience: { listName: 'Besties', listEmoji: '💜' }
}, { statusJidList })

console.log(sent.message.extendedTextMessage.contextInfo.statusAudienceMetadata)
// StatusAudienceMetadata { audienceType: 1, listName: 'Besties', listEmoji: '💜' }
```

If that prints your name, the payload is correct. `listName` is tag 2 and `listEmoji` tag 3 from `ContextInfo.StatusAudienceMetadata`, matching the WhatsApp Web specification exactly, and both are plain strings with no length or character rules on our side.

If it prints `Close friends`, one of these is happening:

| Cause | Fix |
| --- | --- |
| The key was never read | `statusAudience` is resolved by `sock.sendMessage`. Going straight to `generateWAMessageFromContent` and `relayMessage` bypasses it — set `contextInfo.statusAudienceMetadata` yourself there. |
| Written as `listname` or `name` | The key is `listName`. Unknown keys aren’t errors; they just leave the default in place. |
| Only the emoji was provided | `{ listEmoji: '💜' }` preserves its default name, just as `{ listName: 'Besties' }` preserves its default star. |
| It comes with the modern builder | `statusAudience` alongside `groupStatusReaction`, `question`, `comment`, and the others now throw an error instead of disappearing — that builder replaces all of its content and has no contextInfo. |

And if the payload is correct but the phone still shows the default, that’s the client, not the message: the badge is a rollout-gated feature, and WhatsApp can fall back to the default label on builds that have its parser but not its UI yet. Try viewing it on the latest Android build before changing your code.

> [!NOTE]
> In WhatsApp Web, the badge is behind a viewer-side rollout gate (`isStatusCloseFriendsViewerSideEnabled`), and Web has no sender-side path for it at all — it only reads the field. Android and iOS are where you'll see it. As with everything in this chapter, WhatsApp can gate its rendering per account.

<a id="add-yours"></a>
### Add Yours

“Add Yours” is not a message type — it is an **association**. Someone posts a status that carries an Add Yours prompt; when you post your own answer, your status carries `messageAssociation` pointing back to theirs, and that is what links the two.

```js
await sock.sendMessage('status@broadcast', {
  text: 'ikutan!',
  addYours: promptStatus.key
}, { statusJidList })
```

`promptStatus` is **their** status — the one that carried the prompt, as it arrived at `messages.upsert`. You must save its key when it comes in; see [Message Key](#message-key).

It writes `messageContextInfo.messageAssociation` (tag 10) with `associationType: STATUS_ADD_YOURS` (8) and your `parentMessageKey`:

```jsonc
{
  "messageContextInfo": {
    "messageAssociation": {
      "associationType": 8,
      "parentMessageKey": { "remoteJid": "status@broadcast", "id": "ABC123", "participant": "628000@s.whatsapp.net" }
    }
  },
  "extendedTextMessage": { "text": "ikutan!" }
}
```

This works with any status content, including media, because the association sits alongside the message, not inside it:

```js
await sock.sendMessage('status@broadcast', {
  image: { url: './jawaban.jpg' },
  caption: 'ikutan!',
  addYours: promptStatus.key
}, { statusJidList })
```

There are three Add Yours flavors, and you can call whichever one you want:

| `type` | Value | Prompt it answers |
| --- | --- | --- |
| `STATUS_ADD_YOURS` | 8 | regular Add Yours sticker (default) |
| `STATUS_ADD_YOURS_AI_IMAGINE` | 15 | AI image prompt |
| `STATUS_ADD_YOURS_DIWALI` | 17 | Diwali seasonal prompt |

```js
await sock.sendMessage('status@broadcast', {
  text: 'ikutan!',
  addYours: { key: promptStatus.key, type: 'STATUS_ADD_YOURS_AI_IMAGINE' }
}, { statusJidList })
```

<a id="asosiasi-lainnya"></a>
#### Other associations

`addYours` is the shorthand form of the general mechanism, and it’s worth knowing because the same field ties together status polls, questions, reactions, and album items:

```js
import { AssociationType } from '@whiskeysockets/baileys'

await sock.sendMessage('status@broadcast', {
  text: 'jawaban',
  messageAssociation: {
    type: AssociationType.STATUS_QUESTION,
    parentMessageKey: questionStatus.key,
    messageIndex: 0
  }
}, { statusJidList })
```

`AssociationType` is the client's own enum: `MEDIA_ALBUM` 1, `STATUS_POLL` 4, `STATUS_EXTERNAL_RESHARE` 6, `MEDIA_POLL` 7, `STATUS_ADD_YOURS` 8, `STATUS_NOTIFICATION` 9, `STICKER_ANNOTATION` 11, `STATUS_LINK_ACTION` 13, `STATUS_ADD_YOURS_AI_IMAGINE` 15, `STATUS_QUESTION` 16, `STATUS_ADD_YOURS_DIWALI` 17, `STATUS_REACTION` 18, `POLL_ADD_OPTION` 20, and others. Unlike `addYours`, the general form defaults to `UNKNOWN` rather than guessing for you.

<a id="memberi-tahu-pemosting-aslinya"></a>
#### Notifying the original poster

Posting an answer does not itself notify whoever wrote its prompt. That's a separate `statusNotification`, and `STATUS_ADD_YOURS` is one type of it:

```js
await sock.sendMessage(promptAuthorJid, {
  statusNotification: {
    responseMessageKey: myStatus.key,
    originalMessageKey: promptStatus.key,
    type: 'STATUS_ADD_YOURS'
  }
})
```

> [!NOTE]
> **Add Yours** stickers — the prompt itself, with its own text — are composed on Android, and their wire layout is not disclosed anywhere in the WhatsApp Web bundle. Only the association is available, so that is all this library builds. Replying to an existing prompt is possible; creating a new prompt from a bot is not, and nothing here guesses the tags for that.

<a id="mention-di-status"></a>
### Mentions in Status

Mentioning people in a status involves two messages: the status itself is sent to `status@broadcast` with the `mentioned_users` meta node, and each chat that is mentioned receives a small pointer message so the mention appears there — `statusMentionMessage` for an individual, `groupStatusMentionMessage` for a group, both wrapping `protocolMessage` of type `STATUS_MENTION_MESSAGE` (25).

**Pass an array of jids as the targets, and the entire flow is handled for you:**

```js
await sock.sendMessage(
  ['628000@s.whatsapp.net', '120363000000000000@g.us'],
  { image: { url: './foto.jpg' }, caption: 'hello everyone' },
  { delayMs: 1500 }
)
```

It posts the status once — expanding any groups in the list into their members for the audience — then sends one mention pointer per jid, choosing the group or individual wrapper for each and attaching the correct meta attribute (`is_group_status_mention` or `is_status_mention`). `delayMs` spaces out the pointers and defaults to 1500 ms.

To send the pointers themselves, against a status you’ve already posted:

```js
const myStatus = await sock.sendMessage('status@broadcast', { text: 'hello everyone' }, { statusJidList })

await sock.sendMessage(userJid, { statusMention: { key: myStatus.key } })
await sock.sendMessage(groupJid, { statusMention: { key: myStatus.key, group: true } })
```

`myStatus.key` is **yours** — `sendMessage` returns the message it just sent, so save that return value. See [Message Key](#message-key).

Or build without sending, for a custom relay:

```js
import { makeStatusMentionMessage } from '@whiskeysockets/baileys'

const content = makeStatusMentionMessage({ key: myStatus.key, group: false })
// { statusMentionMessage: { message: { protocolMessage: { key, type: 25 } } } }
```

Both wrappers are `FutureProofMessage` — `statusMentionMessage` is field 87 of `Message`, `groupStatusMentionMessage` is field 92 — so the accepted one needs `normalizeMessageContent` like the other wrappers.

<a id="reaksi-status-grup"></a>
### Group Status Reactions

```js
await sock.sendMessage(groupJid, {
  groupStatusReaction: {
    key: groupStatusMessage.key,
    text: '❤️'
  }
})
```

The reaction is wrapped in `groupStatusMessageV2`, so the existing relay layer can include its group status metadata.

<a id="menambah-opsi-polling"></a>
### Adding Poll Options

The original poll must be created with `canAddOption: true` (see [Polling settings](#pengaturan-polling)). Each message carries one option — `addOption` is a single value in the protobuf, not a list, so send multiple messages to add multiple options.

```js
await sock.sendMessage(jid, {
  pollAddOption: {
    pollCreationMessageKey: pollMessage.key,
    option: 'New option'
  }
})
```

`addOption` can be provided directly if you already have the protobuf options object.

<a id="pesan-komentar"></a>
### Comment Message

`content` accepts text or a protobuf message field. Raw protobuf content can be provided as `message`.

```js
await sock.sendMessage(jid, {
  comment: {
    targetMessageKey: targetMessage.key,
    content: {
      text: 'Comment on this message'
    }
  }
})
```

<a id="pesan-undangan-acara"></a>
### Event Invitation Message

```js
await sock.sendMessage(jid, {
  eventInvite: {
    eventId: 'RabbitXmd-event-001',
    eventTitle: 'Acara Komunitas RabbitXmd',
    startTime: new Date(Date.now() + 3600000),
    endTime: new Date(Date.now() + 7200000),
    caption: 'Sampai jumpa di sana'
  }
})
```

<a id="panggilan-terjadwal"></a>
### Scheduled Calls

```js
const created = await sock.sendMessage(jid, {
  scheduledCall: {
    scheduledTimestampMs: new Date(Date.now() + 3600000),
    callType: 'VIDEO',
    title: 'Panggilan RabbitXmd'
  }
})
```

Cancel a scheduled call using its message key.

```js
await sock.sendMessage(jid, {
  scheduledCallEdit: {
    key: created.key,
    editType: 'CANCEL'
  }
})
```

<a id="penanda-broadcast-lokasi"></a>
### Location Broadcast Marker

WhatsApp Desktop recognizes `location@broadcast` separately from `status@broadcast`. RabbitXmd Baileys exposes the marker and its detector without treating it as ordinary status fanout.

```js
console.log(LOCATION_BROADCAST_JID)
console.log(isJidLocationBroadcast('location@broadcast'))
```

<a id="builder-tingkat-rendah"></a>
### Low-Level Builder

```js
import {
  makeQuestionMessage,
  makeQuestionResponseMessage,
  makeStatusQuestionAnswerMessage,
  makeStatusQuotedMessage,
  makeStatusStickerInteractionMessage,
  makeStatusNotificationMessage,
  makeNewsletterAdminInviteMessage,
  makeNewsletterFollowerInviteMessage,
  makePollAddOptionMessage,
  makeCommentMessage,
  makeEventInviteMessage,
  makeScheduledCallCreationMessage,
  makeScheduledCallEditMessage,
  makeGroupStatusReactionMessage,
  makeNewsletterStatusAttribution,
  makeGroupStatusAttribution,
  makeStatusAudienceMetadata
} from '@whiskeysockets/baileys'
```

This helper returns protobuf-compatible message content that can be passed to `generateWAMessageFromContent` or to your own relay logic.

> [!IMPORTANT]
> The WhatsApp Desktop build that was inspected also exposed schema names related to bot history sharing and identity verification. Both have deliberately not been added until their protobuf field numbers, parent messages, and wire layouts are confirmed. RabbitXmd Baileys does not guess protobuf tags.

---

<a id="readme-section-42"></a>
<a id="-sinyal-kesehatan-akun"></a>
## 🛡️ Account Health Signals

WhatsApp tracks how an account contacts people it has never spoken to before, and tells its clients where the account stands. Reading these two signals is much more reliable than guessing safe delays.

Both are the exact same `w:mex` queries run by WA Web, so the answers come from WhatsApp's server, not from local calculations:

| Function | Persisted query | When it can be called |
| --- | --- | --- |
| `fetchNewChatMessageCap()` | `WAWebMexFetchNewChatMessageCappingInfoJobQuery` (`27910975521856601`) | any time after connecting |
| `fetchAccountReachoutTimelock()` | `WAWebMexFetchReachoutTimelockJobQuery` (`23983697327930364`) | any time after connecting |

<a id="kuota-pesan-ke-chat-baru"></a>
### Message Quota for New Chats

```js
const cap = await sock.fetchNewChatMessageCap()
```

What is returned:

| Field | Contents |
| --- | --- |
| `status` | `NONE` → `FIRST_WARNING` → `SECOND_WARNING` → `CAPPED`, WhatsApp’s own escalation ladder |
| `capped` | `true` if `status` is already `CAPPED`, meaning sending to a new chat is rejected |
| `warned` | `true` in both `FIRST_WARNING` and `SECOND_WARNING` |
| `totalQuota` | new-chat allowance for one cycle |
| `usedQuota` | amount already used in that cycle |
| `remaining` | `totalQuota - usedQuota`, never negative; `undefined` if the server doesn’t send one of them |
| `cycleStart`, `cycleEnd` | start and end of the cycle, **Unix seconds** — multiply by 1000 for `new Date` |
| `serverTime` | server time when it responds, used to compare `cycleEnd` without trusting your machine’s clock |
| `oteStatus`, `mvStatus`, `subscriptionStatus` | verification and subscription statuses included in the response |
| `response` | the raw response, if you want to read fields that haven’t been mapped |

Only **starting** a chat with a number you’ve never spoken to before uses quota. Replying in a conversation started by someone else doesn’t count, and sending another message to an existing chat doesn’t either.

Note: this query asks for only one type of quota, `INDIVIDUAL_NEW_CHAT_THREAD` — the **thread** quota for new chats, not the number of messages. Up through version `1.3.10`, this fork sends `INDIVIDUAL_NEW_CHAT_MSG`, a name that doesn’t exist in any client, which is why the call can return an error or empty numbers.

<a id="timelock-reachout"></a>
### Timelock Reachout

```js
const lock = await sock.fetchAccountReachoutTimelock()
```

| Field | Content |
| --- | --- |
| `isActive` | the account is currently restricted from contacting new people |
| `timeEnforcementEnds` | `Date` when the restriction is lifted, `undefined` if the server sends `0` |
| `enforcementType` | the reason — `BIZ_QUALITY` quality-based, `BIZ_COMMERCE_VIOLATION_*` policy category |

Calling it also emits `connection.update`, so one call is enough to notify all bots. Both signals also arrive unsolicited:

```js
sock.ev.on('connection.update', ({ reachoutTimeLock }) => {
  if (reachoutTimeLock?.isActive) stopSending()
})
```

<a id="memakainya-sebagai-pengaman"></a>
### Using It as a Safeguard

```js
const guard = async () => {
  const lock = await sock.fetchAccountReachoutTimelock()
  if (lock.isActive) return { send: false, reason: 'timelock reachout sampai ' + lock.timeEnforcementEnds }

  const cap = await sock.fetchNewChatMessageCap()
  if (cap.capped) return { send: false, reason: 'new chat quota runs out until ' + new Date(cap.cycleEnd * 1000) }
  if (cap.warned) return { send: false, reason: 'WhatsApp has warned this account: ' + cap.status }
  if (cap.remaining !== undefined && cap.remaining < 10) return { send: false, reason: 'sisa cuma ' + cap.remaining + ' di siklus ini' }

  return { send: true, remaining: cap.remaining }
}
```

Check before a round and check again after every batch — `SECOND_WARNING` is the last state before its quota hits, so stopping there is the difference between a pause and a block.

> [!NOTE]
> Bulk messaging through unofficial clients violates WhatsApp’s Terms of Service, regardless of whether recipients have consented. The authorized route for opt-in bulk messaging is the WhatsApp Business Platform. These signals reduce the chance of triggering automated limits; they do not make any account safe.

<a id="readme-section-43"></a>
<a id="-penanganan-masalah"></a>
## 🐞 Troubleshooting

<a id="cannot-read-properties-of-undefined-reading-undefined-saat-membalas"></a>
### `Cannot read properties of undefined (reading 'undefined')` when replying

The full trace looks like this:

```
TypeError: Cannot read properties of undefined (reading 'undefined')
    at generateWAMessageFromContent (.../lib/Utils/messages.js:1443:64)
    at generateWAMessage (.../lib/Utils/messages.js:1507:12)
    at async Object.sendMessage (.../lib/Socket/messages-send.js:1300:33)
    at async Object.before (.../plugins/system/_firstchat.js:18:9)
```

You handed `quoted` a message with **no readable content**. Its quoting path normalized it, got nothing, then indexed `undefined` with `undefined`. Three common ways this can happen:

| What you quoted | Why it has no content |
| --- | --- |
| A message that failed to decrypt | Its `messageStubType` is `CIPHERTEXT`; the key is genuine, but its `message` is missing |
| A message read back from a store | Some stores keep the key and discard the body |
| A hand-built `{ key }` | No `message` field at all |

This is now guarded — sending proceeds **without** the quote and logs once:

```
WARN  nothing quotable here, sending without the quote
      jid: "120363000000000000@g.us"  quotedId: "3EB0…"  quotedContentType: undefined
```

That matters more than it might sound. A bot that quoted the message it was replying to in a chat whose messages could not be decrypted used to throw an error on **every send** — so it went completely silent in that one chat while all the others looked fine. The failure was in building the reply, not in the group.

If you’d rather not send anything than send without a quote, check first before calling:

```js
import { normalizeMessageContent, getContentType } from '@whiskeysockets/baileys'

const quotable = !!getContentType(normalizeMessageContent(m.message))
await sock.sendMessage(m.key.remoteJid, { text: 'hello' }, quotable ? { quoted: m } : {})
```

<a id="bot-menjawab-di-semua-grup-kecuali-satu"></a>
### The bot replies in every group except one

A group where not a single message gets through — not one reply, while all the other groups work fine — is almost always a **sender key** problem, not your handler. Group messages are encrypted once with a single group sender key and then fanned out; that key has to reach each member’s device separately, and the library remembers who already has it in `sender-key-memory`, locked **per group**. That’s why the symptom affects one group and not the entire account.

Up to this release, there was one way that memory could lie. Encryption is attempted per device, and a failure on one device is swallowed — delivery still proceeds to all the others — but every device was marked as having the key regardless. The device that never received it was recorded as done, so it was never sent the key again, and from then on it couldn’t read anything the bot said in that group. It only recovers if that device happens to send a retry receipt for that exact group.

Now a device is marked only after its key node is actually present in the stanza, and any remaining devices are recorded and retried on the next delivery:

```
WARN  sender key did not reach every device, leaving them unmarked so the next send retries
      jid: "120363000000000000@g.us"
      skipped: [ "628000:12@s.whatsapp.net" ]
```

If a group was already stuck before this fix, clear its memory once, and the next message will redistribute its key to everyone:

```js
const reset = await sock.resetGroupSenderKey('120363000000000000@g.us')
console.log(reset)
// { jid: '120363000000000000@g.us', cleared: 4, devices: [ '628000:12@s.whatsapp.net', … ] }

await sock.sendMessage('120363000000000000@g.us', { text: 'hello' })
```

It only accepts group jids, and it does not delete sessions or keys—it simply forgets who has already been notified, so the next send notifies everyone again. Safe to run in any group at any time; the cost is one larger stanza.

**Read the `cleared` count; that’s the diagnosis.** A number above zero means there really were stale records, and the next send should fix the group. `cleared: 0` means nothing at all was stored for that jid—so the sender key is not the problem, and the cause is one of the three below. Clearing it again won’t help.

Before blaming the sender key, rule out the two cheaper causes first:

| What to check | What it means |
| --- | --- |
| Are the group messages reaching `messages.upsert` at all? | If nothing arrives, this is incoming decryption, not sending. Look for `failed to decrypt message` in the logs—the library responds to that automatically with a retry request. |
| Does `messageStubType` say `CIPHERTEXT`? | The message arrived but can’t be read. Same as above; it usually fixes itself after one or two messages. |
| Does `sendMessage` throw an error for that jid? | Then it’s the group metadata fetch, not the encryption—check the error, not the key. |

<a id="kode-pairing-harus-tepat-8-karakter"></a>
### The pairing code must be exactly 8 characters

When using a custom pairing code:

```js
await sock.requestPairingCode(phone, 'RABBITXMD01')
```

The custom value must contain exactly eight characters.

<a id="kode-pairing-muncul-tapi-ponselnya-tidak-pernah-menampilkan-prompt"></a>
### The pairing code appears, but the phone never shows a prompt

Check what the request throws before assuming the notification is at fault. `requestPairingCode` now waits for the server and reports rejections instead of returning a code that was never registered:

| Message | Meaning |
|---|---|
| `rate-overlimit` (`429`) | too many attempts — wait; trying again will only make things worse |
| `not-allowed` / feature error | phone-number linking is not enabled for that account |
| `must be in international format` (`400`) | the number is not `<kode negara><nomor nasional>` |
| `accepted without registering` | the server responded without a pairing ref |
| `never answered` | no response came at all |

If none of these appear and the code is registered, enter it manually via **WhatsApp → Linked Devices → Link with phone number**. If it is accepted there, the registration is fine and only the push notification failed to arrive, which is determined on the server side.

Verify from outside your bot with `node script/testpairing.js <nomor> --check-only`.

<a id="permintaan-pairing-ditolak-dengan-409"></a>
### Pairing request rejected with 409

There is still other code pending. Wait until it finishes or call `sock.cancelPairingCode()` first — see [Pairing Code](#-kode-pairing).

<a id="socket-is-required"></a>
### `Socket is required`

The builder class requires an active Baileys socket:

```js
const button = new MB.Button(sock)
```

Do not create it without providing `sock`.

<a id="button-atau-airich-tergambar-berbeda"></a>
### Button or AIRich renders differently

Interactive WhatsApp payloads can depend on:

- WhatsApp app version
- Web protocol changes
- Account/server rollout
- Message type compatibility

Always test experimental message formats before using them in production.

<a id="yang-muncul-lid-bukan-jid-nomor-telepon"></a>
### LID appears instead of a phone number JID

This is normal in newer WhatsApp addressing flows. Check `participantAlt` or `remoteJidAlt` if available, rather than blindly converting `@lid` to `@s.whatsapp.net`.

<a id="sesi-ter-logout"></a>
### Session logged out

If WhatsApp returns `DisconnectReason.loggedOut`, delete the invalid local session and pair the account again.

---

<a id="license-and-attribution"></a>
## License and attribution

Review the repository's [`LICENSE`](./LICENSE), [`NOTICE.md`](./NOTICE.md), and [`EXPERIMENTAL.md`](./EXPERIMENTAL.md) before redistribution or production use. Required third-party copyright and license notices are preserved in the repository. This RabbitXmd project is independently maintained; it is not the official distribution of the compatibility-named package namespace.
