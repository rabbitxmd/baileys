import type { BinaryNode } from './transport.js';
import type { SignalAddress } from './protocol.js';
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';
export interface LoggerChildOptions {
    readonly level?: LogLevel;
}
export interface Logger {
    readonly level: LogLevel;
    trace(message: string, context?: Readonly<Record<string, unknown>>): void;
    debug(message: string, context?: Readonly<Record<string, unknown>>): void;
    info(message: string, context?: Readonly<Record<string, unknown>>): void;
    warn(message: string, context?: Readonly<Record<string, unknown>>): void;
    error(message: string, context?: Readonly<Record<string, unknown>>): void;
    child(bindings: Readonly<Record<string, unknown>>, options?: LoggerChildOptions): Logger;
}
export declare function createNoopLogger(level?: LogLevel): Logger;
/** WhatsApp's random 1..16 byte PKCS#7-style padding of an outgoing message. */
export declare function writeRandomPadMax16(message: Uint8Array): Promise<Uint8Array>;
export declare function unpadPkcs7(bytes: Uint8Array): Uint8Array;
/** The account's signed device identity, as stored by the host (`creds.account` on Baileys). */
export interface WaSignedDeviceIdentity {
    readonly details?: Uint8Array | ArrayLike<number> | null;
    readonly accountSignatureKey?: Uint8Array | ArrayLike<number> | null;
    readonly accountSignature?: Uint8Array | ArrayLike<number> | null;
    readonly deviceSignature?: Uint8Array | ArrayLike<number> | null;
}
export interface WaVoipCredentials {
    readonly meJid?: string | null;
    readonly meLid?: string | null;
    readonly signedIdentity?: WaSignedDeviceIdentity | null;
}
export interface WaResolvedSession {
    readonly address: SignalAddress;
    readonly session: unknown;
}
/**
 * Everything the call code needs from its host. On Baileys these are implemented by
 * `createBaileysDeps` (src/baileys/deps.ts).
 */
export interface WaVoipDeps {
    readonly authClient: {
        getCurrentCredentials(): WaVoipCredentials | null;
    };
    readonly lowLevelCoordinator: {
        sendNode(node: BinaryNode): Promise<void>;
    };
    readonly signalDeviceSync: {
        syncDeviceList(jids: readonly string[]): Promise<readonly {
            readonly jid: string;
            readonly deviceJids: readonly string[];
        }[]>;
        queryLidsByPhoneJids(jids: readonly string[]): Promise<readonly ({
            readonly lidJid?: string | null;
        } | null | undefined)[]>;
    };
    readonly sessionResolver: {
        ensureSessionsBatch(jids: readonly string[]): Promise<readonly WaResolvedSession[]>;
    };
    readonly signalProtocol: {
        encryptMessagesBatch(items: readonly {
            readonly address: SignalAddress;
            readonly plaintext: Uint8Array;
        }[], sessions: readonly WaResolvedSession[]): Promise<readonly {
            readonly type: 'msg' | 'pkmsg';
            readonly ciphertext: Uint8Array;
        }[]>;
        decryptMessage(address: SignalAddress, input: {
            readonly type: 'msg' | 'pkmsg';
            readonly ciphertext: Uint8Array;
        }): Promise<Uint8Array>;
    };
    readonly messageDispatch: {
        syncSignalSession(jid: string): Promise<unknown>;
    };
    isMobilePrimary(): boolean;
}
export interface WaVoipStores {
    readonly privacyToken: {
        getByJid(jid: string): Promise<{
            readonly tcToken?: Uint8Array | ArrayLike<number> | null;
        } | null | undefined>;
    };
}
export interface WaIncomingHandler {
    readonly tag: string;
    readonly prepend?: boolean;
    readonly handler: (node: BinaryNode) => Promise<boolean> | boolean;
}
/** What `WaVoipCoordinator` needs from its host: deps, a logger, stanza hooks and an event bus. */
export interface WaClientPluginContext {
    readonly deps: WaVoipDeps;
    readonly stores: WaVoipStores;
    readonly logger: Logger;
    registerIncomingHandler(handler: WaIncomingHandler): () => void;
    emit(event: string, payload: unknown): void;
    readonly client: {
        listenerCount(event: string | symbol): number;
        addListener(event: string | symbol, listener: (...args: any[]) => void): unknown;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): unknown;
    };
}
