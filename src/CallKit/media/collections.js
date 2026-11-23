/** Sets `key` as the newest entry and evicts the oldest past `maxEntries`, via `onEvict`. */
export function setBoundedMapEntry(map, key, value, maxEntries, onEvict) {
    map.delete(key);
    map.set(key, value);
    while (map.size > maxEntries) {
        const oldest = map.entries().next();
        if (oldest.done) {
            break;
        }
        map.delete(oldest.value[0]);
        onEvict?.(oldest.value[0], oldest.value[1]);
    }
}
