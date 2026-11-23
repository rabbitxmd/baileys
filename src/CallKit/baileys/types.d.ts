/**
 * The slice of a Baileys socket the kit uses. Typed structurally so it fits any Baileys build
 * or fork (`@whiskeysockets/baileys`, `baileys`, `@adiwajshing/baileys`, ...) without importing it.
 */
export interface BaileysNode {
    tag: string;
    attrs: {
        [key: string]: string;
    };
    content?: Uint8Array | string | BaileysNode[];
}
export interface BaileysUSyncDevice {
    user: string;
    device?: number;
    jid?: string;
    server?: string;
}
export interface BaileysSocketLike {
    /** `ws.on('CB:call', node => ...)` delivers decoded stanzas. */
    ws: {
        on(event: string, listener: (...args: any[]) => void): unknown;
        off?(event: string, listener: (...args: any[]) => void): unknown;
        removeListener?(event: string, listener: (...args: any[]) => void): unknown;
    };
    authState: {
        creds: {
            me?: {
                id: string;
                lid?: string;
            } | null;
            /** `proto.IADVSignedDeviceIdentity`. */
            account?: {
                details?: Uint8Array | null;
                accountSignatureKey?: Uint8Array | null;
                accountSignature?: Uint8Array | null;
                deviceSignature?: Uint8Array | null;
            } | null;
        };
        keys: {
            get(type: any, ids: string[]): Promise<{
                [id: string]: any;
            }>;
        };
    };
    sendNode(node: BaileysNode): Promise<void>;
    assertSessions(jids: string[], force?: boolean): Promise<boolean>;
    getUSyncDevices(jids: string[], useCache: boolean, ignoreZeroDevices: boolean): Promise<BaileysUSyncDevice[]>;
    signalRepository: {
        encryptMessage(opts: {
            jid: string;
            data: Uint8Array;
        }): Promise<{
            type: 'pkmsg' | 'msg';
            ciphertext: Uint8Array;
        }>;
        decryptMessage(opts: {
            jid: string;
            type: 'pkmsg' | 'msg';
            ciphertext: Uint8Array;
        }): Promise<Uint8Array>;
        /** Baileys 7+: phone number <-> LID mapping store. */
        lidMapping?: {
            getLIDForPN?(pn: string): Promise<string | null | undefined> | string | null | undefined;
        };
    };
}
