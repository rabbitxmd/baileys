export interface BinaryNode {
    readonly tag: string;
    readonly attrs: Readonly<Record<string, string>>;
    readonly content?: Uint8Array | string | readonly BinaryNode[];
}
export declare function getNodeChildren(node: BinaryNode): readonly BinaryNode[];
export declare function findNodeChild(node: BinaryNode, tag: string): BinaryNode | undefined;
export declare function getFirstNodeChild(node: BinaryNode): BinaryNode | undefined;
export declare function getNodeChildrenByTag(node: BinaryNode, tag: string): readonly BinaryNode[];
export declare function hasNodeChild(node: BinaryNode, tag: string): boolean;
export type BuildAckNodeInput = {
    readonly kind: 'custom';
    readonly ackClass: string;
    readonly to: string;
    readonly id?: string;
    readonly type?: string;
    readonly participant?: string;
    readonly recipient?: string;
    readonly from?: string;
    readonly error?: number | string;
    readonly content?: BinaryNode[];
};
export declare function buildAckNode(input: BuildAckNodeInput): BinaryNode;
export type BuildReceiptNodeInput = {
    readonly kind: 'custom';
    readonly attrs: Readonly<Record<string, string>>;
    readonly content?: BinaryNode[];
};
export declare function buildReceiptNode(input: BuildReceiptNodeInput): BinaryNode;
export declare function getNodeTextContent(node: BinaryNode | null | undefined): string | undefined;
