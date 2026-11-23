import { EventEmitter } from 'node:events';
import { WaVoipCoordinator, type WaVoipCoordinatorOptions } from '../core/WaVoipCoordinator.js';
import type { BaileysSocketLike } from './types.js';
/** A pino-style logger (what Baileys uses): `logger.info(obj, msg)`. */
export interface PinoLike {
    level?: string;
    trace?(obj: unknown, msg?: string): void;
    debug?(obj: unknown, msg?: string): void;
    info?(obj: unknown, msg?: string): void;
    warn?(obj: unknown, msg?: string): void;
    error?(obj: unknown, msg?: string): void;
    child?(bindings: Record<string, unknown>): PinoLike;
}
export interface AttachCallsOptions extends WaVoipCoordinatorOptions {
    /** Your Baileys logger (`pino`); call logs go to it. Silent when omitted. */
    readonly logger?: PinoLike;
}
export interface BaileysCalls {
    /** The call API: `startCall`, `acceptCall`, `rejectCall`, `endCall`, `media`, ... */
    readonly voip: WaVoipCoordinator;
    /**
     * Call events: `voip_call_incoming`, `voip_call_state`, `voip_call_ended`,
     * `voip_call_inbound_audio`, `voip_call_error`, ...
     */
    readonly events: EventEmitter;
    /** Removes the stanza listeners from the socket and stops the call manager. */
    detach(): void;
}
/**
 * Adds WhatsApp voice (and video) calling to a Baileys socket.
 *
 * Call it once per socket: when your bot reconnects with a new `makeWASocket(...)`, call it again
 * (and `detach()` the old one).
 */
export declare function attachCalls(sock: BaileysSocketLike, options?: AttachCallsOptions): BaileysCalls;
