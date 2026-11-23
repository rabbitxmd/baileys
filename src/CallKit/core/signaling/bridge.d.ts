import { type Logger } from '../../compat/index.js';
import { type BinaryNode } from '../../compat/transport.js';
import type { WaCallManager } from '../call/WaCallManager.js';
import type { WaVoipDeps } from '../types.js';
export declare function routeCallStanza(manager: WaCallManager, deps: WaVoipDeps, node: BinaryNode, logger?: Logger): Promise<string | null>;
export declare function routeCallReceipt(deps: WaVoipDeps, node: BinaryNode): Promise<boolean>;
