import type { RelayInfo } from './relay-info.js';
/**
 * Stamps the relay's credentials onto the SDP answer: `ice-ufrag` carries the relay token
 * (`authToken || token`) and `ice-pwd` its key, both measured as required by the relay.
 */
export declare function modifySdpForRelay(sdp: string, relayInfo: RelayInfo): string;
/** The `ice-ufrag` of a local offer, or `''` without one. */
export declare function readIceUfrag(sdp: string): string;
