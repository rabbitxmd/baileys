/** The libmlow-wasm-fork surface: handle types, the loader, and the stream parameters it opens with. */
export declare const MLOW_SAMPLE_RATE: 16000;
export declare const MLOW_CHANNELS: 1;
export declare const MLOW_FRAME_SIZE = 960;
export declare const MLOW_MAX_FRAME_SIZE = 1920;
/** The library's ceiling on one encoded packet, and the size an encode target needs. */
export declare const MLOW_MAX_PACKET_BYTES = 4000;
export interface MlowDecodeOptions {
    readonly decodeFec?: boolean;
    readonly frameSize?: number;
    readonly maxFrameSize?: number;
}
export interface MlowEncoder {
    encodeInto(pcm: Int16Array, target: Uint8Array): number;
    encodeSecondary(): Uint8Array;
    setSecondaryBitrate(bitrate: number): void;
    setSecondaryComplexity(complexity: number): void;
    encoderCtl(request: number, value: number): void;
    setPacketLossPercent(percentage: number): void;
    free(): void;
}
export interface MlowDecoder {
    decodeFloatInto(target: Float32Array, packet: Uint8Array | null, options?: MlowDecodeOptions): number;
    readonly hasCompanion: boolean;
    setCompanionModel(model: Uint8Array | null): void;
    resetCompanion(): void;
    free(): void;
}
export interface MlowRepacketizer {
    pack(frames: readonly Uint8Array[]): Uint8Array;
    free(): void;
}
export interface MlowModule {
    loadLibopus(): Promise<{
        version: string;
    }>;
    createEncoder(options?: Record<string, unknown>): Promise<MlowEncoder>;
    createDecoder(options?: Record<string, unknown>): Promise<MlowDecoder>;
    createRepacketizer(): Promise<MlowRepacketizer>;
}
export declare function loadMlowModule(): Promise<MlowModule>;
