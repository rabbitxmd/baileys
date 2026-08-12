import { getContentType, normalizeMessageContent } from './messages.js';
/**
 * Protocol message sub-types that don't map to a content key.
 * Values match proto.Message.ProtocolMessage.Type
 */
const PROTOCOL_TYPE = {
    REVOKE: 0,
    MESSAGE_EDIT: 14
};
/** wrapper keys that hide the real content one level down but should still be reported as their own type */
const VIEW_ONCE_KEYS = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'];
/**
 * Classifies the *inner* content key (post getContentType/normalize) into a stable,
 * human readable bucket. Uses substring matching instead of exact equality so that
 * WhatsApp adding new versioned variants (eg. pollCreationMessageV2/V3/V4,
 * listMessageV2, buttonsMessageV2 ...) doesn't silently fall through to 'unknown' -
 * this is the main reason ad-hoc switch/if chains intermittently stop recognising
 * a message type after a WhatsApp client update.
 * @param key the key returned by getContentType(normalizedContent)
 * @param content the normalized message content object
 */
const classifyContentKey = (key, content) => {
    if (!key) {
        return 'unknown';
    }
    const node = content?.[key];
    // compare case-insensitively: keys like "liveLocationMessage" or
    // "pollCreationMessageV3" mix case in ways plain lowercase .includes() checks miss
    const k = key.toLowerCase();
    if (key === 'conversation' || k.includes('extendedtext')) {
        return 'text';
    }
    if (k.includes('sticker')) {
        return 'sticker';
    }
    if (k.includes('image')) {
        return 'image';
    }
    if (k.includes('video')) {
        return node?.gifPlayback ? 'gif' : 'video';
    }
    if (k.includes('audio')) {
        return node?.ptt ? 'ptt' : 'audio';
    }
    if (k.includes('document')) {
        return 'document';
    }
    if (k.includes('location')) {
        return 'location';
    }
    if (k.includes('contact')) {
        return 'contact';
    }
    if (k.includes('poll')) {
        return 'poll';
    }
    if (k.includes('button') || k.includes('template') || k.includes('interactive') || k.includes('list')) {
        return 'interactive';
    }
    return 'unknown';
};
/**
 * Detects the effective type of an incoming message in one call, without having to
 * manually walk ephemeral / view-once / edited / revoked wrappers by hand.
 *
 * Accepts either a full WAMessage/WebMessageInfo (an object with a `.message` field)
 * or a raw message-content object directly.
 *
 * @returns one of: 'text' | 'image' | 'video' | 'gif' | 'audio' | 'ptt' | 'sticker' |
 * 'document' | 'reaction' | 'viewonce' | 'edited' | 'revoke' | 'interactive' | 'poll' |
 * 'location' | 'contact' | 'unknown'
 */
export const detectMessageType = (msg) => {
    const rawContent = msg?.message !== undefined ? msg.message : msg;
    if (!rawContent) {
        return 'unknown';
    }
    // reactions & protocol events (edit/revoke) live at the top level and must be
    // checked before normalization, since normalizeMessageContent only unwraps
    // "envelope" style wrappers and leaves these untouched.
    if (rawContent.reactionMessage) {
        return 'reaction';
    }
    if (rawContent.protocolMessage) {
        const type = rawContent.protocolMessage.type;
        if (type === PROTOCOL_TYPE.REVOKE) {
            return 'revoke';
        }
        if (type === PROTOCOL_TYPE.MESSAGE_EDIT) {
            return 'edited';
        }
    }
    const isViewOnce = VIEW_ONCE_KEYS.some(k => rawContent[k]);
    if (isViewOnce) {
        return 'viewonce';
    }
    const normalized = normalizeMessageContent(rawContent);
    const key = getContentType(normalized);
    return classifyContentKey(key, normalized);
};
