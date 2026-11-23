import { concatBytes, EMPTY_BYTES } from './bytes.js';
/**
 * Protobuf field writing and reading, shared by the app-data payloads and the relay's
 * subscription lists. `bigint` throughout because an app-data transaction id is a `uint64`.
 */
export const PROTO_WIRE_VARINT = 0;
const PROTO_WIRE_FIXED64 = 1;
export const PROTO_WIRE_LENGTH_DELIMITED = 2;
const PROTO_WIRE_FIXED32 = 5;
const VARINT_CONTINUATION = 0x80;
const VARINT_PAYLOAD_MASK = 0x7fn;
const VARINT_SHIFT = 7n;
function encodeVarint(value) {
    const bytes = [];
    let remaining = value;
    while (remaining > VARINT_PAYLOAD_MASK) {
        bytes.push(Number(remaining & VARINT_PAYLOAD_MASK) | VARINT_CONTINUATION);
        remaining >>= VARINT_SHIFT;
    }
    bytes.push(Number(remaining & VARINT_PAYLOAD_MASK));
    return new Uint8Array(bytes);
}
function encodeTag(fieldNumber, wireType) {
    return encodeVarint((BigInt(fieldNumber) << 3n) | BigInt(wireType));
}
export function encodeProtoVarintField(fieldNumber, value) {
    return concatBytes([encodeTag(fieldNumber, PROTO_WIRE_VARINT), encodeVarint(value)]);
}
export function encodeProtoLengthDelimited(fieldNumber, data) {
    return concatBytes([
        encodeTag(fieldNumber, PROTO_WIRE_LENGTH_DELIMITED),
        encodeVarint(BigInt(data.length)),
        data
    ]);
}
function readVarint(data, offset) {
    let value = 0n;
    let shift = 0n;
    let cursor = offset;
    while (cursor < data.length) {
        const byte = data[cursor++];
        value |= (BigInt(byte) & VARINT_PAYLOAD_MASK) << shift;
        if ((byte & VARINT_CONTINUATION) === 0)
            return { value, next: cursor };
        shift += VARINT_SHIFT;
        if (shift > 63n)
            break;
    }
    throw new Error('truncated protobuf varint');
}
/** Walks the fields of one message, skipping unknown ones; throws on malformed bytes. */
export function* readProtoFields(data) {
    let offset = 0;
    while (offset < data.length) {
        const tag = readVarint(data, offset);
        offset = tag.next;
        const fieldNumber = Number(tag.value >> 3n);
        const wireType = Number(tag.value & 0x7n);
        if (fieldNumber === 0)
            throw new Error('invalid protobuf field number 0');
        if (wireType === PROTO_WIRE_VARINT) {
            const read = readVarint(data, offset);
            offset = read.next;
            yield { fieldNumber, wireType, varint: read.value, bytes: EMPTY_BYTES };
            continue;
        }
        if (wireType === PROTO_WIRE_LENGTH_DELIMITED) {
            const length = readVarint(data, offset);
            const start = length.next;
            const end = start + Number(length.value);
            if (end > data.length)
                throw new Error('truncated protobuf length-delimited field');
            offset = end;
            yield { fieldNumber, wireType, varint: 0n, bytes: data.subarray(start, end) };
            continue;
        }
        if (wireType === PROTO_WIRE_FIXED64) {
            offset += 8;
        }
        else if (wireType === PROTO_WIRE_FIXED32) {
            offset += 4;
        }
        else {
            throw new Error(`unsupported protobuf wire type ${wireType}`);
        }
        if (offset > data.length)
            throw new Error('truncated protobuf fixed-width field');
    }
}
