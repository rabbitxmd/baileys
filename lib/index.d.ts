export * from "../WAProto/index.js";
export * from "./Utils/index.js";
export * from "./Types/index.js";
export * from "./Store/index.js";
export * from "./Defaults/index.js";
export * from "./WABinary/index.js";
export * from "./WAM/index.js";
export * from "./WAUSync/index.js";
// Note: Voip module ships as plain .mjs with no .d.ts declarations,
// so these are exported without static types (effectively `any`).
export { attachVoip, VoipClient, ActiveCall } from "./Voip/dist/index.mjs";
export { makeWASocket };
export default makeWASocket;
import makeWASocket from './Socket/index.js';
//# sourceMappingURL=index.d.ts.map
