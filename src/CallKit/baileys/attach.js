import { EventEmitter } from 'node:events';
import { createNoopLogger } from '../compat/index.js';
import { WaVoipCoordinator } from '../core/WaVoipCoordinator.js';
import { createBaileysDeps } from './deps.js';
const LEVELS = ['trace', 'debug', 'info', 'warn', 'error'];
function fromPino(pino) {
    if (!pino)
        return createNoopLogger('error');
    const make = (target, level) => {
        const call = (name) => (message, context) => {
            const fn = target[name];
            if (typeof fn === 'function')
                fn.call(target, context ?? {}, message);
        };
        return {
            level,
            trace: call('trace'),
            debug: call('debug'),
            info: call('info'),
            warn: call('warn'),
            error: call('error'),
            child: (bindings, options) => make(target.child ? target.child({ ...bindings }) : target, options?.level ?? level)
        };
    };
    const level = LEVELS.includes(pino.level) ? pino.level : 'info';
    return make(pino, level);
}
/**
 * Adds WhatsApp voice (and video) calling to a Baileys socket.
 *
 * Call it once per socket: when your bot reconnects with a new `makeWASocket(...)`, call it again
 * (and `detach()` the old one).
 */
export function attachCalls(sock, options = {}) {
    const events = new EventEmitter();
    const { deps, stores } = createBaileysDeps(sock);
    const logger = fromPino(options.logger);
    const listeners = [];
    const ctx = {
        deps,
        stores,
        logger,
        registerIncomingHandler(handler) {
            const event = `CB:${handler.tag}`;
            const listener = (node) => {
                Promise.resolve(handler.handler(node)).catch((error) => {
                    logger.error('call stanza handler failed', {
                        tag: handler.tag,
                        error: error instanceof Error ? error.message : String(error)
                    });
                });
            };
            sock.ws.on(event, listener);
            listeners.push({ event, listener });
            return () => {
                const off = sock.ws.off ?? sock.ws.removeListener;
                off?.call(sock.ws, event, listener);
            };
        },
        emit: (event, payload) => {
            // An unhandled 'error'-named event would throw; call errors use `voip_call_error`.
            events.emit(event, payload);
        },
        client: events
    };
    const voip = new WaVoipCoordinator(ctx, options);
    return {
        voip,
        events,
        detach() {
            const off = sock.ws.off ?? sock.ws.removeListener;
            for (const { event, listener } of listeners)
                off?.call(sock.ws, event, listener);
            listeners.length = 0;
            events.removeAllListeners();
        }
    };
}
