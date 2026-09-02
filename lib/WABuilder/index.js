/**
 * WABuilder/index.js
 *
 * Fluent `Button` / `Card` / `Carousel` builders, exported directly from the
 * library entry point.
 *
 * These wrap the interactive-message and carousel-message support that
 * already exists in lib/Utils/messages.js (generateWAMessageContent /
 * prepareNativeFlowButtons), so the button payloads produced here use the
 * exact same field names this library's own sendMessage() expects:
 *
 *   { text, id }               -> quick_reply
 *   { text, url, useWebview }  -> cta_url
 *   { text, call }             -> cta_call
 *   { text, copy }             -> cta_copy
 *   { text, sections }         -> single_select
 *
 * Usage — standalone interactive/button message:
 *
 *   import { Button } from '@whiskeysockets/baileys'
 *
 *   await new Button(sock)
 *     .setImage('https://example.com/banner.jpg')
 *     .setTitle('Header title')
 *     .setCaption('Body text')
 *     .setFooter('Footer text')
 *     .addReplyButton('Reply', 'btn_reply')
 *     .addUrlButton('Visit', 'https://example.com')
 *     .addCallButton('Call us', '+8801XXXXXXXXX')
 *     .send(jid)
 *
 * Usage — carousel:
 *
 *   import { Carousel } from '@whiskeysockets/baileys'
 *
 *   const carousel = new Carousel(sock)
 *     .setText('Check these out 👇')
 *     .setFooter('Footer text')
 *
 *   carousel.addCard(c => c
 *     .setImage('https://example.com/card1.jpg')
 *     .setTitle('Card 1')
 *     .setSubtitle('Subtitle')
 *     .setCaption('Body text for card 1')
 *     .addUrlButton('Visit', 'https://example.com')
 *     .addReplyButton('Reply', 'card1_reply')
 *   )
 *
 *   carousel.addCard(c => c
 *     .setVideo('https://example.com/card2.mp4')
 *     .setCaption('Body text for card 2')
 *     .addCallButton('Call us', '+8801XXXXXXXXX')
 *   )
 *
 *   await carousel.send(jid)
 */

// ─── BaseBuilder ────────────────────────────────────────────────────────────
// Shared title/subtitle/body/footer/contextInfo/extra-payload state + fluent
// setters, reused by Button, Card, and Carousel.
class BaseBuilder {
	constructor() {
		this._title = ''
		this._subtitle = ''
		this._body = ''
		this._footer = ''
		this._contextInfo = {}
		this._extraPayload = {}
	}

	setTitle(title) {
		if (typeof title !== 'string') throw new TypeError('Title must be a string')
		this._title = title
		return this
	}

	setSubtitle(subtitle) {
		if (typeof subtitle !== 'string') throw new TypeError('Subtitle must be a string')
		this._subtitle = subtitle
		return this
	}

	setBody(body) {
		if (typeof body !== 'string') throw new TypeError('Body must be a string')
		this._body = body
		return this
	}

	// Alias for setBody — matches the `text` field name used in sendMessage()
	setText(text) {
		return this.setBody(text)
	}

	setFooter(footer) {
		if (typeof footer !== 'string') throw new TypeError('Footer must be a string')
		this._footer = footer
		return this
	}

	setContextInfo(obj) {
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
			throw new TypeError('ContextInfo must be a plain object')
		}
		this._contextInfo = obj
		return this
	}

	addPayload(obj) {
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
			throw new TypeError('Payload must be a plain object')
		}
		Object.assign(this._extraPayload, obj)
		return this
	}
}

// ─── Native-flow button helpers ────────────────────────────────────────────
// Shared between Button and Card since both feed into the same
// prepareNativeFlowButtons() logic under the hood.
class NativeFlowMixin {
	_buttons = []
	_sections = null

	addReplyButton(text, id, options = {}) {
		this._buttons.push({ text, id, ...options })
		return this
	}

	addUrlButton(text, url, useWebview = false, options = {}) {
		this._buttons.push({ text, url, useWebview, ...options })
		return this
	}

	addCallButton(text, phoneNumber, options = {}) {
		this._buttons.push({ text, call: phoneNumber, ...options })
		return this
	}

	addCopyButton(text, code, options = {}) {
		this._buttons.push({ text, copy: code, ...options })
		return this
	}

	/**
	 * Attach a single_select list. rows: [{ title, description?, id, header? }]
	 */
	setSections(title, rows, highlightLabel) {
		this._buttons.push({
			text: title,
			sections: [{ title, highlight_label: highlightLabel, rows }]
		})
		return this
	}

	get _hasButtons() {
		return this._buttons.length > 0
	}
}

// ─── Button ─────────────────────────────────────────────────────────────────
// Standalone interactive/button message (header media + body/footer + native
// flow buttons) — same shape as a single carousel card, just sent on its own.
class Button extends BaseBuilder {
	#client
	_buttons = []

	constructor(client) {
		super()
		if (!client) throw new Error('Socket is required')
		this.#client = client
		this._media = null
	}

	setImage(pathOrBuffer, options = {}) {
		if (!pathOrBuffer) throw new Error('Image url or buffer needed')
		this._media = { image: Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : { url: pathOrBuffer, ...options } }
		return this
	}

	setVideo(pathOrBuffer, options = {}) {
		if (!pathOrBuffer) throw new Error('Video url or buffer needed')
		this._media = { video: Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : { url: pathOrBuffer, ...options } }
		return this
	}

	setDocument(pathOrBuffer, options = {}) {
		if (!pathOrBuffer) throw new Error('Document url or buffer needed')
		this._media = { document: Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : { url: pathOrBuffer, ...options } }
		return this
	}

	setCaption(caption) {
		if (typeof caption !== 'string') throw new TypeError('Caption must be a string')
		this._caption = caption
		return this
	}

	addReplyButton(text, id, options = {}) {
		this._buttons.push({ text, id, ...options })
		return this
	}

	addUrlButton(text, url, useWebview = false, options = {}) {
		this._buttons.push({ text, url, useWebview, ...options })
		return this
	}

	addCallButton(text, phoneNumber, options = {}) {
		this._buttons.push({ text, call: phoneNumber, ...options })
		return this
	}

	addCopyButton(text, code, options = {}) {
		this._buttons.push({ text, copy: code, ...options })
		return this
	}

	setSections(title, rows, highlightLabel) {
		this._buttons.push({
			text: title,
			sections: [{ title, highlight_label: highlightLabel, rows }]
		})
		return this
	}

	build() {
		if (!this._buttons.length) throw new Error('Button message requires at least one button')
		return {
			...this._extraPayload,
			...(this._media ?? {}),
			title: this._title || undefined,
			subtitle: this._subtitle || undefined,
			caption: this._caption ?? this._body ?? '',
			footer: this._footer || undefined,
			nativeFlow: this._buttons
		}
	}

	async send(jid, options = {}) {
		return this.#client.sendMessage(jid, this.build(), options)
	}

	async run(jid, options = {}) {
		return this.send(jid, options)
	}
}

// ─── Card ───────────────────────────────────────────────────────────────────
// One carousel card. Serializes to the exact shape generateWAMessageContent()
// expects inside `cards[]` (image/video/product header + title/subtitle/
// caption/footer + nativeFlow), using the same button field names as Button.
class Card extends BaseBuilder {
	_buttons = []

	constructor() {
		super()
		this._media = null
		this._caption = ''
		this._thumbnail = null
		this._audioFooter = null
	}

	setImage(pathOrBuffer, options = {}) {
		if (!pathOrBuffer) throw new Error('Image url or buffer needed')
		this._media = { image: Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : { url: pathOrBuffer, ...options } }
		return this
	}

	setVideo(pathOrBuffer, options = {}) {
		if (!pathOrBuffer) throw new Error('Video url or buffer needed')
		this._media = { video: Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : { url: pathOrBuffer, ...options } }
		return this
	}

	setProduct(product) {
		if (typeof product !== 'object' || product === null) throw new TypeError('Product must be a plain object')
		this._media = { product }
		return this
	}

	setCaption(caption) {
		if (typeof caption !== 'string') throw new TypeError('Caption must be a string')
		this._caption = caption
		return this
	}

	setThumbnail(buffer) {
		this._thumbnail = buffer
		return this
	}

	setAudioFooter(pathOrBuffer) {
		this._audioFooter = pathOrBuffer
		return this
	}

	addReplyButton(text, id, options = {}) {
		this._buttons.push({ text, id, ...options })
		return this
	}

	addUrlButton(text, url, useWebview = false, options = {}) {
		this._buttons.push({ text, url, useWebview, ...options })
		return this
	}

	addCallButton(text, phoneNumber, options = {}) {
		this._buttons.push({ text, call: phoneNumber, ...options })
		return this
	}

	addCopyButton(text, code, options = {}) {
		this._buttons.push({ text, copy: code, ...options })
		return this
	}

	setSections(title, rows, highlightLabel) {
		this._buttons.push({
			text: title,
			sections: [{ title, highlight_label: highlightLabel, rows }]
		})
		return this
	}

	/** Serialize into the shape lib/Utils/messages.js expects for one card. */
	toPayload() {
		if (!this._media) {
			throw new Error('Card must have an image, video, or product set as header media')
		}
		const card = {
			...this._media,
			title: this._title,
			subtitle: this._subtitle,
			caption: this._caption
		}
		if (this._thumbnail) card.thumbnail = this._thumbnail
		if (this._footer) card.footer = this._footer
		if (this._audioFooter) card.audioFooter = this._audioFooter
		if (this._buttons.length) card.nativeFlow = this._buttons
		return card
	}
}

// ─── Carousel ───────────────────────────────────────────────────────────────
class Carousel extends BaseBuilder {
	#client

	constructor(client) {
		super()
		if (!client) throw new Error('Socket is required')
		this.#client = client
		this._cards = []
	}

	/**
	 * addCard(card) accepts either:
	 *   - a Card instance
	 *   - a builder callback: c => c.setImage(...).addUrlButton(...)
	 *   - an array of either of the above
	 */
	addCard(card) {
		const items = Array.isArray(card) ? card : [card]
		for (const item of items) {
			let built
			if (typeof item === 'function') {
				const c = new Card()
				item(c)
				built = c
			} else if (item instanceof Card) {
				built = item
			} else {
				throw new TypeError('addCard() expects a Card instance or a builder callback')
			}
			this._cards.push(built)
		}
		return this
	}

	build() {
		if (!this._cards.length) throw new Error('Carousel requires at least one card')
		return {
			...this._extraPayload,
			text: this._body || undefined,
			footer: this._footer || undefined,
			cards: this._cards.map(c => c.toPayload())
		}
	}

	async send(jid, options = {}) {
		return this.#client.sendMessage(jid, this.build(), options)
	}

	async run(jid, options = {}) {
		return this.send(jid, options)
	}
}

export { BaseBuilder, Button, Card, Carousel }
