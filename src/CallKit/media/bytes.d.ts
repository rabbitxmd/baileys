/** Byte helpers of the media plane, kept here because the package runs without `zapo-js`. */
export declare const TEXT_ENCODER: TextEncoder;
export declare const TEXT_DECODER: TextDecoder;
export declare const EMPTY_BYTES: Readonly<Uint8Array<ArrayBuffer>>;
export declare function bytesToHex(value: Uint8Array): string;
/** An SSRC as logged. */
export declare function hexSsrc(ssrc: number): string;
export declare function concatBytes(parts: readonly Uint8Array[]): Uint8Array;
/** A plain `Uint8Array` over the same memory, whatever view or buffer came in. */
export declare function toBytesView(value: Uint8Array | ArrayBuffer | ArrayBufferView): Uint8Array;
export declare function toArrayBuffer(bytes: Uint8Array): ArrayBuffer;
export declare function readUInt16BE(buf: Uint8Array, offset: number): number;
export declare function readUInt32BE(buf: Uint8Array, offset: number): number;
export declare function readBigUInt64BE(buf: Uint8Array, offset: number): bigint;
export declare function writeUInt16BE(buf: Uint8Array, value: number, offset: number): void;
export declare function writeUInt32BE(buf: Uint8Array, value: number, offset: number): void;
export declare function writeBigUInt64BE(buf: Uint8Array, value: bigint, offset: number): void;
