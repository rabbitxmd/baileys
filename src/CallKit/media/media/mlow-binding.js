/** The libmlow-wasm-fork surface: handle types, the loader, and the stream parameters it opens with. */
export const MLOW_SAMPLE_RATE = 16_000;
export const MLOW_CHANNELS = 1;
export const MLOW_FRAME_SIZE = 960;
export const MLOW_MAX_FRAME_SIZE = 1_920;
/** The library's ceiling on one encoded packet, and the size an encode target needs. */
export const MLOW_MAX_PACKET_BYTES = 4_000;
let wasmReady = null;
export function loadMlowModule() {
    if (!wasmReady) {
        wasmReady = import('libmlow-wasm-fork')
            .then(async (mod) => {
            const lib = mod;
            await lib.loadLibopus();
            return lib;
        })
            .catch((err) => {
            wasmReady = null;
            throw err;
        });
    }
    return wasmReady;
}
