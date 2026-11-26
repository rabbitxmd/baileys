// Stand-in for the helpers the VoIP core imports, so the call code runs on top of any host that
// implements `WaVoipDeps`. Licence and origin: see NOTICE.md and LICENSE.* in src/CallKit.
import { randomBytes } from 'node:crypto';
function noop() { }
export function createNoopLogger(level = 'error') {
    const logger = {
        level,
        trace: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        child: (_bindings, options) => (options?.level ? createNoopLogger(options.level) : logger)
    };
    return logger;
}
const PAD_MASK = 0x0f;
/** WhatsApp's random 1..16 byte PKCS#7-style padding of an outgoing message. */
export async function writeRandomPadMax16(message) {
    const padLength = (randomBytes(1)[0] & PAD_MASK) + 1;
    const out = new Uint8Array(message.length + padLength);
    out.set(message, 0);
    out.fill(padLength, message.length);
    return out;
}
export function unpadPkcs7(bytes) {
    if (bytes.length === 0)
        throw new Error('unpadPkcs7 given empty bytes');
    const padLength = bytes[bytes.length - 1];
    if (padLength > bytes.length) {
        throw new Error(`unpadPkcs7 given ${bytes.length} bytes, but pad is ${padLength}`);
    }
    return bytes.subarray(0, bytes.length - padLength);
}
