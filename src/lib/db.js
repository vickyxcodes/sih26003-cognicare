/**
 * db - the app's single storage entry point.
 *
 * Picks a driver once (IndexedDB, falling back to memory if the browser will not
 * give us one) and wraps the write helpers so a storage failure can never
 * interrupt a game. Logging is important; it is not more important than the
 * patient answering or leaving their session, so every write here is fire-and-forget with
 * the error reported to the console and swallowed.
 *
 * UI code imports only this file. Anything that needs to read history
 * (the caregiver dashboard, the demo seeder) uses `getStore()`; the one read the
 * patient side needs - today's reminder events - is wrapped below.
 */
import { createRecordStore } from './store.js';
import { createIdbDriver, isIndexedDbAvailable } from './idbDriver.js';
import { createMemoryDriver } from './memoryDriver.js';

let cached = null;
let usingFallback = false;

function pickDriver() {
  if (isIndexedDbAvailable()) return createIdbDriver();
  usingFallback = true;
  console.warn('[CogniCare] IndexedDB unavailable - history will not survive this tab');
  return createMemoryDriver();
}

/** The shared store, created on first use. */
export function getStore() {
  if (!cached) cached = createRecordStore(pickDriver());
  return cached;
}

/** True when we had to fall back to in-memory storage (surfaced by the UI). */
export function isStorageEphemeral() {
  getStore();
  return usingFallback;
}

/** Replaces the driver - used by tests and by nothing else. */
export function useDriver(driver) {
  cached = createRecordStore(driver);
  usingFallback = driver.name !== 'indexeddb';
  return cached;
}

async function safely(what, run) {
  try {
    return await run();
  } catch (error) {
    console.warn(`[CogniCare] could not save ${what}:`, error);
    return null;
  }
}

/**
 * Anyone who wants to know that a syncable row was just written - the sync layer,
 * and nothing else today. It lives here so the dependency points one way: the
 * game and the reminder card import `db.js` and know nothing about Firestore,
 * while `sync.js` listens and knows nothing about the game.
 */
const queueListeners = new Set();

export function onQueued(fn) {
  queueListeners.add(fn);
  return () => queueListeners.delete(fn);
}

/** Announced only for a row that really was written, and never allowed to throw
 * back into the caller - a sync listener must not be able to break a game. */
function announceQueued(row) {
  if (!row) return row;
  for (const fn of queueListeners) {
    try {
      fn(row);
    } catch (error) {
      console.warn('[CogniCare] queue listener failed:', error);
    }
  }
  return row;
}

/** Writes one answer immediately. Called on every tap; never awaited by the UI. */
export function recordAnswer(record) {
  if (!record) return Promise.resolve(null);
  return safely('an answer', () => getStore().logAnswer(record));
}

export function recordSession(summary) {
  if (!summary) return Promise.resolve(null);
  return safely('a session', () => getStore().saveSession(summary)).then(announceQueued);
}

export function recordReminderEvent(event) {
  if (!event) return Promise.resolve(null);
  return safely('a reminder', () => getStore().logReminderEvent(event)).then(announceQueued);
}

/**
 * The reminder events logged since `since` - today's, in practice. The overlay
 * reads this on mount so a reload cannot announce a reminder the patient has
 * already dealt with. Read through the same swallow-and-continue path as the
 * writes: unreadable history means "nothing logged yet", never a broken screen.
 */
export async function readReminderEvents(since) {
  const rows = await safely('reminder history', () => getStore().reminderEvents({ since }));
  return rows || [];
}
