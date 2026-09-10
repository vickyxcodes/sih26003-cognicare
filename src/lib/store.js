/**
 * store - everything the app remembers, as pure logic over an injected driver.
 *
 * No `idb` import here, and no browser API: a driver with five methods is passed
 * in (`src/lib/idbDriver.js` in the app, an in-memory one in tests and as a
 * fallback). That is what lets `npm test` exercise the real logging rules -
 * shapes, enums, the privacy guard, the sync queue - with no browser at all.
 *
 * What is stored, and why it is split this way:
 *   answers        one row per tap. Local only, never synced. This is the
 *                  detailed record the spec asks to write immediately, and
 *                  keeping it on the device means Firestore only ever holds a
 *                  session-level score.
 *   sessions       one row per completed or abandoned session report -> synced to Firestore.
 *   reminderEvents one row per reminder dismissed or missed -> synced.
 *   settings       key/value: pairing code, device id, last sync time.
 */
import { assertSafeRecord } from './privacy.js';

export const STORES = {
  answers: 'answers',
  sessions: 'sessions',
  reminderEvents: 'reminderEvents',
  settings: 'settings',
};

/** Values fixed by the Firestore schema in the spec. A typo here would quietly
 * split a caregiver chart in two, so they are checked at the write boundary.
 * This list must stay in step with `BANKS` in `src/data/banks.js` - a bank whose
 * domain is missing here could be played but never stored. A test asserts it. */
export const DOMAINS = [
  'memory_recall',
  'routine_matching',
  'word_recall',
  'number_sequence',
  'pattern_matching',
];
export const REMINDER_TYPES = ['medicine', 'hydration', 'appointment'];
export const REMINDER_STATUSES = ['dismissed', 'missed'];

export const SYNCED = { pending: 0, done: 1 };

/**
 * The mark carried by every row the demo seeder writes, and by nothing else.
 *
 * It exists so fabricated history is distinguishable from a real patient's play
 * and can be removed on its own - `removeDemoRows()` below deletes exactly these
 * rows and leaves genuine sessions, the pairing code and the device id alone.
 * Real writes never pass `demo`, so their stored shape is unchanged: `demoMark`
 * returns `null`, and spreading `null` adds no key at all.
 *
 * Deliberately absent from `remotePayload()` in `sync.js`: the Firestore schema
 * is fixed by the spec and this mark is a local bookkeeping field, so it never
 * leaves the device. See DECISIONS.md, step 13.
 */
export const DEMO_FLAG = 1;

/** `{demo: 1}` for a seeded row, nothing at all for a real one. */
const demoMark = (record) => (record && record.demo ? { demo: DEMO_FLAG } : null);

/** The stores the demo seeder is allowed to touch - never `settings`. */
export const HISTORY_STORES = [STORES.answers, STORES.sessions, STORES.reminderEvents];

const oneOf = (list, value, label) => {
  if (!list.includes(value)) {
    throw new Error(`${label} must be one of ${list.join(', ')} - got ${JSON.stringify(value)}`);
  }
  return value;
};

const tierOf = (value) => {
  const tier = Number(value);
  if (!Number.isInteger(tier) || tier < 1 || tier > 3) {
    throw new Error(`difficultyTierEnd must be 1, 2 or 3 - got ${JSON.stringify(value)}`);
  }
  return tier;
};

const stampOf = (value, now) => (Number.isFinite(value) ? value : now());

/**
 * Builds the app's storage API around a driver.
 *
 * driver = {
 *   put(store, value) -> key,
 *   getAll(store) -> rows,
 *   get(store, key) -> row | undefined,
 *   delete(store, key),
 *   clear(store),
 * }
 */
export function createRecordStore(driver, { now = Date.now } = {}) {
  /**
   * Two layers of protection against personal data reaching storage: every
   * record below is built field by field, so anything extra a caller passes is
   * dropped rather than persisted, and `assertSafeRecord` then rejects the
   * forbidden field names outright (which is what catches caller-named keys,
   * like a settings key, and the payloads the sync layer builds).
   */
  const write = async (storeName, row) => {
    assertSafeRecord(row, storeName);
    const id = await driver.put(storeName, row);
    return { ...row, id };
  };

  const rows = async (storeName, { domain, since, limit } = {}) => {
    let out = await driver.getAll(storeName);
    if (domain) out = out.filter((r) => r.domain === domain);
    if (Number.isFinite(since)) out = out.filter((r) => r.timestamp >= since);
    out.sort((a, b) => a.timestamp - b.timestamp);
    if (Number.isFinite(limit)) out = out.slice(-limit);
    return out;
  };

  return {
    /**
     * One answer, written the moment it is given - the spec is explicit that
     * these are not batched, because a session interrupted halfway (the patient
     * walks away, the tab is closed) must still have logged what was played.
     */
    async logAnswer(record) {
      if (!record) throw new Error('logAnswer needs a record');
      return write(STORES.answers, {
        domain: oneOf(DOMAINS, record.domain, 'domain'),
        questionId: String(record.questionId || ''),
        correct: Boolean(record.correct),
        difficultyTierEnd: tierOf(record.difficultyTierEnd),
        timestamp: stampOf(record.timestamp, now),
        ...demoMark(record),
      });
    },

    /** One completed or abandoned session report: this is the row the caregiver chart plots. */
    async saveSession(summary) {
      if (!summary) throw new Error('saveSession needs a summary');
      const score = Number(summary.score);
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new Error(`score must be a percent 0-100 - got ${JSON.stringify(summary.score)}`);
      }
      return write(STORES.sessions, {
        domain: oneOf(DOMAINS, summary.domain, 'domain'),
        score: Math.round(score),
        difficultyTierEnd: tierOf(summary.difficultyTierEnd),
        asked: Number(summary.asked) || 0,
        correct: Number(summary.correct) || 0,
        durationMs: Number(summary.durationMs) || 0,
        endReason: summary.endReason ? String(summary.endReason) : 'complete',
        timestamp: stampOf(summary.timestamp, now),
        synced: SYNCED.pending,
        ...demoMark(summary),
      });
    },

    async logReminderEvent(event) {
      if (!event) throw new Error('logReminderEvent needs an event');
      return write(STORES.reminderEvents, {
        type: oneOf(REMINDER_TYPES, event.type, 'type'),
        status: oneOf(REMINDER_STATUSES, event.status, 'status'),
        timestamp: stampOf(event.timestamp, now),
        synced: SYNCED.pending,
        ...demoMark(event),
      });
    },

    answers: (opts) => rows(STORES.answers, opts),
    sessions: (opts) => rows(STORES.sessions, opts),
    reminderEvents: (opts) => rows(STORES.reminderEvents, opts),

    /**
     * Everything still waiting to reach Firestore. Filtered in JS rather than
     * through an index: this is a handful of rows per day per device, and one
     * code path is worth more here than a micro-optimisation.
     */
    async pendingSync() {
      const [sessions, reminderEvents] = await Promise.all([
        rows(STORES.sessions),
        rows(STORES.reminderEvents),
      ]);
      return {
        sessions: sessions.filter((r) => r.synced !== SYNCED.done),
        reminderEvents: reminderEvents.filter((r) => r.synced !== SYNCED.done),
      };
    },

    /** Marks rows as synced. Unknown ids are skipped, never thrown on: a sync
     * ack for a row a demo reset deleted must not break the next sync. */
    async markSynced(storeName, ids = []) {
      let marked = 0;
      // Sequential on purpose: a handful of rows, and a read-modify-write per row.
      for (const id of ids) {
        const row = await driver.get(storeName, id);
        if (!row) continue;
        await driver.put(storeName, { ...row, synced: SYNCED.done });
        marked += 1;
      }
      return marked;
    },

    async getSetting(key, fallback = null) {
      const row = await driver.get(STORES.settings, key);
      return row && row.value !== undefined ? row.value : fallback;
    },

    async setSetting(key, value) {
      assertSafeRecord({ [key]: value }, 'settings');
      await driver.put(STORES.settings, { key, value });
      return value;
    },

    /**
     * Deletes every row a demo seed wrote, and only those.
     *
     * Row by row, filtered on `demo === DEMO_FLAG`, rather than `driver.clear()`:
     * a demo may well be run on a device that has genuine play on it (the
     * developer's own tablet), and a reset that took real sessions with it would
     * be exactly the "clear everything" behaviour the spec rules out. `settings`
     * is not in `HISTORY_STORES`, so the pairing code and device id are not
     * reachable from here even by mistake.
     *
     * Returns per-store counts so the console helper can report what it removed.
     */
    async removeDemoRows() {
      const removed = {};
      for (const storeName of HISTORY_STORES) {
        const all = await driver.getAll(storeName);
        const marked = all.filter((row) => row && row.demo === DEMO_FLAG);
        // Sequential: one delete per row, and these are tens of rows, not thousands.
        for (const row of marked) await driver.delete(storeName, row.id);
        removed[storeName] = marked.length;
      }
      return removed;
    },

    /**
     * Clears play history but keeps settings, so re-seeding the demo does not
     * unpair the caregiver's device (step 13 leans on this).
     */
    async clearHistory() {
      await Promise.all([
        driver.clear(STORES.answers),
        driver.clear(STORES.sessions),
        driver.clear(STORES.reminderEvents),
      ]);
    },
  };
}
