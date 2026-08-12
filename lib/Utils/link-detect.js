/**
 * Matches http(s):// links, bare "www." links, and bare domains with a common TLD.
 * The existing URL_REGEX in Defaults only matches strings that start with
 * "https://", so plain "www.example.com" or "example.com" or "http://" links were
 * silently missed - this is the usual cause of link detection appearing to
 * "randomly" stop working. This regex additionally recognises those cases.
 */
export const LINK_REGEX = /\b(?:https?:\/\/[^\s<>"'`]+|www\.[^\s<>"'`]+|(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|io|co|me|info|biz|xyz|gg|app|dev|link|id|in|us|uk|ai|store|shop|online|site|top|club|live|tv|ly)\b(?:\/[^\s<>"'`]*)?)/gi;
/** matches a WhatsApp group invite link and captures its invite code */
export const WA_GROUP_INVITE_REGEX = /chat\.whatsapp\.com\/([0-9A-Za-z]{10,24})/i;
/** matches a WhatsApp channel/newsletter invite link */
export const WA_CHANNEL_INVITE_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{10,30})/i;
/** strips punctuation that commonly trails a URL at the end of a sentence (., ,, ), ], !, ? ...) */
const stripTrailingPunctuation = (url) => url.replace(/[.,;:!?)\]}'"]+$/, '');
/**
 * Finds every link in a piece of text.
 * @param text the message text to scan
 * @returns an array of link matches, each normalized to include a protocol
 */
export const detectLinks = (text) => {
    if (!text || typeof text !== 'string') {
        return [];
    }
    const matches = text.match(LINK_REGEX) || [];
    return matches.map(raw => {
        const cleaned = stripTrailingPunctuation(raw.trim());
        const url = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
        const groupInvite = url.match(WA_GROUP_INVITE_REGEX);
        const channelInvite = url.match(WA_CHANNEL_INVITE_REGEX);
        return {
            raw,
            url,
            isWhatsAppGroupInvite: !!groupInvite,
            groupInviteCode: groupInvite ? groupInvite[1] : undefined,
            isWhatsAppChannelInvite: !!channelInvite,
            channelInviteCode: channelInvite ? channelInvite[1] : undefined
        };
    });
};
/** @returns true if the given text contains at least one link */
export const hasLink = (text) => detectLinks(text).length > 0;
/** @returns true if the given text contains a WhatsApp group invite link */
export const hasWhatsAppGroupInvite = (text) => typeof text === 'string' && WA_GROUP_INVITE_REGEX.test(text);
