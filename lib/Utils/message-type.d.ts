export type DetectedMessageType = 'text' | 'image' | 'video' | 'gif' | 'audio' | 'ptt' | 'sticker' | 'document' | 'reaction' | 'viewonce' | 'edited' | 'revoke' | 'interactive' | 'poll' | 'location' | 'contact' | 'unknown';
/**
 * Detects the effective type of an incoming message (WAMessage/WebMessageInfo or raw
 * message-content object), correctly handling ephemeral, view-once, edited and
 * revoked wrappers.
 */
export function detectMessageType(msg: any): DetectedMessageType;
