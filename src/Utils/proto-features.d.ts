import type { proto } from '../../WAProto/index.js';

export declare const PaymentDetailsServiceType: Readonly<{ UNKNOWN: 0; UPI: 1 }>;
export declare const PaymentDetailsStatus: Readonly<{ STATUS_UNKNOWN: 0; SUCCESS: 1 }>;
export declare const VpcScopeHint: Readonly<{ UNKNOWN: 0; WA_ONLY: 1; WAFFLE: 2; WA_META_AI: 3; META_AI_ONLY: 4; FOA_ONLY: 5 }>;
export declare const RequestLocationUpdateType: Readonly<{ UNKNOWN: 0; CANCEL: 1 }>;
export declare const MessageEditDisplayType: Readonly<{ DEFAULT: 0; LINK_PREVIEW_ONLY: 1 }>;

export declare function buildPaymentDetails(options?: {
    serviceType?: keyof typeof PaymentDetailsServiceType | number;
    /** Human amount, not the scaled wire value. */
    amount?: number;
    currency?: string;
    payeeName?: string;
    payerName?: string;
    transactionTimestampMs?: number;
    transactionId?: string | number;
    status?: keyof typeof PaymentDetailsStatus | number;
    contextInfo?: proto.IContextInfo;
}): proto.Message.IPaymentDetailsMessage;

export declare function buildVpcRequest(options: {
    /** Older WhatsApp builds; send this or `token` (or both). */
    requestId?: string | number;
    /** Newer builds; bytes, or a base64 string. */
    token?: Uint8Array | string;
    payloadSchemaVersion?: number;
    scopeHint?: keyof typeof VpcScopeHint | number;
}): proto.Message.IVpcRequestMessage;

export declare function buildRequestLocationUpdate(options: {
    key: proto.IMessageKey;
    updateType?: keyof typeof RequestLocationUpdateType | number;
    senderTimestampMs?: number;
}): proto.Message.IRequestLocationUpdateMessage;

export declare function resolveEditDisplayType(value?: keyof typeof MessageEditDisplayType | number): number | undefined;

export declare function readPaymentDetails(msg: any): {
    serviceType?: number;
    amount?: { amount: number; currencyCode?: string };
    payeeName?: string;
    payerName?: string;
    transactionTimestampMs?: number;
    transactionId?: string;
    status?: number;
} | null;
