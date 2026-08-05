# 🐇 RabbitXmd Baileys

> [!NOTE]
> 📄 This project is maintained with limited scope and is not intended to replace upstream Baileys.

### 📋 Table of Contents
- [🛠️ Internal Adjustments](#️-internal-adjustments)
- [📨 Messages Handling \& Compatibility](#-messages-handling--compatibility)
- [🧩 Additional Message Options](#-additional-message-options)
- [📥 Installation](#-installation)
  - [🧩 Import (ESM \& CJS)](#-import-esm--cjs)
- [🌐 Connect to WhatsApp (Quick Step)](#-connect-to-whatsapp-quick-step)
  - [🔐 Auth State](#-auth-state)
- [🗄️ Implementing Data Store](#️-implementing-data-store)
- [🪪 WhatsApp IDs Explain](#-whatsapp-ids-explain)
- [✉️ Sending Messages](#️-sending-messages)
  - [🔠 Text](#-text)
  - [😁 Reaction](#-reaction)
  - [📌 Pin Message](#-pin-message)
  - [🔖 Keep Chat](#-keep-chat)
  - [➡️ Forward Message](#️-forward-message)
  - [👤 Contact](#-contact)
  - [📍 Location](#-location)
  - [🗓️ Event](#️-event)
  - [👥 Group Invite](#-group-invite)
  - [🛍️ Product](#️-product)
  - [📊 Poll](#-poll)
  - [💭 Button Response](#-button-response)
  - [✨ Rich Response](#-rich-response)
  - [🧾 Message with Code Block](#-message-with-code-block)
  - [🌏 Message with Inline Entities](#-message-with-inline-entities)
  - [📋 Message with Table](#-message-with-table)
  - [🎞️ Status Mention](#️-status-mention)
- [📁 Sending Media Messages](#-sending-media-messages)
  - [🖼️ Image](#️-image)
  - [🎥 Video](#-video)
  - [📃 Sticker](#-sticker)
  - [💽 Audio](#-audio)
  - [🗂️ Document](#️-document)
  - [🖼️ Album (Image \& Video)](#️-album-image--video)
  - [📦 Sticker Pack](#-sticker-pack)
- [👉🏻 Sending Interactive Messages](#-sending-interactive-messages)
  - [🔘 Buttons](#-buttons)
  - [📋 List](#-list)
  - [🗄️ Interactive](#️-interactive)
  - [🗂️ Carousel \& Native Flow](#️-carousel--native-flow)
  - [🔈 Native Flow with Audio Footer](#-native-flow-with-audio-footer)
  - [🫙 Hydrated Template](#-hydrated-template)
- [💳 Sending Payment Messages](#-sending-payment-messages)
- [📨 Handling Incoming Messages](#-handling-incoming-messages)
  - [✔️✔️ Sending Real Read Receipts](#️️-sending-real-read-receipts)
  - [🔁 Recovering Failed / Expired Media](#-recovering-failed--expired-media)
  - [📜 On-Demand History Sync](#-on-demand-history-sync)
  - [🔄 Requesting a Resend for a "Placeholder" Message](#-requesting-a-resend-for-a-placeholder-message)
- [👥 Group Management](#-group-management)
  - [🧱 Create \& Fetch](#-create--fetch)
  - [✏️ Update Subject / Description](#️-update-subject--description)
  - [👤 Manage Participants](#-manage-participants)
  - [🔗 Invite Links](#-invite-links)
  - [⚙️ Group Settings](#️-group-settings)
  - [🙋 Approving / Rejecting Join Requests](#-approving--rejecting-join-requests)
  - [🏷️ Group Member Tag](#️-group-member-tag)
  - [🚪 Leave a Group](#-leave-a-group)
  - [📡 Listening to Group Events](#-listening-to-group-events)
- [🏘️ Community Management](#️-community-management)
- [📰 Newsletter (Channel) Management](#-newsletter-channel-management)
  - [📡 Listening to Newsletter Events](#-listening-to-newsletter-events)
- [📞 Detecting \& Rejecting Incoming Calls](#-detecting--rejecting-incoming-calls)
- [📟 Placing Voice Calls (VoIP)](#-placing-voice-calls-voip)
  - [🔌 Attach \& Place a Call](#-attach--place-a-call)
  - [🎧 Sending Real Audio Instead of Silence](#-sending-real-audio-instead-of-silence)
  - [📴 Cleaning Up](#-cleaning-up)
- [🛡️ Built-in AntiBot (Bot \& Link Detection)](#️-built-in-antibot-bot--link-detection)
  - [⚙️ Native Group Enforcement (kick / warn / delete)](#️-native-group-enforcement-kick--warn--delete)
- [👤 Profile \& Privacy Management](#-profile--privacy-management)
- [🚫 Blocklist](#-blocklist)
- [🔍 Checking Numbers on WhatsApp](#-checking-numbers-on-whatsapp)
- [💬 Chat Modifications](#-chat-modifications)
- [🏷️ Labels \& Quick Replies](#️-labels--quick-replies)
- [📇 Contact Management](#-contact-management)
- [🏪 Business Tools (Catalog \& Storefront)](#-business-tools-catalog--storefront)
- [📡 Quick Reference — All Events](#-quick-reference--all-events)
- [🔌 Session Management](#-session-management)

### 🛠️ Internal Adjustments

- 🖼️ Fixed an issue where media could not be sent to newsletters due to an upstream issue.
- 📁 Reintroduced `makeInMemoryStore` with a minimal ESM adaptation and small adjustments for Baileys v7.
- 📦 Switched FFmpeg execution from `exec` to `spawn` for safer process handling.
- 🗃️ Added `@napi-rs/image` as a supported image processing backend in `getImageProcessingLibrary()`, offering a balance between performance and compatibility.

### 📨 Messages Handling & Compatibility

- 📩 Expanded messages support for:
   - 🖼️ Album Message
   - 👤 Group Status Message
   - 👉🏻 Interactive Message (buttons, lists, native flows, templates, carousels)
   - 🎞️ Status Mention Message
   - 📦 Sticker Pack Message
   - ✨ Rich Response Message **[NEW]**
   - 🧾 Message with Code Blocks **[NEW]**
   - 🌏 Message with Inline Entities **[NEW]**
   - 📋 Message with Table **[NEW]**
   - 💳 Payment-related Messages (payment requests, invites, orders, invoices)

- 📰 Simplified sending messages with `externalAdReply`, without requiring manual `contextInfo`.
- 💭 Added support for quoting messages inside channels (newsletter). **[NEW]**
- 🎀 Added support for custom button icons. **[NEW]**

### 🧩 Additional Message Options

- 👁️ Added optional boolean flags:
  - 🤖 `ai`
  - 📣 `mentionAll`
  - 🔧 `ephemeral`
  - 👥 `groupStatus`
  - 🐱 `isLottie`
  - 📑 `spoiler`
  - 👁️ `viewOnce`
  - 👁️ `viewOnceV2`
  - 👁️ `viewOnceV2Extension`
  - 🗄️ `interactiveAsTemplate`
  - 🔒 `secureMetaServiceLabel`
  - 📄 `raw`

### 📥 Installation

#### package.json

```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "github:rabbitxmd/baileys"
  }
}
```

#### Terminal

```bash
npm i github:rabbitxmd/baileys
```

#### 🧩 Import (ESM & CJS)

```javascript
// --- ESM
import { makeWASocket } from '@whiskeysockets/baileys'

// --- CJS (tested and working on Node.js 24 ✅)
const { makeWASocket } = require('@whiskeysockets/baileys')
```

### 🌐 Connect to WhatsApp (Quick Step)

```javascript
import {
   makeWASocket,
   delay,
   DisconnectReason,
   useMultiFileAuthState
} from '@whiskeysockets/baileys'

import { Boom } from '@hapi/boom'
import pino from 'pino'

// --- Connect with pairing code
const myPhoneNumber = '9125555555555'

const logger = pino({ level: 'silent' })

const connectToWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')

   const sock = makeWASocket({
      logger,
      auth: state
   })

   sock.ev.on('creds.update', saveCreds)

   sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'connecting' && !sock.authState.creds.registered) {
         await delay(1500)

         const code = await sock.requestPairingCode(myPhoneNumber)
         console.log('🔗 Pairing code:', code)
      }

      else if (connection === 'close') {
         const shouldReconnect =
            new Boom(lastDisconnect?.error)?.output?.statusCode !==
            DisconnectReason.loggedOut

         console.log(
            '⚠️ Connection closed:',
            lastDisconnect?.error,
            'Reconnect:',
            shouldReconnect
         )

         if (shouldReconnect) {
            connectToWhatsApp()
         }
      }

      else if (connection === 'open') {
         console.log('✅ Successfully connected to WhatsApp')
      }
   })

   sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
         if (!message.message) continue

         console.log('🔔 Got new message:', message)

         await sock.sendMessage(message.key.remoteJid, {
            text: '👋🏻 Hello world'
         })
      }
   })
}

connectToWhatsApp()
```

#### 🔐 Auth State

> [!NOTE]
> You can use the experimental `useSingleFileAuthState`
> and `useSqliteAuthState` as an alternative to
> `useMultiFileAuthState`.

> `useSingleFileAuthState` already includes an internal cache,
> so there is **no need** to wrap `state.keys`
> using `makeCacheableSignalKeyStore`.
### 🗄️ Implementing Data Store

> [!CAUTION]
> I highly recommend building your own data store, as keeping an entire chat history in memory can lead to excessive RAM usage.

```javascript
import {
   makeWASocket,
   makeInMemoryStore,
   delay,
   DisconnectReason,
   useMultiFileAuthState
} from '@whiskeysockets/baileys'

import { Boom } from '@hapi/boom'
import pino from 'pino'

const myPhoneNumber = '6288888888888'

// --- Create your store path
const storePath = './store.json'

const logger = pino({ level: 'silent' })

const connectToWhatsApp = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')

   const sock = makeWASocket({
      logger,
      auth: state
   })

   const store = makeInMemoryStore({
      logger,
      socket: sock
   })

   store.bind(sock.ev)

   sock.ev.on('creds.update', saveCreds)

   sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'connecting' && !sock.authState.creds.registered) {
         await delay(1500)

         const code = await sock.requestPairingCode(myPhoneNumber)
         console.log('🔗 Pairing code:', code)
      }

      else if (connection === 'close') {
         const shouldReconnect =
            new Boom(lastDisconnect?.error)?.output?.statusCode !==
            DisconnectReason.loggedOut

         console.log(
            '⚠️ Connection closed:',
            lastDisconnect?.error,
            'Reconnect:',
            shouldReconnect
         )

         if (shouldReconnect) {
            connectToWhatsApp()
         }
      }

      else if (connection === 'open') {
         console.log('✅ Successfully connected to WhatsApp')
      }
   })

   sock.ev.on('chats.upsert', () => {
      console.log('✉️ Got chats', store.chats.all())
   })

   sock.ev.on('contacts.upsert', () => {
      console.log('👥 Got contacts', Object.values(store.contacts))
   })

   // --- Read store from file
   store.readFromFile(storePath)

   // --- Save store every 3 minutes
   setInterval(() => {
      store.writeToFile(storePath)
   }, 180000)
}

connectToWhatsApp()
```
### 🪪 WhatsApp IDs Explain

`id` is the WhatsApp ID (also known as `jid` or `lid`) of the user, group, or newsletter you want to interact with.

- **User (PN):**
  ```
  [country_code][phone_number]@s.whatsapp.net
  ```
  Example:
  ```
  19999999999@s.whatsapp.net
  ```

- **User (LID):**
  ```
  12699999999@lid
  ```

- **Group:**
  ```
  123456789-123345@g.us
  ```

- **Meta AI:**
  ```
  13135550002@bot
  ```

- **Broadcast:**
  ```
  [timestamp]@broadcast
  ```

- **Status:**
  ```
  status@broadcast
  ```

---

## ✉️ Sending Messages

> [!NOTE]
> You can get the destination JID from:
>
> ```javascript
> message.key.remoteJid
> ```

### 🔠 Text

```javascript
// --- Regular text
await sock.sendMessage(jid, {
   text: '👋 Hello World!'
}, {
   quoted: message
})

// --- Link preview
const url = 'https://rabbitpair.zone.id'

await sock.sendMessage(jid, {
   text: `${url}\n\nOpen this website.`,
   linkPreview: {
      'matched-text': url,
      title: 'RabbitXmd',
      description: 'Powered by RabbitXmd',
      previewType: 0,
      jpegThumbnail: fs.readFileSync('./thumb.jpg')
   }
})

// --- Large preview
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

const { imageMessage } = await prepareWAMessageMedia({
   image: {
      url: './thumb.jpg'
   }
}, {
   upload: sock.waUploadToServer,
   mediaTypeOverride: 'thumbnail-link'
})

imageMessage.height = 720
imageMessage.width = 480

await sock.sendMessage(jid, {
   text: `${url}\n\nRabbitXmd`,
   linkPreview: {
      'matched-text': url,
      title: 'RabbitXmd',
      description: 'Powered by RabbitXmd',
      previewType: 0,
      jpegThumbnail: fs.readFileSync('./thumb.jpg'),
      highQualityThumbnail: imageMessage,
      linkPreviewMetadata: {
         linkMediaDuration: 0,
         socialMediaPostType: 1
      }
   },
   favicon: {
      url: './favicon.ico'
   }
})
```
#### 🔔 Mention

```javascript
// --- Regular mention
await sock.sendMessage(jid, {
   text: '👋 Hello @917980651473',
   mentions: ['917980651473@s.whatsapp.net']
}, {
   quoted: message
})

// --- Mention all members
await sock.sendMessage(jid, {
   text: '👋 Hello @all',
   mentionAll: true
}, {
   quoted: message
})
```

---

#### 😁 Reaction

```javascript
await sock.sendMessage(jid, {
   react: {
      key: message.key,
      text: '🔥'
   }
})
```

---

#### 📌 Pin Message

```javascript
await sock.sendMessage(jid, {
   pin: message.key,
   time: 86400, // 1 Day
   type: 1      // Use 2 to unpin
})
```

Supported pin durations:

```text
86400      = 1 Day
604800     = 7 Days
2592000    = 30 Days
```

---

#### 🔖 Keep Chat

> [!NOTE]
> Keep Chat only works when disappearing messages are enabled.

```javascript
await sock.sendMessage(jid, {
   keep: message.key,
   type: 1 // Use 2 to remove
})
```

---

#### ➡️ Forward Message

```javascript
await sock.sendMessage(jid, {
   forward: message
})

// Force forward

await sock.sendMessage(jid, {
   forward: message,
   force: true
})
```
#### 👤 Contact

```javascript
const vcard =
'BEGIN:VCARD\n' +
'VERSION:3.0\n' +
'FN:RabbitXmd\n' +
'ORG:RabbitXmd;\n' +
'TEL;type=CELL;type=VOICE;waid=917980651473:+91 79 80 65 14 73\n' +
'END:VCARD'

await sock.sendMessage(jid, {
   contacts: {
      displayName: 'RabbitXmd',
      contacts: [
         { vcard }
      ]
   }
}, {
   quoted: message
})
```

---

#### 📍 Location

```javascript
await sock.sendMessage(jid, {
   location: {
      degreesLatitude: 24.121231,
      degreesLongitude: 55.1121221,
      name: '👋 I am here'
   }
}, {
   quoted: message
})
```

---

#### 🗓️ Event

```javascript
await sock.sendMessage(jid, {
   event: {
      name: '🎉 RabbitXmd Meetup',
      description: 'Official RabbitXmd community meetup.',
      call: 'audio', // or "video"
      startDate: new Date(Date.now() + 3600000),
      endDate: new Date(Date.now() + 28800000),
      isCancelled: false,
      isScheduleCall: false,
      extraGuestsAllowed: false,
      location: {
         name: 'Jakarta',
         degreesLatitude: -6.2,
         degreesLongitude: 106.8
      }
   }
}, {
   quoted: message
})
```

---

#### 👥 Group Invite

```javascript
const inviteCode = groupUrl
   .split('chat.whatsapp.com/')[1]
   ?.split('?')[0]

const groupJid = '1201111111111@g.us'
const groupName = 'RabbitXmd'

await sock.sendMessage(jid, {
   groupInvite: {
      inviteCode,
      inviteExpiration: Date.now() + 86400000,
      text: '👋 Hello, we invite you to join our group.',
      jid: groupJid,
      subject: groupName
   }
}, {
   quoted: message
})
```

---

#### 🛍️ Product

```javascript
import { randomUUID } from 'crypto'

await sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   body: '👋 Check out our product!',
   footer: 'RabbitXmd',
   product: {
      currencyCode: 'IDR',
      description: '🛍️ Premium Product',
      priceAmount1000: 70000000,
      productId: randomUUID(),
      productImageCount: 1,
      salePriceAmount1000: 65000000,
      signedUrl: 'https://github.com/rabbitxmd/baileys',
      title: '📦 RabbitXmd Premium',
      url: 'https://github.com/rabbitxmd/baileys'
   },
   businessOwnerJid: '0@s.whatsapp.net'
})
```
#### 📊 Poll

```javascript
// --- Regular Poll
await sock.sendMessage(jid, {
   poll: {
      name: '🔥 Voting Time',
      values: ['Yes', 'No'],
      selectableCount: 1,
      toAnnouncementGroup: false,
      endDate: new Date(Date.now() + 28800000), // Optional
      hideVoter: false, // Optional
      canAddOption: false // Optional
   }
}, {
   quoted: message
})

// --- Quiz (Newsletter only)
await sock.sendMessage('1211111111111@newsletter', {
   poll: {
      name: '🔥 Quiz',
      values: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pollType: 1
   }
}, {
   quoted: message
})

// --- Poll Result
await sock.sendMessage(jid, {
   pollResult: {
      name: '📝 Poll Result',
      votes: [{
         name: 'Yes',
         voteCount: 10
      }, {
         name: 'No',
         voteCount: 2
      }],
      pollType: 0
   }
}, {
   quoted: message
})

// --- Poll Update
await sock.sendMessage(jid, {
   pollUpdate: {
      metadata: {},
      key: message.key,
      vote: {
         enclv: /* Buffer */,
         encPayload: /* Buffer */
      }
   }
}, {
   quoted: message
})
```

---

#### 💭 Button Response

```javascript
// --- buttonsResponseMessage
await sock.sendMessage(jid, {
   type: 'plain',
   buttonReply: {
      id: '#Menu',
      displayText: '✨ RabbitXmd Menu'
   }
}, {
   quoted: message
})

// --- interactiveResponseMessage
await sock.sendMessage(jid, {
   flowReply: {
      format: 0,
      text: '💭 Response',
      name: 'menu_options',
      paramsJson: JSON.stringify({
         id: '#Menu',
         description: '✨ RabbitXmd Menu'
      })
   }
}, {
   quoted: message
})

// --- listResponseMessage
await sock.sendMessage(jid, {
   listReply: {
      title: '📄 See More',
      description: '✨ RabbitXmd Menu',
      id: '#Menu'
   }
}, {
   quoted: message
})

// --- templateButtonReplyMessage
await sock.sendMessage(jid, {
   type: 'template',
   buttonReply: {
      id: '#Menu',
      displayText: '✨ RabbitXmd Menu',
      index: 1
   }
}, {
   quoted: message
})
```

---

#### ✨ Rich Response

```javascript
await sock.sendMessage(jid, {
   disclaimerText: 'RabbitXmd Example',
   richResponse: [{
      text: 'Example Usage'
   }, {
      language: 'javascript',
      code: [{
         highlightType: 0,
         codeContent: 'console.log("Hello, RabbitXmd!")'
      }]
   }, {
      text: 'Pretty simple, right?\n'
   }, {
      text: 'Runtime Comparison'
   }, {
      title: 'Node.js vs Bun vs Deno',
      table: [{
         isHeading: true,
         items: ['', 'Node.js', 'Bun', 'Deno']
      }, {
         isHeading: false,
         items: ['Engine', 'V8', 'JavaScriptCore', 'V8']
      }, {
         isHeading: false,
         items: ['Performance', '4/5', '5/5', '4/5']
      }]
   }, {
      text: 'RabbitXmd supports rich response messages.'
   }]
})
```

---

```javascript
import { tokenizeCode } from '@whiskeysockets/baileys'

const language = 'javascript'
const code = 'console.log("Hello RabbitXmd!")'

await sock.sendMessage(jid, {
   disclaimerText: 'Tokenized Code',
   richResponse: [{
      text: 'Example'
   }, {
      language,
      code: tokenizeCode(code, language)
   }, {
      text: 'Done.'
   }]
})
```
#### 🧾 Message with Code Block

> [!NOTE]
> This feature already includes a built-in tokenizer with `tokenizeCode`.

```javascript
sock.sendMessage(jid, {
   disclaimerText: 'Code Block',
   headerText: '## Example Usage',
   contentText: '---',
   code: 'console.log("Hello, World!")',
   language: 'javascript',
   footerText: 'Pretty simple, right?'
})
```

---

#### 🌏 Message with Inline Entities

```javascript
sock.sendMessage(jid, {
   disclaimerText: 'Inline Entities',
   headerText: '## Check Out!',
   contentText: '---',
   links: [{
      text: '1. Google',
      title: 'Popular Search Engine',
      url: 'https://www.google.com/'
   }, {
      text: '2. YouTube',
      title: 'Popular Streaming Platform',
      url: 'https://www.youtube.com/'
   }, {
      text: '3. RabbitXmd',
      title: 'Enhanced Baileys Fork',
      url: 'https://github.com/rabbitxmd/baileys'
   }],
   footerText: '---'
})
```

---

#### 📋 Message with Table

```javascript
sock.sendMessage(jid, {
   disclaimerText: 'Table',
   headerText: '## Comparison between Node.js, Bun, and Deno',
   contentText: '---',
   title: 'Runtime Comparison',
   table: [
      ['', 'Node.js', 'Bun', 'Deno'],
      ['Engine', 'V8 (C++)', 'JavaScriptCore (C++)', 'V8 (C++)'],
      ['Performance', '4/5', '5/5', '4/5']
   ],
   noHeading: false, // Optional
   footerText: 'Does this help clarify the differences?'
})
```

---

#### 🎞️ Status Mention

```javascript
sock.sendMessage([jidA, jidB, jidC], {
   text: 'Hello! 👋🏻'
})
```

---

# 📁 Sending Media Messages

> [!NOTE]
> For media messages, you can pass:
>
> - `Buffer`
> - `{ stream: Readable }`
> - `{ url: string }`
>
> The URL can be either a local file path or an HTTP/HTTPS URL.

---

### 🖼️ Image

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🔥 Superb'
}, {
   quoted: message
})
```

---

### 🎥 Video

```javascript
sock.sendMessage(jid, {
   video: {
      url: './path/to/video.mp4'
   },
   gifPlayback: false, // Set true to send as GIF
   ptv: false,         // Set true to send as PTV
   caption: '🔥 Superb'
}, {
   quoted: message
})
```

---

### 📃 Sticker

```javascript
sock.sendMessage(jid, {
   sticker: {
      url: './path/to/sticker.webp'
   }
}, {
   quoted: message
})
```

---

### 💽 Audio

```javascript
sock.sendMessage(jid, {
   audio: {
      url: './path/to/audio.mp3'
   },
   ptt: false // Set true to send as Voice Note
}, {
   quoted: message
})
```

---

### 🗂️ Document

```javascript
sock.sendMessage(jid, {
   document: {
      url: './path/to/document.pdf'
   },
   mimetype: 'application/pdf',
   caption: '✨ My Work!'
}, {
   quoted: message
})
```
#### 🖼️ Album (Image & Video)

```javascript
sock.sendMessage(jid, {
   album: [{
      image: {
         url: './path/to/image.jpg'
      },
      caption: '1st image'
   }, {
      video: {
         url: './path/to/video.mp4'
      },
      caption: '1st video'
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '2nd image'
   }, {
      video: {
         url: './path/to/video.mp4'
      },
      caption: '2nd video'
   }]
}, {
   quoted: message
})
```

---

#### 📦 Sticker Pack

> [!IMPORTANT]
> If `sharp` or `@napi-rs/image` is not installed, the `cover` and `stickers` must already be in **WebP** format.

```javascript
sock.sendMessage(jid, {
   cover: {
      url: './path/to/image.webp'
   },
   stickers: [{
      data: {
         url: './path/to/image.webp'
      }
   }, {
      data: {
         url: './path/to/image.webp'
      }
   }, {
      data: {
         url: './path/to/image.webp'
      }
   }],
   name: '📦 RabbitXmd Sticker Pack',
   publisher: '🌟 RabbitXmd',
   description: '@whiskeysockets/baileys'
}, {
   quoted: message
})
```

---

# 👉🏻 Sending Interactive Messages

The following sections cover interactive message types supported by RabbitXmd:

- 🔘 Buttons
- 📋 Lists
- 🗄️ Interactive (Native Flow)
- 🫙 Hydrated Template

### 🔘 Buttons

#### Regular Buttons

```javascript
sock.sendMessage(jid, {
   text: '👆🏻 Buttons!',
   footer: 'RabbitXmd',
   buttons: [{
      text: '👋🏻 Sign Up',
      id: '#SignUp'
   }]
}, {
   quoted: message
})
```

---

#### Buttons with Media & Native Flow

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '👆🏻 Buttons and Native Flow!',
   footer: 'RabbitXmd',
   buttons: [{
      text: '👋🏻 Rating',
      id: '#Rating'
   }, {
      text: '📋 Select',
      sections: [{
         title: '✨ Section 1',
         rows: [{
            header: '',
            title: '💭 Secret Ingredient',
            description: '',
            id: '#SecretIngredient'
         }]
      }, {
         title: '✨ Section 2',
         highlight_label: '🔥 Popular',
         rows: [{
            header: '',
            title: '🏷️ Coupon',
            description: '',
            id: '#CouponCode'
         }]
      }]
   }]
}, {
   quoted: message
})
```
#### 📋 List

> [!NOTE]
> It only works in private chats (`@s.whatsapp.net`).

```javascript
sock.sendMessage(jid, {
   text: '📋 List!',
   footer: 'RabbitXmd',
   buttonText: '📋 Select',
   title: '👋🏻 Hello',
   sections: [{
      title: '🚀 Menu 1',
      rows: [{
         title: '✨ AI',
         description: '',
         rowId: '#AI'
      }]
   }, {
      title: '🌱 Menu 2',
      rows: [{
         title: '🔍 Search',
         description: '',
         rowId: '#Search'
      }]
   }]
}, {
   quoted: message
})
```

---

### 🗄️ Interactive

The next section covers Native Flow interactive messages, including:

- Native Flow
- Native Flow with Offers
- Carousel + Native Flow
- Audio Footer
- Interactive as Template

##### Native Flow

```javascript
sock.sendMessage(jid, {
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🗄️ Interactive!',
   footer: 'RabbitXmd',

   optionText: '👉🏻 Select Options', // Optional
   optionTitle: '📄 Select Options', // Optional

   offerText: '🏷️ New Coupon!',      // Optional
   offerCode: 'RabbitXmd',            // Optional
   offerUrl: 'https://github.com/rabbitxmd/baileys', // Optional
   offerExpiration: Date.now() + 3_600_000,

   nativeFlow: [{
      text: '👋🏻 Greeting',
      id: '#Greeting',
      icon: 'review'
   }, {
      text: '📞 Call',
      call: '628123456789'
   }, {
      text: '📋 Copy',
      copy: 'RabbitXmd'
   }, {
      text: '🌐 Source',
      url: 'https://github.com/rabbitxmd/baileys',
      useWebview: true
   }, {
      text: '📋 Select',
      sections: [{
         title: '✨ Section 1',
         rows: [{
            header: '',
            title: '🏷️ Coupon',
            description: '',
            id: '#CouponCode'
         }]
      }, {
         title: '✨ Section 2',
         highlight_label: '🔥 Popular',
         rows: [{
            header: '',
            title: '💭 Secret Ingredient',
            description: '',
            id: '#SecretIngredient'
         }]
      }],
      icon: 'default'
   }],

   interactiveAsTemplate: false
}, {
   quoted: message
})
```
#### 🗂️ Carousel & Native Flow

```javascript
sock.sendMessage(jid, {
   text: '🗂️ Interactive with Carousel!',
   footer: 'RabbitXmd',

   cards: [{
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 1',
      footer: '🏷️ RabbitXmd',

      nativeFlow: [{
         text: '🌐 Source',
         url: 'https://github.com/rabbitxmd/baileys',
         useWebview: true
      }]
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 2',
      footer: '🏷️ RabbitXmd',

      offerText: '🏷️ New Coupon!',
      offerCode: 'RabbitXmd',
      offerUrl: 'https://github.com/rabbitxmd/baileys',
      offerExpiration: Date.now() + 3_600_000,

      nativeFlow: [{
         text: '🌐 Source',
         url: 'https://github.com/rabbitxmd/baileys'
      }]
   }, {
      image: {
         url: './path/to/image.jpg'
      },
      caption: '🖼️ Image 3',
      footer: '🏷️ RabbitXmd',

      optionText: '👉🏻 Select Options',
      optionTitle: '📄 Select Options',

      offerText: '🏷️ New Coupon!',
      offerCode: 'RabbitXmd',
      offerUrl: 'https://github.com/rabbitxmd/baileys',
      offerExpiration: Date.now() + 3_600_000,

      nativeFlow: [{
         text: '🛒 Product',
         id: '#Product',
         icon: 'default'
      }, {
         text: '🌐 Source',
         url: 'https://github.com/rabbitxmd/baileys'
      }]
   }]
}, {
   quoted: message
})
```

---

#### 🔈 Native Flow with Audio Footer

```javascript
sock.sendMessage(jid, {
   text: '🔈 Music in the footer!',

   audioFooter: {
      url: './path/to/audio.mp3'
   },

   nativeFlow: [{
      text: '👍🏻 Good, Next',
      id: '#Next',
      icon: 'review'
   }, {
      text: '👎🏻 Skip',
      id: '#Skip',
      icon: 'default'
   }]
}, {
   quoted: message
})
```
#### 🫙 Hydrated Template

```javascript
sock.sendMessage(jid, {
   title: '👋🏻 Hello',
   image: {
      url: './path/to/image.jpg'
   },
   caption: '🫙 Template!',
   footer: 'RabbitXmd',

   templateButtons: [{
      text: '👉🏻 Tap Here',
      id: '#Order'
   }, {
      text: '🌐 GitHub',
      url: 'https://github.com/rabbitxmd/baileys'
   }, {
      text: '📞 Call',
      call: '917985214536'
   }]
}, {
   quoted: message
})
```

---

# 💳 Sending Payment Messages

The following payment message types are supported:

- ➕ Invite Payment
- 🧾 Invoice
- 🛍️ Order
- 💳 Request Payment

> [!NOTE]
> Usage examples for this section are still being written and will be added soon.

---

# 📨 Handling Incoming Messages

Every incoming or outgoing message passes through the `messages.upsert` event.

```javascript
sock.ev.on('messages.upsert', async ({ messages, type }) => {
   // type: 'notify' -> new realtime message | 'append' -> history/offline sync
   for (const msg of messages) {
      if (!msg.message) continue // skip protocol / reaction-only updates

      const jid = msg.key.remoteJid
      const isGroup = jid?.endsWith('@g.us')
      const sender = msg.key.participant || jid
      const isFromMe = msg.key.fromMe

      const text =
         msg.message.conversation ||
         msg.message.extendedTextMessage?.text ||
         msg.message.imageMessage?.caption ||
         msg.message.videoMessage?.caption ||
         ''

      console.log(`📩 [${type}] ${isGroup ? '👥' : '👤'} ${sender}: ${text}`)

      if (!isFromMe && text === '!ping') {
         await sock.sendMessage(jid, { text: '🏓 Pong!' }, { quoted: msg })
      }
   }
})
```

> [!NOTE]
> `type` is `'notify'` for a freshly received message and `'append'` for messages that arrive as part of history sync or while you were offline.

### ✔️✔️ Sending Real Read Receipts

`chatModify({ markRead: true }, ...)` only updates your own app-state (so *your* chat list shows it as read). To actually send the blue-tick read receipt to the other person, use `readMessages`:

```javascript
await sock.readMessages([msg.key]) // marks one or more messages as read on the wire
```

### 🔁 Recovering Failed / Expired Media

If a media message fails to download because the media has expired on WhatsApp's servers, you can ask the sender's device to re-upload it:

```javascript
try {
   await sock.downloadMediaMessage(msg)
} catch {
   await sock.updateMediaMessage(msg) // requests a fresh re-upload, then retry the download
}
```

### 📜 On-Demand History Sync

Pull older messages for a chat beyond what was synced on connect:

```javascript
await sock.fetchMessageHistory(
   50,                 // how many messages to request
   oldestMsg.key,      // the oldest message key you currently have
   oldestMsg.messageTimestamp
)
// the results arrive later through the regular 'messaging-history.set' event
```

### 🔄 Requesting a Resend for a "Placeholder" Message

Occasionally a message arrives as an empty/placeholder stub (e.g. view-once or a decrypt failure). You can ask the sender's device to resend it:

```javascript
await sock.requestPlaceholderResend(msg.key)
```

---

# 👥 Group Management

### 🧱 Create & Fetch

```javascript
// --- Create a group
const group = await sock.groupCreate('🚀 My Awesome Group', [
   '917980651473@s.whatsapp.net',
   '918888888888@s.whatsapp.net'
])
console.log('✅ Group created:', group.id)

// --- Get group metadata
const metadata = await sock.groupMetadata(groupJid)

// --- Fetch every group you're currently in
const allGroups = await sock.groupFetchAllParticipating()
```

### ✏️ Update Subject / Description

```javascript
await sock.groupUpdateSubject(groupJid, '🎉 New Group Name')
await sock.groupUpdateDescription(groupJid, 'Welcome to the group!')
```

### 👤 Manage Participants

```javascript
const users = ['917980651473@s.whatsapp.net']

await sock.groupParticipantsUpdate(groupJid, users, 'add')      // add members
await sock.groupParticipantsUpdate(groupJid, users, 'remove')   // remove members
await sock.groupParticipantsUpdate(groupJid, users, 'promote')  // make admin
await sock.groupParticipantsUpdate(groupJid, users, 'demote')   // remove admin
```

### 🔗 Invite Links

```javascript
const code = await sock.groupInviteCode(groupJid)
console.log('🔗 Invite link:', `https://chat.whatsapp.com/${code}`)

// --- Revoke the current link and generate a new one
await sock.groupRevokeInvite(groupJid)

// --- Join a group using an invite code
await sock.groupAcceptInvite(inviteCode)

// --- Preview a group before joining
const info = await sock.groupGetInviteInfo(inviteCode)
```

### ⚙️ Group Settings

```javascript
// --- Who can send messages
await sock.groupSettingUpdate(groupJid, 'announcement')     // only admins can send
await sock.groupSettingUpdate(groupJid, 'not_announcement') // everyone can send

// --- Who can edit group info
await sock.groupSettingUpdate(groupJid, 'locked')           // only admins
await sock.groupSettingUpdate(groupJid, 'unlocked')         // everyone

// --- Approve members manually before they join
await sock.groupJoinApprovalMode(groupJid, 'on')
await sock.groupMemberAddMode(groupJid, 'admin_add')

// --- Disappearing messages
await sock.groupToggleEphemeral(groupJid, 604800) // 7 days — use 0 to disable
```

### 🙋 Approving / Rejecting Join Requests

When `groupJoinApprovalMode(jid, 'on')` is enabled, new members don't join instantly — they show up as pending requests that an admin must approve.

```javascript
// --- List everyone waiting to be approved
const pending = await sock.groupRequestParticipantsList(groupJid)
console.log(pending) // [{ jid, type: 'invite' | 'link', ... }]

// --- Approve or reject them
await sock.groupRequestParticipantsUpdate(groupJid, ['917980651473@s.whatsapp.net'], 'approve')
await sock.groupRequestParticipantsUpdate(groupJid, ['917980651473@s.whatsapp.net'], 'reject')
```

### 🏷️ Group Member Tag

Set a short custom label next to your name inside a specific group (distinct from group-wide labels).

```javascript
await sock.updateMemberLabel(groupJid, '🛠️ Moderator')

sock.ev.on('group.member-tag.update', update => {
   console.log('🏷️ Member tag changed:', update)
})
```

### 🚪 Leave a Group

```javascript
await sock.groupLeave(groupJid)
```

### 📡 Listening to Group Events

```javascript
// --- Group metadata changed (subject, description, settings, etc.)
sock.ev.on('groups.update', updates => {
   for (const update of updates) {
      console.log('🛠️ Group updated:', update)
   }
})

// --- Participants added, removed, promoted, or demoted
sock.ev.on('group-participants.update', ({ id, participants, action }) => {
   console.log(`👥 ${action} in ${id}:`, participants)
})

// --- Someone requested to join (when join-approval mode is on)
sock.ev.on('group.join-request', request => {
   console.log('🙋 Join request:', request)
})
```

---

# 🏘️ Community Management

```javascript
// --- Create a community
const community = await sock.communityCreate(
   '🏘️ My Community',
   'A community for all our projects'
)

// --- Create a group inside the community
const group = await sock.communityCreateGroup('📢 Announcements', [], community.id)

// --- Link / unlink an existing group
await sock.communityLinkGroup(groupJid, communityJid)
await sock.communityUnlinkGroup(groupJid, communityJid)

// --- Metadata & linked groups
const metadata = await sock.communityMetadata(communityJid)
const linked = await sock.communityFetchLinkedGroups(communityJid)

// --- Manage participants (same actions as groups)
await sock.communityParticipantsUpdate(communityJid, ['917980651473@s.whatsapp.net'], 'add')

// --- Update subject / description
await sock.communityUpdateSubject(communityJid, '🏘️ New Community Name')
await sock.communityUpdateDescription(communityJid, 'Updated description')

// --- Invite link
const code = await sock.communityInviteCode(communityJid)

// --- Leave the community
await sock.communityLeave(communityJid)
```

> [!NOTE]
> Community metadata changes and participant updates are delivered through the same `groups.update` and `group-participants.update` events used for regular groups.

---

# 📰 Newsletter (Channel) Management

```javascript
// --- Create a newsletter (channel)
const newsletter = await sock.newsletterCreate(
   '📰 RabbitXmd News',
   'Latest updates and announcements'
)
console.log('✅ Newsletter created:', newsletter.id)

// --- Get metadata by jid or invite code
const metadata = await sock.newsletterMetadata('jid', newsletterJid)
// or: await sock.newsletterMetadata('invite', inviteCode)

// --- Follow / unfollow
await sock.newsletterFollow(newsletterJid)
await sock.newsletterUnfollow(newsletterJid)

// --- Mute / unmute
await sock.newsletterMute(newsletterJid)
await sock.newsletterUnmute(newsletterJid)

// --- Update name, description & picture
await sock.newsletterUpdateName(newsletterJid, '📰 Updated Name')
await sock.newsletterUpdateDescription(newsletterJid, 'New description')
await sock.newsletterUpdatePicture(newsletterJid, { url: './path/to/logo.jpg' })
await sock.newsletterRemovePicture(newsletterJid)

// --- React to a newsletter post
await sock.newsletterReactMessage(newsletterJid, serverId, '🔥')

// --- Fetch newsletter messages
const messages = await sock.newsletterFetchMessages('jid', newsletterJid, 20)

// --- Admin actions
await sock.newsletterChangeOwner(newsletterJid, newOwnerJid)
await sock.newsletterDemote(newsletterJid, userJid)
await sock.newsletterDelete(newsletterJid)

// --- List newsletters you're subscribed to
const subscribed = await sock.newsletterSubscribed()
```

### 📡 Listening to Newsletter Events

```javascript
sock.ev.on('newsletter-participants.update', update => {
   console.log('👥 Newsletter participants changed:', update)
})

sock.ev.on('newsletter-settings.update', update => {
   console.log('⚙️ Newsletter settings changed:', update)
})

sock.ev.on('newsletter.reaction', reaction => {
   console.log('❤️ Newsletter reaction:', reaction)
})

sock.ev.on('newsletter.view', view => {
   console.log('👁️ Newsletter viewed:', view)
})
```

---

# 📞 Detecting & Rejecting Incoming Calls

```javascript
sock.ev.on('call', async calls => {
   for (const call of calls) {
      console.log(`📞 Call ${call.status} from ${call.from} (video: ${!!call.isVideo})`)

      if (call.status === 'offer') {
         // --- Automatically reject the incoming call
         await sock.rejectCall(call.id, call.from)
      }
   }
})
```

Possible `call.status` values: `offer`, `ringing`, `accept`, `reject`, `timeout`, `terminate`, `relaylatency`.

```javascript
// --- Create a shareable call link
const link = await sock.createCallLink('voice') // or 'video'
console.log('🔗 Call link:', link)
```

> [!NOTE]
> This only covers detecting and rejecting incoming calls. To place an actual outbound voice call, see the **📟 Placing Voice Calls (VoIP)** section below.

---

# 📟 Placing Voice Calls (VoIP)

This fork ships a real VoIP layer (`lib/Voip`) that can place genuine outbound **voice** calls over WhatsApp's calling infrastructure, on top of an already-connected `sock`.

> [!IMPORTANT]
> - Voice only — video calling is **not** supported.
> - Requires `ffmpeg` installed and available on `PATH` (used to decode/feed audio).
> - `attach(sock)` must be called on an already-open, authenticated socket.
> - This is low-level and experimental — the WASM calling engine talks directly to WhatsApp's call signaling, so expect rough edges.

### 🔌 Attach & Place a Call

```javascript
import { attachVoip, CallState } from '@whiskeysockets/baileys'

// --- Attach the VoIP client to your existing, already-connected sock
const voip = await attachVoip(sock)

// --- Place an outbound voice call
const call = await voip.call('917980651473', {
   durationMs: 120_000,   // auto hang-up after 2 minutes (optional)
   audioSource: 'silence' // 'silence' | path to an audio file | 'lavfi:<filter>'
})

call.on('ringing', () => {
   console.log('📞 Ringing...')
})

call.on('connected', () => {
   console.log('✅ Call connected')
})

call.on('audio', pcm => {
   // Float32Array of incoming PCM audio from the other side
})

call.on('ended', reason => {
   console.log('📴 Call ended:', reason) // 'ended' | 'remote_end' | 'timeout' | 'disconnect'
})

// --- Mute / unmute your outgoing audio
call.mute(true)
call.mute(false)

// --- Manually end the call
call.end()

// --- Or just await the call finishing
const endReason = await call.waitForEnd()
```

### 🎧 Sending Real Audio Instead of Silence

```javascript
// --- Stream an audio/video file's audio track into the call
const call = await voip.call('917980651473', {
   audioSource: './path/to/audio.mp3'
})

// --- Or feed a generated tone via an ffmpeg lavfi filter
const toneCall = await voip.call('917980651473', {
   audioSource: 'lavfi:sine=frequency=440:sample_rate=16000'
})
```

### 📴 Cleaning Up

```javascript
// --- Is a call currently active?
console.log(voip.busy)

// --- Release VoIP engine/relay resources (does NOT close the underlying sock)
voip.disconnect()
```

`call.state` reflects WhatsApp's WASM call-state machine via the `CallState` enum:

| State | Value | Meaning |
|---|---|---|
| `Idle` | 0 | No active call |
| `Calling` | 1 | Dialing out |
| `PreacceptReceived` | 2 | Ringing on the other end |
| `ReceivedCall` | 3 | Incoming call received |
| `AcceptSent` | 4 | We accepted the call |
| `AcceptReceived` | 5 | Peer accepted the call |
| `Active` | 6 | Call is live |
| `ActiveElsewhere` | 7 | Call accepted on another device |
| `Ending` | 13 | Call is wrapping up |

---

# 🛡️ Built-in AntiBot (Bot & Link Detection)

This fork detects two message flags natively — `message.isBotMessage` and `message.isLinkMessage` — and fires dedicated events for them as soon as they're set (unlike `messages.upsert`, which fires *before* the flags exist).

```javascript
sock.ev.on('messages.bot-detect', updates => {
   for (const { key, message } of updates) {
      console.log('🤖 Bot message detected:', key.id)
   }
})

sock.ev.on('messages.link-detect', updates => {
   for (const { key, message } of updates) {
      console.log('🔗 Link message detected:', key.id)
   }
})
```

> [!NOTE]
> `isBotMessage` is set when the sender JID is a known WhatsApp bot / Meta AI, or when the message ID looks script-generated. `isLinkMessage` is set when the text contains a `http(s)://` or `www.` link. These flags are set for **every** message, from anyone — including your own.

### ⚙️ Native Group Enforcement (kick / warn / delete)

On top of the raw events, the socket ships a ready-to-use moderation layer for groups — enable it per-group and it handles detection + action for you.

```javascript
// --- Turn it on for a group (mode: 'kick' | 'warn' | 'delete' | 'null')
sock.setAntiBotSettings(groupJid, { enabled: true, mode: 'warn' })

// --- Check current settings
const settings = sock.getAntiBotSettings(groupJid)
console.log(settings) // { enabled: true, mode: 'warn' }

// --- Turn it off
sock.setAntiBotSettings(groupJid, { enabled: false })
```

| Mode | Behaviour |
|---|---|
| `kick` (default) | Deletes the offending message and removes the sender |
| `warn` | Deletes the message, warns the sender; removes them after 3 warnings |
| `delete` | Deletes the message only |
| `null` | Detection only — no message deletion or action taken |

> [!IMPORTANT]
> The bot itself must be a group admin for delete/kick actions to work, and it never takes action against group admins, the group owner, or its own messages.

---

# 👤 Profile & Privacy Management

```javascript
// --- Update your own profile
await sock.updateProfileName('🐇 RabbitXmd')
await sock.updateProfileStatus('✨ Powered by Baileys')
await sock.updateProfilePicture(sock.user.id, { url: './path/to/avatar.jpg' })
await sock.removeProfilePicture(sock.user.id)

// --- Update the FULL, uncropped profile picture (works for your own DP,
// a group's DP, or — if permitted — someone else's DP)
await sock.updateFullProfilePicture(sock.user.id, { url: './path/to/avatar-full.jpg' })
await sock.updateFullGroupProfilePicture(groupJid, { url: './path/to/group-full.jpg' })

// --- Get someone's profile picture URL
const ppUrl = await sock.profilePictureUrl(jid, 'image')

// --- Privacy settings ('all' | 'contacts' | 'contact_blacklist' | 'none')
await sock.updateLastSeenPrivacy('contacts')
await sock.updateOnlinePrivacy('all')
await sock.updateProfilePicturePrivacy('contacts')
await sock.updateStatusPrivacy('contacts')
await sock.updateReadReceiptsPrivacy('all')
await sock.updateCallPrivacy('all')
await sock.updateGroupsAddPrivacy('contacts')

// --- Fetch your current privacy settings (what readMessages() checks internally)
const privacy = await sock.fetchPrivacySettings()
console.log(privacy) // { readreceipts, groupadd, status, online, last, ... }

// --- Presence (typing / online indicators)
await sock.sendPresenceUpdate('available', jid)   // available | unavailable | composing | recording | paused
await sock.presenceSubscribe(jid)

sock.ev.on('presence.update', ({ id, presences }) => {
   console.log('👀 Presence update:', id, presences)
})
```

---

# 🚫 Blocklist

```javascript
// --- Block / unblock a user
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')

// --- Fetch your current blocklist
const blocked = await sock.fetchBlocklist()

sock.ev.on('blocklist.update', update => {
   console.log('🚫 Blocklist changed:', update)
})
```

---

# 🔍 Checking Numbers on WhatsApp

```javascript
const [result] = await sock.onWhatsApp('917980651473')

if (result?.exists) {
   console.log('✅ Registered on WhatsApp:', result.jid)
} else {
   console.log('❌ Not on WhatsApp')
}
```

---

# 💬 Chat Modifications

All of these go through a single low-level helper, `chatModify(mod, jid)` — the functions below are convenient wrappers around it, but you can also call `chatModify` directly for anything not covered by a wrapper (e.g. `mute`, `pin`, `clear`, `delete`, `markRead`, `deleteForMe`).

```javascript
// --- Mute / unmute a chat
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid) // mute for 8 hours
await sock.chatModify({ mute: null }, jid)                // unmute

// --- Archive / unarchive
await sock.chatModify({ archive: true, lastMessages: [msg] }, jid)
await sock.chatModify({ archive: false, lastMessages: [msg] }, jid)

// --- Pin / unpin a chat
await sock.chatModify({ pin: true }, jid)
await sock.chatModify({ pin: false }, jid)

// --- Mark a chat as read / unread
await sock.chatModify({ markRead: true, lastMessages: [msg] }, jid)
await sock.chatModify({ markRead: false, lastMessages: [msg] }, jid)

// --- Clear all messages in a chat
await sock.chatModify({ clear: true, lastMessages: [msg] }, jid)

// --- Delete an entire chat
await sock.chatModify({ delete: true, lastMessages: [msg] }, jid)

// --- Star / unstar messages
await sock.star(jid, [{ id: msg.key.id, fromMe: msg.key.fromMe }], true)

// --- Globally disable link-preview generation (privacy setting, not the linkPreview send option)
await sock.updateDisableLinkPreviewsPrivacy(true)
```

---

# 🏷️ Labels & Quick Replies

> [!NOTE]
> Labels and Quick Replies are WhatsApp **Business** app features.

```javascript
// --- Create/update a label definition
await sock.addLabel(jid, { name: '🔥 VIP', color: 1, deleted: false })

// --- Apply / remove a label on a chat
await sock.addChatLabel(jid, labelId)
await sock.removeChatLabel(jid, labelId)

// --- Apply / remove a label on a specific message
await sock.addMessageLabel(jid, messageId, labelId)
await sock.removeMessageLabel(jid, messageId, labelId)

// --- Quick replies (canned responses)
await sock.addOrEditQuickReply({
   shortcut: '/hello',
   message: '👋 Hello! How can I help you today?',
   keywords: [],
   count: 0
})

await sock.removeQuickReply(quickReplyTimestamp)

sock.ev.on('labels.edit', label => console.log('🏷️ Label edited:', label))
sock.ev.on('labels.association', assoc => console.log('🔗 Label applied:', assoc))
```

---

# 📇 Contact Management

```javascript
// --- Add or edit a contact
await sock.addOrEditContact(jid, { fullName: 'RabbitXmd', firstName: 'Rabbit' })

// --- Remove a contact
await sock.removeContact(jid)

sock.ev.on('contacts.upsert', contacts => console.log('📇 New contacts:', contacts))
sock.ev.on('contacts.update', updates => console.log('📇 Contacts updated:', updates))
```

---

# 🏪 Business Tools (Catalog & Storefront)

> [!NOTE]
> These endpoints only work on WhatsApp **Business** accounts.

```javascript
// --- Get another account's business profile
const profile = await sock.getBusinessProfile(jid)

// --- Update your own business profile / cover photo
await sock.updateBusinessProfile({ description: '🐇 Official RabbitXmd Store' })
await sock.updateCoverPhoto({ url: './path/to/cover.jpg' })
await sock.removeCoverPhoto(coverPhotoId)

// --- Browse a catalog
const { products, nextPageCursor } = await sock.getCatalog({ jid, limit: 20 })
const { collections } = await sock.getCollections(jid)

// --- Manage your own products
const created = await sock.productCreate({
   name: '📦 RabbitXmd Hoodie',
   images: [{ url: './path/to/product.jpg' }],
   price: 250000, // in the smallest currency unit
   currency: 'IDR',
   isHidden: false,
   retailerId: 'SKU-001'
})

await sock.productUpdate(created.id, { name: '📦 Updated Name' })
await sock.productDelete([created.id])

// --- Order details
const order = await sock.getOrderDetails(orderId, tokenBase64)
```

---

# 📡 Quick Reference — All Events

| Event | Fired When |
|---|---|
| `connection.update` | Connection state changes (connecting, open, close) |
| `creds.update` | Auth credentials change — always save these |
| `messages.upsert` | A new message arrives or history syncs |
| `messages.update` | A message is edited, revoked, or its status changes |
| `messages.delete` | A message is deleted |
| `messages.reaction` | Someone reacts to a message |
| `messages.bot-detect` | A message is flagged as sent by a bot / Meta AI |
| `messages.link-detect` | A message is flagged as containing a link |
| `message-receipt.update` | Delivery / read receipts update |
| `message-capping.update` | WhatsApp's new-chat message-limit info changes |
| `chats.upsert` / `chats.update` / `chats.delete` | Chats are added, changed, or removed |
| `chats.lock` | A chat is locked/unlocked (chat lock feature) |
| `contacts.upsert` / `contacts.update` | Contacts are added or changed |
| `groups.upsert` / `groups.update` | Group metadata is added or changed |
| `group-participants.update` | Members are added, removed, promoted, or demoted |
| `group.join-request` | Someone requests to join a group (approval mode) |
| `group.member-tag.update` | A member's tag/label inside a group changes |
| `newsletter-participants.update` | Newsletter admin/subscriber changes |
| `newsletter-settings.update` | Newsletter settings change |
| `newsletter.reaction` / `newsletter.view` | Reactions/views on a newsletter post |
| `call` | An incoming or ongoing call event |
| `presence.update` | Someone's online/typing status changes |
| `blocklist.update` | Your blocklist changes |
| `labels.edit` / `labels.association` | Labels are created or applied to a chat |
| `lid-mapping.update` | A phone-number ↔ LID mapping is learned/updated |
| `messaging-history.set` | Initial history sync completes |
| `messaging-history.status` | Progress updates during history sync |

```javascript
sock.ev.on('messages.reaction', reactions => {
   console.log('❤️ Reaction:', reactions)
})

sock.ev.on('messages.delete', item => {
   console.log('🗑️ Message deleted:', item)
})
```

---

# 🔌 Session Management

```javascript
// --- Log out (invalidates the session on WhatsApp's side too — you'll need to re-scan/re-pair)
await sock.logout()

// --- Just close the socket connection (keeps the session/creds valid for reconnecting)
sock.end(undefined)
```

> [!NOTE]
> Use `sock.end()` for a normal disconnect/reconnect (e.g. on `connection.update` with `DisconnectReason.restartRequired`). Only use `sock.logout()` when you actually want to sign the device out of WhatsApp.
