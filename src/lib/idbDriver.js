/**
 * idbDriver - the only file in the app that touches IndexedDB.
 *
 * It implements the same five-method driver contract as memoryDriver, so all the
 * rules about what gets written live in the testable `store.js` and this file
 * stays boring on purpose: open the database, put, get, getAll, delete, clear.
 *
 * Schema (version 2):
 *   answers        auto id  - one row per tap, local only
 *   sessions       auto id  - one row per finished session, index on `synced`
 *   reminderEvents auto id  - one row per dismissed/missed reminder, index on `synced`
 *   rememberThis    auto id  - local delayed-recall memories
 *   manualReminders auto id - local one-time reminders
 *   settings       key      - pairing code, device id, last sync time
 */
import { openDB } from 'idb';
import { STORES } from './store.js';

export const DB_NAME = 'cognicare';
export const DB_VERSION = 2;

/** True when this browser can actually give us IndexedDB. */
export function isIndexedDbAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function upgrade(db) {
  if (!db.objectStoreNames.contains(STORES.answers)) {
    const answers = db.createObjectStore(STORES.answers, { keyPath: 'id', autoIncrement: true });
    answers.createIndex('by-timestamp', 'timestamp');
    answers.createIndex('by-domain', 'domain');
  }
  if (!db.objectStoreNames.contains(STORES.sessions)) {
    const sessions = db.createObjectStore(STORES.sessions, { keyPath: 'id', autoIncrement: true });
    sessions.createIndex('by-timestamp', 'timestamp');
    sessions.createIndex('by-domain', 'domain');
    sessions.createIndex('by-synced', 'synced');
  }
  if (!db.objectStoreNames.contains(STORES.reminderEvents)) {
    const events = db.createObjectStore(STORES.reminderEvents, { keyPath: 'id', autoIncrement: true });
    events.createIndex('by-timestamp', 'timestamp');
    events.createIndex('by-synced', 'synced');
  }
  if (!db.objectStoreNames.contains(STORES.rememberThis)) {
    const memories = db.createObjectStore(STORES.rememberThis, { keyPath: 'id', autoIncrement: true });
    memories.createIndex('by-dueAt', 'dueAt');
    memories.createIndex('by-status', 'status');
  }
  if (!db.objectStoreNames.contains(STORES.manualReminders)) {
    const reminders = db.createObjectStore(STORES.manualReminders, { keyPath: 'id', autoIncrement: true });
    reminders.createIndex('by-reminderAt', 'reminderAt');
    reminders.createIndex('by-status', 'status');
  }
  if (!db.objectStoreNames.contains(STORES.settings)) {
    db.createObjectStore(STORES.settings, { keyPath: 'key' });
  }
}

export function createIdbDriver() {
  let dbPromise = null;

  const db = () => {
    if (!dbPromise) {
      dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade,
        blocked() {
          console.warn('[CogniCare] another tab is holding an old version of the database');
        },
        terminated() {
          // Let the next call reopen rather than failing forever.
          dbPromise = null;
        },
      });
    }
    return dbPromise;
  };

  return {
    name: 'indexeddb',
    ready: () => db(),
    put: async (store, value) => (await db()).put(store, value),
    getAll: async (store) => (await db()).getAll(store),
    get: async (store, key) => (await db()).get(store, key),
    delete: async (store, key) => (await db()).delete(store, key),
    clear: async (store) => (await db()).clear(store),
  };
}
