export declare const WA_DEFAULTS: Readonly<{
    readonly HOST_DOMAIN: 's.whatsapp.net';
    readonly GROUP_SERVER: 'g.us';
    readonly BROADCAST_SERVER: 'broadcast';
    readonly LID_SERVER: 'lid';
    readonly HOSTED_SERVER: 'hosted';
    readonly HOSTED_LID_SERVER: 'hosted.lid';
}>;
export declare const WA_MESSAGE_TAGS: Readonly<{
    readonly RECEIPT: 'receipt';
    readonly ACK: 'ack';
}>;
export interface SignalAddress {
    readonly user: string;
    readonly server: string;
    readonly device: number;
}
/** `{ user, server, device }` of a JID; `device` is `0` without a `:device` segment. */
export declare function parseSignalAddressFromJid(jid: string): SignalAddress;
/** Maps the hosted server variants back to their canonical Signal server. */
export declare function canonicalizeSignalServer(server: string, hostDomain?: string): string;
/** Bare `user@server`; `canonicalizeSignalServer` also rewrites hosted servers. */
export declare function toUserJid(jid: string, options?: {
    readonly canonicalizeSignalServer?: boolean;
    readonly hostDomain?: string;
}): string;
/** Full device form: `user:device@server`, or `user@server` for device 0. */
export declare function normalizeDeviceJid(jid: string): string;
export declare function isLidJid(jid: string): boolean;
/** Inverse of {@link parseSignalAddressFromJid}. */
export declare function signalAddressToJid(address: SignalAddress): string;
