import { type RelayEndpoint } from '../relay/relay-info.js';
import type { RxVideoSubscription } from '../relay/stun-subscriptions.js';
import { type WaCallMediaRelay, type WaCallMediaSender, type WaCallMediaVideoSubscription } from './plan.js';
/** Whether two SSRC lists are the same, order included: the order is what the relay gets. */
export declare function sameSsrcs(left: readonly number[], right: readonly number[]): boolean;
/** `base` followed by whatever of `extra` it lacks, in order. */
export declare function unionInOrder(base: readonly number[], extra: readonly number[]): number[];
/** The plan's dialable relays as the relay is told them, on the web client's port unless asked. */
export declare function toRelayConfigs(endpoints: readonly WaCallMediaRelay[], useOriginalRelayPort: boolean): RelayEndpoint[];
/** The video asked of each sender, by the sender's pid; a sender without one yet is left out. */
export declare function rxVideoSubscriptionInfos(senders: readonly WaCallMediaSender[], wanted: readonly WaCallMediaVideoSubscription[]): RxVideoSubscription[];
