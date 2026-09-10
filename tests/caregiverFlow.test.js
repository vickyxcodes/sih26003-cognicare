import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAREGIVER_CODE_KEY,
  LOG_LIMIT,
  SOURCE,
  buildReminderLog,
  describeFreshness,
  forgetCode,
  loadCaregiverData,
  readStoredCode,
  saveCode,
} from '../src/lib/caregiverData.js';
import { STORES, createRecordStore } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { SETTINGS } from '../src/lib/sync.js';
import { NOT_A_DIAGNOSIS, TREND, buildSeries, describeTrend } from '../src/lib/trends.js';
import { chartConfig } from '../src/lib/chartSpec.js';
import { DAY_MS } from '../src/lib/timeWords.js';
import { BANKS } from '../src/data/banks.js';

/**
 * The caregiver journey, start to finish, as one simulation.
 *
 * There is no browser here, so this cannot click a button. What it can do -
 * and what the pages are structured to allow - is run exactly the calls the two
 * screens make, in the order they make them, against a real record store and a
 * fake Firestore, and assert what the caregiver would end up looking at. The
 * pages themselves are then thin enough that what is left unverified is layout,
 * which is on the README's manual checklist.
 *
 * The view model built in `viewModel()` below is a copy of the memo block in
 * `CaregiverDashboard.jsx`, and a test at the bottom of this file reads the page
 * source to check the two have not drifted apart.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TZ = { timeZone: 'Asia/Kolkata' };
const NOW = Date.UTC(2026, 8, 6, 3, 45);
const now = () => NOW;

const PATIENT = 'K7M2QP';
const STRANGER = 'W9XY34';

const freshStore = () => createRecordStore(createMemoryDriver(), { now });

const remoteSession = (code, daysAgo, score, tier, domain) => ({
  docId: `sessions-D1-${domain}-${daysAgo}`,
  pairingCode: code,
  domain,
  score,
  difficultyTierEnd: tier,
  timestamp: NOW - daysAgo * DAY_MS,
});

const remoteReminder = (code, daysAgo, type, status) => ({
  docId: `reminderEvents-D1-${type}-${daysAgo}`,
  pairingCode: code,
  type,
  status,
  timestamp: NOW - daysAgo * DAY_MS,
});

function createFakeRemote({ configured = true, sessions = [], reminderEvents = [], fail = null } = {}) {
  return {
    isConfigured: () => configured,
    async list({ collection, pairingCode }) {
      if (!pairingCode) throw new Error('a remote read must be constrained to a pairing code');
      if (fail) throw fail;
      const all = collection === STORES.sessions ? sessions : reminderEvents;
      return { rows: all.filter((row) => row.pairingCode === pairingCode), fromCache: false };
    },
  };
}

/** Exactly what the dashboard derives from a snapshot before it renders. */
const viewModel = (snapshot) => ({
  charts: BANKS.map((bank) => {
    const series = buildSeries(snapshot.sessions, bank.domain, { now: NOW, ...TZ });
    return { bank, series, reading: describeTrend(series, { label: bank.name, now: NOW }) };
  }),
  log: buildReminderLog(snapshot.reminderEvents, { limit: LOG_LIMIT, now: NOW, ...TZ }),
  freshness: describeFreshness(snapshot, NOW, TZ),
});

/**
 * A patient who has been playing for a week: memory recall drifting down,
 * routine matching holding steady, and a mixed reminder history. Written as
 * remote documents because that is what a caregiver's own device would read.
 * Nothing here is seeded into the app - it is test input only (demo seeding is
 * step 13).
 */
const HISTORY = {
  sessions: [
    remoteSession(PATIENT, 9, 80, 3, 'memory_recall'),
    remoteSession(PATIENT, 7, 78, 3, 'memory_recall'),
    remoteSession(PATIENT, 5, 74, 2, 'memory_recall'),
    remoteSession(PATIENT, 3, 55, 2, 'memory_recall'),
    remoteSession(PATIENT, 2, 50, 1, 'memory_recall'),
    remoteSession(PATIENT, 1, 48, 1, 'memory_recall'),
    remoteSession(PATIENT, 8, 70, 2, 'routine_matching'),
    remoteSession(PATIENT, 6, 72, 2, 'routine_matching'),
    remoteSession(PATIENT, 4, 68, 2, 'routine_matching'),
    remoteSession(PATIENT, 2, 71, 2, 'routine_matching'),
    // A stranger's rows sit in the same collection, as they would in Firestore.
    remoteSession(STRANGER, 1, 95, 3, 'memory_recall'),
  ],
  reminderEvents: [
    remoteReminder(PATIENT, 3, 'medicine', 'dismissed'),
    remoteReminder(PATIENT, 2, 'hydration', 'missed'),
    remoteReminder(PATIENT, 1, 'medicine', 'dismissed'),
    remoteReminder(PATIENT, 0, 'appointment', 'dismissed'),
    remoteReminder(STRANGER, 0, 'medicine', 'missed'),
  ],
};

test('first visit: nothing is stored, so the pairing screen is what opens', async () => {
  const store = freshStore();
  assert.equal(await readStoredCode(store), null);
  /* The page turns that null into staying put, and a code into a redirect. Both
   * are asserted against the source at the bottom of this file. */
});

test('the whole journey: pair once, reload, and the dashboard is what opens', async () => {
  const driver = createMemoryDriver();
  const remote = createFakeRemote(HISTORY);

  // --- first visit -------------------------------------------------------
  const visit1 = createRecordStore(driver, { now });
  assert.equal(await readStoredCode(visit1), null, 'the pairing screen is shown');

  // A caregiver types the code from the patient's device, in lower case.
  await saveCode(visit1, 'k7m2qp');
  assert.equal(await readStoredCode(visit1), PATIENT);

  // --- reload: a new store object over the same stored data --------------
  const visit2 = createRecordStore(driver, { now });
  const stored = await readStoredCode(visit2);
  assert.equal(stored, PATIENT, 'the code survived the reload, so the dashboard opens directly');

  // --- the dashboard reads ----------------------------------------------
  const snapshot = await loadCaregiverData({ store: visit2, remote, code: stored, now });
  assert.equal(snapshot.source, SOURCE.remote);
  assert.equal(snapshot.sessions.length, 10, 'ten of the patient rows, none of the stranger');
  assert.equal(snapshot.reminderEvents.length, 4);

  const { charts, log, freshness } = viewModel(snapshot);

  // --- one chart per domain, each with a reading under it ---------------
  assert.equal(charts.length, BANKS.length);
  assert.deepEqual(charts.map((c) => c.bank.domain), BANKS.map((b) => b.domain));

  const [memory, routine] = charts;
  assert.equal(memory.series.count, 6);
  assert.deepEqual(memory.series.scores, [80, 78, 74, 55, 50, 48], 'oldest first');
  assert.equal(memory.reading.direction, TREND.down);
  assert.match(memory.reading.headline, /has declined across the last 6 sessions\.$/);

  assert.equal(routine.series.count, 4);
  assert.equal(routine.reading.direction, TREND.steady);
  assert.match(routine.reading.headline, /has been steady across the last 4 sessions\.$/);

  // Each chart is genuinely drawable from its own series, and the two do not
  // share a config object.
  for (const chart of charts) {
    const config = chartConfig(chart.series);
    assert.deepEqual(config.data.datasets[0].data, chart.series.scores);
    assert.deepEqual(config.data.datasets[1].data, chart.series.tiers);
    assert.equal(config.data.labels.length, chart.series.count);
    assert.ok(chart.reading.headline.startsWith(chart.bank.name));
    assert.ok(chart.reading.detail.length > 20, 'words, not only a number');
  }

  // --- the reminder log -------------------------------------------------
  assert.deepEqual(log.rows.map((r) => r.typeLabel), ['Appointment', 'Medicine', 'Water', 'Medicine']);
  assert.deepEqual(log.rows.map((r) => r.statusLabel), ['Marked done', 'Marked done', 'No answer', 'Marked done']);
  assert.match(log.rows[0].when, /^Today at /);
  assert.match(log.summary, /3 were marked done and 1 went unanswered/);

  // --- last synced ------------------------------------------------------
  assert.match(freshness.syncValue, /^Today at /, 'the read really happened, at NOW');
  assert.match(freshness.syncNote, /from the server/);
  assert.equal(freshness.warning, '', 'a session from yesterday is not stale');
  /* Latest activity is the newest row across BOTH collections, which here is
   * today's appointment reminder rather than yesterday's session - that is the
   * point of the line: "has anything happened lately", not "has a game been
   * played lately". */
  assert.match(freshness.activityValue, /^Today at /);
  assert.match(freshness.activityNote, /from today/);

  // --- change code returns to pairing ----------------------------------
  await forgetCode(visit2);
  assert.equal(await readStoredCode(visit2), null);
});

test('an empty history gives an honest empty dashboard, with no chart drawn', async () => {
  const store = freshStore();
  const snapshot = await loadCaregiverData({
    store,
    remote: createFakeRemote({ sessions: [], reminderEvents: [] }),
    code: PATIENT,
    now,
  });
  const { charts, log, freshness } = viewModel(snapshot);

  for (const chart of charts) {
    assert.equal(chart.series.count, 0);
    assert.deepEqual(chart.series.points, [], 'the component renders its empty state, not a flat line');
    assert.match(chart.reading.headline, /has not been played yet\.$/);
    assert.match(chart.reading.detail, /fills in on its own/);
  }
  assert.equal(log.rows.length, 0);
  assert.equal(log.summary, 'No reminders have been recorded yet.');
  assert.equal(freshness.warning, '', 'nothing recorded is not the same as stale');
  assert.equal(freshness.activityValue, 'Nothing recorded yet');
  assert.match(freshness.syncValue, /^Today at /, 'the read itself did happen');
});

test('one session in a domain is reported as too little to read, not as a trend', async () => {
  const store = freshStore();
  const played = ['memory_recall', 'routine_matching'];
  const snapshot = await loadCaregiverData({
    store,
    remote: createFakeRemote({
      sessions: [
        remoteSession(PATIENT, 1, 62, 2, 'memory_recall'),
        remoteSession(PATIENT, 1, 40, 1, 'routine_matching'),
      ],
    }),
    code: PATIENT,
    now,
  });
  const charts = viewModel(snapshot).charts;
  for (const chart of charts.filter((c) => played.includes(c.bank.domain))) {
    assert.equal(chart.series.count, 1);
    assert.equal(chart.reading.direction, TREND.single);
    assert.match(chart.reading.headline, /has been played once so far\.$/);
    assert.match(chart.reading.detail, /One session cannot show a trend/);
    // A single point is still plotted - it is a fact, not a trend - but the
    // words are what tell the caregiver not to read a direction into it.
    assert.equal(chartConfig(chart.series).data.datasets[0].data.length, 1);
  }
  /* A domain this patient has not reached yet says exactly that, rather than
   * drawing a flat line at zero that would read as a collapse. */
  for (const chart of charts.filter((c) => !played.includes(c.bank.domain))) {
    assert.equal(chart.series.count, 0);
    assert.match(chart.reading.headline, /has not been played yet\.$/);
  }
});

test('a dashboard that cannot read anything says so instead of showing empty charts', async () => {
  const store = freshStore();
  const snapshot = await loadCaregiverData({
    store,
    remote: createFakeRemote({ fail: Object.assign(new Error('unavailable'), { code: 'unavailable' }) }),
    code: PATIENT,
    now,
  });
  const { freshness } = viewModel(snapshot);
  assert.equal(snapshot.source, SOURCE.none);
  assert.equal(freshness.syncValue, 'Unavailable');
  assert.match(freshness.warning, /No records could be read for this pairing code/);
  /* The difference that matters: "could not read" and "nothing recorded" produce
   * different warnings, so a caregiver is never shown a blank chart that looks
   * like the patient stopped playing. */
  assert.notEqual(freshness.warning, '');
});

test('a stale history is flagged even though the read itself just succeeded', async () => {
  const store = freshStore();
  const snapshot = await loadCaregiverData({
    store,
    remote: createFakeRemote({
      sessions: [
        remoteSession(PATIENT, 20, 70, 2, 'memory_recall'),
        remoteSession(PATIENT, 18, 72, 2, 'memory_recall'),
      ],
    }),
    code: PATIENT,
    now,
  });
  const { freshness } = viewModel(snapshot);
  assert.match(freshness.syncValue, /^Today at /, 'the dashboard read just now');
  assert.match(freshness.warning, /Nothing new has been recorded for a while/);
  assert.match(freshness.activityNote, /weeks old/);
});

test('on the patient own device the dashboard works with no server at all', async () => {
  /* The demo case: one tablet, no Firebase project. The caregiver uses the
   * device's own code and sees the device's own history. */
  const store = freshStore();
  await store.setSetting(SETTINGS.pairingCode, PATIENT);
  for (const [domain, score] of [['memory_recall', 60], ['memory_recall', 75], ['routine_matching', 80]]) {
    await store.saveSession({ domain, score, difficultyTierEnd: 2 });
  }
  await store.logReminderEvent({ type: 'medicine', status: 'dismissed' });

  await saveCode(store, PATIENT);
  const snapshot = await loadCaregiverData({
    store,
    remote: createFakeRemote({ configured: false }),
    code: PATIENT,
    now,
  });
  const { charts, log, freshness } = viewModel(snapshot);

  assert.equal(snapshot.source, SOURCE.local);
  assert.equal(charts[0].series.count, 2);
  assert.equal(charts[1].series.count, 1);
  assert.equal(log.rows.length, 1);
  assert.equal(freshness.syncValue, 'Not yet', 'nothing has been uploaded, and it says so');
  assert.match(freshness.sourceWords, /this device/);
  assert.deepEqual(snapshot.pending, { sessions: 3, reminderEvents: 1 });
});

test('a caregiver holding the wrong code sees nothing, not this device history', async () => {
  const store = freshStore();
  await store.setSetting(SETTINGS.pairingCode, PATIENT);
  await store.saveSession({ domain: 'memory_recall', score: 90, difficultyTierEnd: 3 });

  const snapshot = await loadCaregiverData({
    store,
    remote: createFakeRemote({ configured: false }),
    code: STRANGER,
    now,
  });
  const { charts, log } = viewModel(snapshot);
  assert.equal(snapshot.source, SOURCE.none);
  for (const chart of charts) assert.equal(chart.series.count, 0);
  assert.equal(log.rows.length, 0);
});

// ------------------------------------------------------- routing and structure

test('the two caregiver routes redirect the way the flow needs', () => {
  const pairing = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverPairing.jsx'), 'utf8');
  const dashboard = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverDashboard.jsx'), 'utf8');

  // A stored code skips the pairing screen.
  assert.match(pairing, /if \(stored\) return <Navigate to="\/caregiver\/dashboard" replace \/>;/);
  assert.match(pairing, /navigate\('\/caregiver\/dashboard', \{ replace: true \}\)/);
  // No stored code cannot reach the dashboard.
  assert.match(dashboard, /<Navigate to="\/caregiver" replace \/>/);
  // Both screens offer the way back to the patient side, and nothing more.
  for (const page of [pairing, dashboard]) {
    assert.match(page, /to="\/"/);
  }
  assert.match(dashboard, /LanguageSelector/);
});

test('the caregiver screens sit outside the patient shell, so no reminder covers them', () => {
  const app = readFileSync(join(ROOT, 'src', 'App.jsx'), 'utf8');
  const layout = app.slice(app.indexOf('<Route element={<PatientLayout />}'), app.indexOf('</Route>'));
  assert.match(layout, /path="\/"/);
  assert.match(layout, /path="\/play"/);
  assert.doesNotMatch(layout, /caregiver/, 'a reminder card must never appear over a caregiver screen');
  assert.match(app, /path="\/caregiver" element=\{<CaregiverPairing \/>\}/);
  assert.match(app, /path="\/caregiver\/dashboard" element=\{<CaregiverDashboard \/>\}/);
});

test('the dashboard derives its view exactly the way this simulation does', () => {
  /* If the page starts computing something differently, the simulation above
   * stops standing in for it - so the four calls are pinned. */
  const page = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverDashboard.jsx'), 'utf8');
  assert.match(page, /BANKS\.map\(/);
  assert.match(page, /buildSeries\(/);
  assert.match(page, /describeTrend\(/);
  assert.match(page, /buildReminderLog\(/);
  assert.match(page, /describeFreshness\(/);
  assert.match(page, /label: bank\.name/, 'a chart is labelled with the game name the patient sees');
  // Freezing the read time is what stops "Today at 9:15 am" drifting while the
  // page sits open, and is why `now` is injectable at all.
  assert.match(page, /loadedAt/);
  assert.match(page, /dashboardText/, 'localized dashboard copy is rendered through the shared copy helper');
  assert.ok(NOT_A_DIAGNOSIS.length > 80);
});

test('the dashboard is still information-dense but not patient-styled', () => {
  const page = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverDashboard.jsx'), 'utf8');
  // The patient design system's giant tap targets are for one-button screens;
  // a dashboard using them would be unreadable. It uses the quiet button and the
  // shared card instead, both already in index.css.
  assert.doesNotMatch(page, /btn-primary|min-h-tap-lg|min-h-tap-xl/);
  assert.match(page, /btn-quiet/);
  assert.match(page, /className="card/);
  const home = readFileSync(join(ROOT, 'src', 'pages', 'PatientHome.jsx'), 'utf8');
  assert.match(home, /min-h-tap-xl/, 'the patient side keeps its own giant tap target, unchanged');
});
