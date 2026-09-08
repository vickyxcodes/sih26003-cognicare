/**
 * memoryDriver - the storage driver with no storage.
 *
 * Two jobs. It is what the tests run against, and it is the fallback when
 * IndexedDB is unavailable or blocked (Safari private browsing, a locked-down
 * kiosk browser). In that case history is lost when the tab closes, which is bad
 * - but a patient being unable to play at all is worse, so the game degrades
 * instead of failing.
 */

/** Stores keyed by a field of the record rather than an auto-increment number. */
const KEY_PATHS = { settings: 'key' };

export function createMemoryDriver() {
  const data = new Map();
  const seq = new Map();

  const tableOf = (store) => {
    if (!data.has(store)) data.set(store, new Map());
    return data.get(store);
  };

  const nextId = (store) => {
    const id = (seq.get(store) || 0) + 1;
    seq.set(store, id);
    return id;
  };

  return {
    name: 'memory',

    async put(store, value) {
      const table = tableOf(store);
      const keyPath = KEY_PATHS[store];
      const key = keyPath ? value[keyPath] : value.id ?? nextId(store);
      if (key === undefined || key === null) throw new Error(`${store}: record has no key`);
      table.set(key, keyPath ? { ...value } : { ...value, id: key });
      return key;
    },

    async getAll(store) {
      return [...tableOf(store).values()].map((row) => ({ ...row }));
    },

    async get(store, key) {
      const row = tableOf(store).get(key);
      return row ? { ...row } : undefined;
    },

    async delete(store, key) {
      tableOf(store).delete(key);
    },

    async clear(store) {
      tableOf(store).clear();
      seq.delete(store);
    },
  };
}
