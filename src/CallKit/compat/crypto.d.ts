/** HKDF (HMAC-SHA-256): `outLength` bytes from `ikm`, `salt` (empty when `null`) and `info`. */
export declare function hkdf(ikm: Uint8Array, salt: Uint8Array | null, info: Uint8Array, outLength: number): Uint8Array;
