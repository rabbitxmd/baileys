/** Randomness from `crypto.getRandomValues`, which every host has, so it needs no backend. */
export declare function randomBytes(length: number): Uint8Array;
/** A uniform integer in `[min, max)`, by rejection sampling rather than a biased modulo. */
export declare function randomInt(min: number, max: number): number;
