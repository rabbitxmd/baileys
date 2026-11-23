// A hand-rolled protobuf codec for the only two messages the call code touches, so the kit does
// not depend on which Baileys build (or fork) is installed. Field numbers are from WAProto:
//   Message { Call call = 10 }                         Call { bytes callKey = 1 }
//   ADVSignedDeviceIdentity { details = 1; accountSignatureKey = 2; accountSignature = 3;
//                             deviceSignature = 4 }
function toBytes(value) {
    return value instanceof Uint8Array ? value : Uint8Array.from(value);
}
function writeVarint(out, value) {
    let v = value;
    while (v > 0x7f) {
        out.push((v & 0x7f) | 0x80);
        v = Math.floor(v / 128);
    }
    out.push(v);
}
function writeBytesField(out, field, value) {
    writeVarint(out, (field << 3) | 2);
    writeVarint(out, value.length);
    for (let i = 0; i < value.length; i++)
        out.push(value[i]);
}
function readVarint(buf, pos) {
    let result = 0;
    let shift = 0;
    let p = pos;
    for (;;) {
        if (p >= buf.length)
            throw new Error('protobuf: truncated varint');
        const byte = buf[p++];
        result += (byte & 0x7f) * 2 ** shift;
        if ((byte & 0x80) === 0)
            break;
        shift += 7;
        if (shift > 63)
            throw new Error('protobuf: varint too long');
    }
    return { value: result, next: p };
}
/** Calls `visit` for each length-delimited field; every other wire type is skipped. */
function eachBytesField(buf, visit) {
    let pos = 0;
    while (pos < buf.length) {
        const tag = readVarint(buf, pos);
        pos = tag.next;
        const field = Math.floor(tag.value / 8);
        const wire = tag.value & 7;
        if (wire === 0) {
            pos = readVarint(buf, pos).next;
        }
        else if (wire === 1) {
            pos += 8;
        }
        else if (wire === 5) {
            pos += 4;
        }
        else if (wire === 2) {
            const len = readVarint(buf, pos);
            pos = len.next;
            if (pos + len.value > buf.length)
                throw new Error('protobuf: truncated field');
            visit(field, buf.subarray(pos, pos + len.value));
            pos += len.value;
        }
        else {
            throw new Error(`protobuf: unsupported wire type ${wire}`);
        }
    }
}
export const proto = {
    Message: {
        encode(message) {
            const out = [];
            const callKey = message.call?.callKey;
            if (message.call) {
                const inner = [];
                if (callKey)
                    writeBytesField(inner, 1, toBytes(callKey));
                writeBytesField(out, 10, Uint8Array.from(inner));
            }
            return { finish: () => Uint8Array.from(out) };
        },
        decode(bytes) {
            const result = {};
            eachBytesField(bytes, (field, data) => {
                if (field !== 10)
                    return;
                const call = {};
                eachBytesField(data, (innerField, value) => {
                    if (innerField === 1)
                        call.callKey = value;
                });
                result.call = call;
            });
            return result;
        }
    },
    ADVSignedDeviceIdentity: {
        encode(identity) {
            const out = [];
            const fields = [
                [1, identity.details],
                [2, identity.accountSignatureKey],
                [3, identity.accountSignature],
                [4, identity.deviceSignature]
            ];
            for (const [field, value] of fields) {
                if (value && value.length > 0)
                    writeBytesField(out, field, toBytes(value));
            }
            return { finish: () => Uint8Array.from(out) };
        }
    }
};
