/**
 * demoData - a fabricated fortnight of play, so a demo can start on a populated
 * dashboard instead of on "Nothing to chart yet."
 *
 * The problem this solves: every screen the caregiver side draws is derived from
 * real recorded history, and the Step 12 decline alert deliberately needs three
 * consecutive falling sessions of one domain before it says anything. Showing
 * either of those honestly would mean playing a dozen sessions by hand across
 * several days. So this file writes the history the app would have written, and
 * changes nothing else.
 *
 * Four rules the whole file obeys.
 *
 * 1. It writes through the real store. `seedDemoHistory` takes the same store
 *    object `db.js` hands the game, and calls the same `logAnswer` /
 *    `saveSession` / `logReminderEvent` the patient's taps call. Every row is
 *    therefore built by the same field list, validated against the same enums and
 *    passed through the same privacy guard as a genuine one. There is no second
 *    data model and no writer that bypasses the rules, which is the only way the
 *    dashboard can be trusted to render seeded data the same way it renders real
 *    data.
 * 2. Every seeded row carries `demo: 1`, and nothing else in the app ever does.
 *    That is what makes the data distinguishable and what makes the reset
 *    surgical - `clearDemoHistory` deletes exactly the marked rows.
 * 3. It is deterministic. A fixed seed drives a small LCG, and all timestamps are
 *    derived from a `now` that is rounded down to the start of its day, so the
 *    same call on the same day produces byte-identical history. Combined with
 *    "clear the marked rows first", re-running is idempotent rather than
 *    duplicating.
 * 4. It never touches settings. The pairing code, the device id, the caregiver's
 *    typed code and `lastSyncAt` are all left exactly as they were, so seeding
 *    mid-demo cannot unpair a dashboard.
 *
 * Nothing here is imported by the patient game or by the sync layer. It is pure
 * logic over an injected store with the clock injected too, so `node --test`
 * exercises the real thing.
 */
import { DEMO_FLAG, DOMAINS, HISTORY_STORES, REMINDER_TYPES, STORES } from './store.js';

/** The two domains, in the order the dashboard lists them. */
export const [MEMORY_DOMAIN, ROUTINE_DOMAIN] = DOMAINS;

/**
 * The domain that trends downward, and the one that stays level.
 *
 * `memory_recall` is the declining one. That is the more plausible story of the
 * two - short-term recall is what slips first, while the object-to-routine task
 * leans on habits that hold up longer - and it is the domain the dashboard draws
 * first, so a demonstrator scrolls to the alert and then straight to the chart it
 * names.
 */
export const DECLINING_DOMAIN = MEMORY_DOMAIN;
export const STEADY_DOMAIN = ROUTINE_DOMAIN;

/** Fixed, so the same day always seeds the same history. */
export const DEMO_SEED = 20260913;

/** How many days back the fabricated history starts. */
export const DEMO_DAYS = 12;

export const DAY_MS = 86400000;

/**
 * The scores, written out rather than generated.
 *
 * Generating them from a curve was the first attempt and it was the wrong call:
 * the numbers have to satisfy the Step 12 rule *exactly* (a run of at least
 * three consecutive falls, totalling at least 5 points, counted backwards from
 * the newest session) while the other domain must clearly not, and a formula
 * makes that a property nobody can read off the page. Listing them means the
 * intended demo is legible here and pinned by a test.
 *
 * `memory_recall`: a believable fortnight - a good start, an ordinary wobble in
 * the middle, then the last four sessions falling at every step, 71 → 64 → 58 →
 * 49. That is a run of 4 (more than the required 3) dropping 22 points (well over
 * the required 5), so the alert fires and keeps firing even if a demonstrator
 * plays one extra session live.
 *
 * `routine_matching`: level in the low-to-mid 80s, wobbling by a few points in
 * both directions and *ending on a rise*, so its trailing run is length 1. It can
 * never be read as a decline, and `describeTrend` calls it steady.
 *
 * Tiers move the way the adaptive engine would move them: up while the scores are
 * good, back down as memory recall gets harder, and steady at 3 for routines.
 */
const MEMORY_SESSIONS = [
  { day: 12, score: 75, tier: 2 },
  { day: 11, score: 81, tier: 2 },
  { day: 10, score: 78, tier: 3 },
  { day: 8, score: 84, tier: 3 },
  { day: 7, score: 76, tier: 3 },
  { day: 5, score: 71, tier: 3 },
  { day: 4, score: 64, tier: 2 },
  { day: 2, score: 58, tier: 2 },
  { day: 1, score: 49, tier: 1 },
];

const ROUTINE_SESSIONS = [
  { day: 11, score: 84, tier: 2 },
  { day: 9, score: 81, tier: 3 },
  { day: 8, score: 88, tier: 3 },
  { day: 6, score: 83, tier: 3 },
  { day: 5, score: 86, tier: 3 },
  { day: 3, score: 82, tier: 3 },
  { day: 2, score: 85, tier: 3 },
  { day: 1, score: 88, tier: 3 },
];

/**
 * Sessions are placed at plausible hours, not at midnight.
 *
 * A caregiver reading "Today at 12:00 am" would be looking at an obvious
 * fabrication, and the chart tooltips name the time. Late morning and
 * mid-afternoon are when this app would realistically be used.
 */
const SESSION_HOURS = [10, 11, 15, 16];

/** Eight questions per session, matching the engine's cap. */
export const DEMO_QUESTIONS_PER_SESSION = 8;

/**
 * The reminder history: a fortnight of medicine and water prompts, mostly
 * answered. Two `missed` rows near the end give the caregiver log something
 * honest to show - a demo where everything was perfect says nothing about the
 * feature - and the mix is deliberately unremarkable rather than alarming.
 *
 * `appointment` is included once, on a single day, because it is the weekly slot
 * in `src/data/reminders.js`.
 */
const REMINDER_PLAN = [
  { day: 6, hour: 8, minute: 5, type: 'medicine', status: 'dismissed' },
  { day: 6, hour: 11, minute: 30, type: 'hydration', status: 'dismissed' },
  { day: 5, hour: 8, minute: 10, type: 'medicine', status: 'dismissed' },
  { day: 5, hour: 11, minute: 35, type: 'hydration', status: 'missed' },
  { day: 4, hour: 8, minute: 2, type: 'medicine', status: 'dismissed' },
  { day: 4, hour: 16, minute: 20, type: 'hydration', status: 'dismissed' },
  { day: 3, hour: 8, minute: 15, type: 'medicine', status: 'dismissed' },
  { day: 3, hour: 9, minute: 5, type: 'appointment', status: 'dismissed' },
  { day: 2, hour: 8, minute: 8, type: 'medicine', status: 'dismissed' },
  { day: 2, hour: 11, minute: 40, type: 'hydration', status: 'missed' },
  { day: 1, hour: 8, minute: 4, type: 'medicine', status: 'dismissed' },
  { day: 1, hour: 16, minute: 12, type: 'hydration', status: 'dismissed' },
];

/**
 * A tiny linear congruential generator, seeded from a constant.
 *
 * `Math.random` would make the answer rows differ on every seed run, which would
 * break the determinism promise for no benefit. The engine's own tests use the
 * same trick, so this is the established pattern in this repo rather than a new
 * one.
 */
export function makeSeededRand(seed = DEMO_SEED) {
  let value = Math.abs(Math.floor(seed)) % 2147483647 || 42;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

/**
 * Midnight at the start of the day `now` falls in, in UTC.
 *
 * Rounding to a day boundary is what makes two seed runs an hour apart produce
 * identical timestamps. UTC rather than local time is a deliberate simplification:
 * the demo only needs the rows to land on distinct past days at plausible hours,
 * and a device in IST reading a UTC-derived 10:00 sees 15:30, which is still an
 * ordinary afternoon. Using local midnight would make the fixture depend on the
 * machine's zone, and the tests would then pass or fail by geography.
 */
export const startOfDay = (now) => Math.floor(now / DAY_MS) * DAY_MS;

const stampFor = (dayStart, daysAgo, hour, minute = 0) =>
  dayStart - daysAgo * DAY_MS + hour * 3600000 + minute * 60000;

/**
 * The full fabricated history as plain data - every row that `seedDemoHistory`
 * will write, in the shape the store expects, with nothing stored yet.
 *
 * Split out from the writing so the *content* can be asserted directly: a test
 * can check the decline, the domains, the day span and the schema without an
 * IndexedDB or even a store. It is also what makes the plan reviewable here
 * rather than only observable after a run.
 */
export function buildDemoHistory({ now = Date.now(), seed = DEMO_SEED } = {}) {
  const dayStart = startOfDay(now);
  const rand = makeSeededRand(seed);
  const sessions = [];
  const answers = [];
  const reminderEvents = [];

  const plan = [
    ...MEMORY_SESSIONS.map((row) => ({ ...row, domain: MEMORY_DOMAIN })),
    ...ROUTINE_SESSIONS.map((row) => ({ ...row, domain: ROUTINE_DOMAIN })),
  ];

  /* Oldest first, so the rows are written in the order they would have happened
   * and the auto-increment ids run forwards with the timestamps. */
  plan.sort((a, b) => b.day - a.day || a.domain.localeCompare(b.domain));

  plan.forEach((row, index) => {
    const hour = SESSION_HOURS[index % SESSION_HOURS.length];
    const minute = Math.floor(rand() * 50);
    const timestamp = stampFor(dayStart, row.day, hour, minute);
    const asked = DEMO_QUESTIONS_PER_SESSION;
    /* The count is derived from the score rather than the other way round, so
     * `score` is exactly the percent the chart plots and `correct`/`asked` cannot
     * contradict it by more than the rounding the real engine also has. */
    const correct = Math.round((row.score / 100) * asked);

    sessions.push({
      domain: row.domain,
      score: row.score,
      difficultyTierEnd: row.tier,
      asked,
      correct,
      /* Four to seven minutes - inside the engine's six-minute cap for a
       * complete session, and long enough to look like real play. */
      durationMs: 240000 + Math.floor(rand() * 150000),
      endReason: 'complete',
      timestamp,
      demo: DEMO_FLAG,
    });

    /**
     * One answer row per question, so the local-only detail the spec asks to be
     * written on every tap is present in the seeded history too. These never
     * sync and the dashboard never reads them - they exist so a demonstrator
     * opening DevTools sees a coherent database rather than sessions with no
     * answers behind them.
     *
     * The correct ones are spread through the session rather than bunched at the
     * front: a run of 8 rights followed by 2 wrongs would imply tier movements
     * that the session's own `difficultyTierEnd` contradicts.
     */
    const outcomes = Array.from({ length: asked }, (_, i) => i < correct);
    for (let i = outcomes.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
    }
    const prefix = row.domain === MEMORY_DOMAIN ? 'mr' : 'rm';
    outcomes.forEach((wasCorrect, i) => {
      answers.push({
        domain: row.domain,
        questionId: `${prefix}-${1 + Math.floor(rand() * 20)}`,
        correct: wasCorrect,
        difficultyTierEnd: row.tier,
        /* Spaced through the session so the rows read as a sequence of taps. */
        timestamp: timestamp + i * 20000,
        demo: DEMO_FLAG,
      });
    });
  });

  REMINDER_PLAN.forEach((row) => {
    reminderEvents.push({
      type: row.type,
      status: row.status,
      timestamp: stampFor(dayStart, row.day, row.hour, row.minute),
      demo: DEMO_FLAG,
    });
  });

  sessions.sort((a, b) => a.timestamp - b.timestamp);
  answers.sort((a, b) => a.timestamp - b.timestamp);
  reminderEvents.sort((a, b) => a.timestamp - b.timestamp);

  return { sessions, answers, reminderEvents, dayStart, seed };
}

/**
 * Deletes exactly the rows a previous seed wrote, and nothing else.
 *
 * Row-by-row rather than `clearHistory()`, which would take a real patient's
 * sessions with it. Settings are not in `HISTORY_STORES` at all, so the pairing
 * code, the device id and the caregiver's typed code cannot be reached from here
 * even by mistake.
 */
export async function clearDemoHistory(store) {
  if (!store || typeof store.removeDemoRows !== 'function') {
    throw new Error('clearDemoHistory needs a record store');
  }
  return store.removeDemoRows();
}

/**
 * Writes the demo history, replacing any previous seed.
 *
 * Idempotent by construction: the marked rows are removed first, then a
 * deterministic set is written, so running this ten times leaves the same history
 * as running it once. Genuine rows are untouched by both halves.
 *
 * Returns counts rather than the rows themselves - the caller is a console
 * helper or a script that wants to print a line, and the history is then read
 * back through the normal store API like any other.
 */
export async function seedDemoHistory(store, { now = Date.now(), seed = DEMO_SEED } = {}) {
  if (!store || typeof store.saveSession !== 'function') {
    throw new Error('seedDemoHistory needs a record store');
  }
  const removed = await clearDemoHistory(store);
  const history = buildDemoHistory({ now, seed });

  /* Sequential, not `Promise.all`: the store's ids are an auto-increment, and
   * writing in timestamp order keeps the ids and the history in the same
   * sequence - which is also the order the sync layer will drain them in. */
  for (const row of history.answers) await store.logAnswer(row);
  for (const row of history.sessions) await store.saveSession(row);
  for (const row of history.reminderEvents) await store.logReminderEvent(row);

  return {
    removed,
    seeded: {
      answers: history.answers.length,
      sessions: history.sessions.length,
      reminderEvents: history.reminderEvents.length,
    },
    dayStart: history.dayStart,
    days: DEMO_DAYS,
    stores: HISTORY_STORES,
    domains: { declining: DECLINING_DOMAIN, steady: STEADY_DOMAIN },
  };
}

/**
 * What the demo rows currently in storage look like - used by the console helper
 * to report state, and by tests to prove the reset was surgical.
 */
export async function demoHistoryCounts(store) {
  const [answers, sessions, reminderEvents] = await Promise.all([
    store.answers(),
    store.sessions(),
    store.reminderEvents(),
  ]);
  const count = (rows) => rows.filter((row) => row && row.demo === DEMO_FLAG).length;
  return {
    demo: {
      answers: count(answers),
      sessions: count(sessions),
      reminderEvents: count(reminderEvents),
    },
    real: {
      answers: answers.length - count(answers),
      sessions: sessions.length - count(sessions),
      reminderEvents: reminderEvents.length - count(reminderEvents),
    },
  };
}

/** The reminder types the seeded log covers, for the docs and the tests. */
export const DEMO_REMINDER_TYPES = [...new Set(REMINDER_PLAN.map((r) => r.type))].filter((t) =>
  REMINDER_TYPES.includes(t)
);

/** Named so a test can assert the seeder never reaches for the settings store. */
export const DEMO_TOUCHES_STORES = [STORES.answers, STORES.sessions, STORES.reminderEvents];
