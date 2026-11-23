/** Sets `key` as the newest entry and evicts the oldest past `maxEntries`, via `onEvict`. */
export declare function setBoundedMapEntry<K, V>(map: Map<K, V>, key: K, value: V, maxEntries: number, onEvict?: (key: K, value: V) => void): void;
