/**
 * Protobuf field writing and reading, shared by the app-data payloads and the relay's
 * subscription lists. `bigint` throughout because an app-data transaction id is a `uint64`.
 */
export declare const PROTO_WIRE_VARINT = 0;
export declare const PROTO_WIRE_LENGTH_DELIMITED = 2;
export declare function encodeProtoVarintField(fieldNumber: number, value: bigint): Uint8Array;
export declare function encodeProtoLengthDelimited(fieldNumber: number, data: Uint8Array): Uint8Array;
export interface ProtoField {
    readonly fieldNumber: number;
    readonly wireType: number;
    readonly varint: bigint;
    readonly bytes: Uint8Array;
}
/** Walks the fields of one message, skipping unknown ones; throws on malformed bytes. */
export declare function readProtoFields(data: Uint8Array): Generator<ProtoField>;
