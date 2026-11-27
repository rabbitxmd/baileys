// Part of the bundled Call Kit.
// Only the node helpers and the `custom` ack / receipt builders the VoIP code uses.
import { TEXT_DECODER } from './util.js';
const EMPTY_NODE_CHILDREN = Object.freeze([]);
export function getNodeChildren(node) {
    return Array.isArray(node.content) ? node.content : EMPTY_NODE_CHILDREN;
}
export function findNodeChild(node, tag) {
    const content = node.content;
    if (!Array.isArray(content))
        return undefined;
    for (let i = 0; i < content.length; i++) {
        if (content[i].tag === tag)
            return content[i];
    }
    return undefined;
}
export function getFirstNodeChild(node) {
    return getNodeChildren(node)[0];
}
export function getNodeChildrenByTag(node, tag) {
    const content = node.content;
    if (!Array.isArray(content))
        return EMPTY_NODE_CHILDREN;
    const tagged = [];
    for (let i = 0; i < content.length; i++) {
        if (content[i].tag === tag)
            tagged.push(content[i]);
    }
    return tagged.length > 0 ? tagged : EMPTY_NODE_CHILDREN;
}
export function hasNodeChild(node, tag) {
    return findNodeChild(node, tag) !== undefined;
}
export function buildAckNode(input) {
    const attrs = { class: input.ackClass, to: input.to };
    if (input.id)
        attrs.id = input.id;
    if (input.type)
        attrs.type = input.type;
    if (input.participant)
        attrs.participant = input.participant;
    if (input.recipient)
        attrs.recipient = input.recipient;
    if (input.from)
        attrs.from = input.from;
    if (input.error !== undefined)
        attrs.error = String(input.error);
    return { tag: 'ack', attrs, content: input.content };
}
export function buildReceiptNode(input) {
    return { tag: 'receipt', attrs: { ...input.attrs }, content: input.content };
}
export function getNodeTextContent(node) {
    if (!node)
        return undefined;
    const content = node.content;
    if (content instanceof Uint8Array)
        return TEXT_DECODER.decode(content);
    if (typeof content === 'string')
        return content;
    return undefined;
}
