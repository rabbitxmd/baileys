// Part of the bundled Call Kit.
import { hkdfSync } from 'node:crypto';
import { EMPTY_BYTES, toBytesView } from './util.js';
/** HKDF (HMAC-SHA-256): `outLength` bytes from `ikm`, `salt` (empty when `null`) and `info`. */
export function hkdf(ikm, salt, info, outLength) {
    return toBytesView(hkdfSync('sha256', ikm, salt ?? EMPTY_BYTES, info, outLength));
}
