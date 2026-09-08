import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRecordStore, DEMO_FLAG, DOMAINS, REMINDER_STATUSES, REMINDER_TYPES, STORES, SYNCED } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { assertSafeRecord, FORBIDDEN_FIELDS } from '../src/lib/privacy.js';
import { SETTINGS } from '../src/lib/sync.js';
import {
  buildDemoHistory,
  clearDemoHistory,
  DAY_MS,
  DECLINING_DOMAIN,
  DEMO_DAYS,
  DEMO_QUESTIONS_PER_SESSION,
  DEMO_REMINDER_TYPES,
  DEMO_SEED,
  demoHistoryCounts,
  makeSeededRand,
  seedDemoHistory,
  startOfDay,
  STEADY_DOMAIN,
} from '../src/lib/demoData.js';
import {
  createDemoConsole,
  DEMO_ACTIONS,
  DEMO_GLOBAL,
  DEMO_PARAM,
  installDemoConsole,
  runDemoFromUrl,
} from '../src/lib/demoConsole.js';
import {
  buildSeries,
  DECLINE_MIN_DROP,
  DECLINE_RUN,
  declineAlerts,
  describeDecline,
  describeTrend,
  trailingDecline,
  TREND,
} from '../src/lib/trends.js';
import { buildReminderLog, loadCaregiverData } from '../src/lib/caregiverData.js';
import { BANKS } from '../src/data/banks.js';

/**
 * The seeder is pure logic over an injected store and an injected clock, so these
 * tests run the real thing - the same `createRecordStore` the app builds, the same
 * `buildSeries` / `describeDecline` the dashboard calls - with an in-memory driver
 * instead of IndexedDB.
 */
const NOW = Date.UTC(2026, 8, 13, 19, 42, 11);

const freshStore = () => {
  const driver = createMemoryDriver();
  return { driver, store: createRecordStore(driver, { now: () => NOW }) };
};

const seeded = async (over = {}) => {
  const { driver, store } = freshStore();
  const result = await seedDemoHistory(store, { now: NOW, ...over });
  return { driver, store, result };
};

const sessionsOf = (rows, domain) => rows.filter((r) => r.domain === domain);
const quiet = { info() {}, warn() {} };

/* ------------------------------------------------------- schema and shape ---- */

test('seeded sessions match the stored session schema exactly, field for field', async () => {
  const { store } = await seeded();
  const rows = await store.sessions();
  assert.ok(rows.length > 0);
  for (const row of rows) {
    assert.deepEqual(
      Object.keys(row).sort(),
      [
        'asked',
        'correct',
        'demo',
        'difficultyTierEnd',
        'domain',
        'durationMs',
        'endReason',
        'id',
        'score',
        'synced',
        'timestamp',
      ].sort(),
      'a seeded session has the real fields plus the demo mark, and nothing else'
    );
    assert.ok(DOMAINS.includes(row.domain));
    assert.ok(Number.isInteger(row.score) && row.score >= 0 && row.score <= 100);
    assert.ok([1, 2, 3].includes(row.difficultyTierEnd));
    assert.equal(row.asked, DEMO_QUESTIONS_PER_SESSION);
    assert.ok(row.correct >= 0 && row.correct <= row.asked);
    assert.equal(row.endReason, 'complete');
    assert.equal(row.synced, SYNCED.pending, 'seeded rows queue for sync like real ones');
    assert.equal(row.demo, DEMO_FLAG);
  }
});

test('the seeded score is consistent with its own correct/asked counts', async () => {
  const { store } = await seeded();
  for (const row of await store.sessions()) {
    const implied = Math.round((row.correct / row.asked) * 100);
    assert.ok(
      Math.abs(implied - row.score) <= 7,
      `score ${row.score} should be within rounding of ${implied} (${row.correct}/${row.asked})`
    );
  }
});

test('seeded answers and reminder events match their schemas too', async () => {
  const { store } = await seeded();
  const answers = await store.answers();
  assert.ok(answers.length > 0);
  for (const row of answers) {
    assert.deepEqual(
      Object.keys(row).sort(),
      ['correct', 'demo', 'difficultyTierEnd', 'domain', 'id', 'questionId', 'timestamp'].sort()
    );
    assert.equal(typeof row.correct, 'boolean');
    assert.match(row.questionId, /^(mr|rm)-\d+$/);
  }
  const events = await store.reminderEvents();
  for (const row of events) {
    assert.deepEqual(
      Object.keys(row).sort(),
      ['demo', 'id', 'status', 'synced', 'timestamp', 'type'].sort()
    );
    assert.ok(REMINDER_TYPES.includes(row.type));
    assert.ok(REMINDER_STATUSES.includes(row.status));
  }
});

test('answer rows agree with the session they belong to', async () => {
  const { store } = await seeded();
  const sessions = await store.sessions();
  const answers = await store.answers();
  assert.equal(
    answers.length,
    sessions.length * DEMO_QUESTIONS_PER_SESSION,
    'one answer row per question of every seeded session'
  );
  for (const session of sessions) {
    const mine = answers.filter(
      (a) =>
        a.domain === session.domain &&
        a.timestamp >= session.timestamp &&
        a.timestamp < session.timestamp + DEMO_QUESTIONS_PER_SESSION * 20000
    );
    assert.equal(mine.length, DEMO_QUESTIONS_PER_SESSION);
    assert.equal(
      mine.filter((a) => a.correct).length,
      session.correct,
      'the answer rows cannot disagree with the session score'
    );
    assert.ok(
      mine.every((a) => a.difficultyTierEnd === session.difficultyTierEnd),
      'answers carry the tier the session ended on'
    );
  }
});

test('the demo passes the same privacy guard as real play, and adds no new field name', async () => {
  const history = buildDemoHistory({ now: NOW });
  for (const row of [...history.sessions, ...history.answers, ...history.reminderEvents]) {
    assert.doesNotThrow(() => assertSafeRecord(row), `${JSON.stringify(row)} must be safe`);
    for (const key of Object.keys(row)) {
      assert.ok(!FORBIDDEN_FIELDS.includes(key), `${key} is a forbidden field`);
    }
    for (const value of Object.values(row)) {
      assert.ok(typeof value !== 'string' || value.length <= 20, 'no free text in seeded rows');
    }
  }
});

/* --------------------------------------------------- both domains, spread ---- */

test('both domains are present, and they are the two the app plays', async () => {
  const { store } = await seeded();
  const domains = [...new Set((await store.sessions()).map((s) => s.domain))].sort();
  assert.deepEqual(domains, [...DOMAINS].sort());
  assert.deepEqual(domains, BANKS.map((b) => b.domain).sort(), 'the dashboard draws exactly these');
});

test('timestamps span several distinct past days and none is in the future', async () => {
  const { store } = await seeded();
  const rows = await store.sessions();
  const dayStart = startOfDay(NOW);
  const days = new Set(rows.map((r) => Math.floor(r.timestamp / DAY_MS)));
  assert.ok(days.size >= 8, `expected history over many days, got ${days.size}`);
  assert.ok(rows.every((r) => r.timestamp < NOW), 'seeded history is entirely in the past');
  const oldest = Math.min(...rows.map((r) => r.timestamp));
  assert.ok(
    oldest >= dayStart - DEMO_DAYS * DAY_MS,
    'nothing older than the documented window'
  );
  assert.ok(
    oldest <= dayStart - (DEMO_DAYS - 1) * DAY_MS,
    'the history really does reach back to the documented window'
  );
  for (const domain of DOMAINS) {
    const perDomain = new Set(sessionsOf(rows, domain).map((r) => Math.floor(r.timestamp / DAY_MS)));
    assert.ok(perDomain.size >= 7, `${domain} needs history on several days, got ${perDomain.size}`);
  }
});

test('sessions land at plausible hours, not at midnight', async () => {
  const { store } = await seeded();
  for (const row of await store.sessions()) {
    const hour = new Date(row.timestamp).getUTCHours();
    assert.ok(hour >= 8 && hour <= 18, `a session at ${hour}:00 UTC would look fabricated`);
  }
});

/* ------------------------------------------ the trend the demo has to show ---- */

test('the declining domain trips the real Step 12 alert, through the real rule', async () => {
  const { store } = await seeded();
  const sessions = await store.sessions();
  const series = buildSeries(sessions, DECLINING_DOMAIN, { now: NOW });
  const run = trailingDecline(series);
  assert.ok(
    run.sessions >= DECLINE_RUN,
    `needs at least ${DECLINE_RUN} consecutive falls, got ${run.sessions}`
  );
  assert.ok(run.drop >= DECLINE_MIN_DROP, `needs a drop of ${DECLINE_MIN_DROP}, got ${run.drop}`);

  const reading = describeDecline(series, { label: 'Remember the picture' });
  assert.equal(reading.alert, true);
  assert.equal(reading.reason, 'declining-run');
});

test('the declining domain still alerts if a demonstrator plays one live session', async () => {
  const { store } = await seeded();
  // A live session played right after seeding, scoring below the last seeded one.
  await store.saveSession({
    domain: DECLINING_DOMAIN,
    score: 44,
    difficultyTierEnd: 1,
    asked: 8,
    correct: 4,
    timestamp: NOW - 60000,
  });
  const series = buildSeries(await store.sessions(), DECLINING_DOMAIN, { now: NOW });
  assert.equal(describeDecline(series).alert, true, 'the run survives one more fall');
});

test('the steady domain is meaningfully different and never reads as a decline', async () => {
  const { store } = await seeded();
  const sessions = await store.sessions();
  const series = buildSeries(sessions, STEADY_DOMAIN, { now: NOW });

  const reading = describeDecline(series, { label: 'Everyday routines' });
  assert.equal(reading.alert, false, 'the steady domain must not alert');
  const run = trailingDecline(series);
  assert.ok(run.sessions < DECLINE_RUN, `its trailing run must be short, got ${run.sessions}`);

  const trend = describeTrend(series, { label: 'Everyday routines', now: NOW });
  assert.equal(trend.direction, TREND.steady, 'and the dashboard should call it steady');
  assert.match(trend.headline, /steady/, 'in the words a caregiver actually reads');

  /* `scores` is oldest-first, so the last entry is the newest session's percent.
   * (`series.newest` is a timestamp, not a score.) */
  const lastOf = (s) => s.scores[s.scores.length - 1];
  const declining = buildSeries(sessions, DECLINING_DOMAIN, { now: NOW });
  assert.ok(
    lastOf(declining) + 20 < lastOf(series),
    `the two domains must end far enough apart to look different: ${lastOf(declining)} vs ${lastOf(series)}`
  );
  assert.equal(
    describeTrend(declining, { now: NOW }).direction,
    TREND.down,
    'the other domain must read as going down, so the two are described differently'
  );
});

test('the two domains together produce exactly one alert, via declineAlerts', async () => {
  const { store } = await seeded();
  const sessions = await store.sessions();
  /* The same shape CaregiverDashboard.jsx passes: one entry per chart, each with
   * the series and the label the chart is titled with. */
  const readings = BANKS.map((bank) => ({
    series: buildSeries(sessions, bank.domain, { now: NOW }),
    label: bank.name,
  }));
  const alerts = declineAlerts(readings);
  assert.equal(alerts.any, true);
  assert.equal(alerts.all.length, 2, 'both domains are judged, independently');
  assert.equal(alerts.alerts.length, 1, 'one domain declines, the other does not');
  assert.equal(alerts.alerts[0].alert, true);
  assert.equal(alerts.alerts[0].domain, DECLINING_DOMAIN);
  assert.equal(
    alerts.all.find((one) => one.domain === STEADY_DOMAIN).alert,
    false
  );
});

test('the chart has enough points to be worth showing, in both domains', async () => {
  const { store } = await seeded();
  const sessions = await store.sessions();
  for (const domain of DOMAINS) {
    const series = buildSeries(sessions, domain, { now: NOW });
    assert.ok(series.count >= 8, `${domain} should plot at least 8 points, got ${series.count}`);
    assert.ok(series.labels.every((l) => typeof l === 'string' && l.length > 0));
    assert.ok(series.scores.every((s) => Number.isFinite(s)));
    assert.ok(series.tiers.every((t) => [1, 2, 3].includes(t)));
  }
});

test('the reminder log the dashboard renders is populated, with both statuses', async () => {
  const { store } = await seeded();
  const events = (await store.reminderEvents()).map((r) => ({ ...r, pairingCode: 'K7M2QP' }));
  const log = buildReminderLog(events, { now: NOW });
  assert.ok(log.rows.length >= 10, `expected a useful log, got ${log.rows.length}`);
  const statuses = [...new Set(log.rows.map((r) => r.status))].sort();
  assert.deepEqual(statuses, ['dismissed', 'missed'], 'an honest log shows misses too');
  assert.ok(log.rows.some((r) => r.status === 'missed'));
  for (const type of DEMO_REMINDER_TYPES) {
    assert.ok(REMINDER_TYPES.includes(type), `${type} must be a real reminder type`);
  }
});

/* ----------------------------------------- determinism and duplicate safety ---- */

test('the same day seeds byte-identical history', () => {
  const a = buildDemoHistory({ now: NOW });
  const b = buildDemoHistory({ now: NOW + 3600000 });
  assert.deepEqual(a, b, 'two runs on the same day produce the same rows');
  assert.deepEqual(buildDemoHistory({ now: NOW }), buildDemoHistory({ now: NOW }));
});

test('the seeded rand is a deterministic sequence, not Math.random', () => {
  const a = makeSeededRand(DEMO_SEED);
  const b = makeSeededRand(DEMO_SEED);
  const first = Array.from({ length: 5 }, () => a());
  const second = Array.from({ length: 5 }, () => b());
  assert.deepEqual(first, second);
  assert.ok(first.every((n) => n >= 0 && n < 1));
  assert.notDeepEqual(first, Array.from({ length: 5 }, makeSeededRand(99)));
});

test('re-seeding replaces rather than duplicates', async () => {
  const { store } = freshStore();
  const one = await seedDemoHistory(store, { now: NOW });
  const after1 = {
    answers: (await store.answers()).length,
    sessions: (await store.sessions()).length,
    reminderEvents: (await store.reminderEvents()).length,
  };
  assert.deepEqual(one.removed, { answers: 0, sessions: 0, reminderEvents: 0 });

  const two = await seedDemoHistory(store, { now: NOW });
  assert.deepEqual(two.removed, after1, 'the second run removed exactly what the first wrote');
  const after2 = {
    answers: (await store.answers()).length,
    sessions: (await store.sessions()).length,
    reminderEvents: (await store.reminderEvents()).length,
  };
  assert.deepEqual(after2, after1, 'the history is the same size, not double');

  await seedDemoHistory(store, { now: NOW });
  await seedDemoHistory(store, { now: NOW });
  const scores = (await store.sessions()).map((s) => `${s.domain}:${s.timestamp}:${s.score}`);
  assert.equal(new Set(scores).size, scores.length, 'no duplicated session after four runs');
  assert.equal(scores.length, after1.sessions);
});

test('a second seed leaves the dashboard reading identical', async () => {
  const { store } = freshStore();
  await seedDemoHistory(store, { now: NOW });
  const read = async () => {
    const sessions = await store.sessions();
    return DOMAINS.map((d) => {
      const series = buildSeries(sessions, d, { now: NOW });
      return { scores: series.scores, alert: describeDecline(series).alert };
    });
  };
  const before = await read();
  await seedDemoHistory(store, { now: NOW });
  assert.deepEqual(await read(), before);
});

/* -------------------------------------------------------- reset is surgical ---- */

test('reset removes only demo rows and keeps real play', async () => {
  const { store } = freshStore();
  const real = await store.saveSession({
    domain: DECLINING_DOMAIN,
    score: 66,
    difficultyTierEnd: 2,
    asked: 8,
    correct: 5,
    timestamp: NOW - 5000,
  });
  await store.logAnswer({
    domain: DECLINING_DOMAIN,
    questionId: 'mr-3',
    correct: true,
    difficultyTierEnd: 2,
    timestamp: NOW - 6000,
  });
  await store.logReminderEvent({ type: 'medicine', status: 'dismissed', timestamp: NOW - 7000 });

  await seedDemoHistory(store, { now: NOW });
  const mixed = await demoHistoryCounts(store);
  assert.deepEqual(mixed.real, { answers: 1, sessions: 1, reminderEvents: 1 });
  assert.ok(mixed.demo.sessions > 1);

  const removed = await clearDemoHistory(store);
  assert.equal(removed.sessions, mixed.demo.sessions);

  const after = await demoHistoryCounts(store);
  assert.deepEqual(after.demo, { answers: 0, sessions: 0, reminderEvents: 0 });
  assert.deepEqual(after.real, { answers: 1, sessions: 1, reminderEvents: 1 });
  const survivors = await store.sessions();
  assert.equal(survivors.length, 1);
  assert.equal(survivors[0].id, real.id, 'the genuine session is the one still there');
  assert.equal(survivors[0].demo, undefined, 'and it never carried the mark');
});

test('real writes are unmarked, so nothing genuine can be swept up by a reset', async () => {
  const { store } = freshStore();
  const session = await store.saveSession({
    domain: STEADY_DOMAIN,
    score: 70,
    difficultyTierEnd: 2,
    timestamp: NOW,
  });
  assert.equal('demo' in session, false, 'the stored shape of a real row is unchanged');
  const answer = await store.logAnswer({
    domain: STEADY_DOMAIN,
    questionId: 'rm-2',
    correct: false,
    difficultyTierEnd: 2,
    timestamp: NOW,
  });
  assert.equal('demo' in answer, false);
  const event = await store.logReminderEvent({ type: 'hydration', status: 'missed', timestamp: NOW });
  assert.equal('demo' in event, false);
});

test('seeding and resetting never touch the pairing code or device id', async () => {
  const { driver, store } = freshStore();
  await store.setSetting(SETTINGS.pairingCode, 'K7M2QP');
  await store.setSetting(SETTINGS.deviceId, 'K7M2QPX4RTBV');
  await store.setSetting(SETTINGS.lastSyncAt, NOW - 1000);
  const settingsBefore = await driver.getAll(STORES.settings);

  await seedDemoHistory(store, { now: NOW });
  assert.deepEqual(await driver.getAll(STORES.settings), settingsBefore, 'seeding left settings alone');

  await clearDemoHistory(store);
  assert.deepEqual(await driver.getAll(STORES.settings), settingsBefore, 'reset left settings alone');
  assert.equal(await store.getSetting(SETTINGS.pairingCode), 'K7M2QP');
  assert.equal(await store.getSetting(SETTINGS.deviceId), 'K7M2QPX4RTBV');
  assert.equal(await store.getSetting(SETTINGS.lastSyncAt), NOW - 1000);
});

test('the reset is not clearHistory - a real patient keeps their history', async () => {
  const { store } = freshStore();
  await store.saveSession({ domain: DECLINING_DOMAIN, score: 55, difficultyTierEnd: 1, timestamp: 1000 });
  await clearDemoHistory(store);
  assert.equal((await store.sessions()).length, 1, 'a device with no demo rows loses nothing');
});

/* --------------------------------------- the dashboard really consumes this ---- */

test('the caregiver dashboard loader shows the seeded history for this device', async () => {
  const { store } = freshStore();
  await store.setSetting(SETTINGS.pairingCode, 'K7M2QP');
  await store.setSetting(SETTINGS.deviceId, 'K7M2QPX4RTBV');
  await seedDemoHistory(store, { now: NOW });

  const data = await loadCaregiverData({ store, remote: null, code: 'K7M2QP', now: () => NOW });
  assert.equal(data.isOwnDevice, true, 'the demo is shown for this device\'s own code');
  assert.ok(data.sessions.length >= 15, `the dashboard received ${data.sessions.length} sessions`);
  assert.ok(data.reminderEvents.length >= 10);

  const readings = BANKS.map((bank) => {
    const series = buildSeries(data.sessions, bank.domain, { now: NOW });
    return { bank, series, decline: describeDecline(series, { label: bank.name }) };
  });
  assert.deepEqual(
    readings.map((r) => r.decline.alert),
    [true, false],
    'memory recall alerts, routines do not - the demo story, through the real loader'
  );
  assert.ok(readings[0].decline.headline, 'the alert has plain-language text to show');
  assert.ok(readings.every((r) => r.series.count > 0));
});

test('after a reset the dashboard is empty again, not stale', async () => {
  const { store } = freshStore();
  await store.setSetting(SETTINGS.pairingCode, 'K7M2QP');
  await seedDemoHistory(store, { now: NOW });
  await clearDemoHistory(store);
  const data = await loadCaregiverData({ store, remote: null, code: 'K7M2QP', now: () => NOW });
  assert.equal(data.sessions.length, 0);
  assert.equal(data.reminderEvents.length, 0);
});

/* ------------------------------------------------------- the demo mark stops here */

test('the demo mark cannot reach Firestore, because remotePayload does not carry it', async () => {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const sync = readFileSync(join(ROOT, 'src', 'lib', 'sync.js'), 'utf8');
  const payload = sync.slice(sync.indexOf('function remotePayload'));
  const body = payload.slice(0, payload.indexOf('\n}'));
  assert.ok(!/\bdemo\b/.test(body), 'remotePayload must not copy the demo mark');
});

test('the seeded rows queue for sync exactly like real ones', async () => {
  const { store } = await seeded();
  const pending = await store.pendingSync();
  assert.ok(pending.sessions.length > 0, 'seeded sessions are pending, so sync is not special-cased');
  assert.ok(pending.reminderEvents.length > 0);
  const marked = await store.markSynced(
    STORES.sessions,
    pending.sessions.map((r) => r.id)
  );
  assert.equal(marked, pending.sessions.length);
  assert.equal((await store.pendingSync()).sessions.length, 0);
  assert.ok(
    (await store.sessions()).every((r) => r.demo === DEMO_FLAG),
    'marking synced does not lose the demo mark, so a reset still finds the rows'
  );
});

/* ------------------------------------------------------------ the mechanism ---- */

test('the console helper seeds, reports and resets', async () => {
  const { store } = freshStore();
  const helper = createDemoConsole({ store, now: () => NOW, log: quiet });
  const seedResult = await helper.seedDemo();
  assert.ok(seedResult.seeded.sessions > 0);
  assert.equal(seedResult.days, DEMO_DAYS);
  assert.deepEqual(seedResult.domains, { declining: DECLINING_DOMAIN, steady: STEADY_DOMAIN });

  const status = await helper.demoStatus();
  assert.equal(status.demo.sessions, seedResult.seeded.sessions);
  assert.deepEqual(status.real, { answers: 0, sessions: 0, reminderEvents: 0 });

  const plan = helper.demoPlan();
  assert.deepEqual(plan.sessions.length, seedResult.seeded.sessions, 'the plan matches what was written');
  assert.equal((await store.sessions()).length, seedResult.seeded.sessions, 'demoPlan wrote nothing');

  await helper.resetDemo();
  assert.deepEqual((await helper.demoStatus()).demo, { answers: 0, sessions: 0, reminderEvents: 0 });
});

test('the helper is installed on the global, and writes nothing on its own', async () => {
  const { store } = freshStore();
  const scope = { location: { search: '', href: 'https://x.test/app/' }, history: {} };
  installDemoConsole({ store, scope, now: () => NOW, log: quiet });
  assert.equal(typeof scope[DEMO_GLOBAL].seedDemo, 'function');
  assert.equal(typeof scope[DEMO_GLOBAL].resetDemo, 'function');
  assert.equal(typeof scope[DEMO_GLOBAL].demoStatus, 'function');
  await new Promise((r) => setTimeout(r, 0));
  assert.equal((await store.sessions()).length, 0, 'installing must not seed');
});

test('?demo=seed seeds once and strips itself from the URL', async () => {
  const { store } = freshStore();
  const helper = createDemoConsole({ store, now: () => NOW, log: quiet });
  const replaced = [];
  const scope = {
    location: { search: `?${DEMO_PARAM}=${DEMO_ACTIONS.seed}`, href: `https://x.test/app/?${DEMO_PARAM}=seed` },
    history: { replaceState: (_s, _t, url) => replaced.push(url) },
  };
  const ran = await runDemoFromUrl(helper, scope);
  assert.equal(ran.action, DEMO_ACTIONS.seed);
  assert.ok(ran.result.seeded.sessions > 0);
  assert.deepEqual(replaced, ['/app/'], 'the parameter is removed so a reload does not re-seed');
});

test('?demo=reset resets, and anything else is ignored', async () => {
  const { store } = freshStore();
  const helper = createDemoConsole({ store, now: () => NOW, log: quiet });
  await helper.seedDemo();
  const scope = {
    location: { search: `?${DEMO_PARAM}=${DEMO_ACTIONS.reset}`, href: 'https://x.test/app/?demo=reset' },
    history: { replaceState() {} },
  };
  const ran = await runDemoFromUrl(helper, scope);
  assert.equal(ran.action, DEMO_ACTIONS.reset);
  assert.equal((await store.sessions()).length, 0);

  for (const search of ['', '?demo=', '?demo=wipe', '?other=seed']) {
    const out = await runDemoFromUrl(helper, {
      location: { search, href: `https://x.test/app/${search}` },
      history: { replaceState() {} },
    });
    assert.equal(out, null, `${search || '(no query)'} must do nothing`);
  }
});

test('the seeder refuses a store it cannot use, rather than half-writing', async () => {
  await assert.rejects(() => seedDemoHistory(null), /needs a record store/);
  await assert.rejects(() => seedDemoHistory({}), /needs a record store/);
  await assert.rejects(() => clearDemoHistory({}), /needs a record store/);
  assert.throws(() => createDemoConsole({}), /needs a store/);
  assert.equal(installDemoConsole({ store: null, scope: {} }), null);
});

/* ------------------------------------------------------------------ wiring ---- */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

test('the demo helper is installed by main.jsx and imported nowhere else', () => {
  const main = read('src', 'main.jsx');
  assert.match(main, /import \{ installDemoConsole \} from '\.\/lib\/demoConsole\.js'/);
  assert.match(main, /installDemoConsole\(\{ store: getStore\(\) \}\)/);

  for (const file of [
    'pages/Play.jsx',
    'pages/PatientHome.jsx',
    'pages/CaregiverDashboard.jsx',
    'pages/CaregiverPairing.jsx',
    'lib/sync.js',
    'lib/db.js',
  ]) {
    const src = read('src', ...file.split('/'));
    assert.ok(
      !/demoConsole|demoData/.test(src),
      `${file} must not import the demo seeder - it is not part of the app`
    );
  }
});

test('the demo adds no route, no server and no admin screen', () => {
  const app = read('src', 'App.jsx');
  assert.ok(!/demo/i.test(app), 'App.jsx gains no demo route');
  const checker = read('scripts', 'check-static.mjs');
  assert.ok(!/'\/demo'/.test(checker), 'no demo route was added to the route list');
  const helper = read('src', 'lib', 'demoConsole.js');
  assert.ok(!/express|http\.createServer|fetch\(/.test(helper), 'no backend, no network');
});

test('the demo seeder writes only through the store API, never the driver', () => {
  const src = read('src', 'lib', 'demoData.js');
  assert.ok(!/driver\.|indexedDB|from 'idb'/.test(src), 'no direct driver or IndexedDB access');
  assert.match(src, /store\.saveSession\(/);
  assert.match(src, /store\.logAnswer\(/);
  assert.match(src, /store\.logReminderEvent\(/);
  assert.ok(
    !/setSetting|pairingCode|deviceId/.test(src),
    'the seeder must have no way to write a setting'
  );
});

test('demo:plan is a runnable script that only reads', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['demo:plan'], 'node scripts/demo-plan.mjs');
  const script = read('scripts', 'demo-plan.mjs');
  assert.match(script, /buildDemoHistory/);
  assert.ok(!/seedDemoHistory|clearDemoHistory/.test(script), 'the Node script cannot write to IndexedDB');
});
