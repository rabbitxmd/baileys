type BytesLike = Uint8Array | ArrayLike<number>;
export interface CallMessageShape {
    callKey?: BytesLike | null;
}
export interface MessageShape {
    call?: CallMessageShape | null;
}
export interface SignedDeviceIdentityShape {
    details?: BytesLike | null;
    accountSignatureKey?: BytesLike | null;
    accountSignature?: BytesLike | null;
    deviceSignature?: BytesLike | null;
}
interface Encoded {
    finish(): Uint8Array;
}
export declare const proto: {
    readonly Message: {
        readonly encode: (message: MessageShape) => Encoded;
        readonly decode: (bytes: Uint8Array) => {
            call?: {
                callKey?: Uint8Array;
            };
        };
    };
    readonly ADVSignedDeviceIdentity: {
        readonly encode: (identity: SignedDeviceIdentityShape) => Encoded;
    };
};
export {};
