/** The bytes of an IPv4 address. */
export declare const IPV4_ADDRESS_BYTES = 4;
/** The bytes of an IPv6 address. */
export declare const IPV6_ADDRESS_BYTES = 16;
/** Writes the four dotted-decimal octets of `text[start, end)` into `out` at `offset`. */
export declare function writeIpv4Address(text: string, start: number, end: number, out: Uint8Array, offset: number): boolean;
/**
 * Writes the 16 address bytes of an RFC 4291 textual IPv6 address into `out` at
 * `offset`, covering the compressed `::` run anywhere in the address and the
 * mixed `::ffff:1.2.3.4` tail.
 *
 * Groups are written front to back and the `::` run is closed at the end by
 * sliding everything after it against the tail of the field, so the only
 * allocation is the caller's exact-size attribute buffer.
 */
export declare function writeIpv6Address(text: string, out: Uint8Array, offset: number): boolean;
