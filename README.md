> [!NOTE]
> 📄 This project is maintained with limited scope and is not intended to replace upstream Baileys.
>
> 

### 📋 Table of Contents
- [📋 Table of Contents](#-table-of-contents)
- [✨ Highlights](#-highlights)
- [🛠️ Internal Adjustments](#%EF%B8%8F-internal-adjustments)
- [📨 Messages Handling & Compatibility](#-highlights)
- [🧩 Additional Message Options](#-additional-message-options)
- [📥 Installation](#-installation)
   - [🧩 Import (ESM & CJS)](#-import-esm--cjs)
- [🌐 Connect to WhatsApp (Quick Step)](#-connect-to-whatsapp-quick-step)
   - [🔐 Auth State](#-auth-state)
- [🗄️ Implementing Data Store](#%EF%B8%8F-implementing-data-store)
- [🪪 WhatsApp IDs Explain](#-whatsapp-ids-explain)
- [✉️ Sending Messages](#%EF%B8%8F-sending-messages)

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
```#### 🧩 Import (ESM & CJS)

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
> For media messages, you can pass a `Buffer` directly, or an object with either:

- `{ stream: Readable }`
- `{ url: string }`

The URL can be either:
- Local file path
- HTTP / HTTPS URL
## 📁 Sending Media Messages

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
## 👉🏻 Sending Interactive Messages

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
#### 🗄️ Interactive

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
