import type { WaVoipDeps, WaVoipStores } from '../compat/index.js';
import type { BaileysSocketLike } from './types.js';
/** Builds the host dependencies `WaVoipCoordinator` needs out of a live Baileys socket. */
export declare function createBaileysDeps(sock: BaileysSocketLike): {
    readonly deps: WaVoipDeps;
    readonly stores: WaVoipStores;
};
