/**
 * sync - copies session reports and reminder events to Firestore, once each.
 *
 * The rules of the sync layer as pure logic over an injected remote - exactly
 * the shape `store.js` uses for its driver. `node --test` drives a fake
 * Firestore that can go offline, fail, or take a write and then lose the
 * acknowledgement, so every branch below is exercised with no browser and no
 * Firebase project.
 *
 * The design in one paragraph. IndexedDB stays the source of truth: a session or
 * a reminder event is written locally the moment it happens, carrying
 * `synced: 0`. This file only ever *copies* such a row out and then flips that
 * flag to 1 - never before the server has acknowledged the write, and never by
 * deleting anything. The document id is derived from the row itself
 * (`sessions-<deviceId>-<rowId>`), so a retry after an uncertain result aims at
 * the very document the first attempt would have created. Together with the
 * create-only security rules that makes a duplicate impossible: a retry is
 * either the create that never happened, or an update the rules reject - and one
 * server read then tells us the record is already there.
 */
import {
  PAIRING_CODE_ALPHABET,
  PAIRING_CODE_LENGTH,
  assertSafeRecord,
  isPairingCode,
  makePairingCode,
} from './privacy.js';
import { STORES } from './store.js';

/** The two collections in `firestore.rules`, named after the local stores they
 * mirror. `answers` is deliberately absent: per-answer detail never leaves the
 * device, so Firestore only ever holds a session-level score. */
export const SYNCED_STORES = [STORES.sessions, STORES.reminderEvents];

/** Settings keys this layer owns. Step 11's dashboard reads `lastSyncAt`. */
export const SETTINGS = {
  pairingCode: 'pairingCode',
  deviceId: 'deviceId',
  lastSyncAt: 'lastSyncAt',
};

export const SYNC_DEFAULTS = {
  timeoutMs: 8000, // a Firestore write that has not answered by now is "uncertain"
  startupDelayMs: 3000, // let the first screen paint before touching the network
  sweepMs: 60000, // re-check while the app is open
  retryBaseMs: 5000,
  retryMaxMs: 300000,
  maxFailuresPerRun: 3, // one broken row must not stall the rest of the queue
};

export const SYNC_STATE = {
  idle: 'idle',
  localOnly: 'local-only',
  offline: 'offline',
  syncing: 'syncing',
  synced: 'synced',
  retrying: 'retrying',
  blocked: 'blocked',
};

export const DEVICE_ID_LENGTH = PAIRING_CODE_LENGTH * 2;

/**
 * 12 characters of the pairing alphabet. Never shown, spoken or typed - it
 * exists only so two devices cannot mint the same document id from the same row
 * number, and so document ids stay stable even if a pairing code is ever
 * re-issued. It identifies a device, not a person.
 */
export const makeDeviceId = (rand = Math.random) => `${makePairingCode(rand)}${makePairingCode(rand)}`;

export function isDeviceId(value) {
  if (typeof value !== 'string' || value.length !== DEVICE_ID_LENGTH) return false;
  return [...value].every((c) => PAIRING_CODE_ALPHABET.includes(c));
}

/**
 * The device's two identifiers, minted on first use and then never changed.
 * Stability is load-bearing: the document id is built from the device id, so
 * changing it would make an in-flight row look unsent and let a retry create a
 * second document.
 */
export async function ensureIdentity(store, { rand = Math.random } = {}) {
  let pairingCode = await store.getSetting(SETTINGS.pairingCode);
  if (!isPairingCode(pairingCode)) {
    pairingCode = await store.setSetting(SETTINGS.pairingCode, makePairingCode(rand));
  }
  let deviceId = await store.getSetting(SETTINGS.deviceId);
  if (!isDeviceId(deviceId)) {
    deviceId = await store.setSetting(SETTINGS.deviceId, makeDeviceId(rand));
  }
  return { pairingCode, deviceId };
}

/**
 * The document id for a local row: derived, not generated, so the same row
 * always addresses the same document however many times we retry. Contains no
 * `/` and cannot be `.` or `..`, which are the only ids Firestore refuses.
 */
export function remoteDocId(storeName, deviceId, localId) {
  if (!SYNCED_STORES.includes(storeName)) {
    throw new Error(`${storeName} is not a synced store`);
  }
  if (!isDeviceId(deviceId)) throw new Error('a device id is required to address a document');
  if (!Number.isInteger(localId) || localId < 1) {
    throw new Error(`a row id must be a positive integer - got ${JSON.stringify(localId)}`);
  }
  return `${storeName}-${deviceId}-${localId}`;
}

/**
 * Exactly the fields allowed to leave the device, built one by one from a fixed
 * list so a future extra column on a local row cannot ride along, and then put
 * through the same privacy guard as every local write. `pairingCode` is the only
 * identifier here, and the security rules require it.
 */
export function remotePayload(storeName, row, pairingCode) {
  if (!isPairingCode(pairingCode)) {
    throw new Error('a remote record must carry the device pairing code');
  }
  const timestamp = Number(row.timestamp) || 0;
  let payload;
  if (storeName === STORES.sessions) {
    payload = {
      pairingCode,
      domain: row.domain,
      score: row.score,
      difficultyTierEnd: row.difficultyTierEnd,
      timestamp,
    };
  } else if (storeName === STORES.reminderEvents) {
    payload = { pairingCode, type: row.type, status: row.status, timestamp };
  } else {
    throw new Error(`${storeName} is not a synced store`);
  }
  return assertSafeRecord(payload, `${storeName} (remote)`);
}

/**
 * The queue as a list of jobs, oldest first: a caregiver's chart is a time
 * series, so a partial flush should leave it with a complete beginning rather
 * than holes.
 */
export function planSync(pending, { pairingCode, deviceId }) {
  const jobs = [];
  for (const storeName of SYNCED_STORES) {
    for (const row of pending[storeName] || []) {
      jobs.push({
        storeName,
        collection: storeName,
        docId: remoteDocId(storeName, deviceId, row.id),
        payload: remotePayload(storeName, row, pairingCode),
        localId: row.id,
        timestamp: Number(row.timestamp) || 0,
      });
    }
  }
  jobs.sort((a, b) => a.timestamp - b.timestamp);
  return jobs;
}

/** 5s, 10s, 20s ... capped at five minutes. Slow enough not to drain a battery
 * on a device that has been out of coverage all afternoon. */
export function backoffMs(attempt, { retryBaseMs, retryMaxMs } = SYNC_DEFAULTS) {
  const n = Math.max(1, Math.floor(Number(attempt) || 1));
  return Math.min(retryBaseMs * 2 ** (n - 1), retryMaxMs);
}

/** A rejected write that means "the rules said no", which - with create-only
 * rules - is also what an already-written document looks like. */
export const isPermissionDenied = (error) =>
  Boolean(error) &&
  (error.code === 'permission-denied' || /permission[-\s]?denied/i.test(String(error.message || '')));

const isBrowser = typeof window !== 'undefined' && typeof window.addEventListener === 'function';

/** `navigator.onLine` is a hint, not a promise: it can say "online" behind a
 * captive portal. It is used to skip pointless work, never to decide that a
 * write succeeded. */
const defaultOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false);

const defaultWatchOnline = (fn) => {
  if (!isBrowser) return () => {};
  window.addEventListener('online', fn);
  return () => window.removeEventListener('online', fn);
};

/** Background schedulers (start-up, retry, sweep) must not hold a process open:
 * Node keeps running while a timer is pending, and a demo must not hang because
 * of a five-minute retry. Harmless in a browser, where a timer is a number.
 * Never applied to a timer someone is awaiting - see `withTimeout`. */
const unref = (timer) => {
  if (timer && typeof timer.unref === 'function') timer.unref();
  return timer;
};

/**
 * Rejects if `promise` has not settled within `ms`. A Firestore write while the
 * connection is dying neither resolves nor rejects - the SDK holds it until the
 * network comes back - so without this the queue would wedge behind one write.
 * A timeout is an *uncertain* result, not a failure: the write may still land,
 * which is exactly why document ids are derived from the row.
 *
 * This timer is deliberately NOT unref'd, unlike the schedulers below. Someone
 * is awaiting it, and it is the only thing that will ever answer them: letting
 * Node exit the loop while it is pending would leave that caller hanging for
 * ever (which is precisely how the "write never acknowledged" test fails).
 */
export function withTimeout(promise, ms, label = 'the request') {
  if (!Number.isFinite(ms) || ms <= 0) return promise;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(`${label} did not answer within ${ms}ms`);
      error.code = 'timeout';
      reject(error);
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Builds the sync loop.
 *
 * remote = {
 *   isConfigured() -> boolean,
 *   put({ collection, docId, payload }) -> resolves once the server has it,
 *   exists({ collection, docId }) -> boolean, read from the server,
 * }
 *
 * Nothing here can affect the game: every path is caught, the only local writes
 * are `synced` flags and the `lastSyncAt` setting, and a record is never deleted.
 */
export function createSyncManager({
  store,
  remote,
  online = defaultOnline,
  watchOnline = defaultWatchOnline,
  watchQueue = () => () => {},
  now = Date.now,
  rand = Math.random,
  log = (...args) => console.warn('[CogniCare]', ...args),
  ...overrides
} = {}) {
  const config = { ...SYNC_DEFAULTS, ...overrides };
  const status = {
    state: SYNC_STATE.idle,
    runs: 0,
    pending: null,
    sent: 0,
    attempt: 0,
    lastSyncAt: null,
    lastError: null,
  };

  let inFlight = null;
  let retryTimer = null;
  let sweepTimer = null;
  let startTimer = null;
  let watchers = [];

  const snapshot = () => ({ ...status });

  const finish = (state, counts) => {
    status.state = state;
    return { state, pending: status.pending, ...counts };
  };

  const clearRetry = () => {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
  };

  function scheduleRetry() {
    clearRetry();
    retryTimer = unref(
      setTimeout(() => {
        retryTimer = null;
        flush();
      }, backoffMs(status.attempt, config))
    );
  }

  /**
   * Did the server end up with this document after all? Asked only when a write
   * did not cleanly succeed. "Cannot tell" answers false, which leaves the row
   * queued - the safe direction, because a queued row can only ever be retried,
   * while a wrongly-synced row is data the caregiver never sees.
   */
  async function alreadyStored(job) {
    try {
      return Boolean(await withTimeout(remote.exists(job), config.timeoutMs, 'a Firestore read'));
    } catch (error) {
      return false;
    }
  }

  async function runOnce() {
    status.runs += 1;
    if (!remote || !remote.isConfigured()) {
      // Local-only mode: rows stay queued in IndexedDB and the app is complete
      // without them ever leaving. Not an error, and not retried.
      return finish(SYNC_STATE.localOnly, { sent: 0, failed: 0 });
    }
    if (!online()) return finish(SYNC_STATE.offline, { sent: 0, failed: 0 });

    status.state = SYNC_STATE.syncing;
    const identity = await ensureIdentity(store, { rand });
    const jobs = planSync(await store.pendingSync(), identity);
    status.pending = jobs.length;

    let sent = 0;
    let failed = 0;
    let denied = false;

    for (const job of jobs) {
      let stored = false;
      try {
        await withTimeout(remote.put(job), config.timeoutMs, 'a Firestore write');
        stored = true;
      } catch (error) {
        status.lastError = error.code || error.message || String(error);
        // Uncertain, refused, or offline - all three ask the same question.
        stored = await alreadyStored(job);
        if (!stored) {
          failed += 1;
          denied = denied || isPermissionDenied(error);
        }
      }
      if (stored) {
        // Only now, and only for this row. A crash on the next line leaves the
        // rest of the queue pending, which costs one harmless retry.
        await store.markSynced(job.storeName, [job.localId]);
        sent += 1;
      }
      if (failed >= config.maxFailuresPerRun) break;
    }

    status.pending = Math.max(0, jobs.length - sent);
    status.sent += sent;
    if (sent) {
      // "Last synced" means records actually reached Firestore. A run that sent
      // nothing never touched the network, so it cannot claim contact.
      status.lastSyncAt = now();
      await store.setSetting(SETTINGS.lastSyncAt, status.lastSyncAt);
    }
    if (failed) {
      status.attempt += 1;
      scheduleRetry();
      return finish(denied ? SYNC_STATE.blocked : SYNC_STATE.retrying, { sent, failed });
    }
    status.attempt = 0;
    status.lastError = null;
    return finish(SYNC_STATE.synced, { sent, failed });
  }

  /**
   * One flush at a time. Start-up, the reconnect event, the sweep and a freshly
   * queued row can all arrive together; without this guard two runs could read
   * the same pending row and write it twice.
   */
  function flush() {
    if (inFlight) return inFlight;
    clearRetry();
    inFlight = runOnce()
      .catch((error) => {
        log('sync run failed:', error);
        status.lastError = String((error && error.message) || error);
        status.attempt += 1;
        scheduleRetry();
        return finish(SYNC_STATE.retrying, { sent: 0, failed: 1 });
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  }

  const manager = {
    flush,
    status: snapshot,

    /** Called once, from `main.jsx`. */
    start() {
      manager.stop();
      watchers = [watchOnline(() => flush()), watchQueue(() => flush())];
      startTimer = unref(
        setTimeout(() => {
          startTimer = null;
          flush();
        }, config.startupDelayMs)
      );
      // The sweep is what makes a lie from `navigator.onLine` self-correcting.
      sweepTimer = unref(setInterval(() => flush(), config.sweepMs));
      return manager;
    },

    stop() {
      clearRetry();
      if (startTimer) clearTimeout(startTimer);
      if (sweepTimer) clearInterval(sweepTimer);
      startTimer = null;
      sweepTimer = null;
      watchers.forEach((off) => {
        if (typeof off === 'function') off();
      });
      watchers = [];
      return manager;
    },
  };

  return manager;
}
