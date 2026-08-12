export interface DetectedLink {
    raw: string;
    url: string;
    isWhatsAppGroupInvite: boolean;
    groupInviteCode?: string;
    isWhatsAppChannelInvite: boolean;
    channelInviteCode?: string;
}
export const LINK_REGEX: RegExp;
export const WA_GROUP_INVITE_REGEX: RegExp;
export const WA_CHANNEL_INVITE_REGEX: RegExp;
export function detectLinks(text: string): DetectedLink[];
export function hasLink(text: string): boolean;
export function hasWhatsAppGroupInvite(text: string): boolean;
