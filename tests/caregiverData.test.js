import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAREGIVER_CODE_KEY,
  LOG_LIMIT,
  READ_ERROR,
  SOURCE,
  buildReminderLog,
  describeFreshness,
  forgetCode,
  loadCaregiverData,
  newestTimestamp,
  normaliseCode,
  normaliseReminder,
  normaliseSession,
  onlyForCode,
  readStoredCode,
  saveCode,
  validateCode,
} from '../src/lib/caregiverData.js';
import { STORES, SYNCED, createRecordStore } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { SETTINGS } from '../src/lib/sync.js';
import { PAIRING_CODE_LENGTH, isPairingCode } from '../src/lib/privacy.js';
import { DAY_MS } from '../src/lib/timeWords.js';
import { buildSeries } from '../src/lib/trends.js';

/**
 * The caregiver read path, exercised the way the dashboard uses it: a real
 * `createRecordStore` over an in-memory driver, and a fake remote in place of
 * Firestore.
 *
 * The tests that matter most here are the privacy ones. "Queries are constrained
 * to the stored pairing code" is a claim that has to survive a mistake, so the
 * fake remote below deliberately answers with rows for the WRONG code as well,
 * and the assertions are that none of them reach the snapshot.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TZ = { timeZone: 'Asia/Kolkata' };
const NOW = Date.UTC(2026, 8, 6, 3, 45);
const now = () => NOW;

const PATIENT = 'K7M2QP';
const STRANGER = 'W9XY34';

const remoteSession = (code, daysAgo, score, tier = 2, domain = 'memory_recall') => ({
  docId: `sessions-DEVICE1-${domain}-${daysAgo}`,
  pairingCode: code,
  domain,
  score,
  difficultyTierEnd: tier,
  timestamp: NOW - daysAgo * DAY_MS,
});

const remoteReminder = (code, daysAgo, type = 'medicine', status = 'dismissed') => ({
  docId: `reminderEvents-DEVICE1-${type}-${daysAgo}`,
  pairingCode: code,
  type,
  status,
  timestamp: NOW - daysAgo * DAY_MS,
});

/**
 * Stands in for `remote.js`. `leak` is the interesting knob: when true the
 * server answers every query with a stranger's rows appended, simulating a
 * mis-built query or a rules mistake. The dashboard must still show nothing of
 * theirs.
 */
function createFakeRemote({
  configured = true,
  sessions = [],
  reminderEvents = [],
  fail = null,
  fromCache = false,
  leak = false,
} = {}) {
  const calls = [];
  return {
    calls,
    isConfigured: () => configured,
    async list({ collection, pairingCode, max }) {
      calls.push({ collection, pairingCode, max });
      if (!pairingCode) throw new Error('a remote read must be constrained to a pairing code');
      if (fail) throw fail;
      const all = collection === STORES.sessions ? sessions : reminderEvents;
      const mine = all.filter((row) => row.pairingCode === pairingCode);
      const rows = leak ? [...mine, ...all.filter((row) => row.pairingCode !== pairingCode)] : mine;
      return { rows, fromCache };
    },
  };
}

const freshStore = () => createRecordStore(createMemoryDriver(), { now });

// ---------------------------------------------------------------- pairing code

test('a typed code is normalised the way a person would type it', () => {
  assert.equal(normaliseCode('k7m2qp'), 'K7M2QP');
  assert.equal(normaliseCode(' K7M-2QP '), 'K7M2QP');
  assert.equal(normaliseCode(null), '');
  assert.equal(normaliseCode(undefined), '');
  assert.equal(normaliseCode(742), '742');
});

test('an empty, short or impossible code is refused with words a caregiver can act on', () => {
  const empty = validateCode('');
  assert.equal(empty.ok, false);
  assert.match(empty.reason, /Enter the code/);

  const short = validateCode('K7M');
  assert.equal(short.ok, false);
  assert.match(short.reason, new RegExp(`${PAIRING_CODE_LENGTH} characters`));
  assert.match(short.reason, /has 3/, 'it says what was actually typed');

  /* I, O, 0 and 1 are not in the pairing alphabet precisely because they are
   * misread, so the error explains that rather than just saying "invalid". */
  const ambiguous = validateCode('K7M2QO');
  assert.equal(ambiguous.ok, false);
  assert.match(ambiguous.reason, /never contain the letters I or O/);

  assert.equal(validateCode(PATIENT).ok, true);
  assert.equal(validateCode('k7m2qp').code, PATIENT, 'lower case is accepted, not rejected');
});

test('the code survives a reload, and is kept apart from this device own code', async () => {
  const store = freshStore();
  assert.equal(await readStoredCode(store), null, 'first visit has nothing stored');

  await saveCode(store, 'k7m2qp');
  assert.equal(await readStoredCode(store), PATIENT);
  assert.equal(await store.getSetting(CAREGIVER_CODE_KEY, null), PATIENT);

  /* A reload is a new store object over the same data - which is what the
   * IndexedDB driver gives the next page load. */
  const reloaded = createRecordStore(
    { ...createMemoryDriver(), ...{} },
    { now }
  );
  assert.equal(await readStoredCode(reloaded), null, 'a different device knows nothing');

  // The sync layer mints a code for every device including the caregiver's.
  // Conflating the two would show a caregiver their own empty device.
  await store.setSetting(SETTINGS.pairingCode, STRANGER);
  assert.equal(await readStoredCode(store), PATIENT, 'the typed code is unaffected');
  assert.notEqual(CAREGIVER_CODE_KEY, SETTINGS.pairingCode);
});

test('an invalid code is never stored', async () => {
  const store = freshStore();
  await assert.rejects(() => saveCode(store, 'K7M'), /6 characters/);
  assert.equal(await readStoredCode(store), null);
  await assert.rejects(() => saveCode(store, ''), /Enter the code/);
  assert.equal(await store.getSetting(CAREGIVER_CODE_KEY, null), null);
});

test('a stored value that is not a pairing code is ignored rather than trusted', async () => {
  const store = freshStore();
  // However it got there - an old build, a hand-edited database - it is not a
  // code, so the caregiver is sent back to the pairing screen.
  await store.setSetting(CAREGIVER_CODE_KEY, 'HELLO!!');
  assert.equal(await readStoredCode(store), null);
});

test('forgetting the code returns the device to the pairing screen', async () => {
  const store = freshStore();
  await saveCode(store, PATIENT);
  await forgetCode(store);
  assert.equal(await readStoredCode(store), null);
});

// -------------------------------------------------------------------- privacy

test('a row is only kept if it carries the code that was asked for', () => {
  const rows = [
    { pairingCode: PATIENT, score: 70 },
    { pairingCode: STRANGER, score: 90 },
    { pairingCode: '', score: 50 },
    { score: 50 },
    null,
  ];
  const kept = onlyForCode(rows, PATIENT);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].score, 70);
  assert.deepEqual(onlyForCode(null, PATIENT), []);
  assert.deepEqual(onlyForCode(rows, ''), [], 'an empty code matches nothing, not everything');
});

test('rows are rebuilt field by field, so a document cannot smuggle a field in', () => {
  const session = normaliseSession({
    docId: 'sessions-A-1',
    pairingCode: PATIENT,
    domain: 'memory_recall',
    score: 70,
    difficultyTierEnd: 2,
    timestamp: NOW,
    patientName: 'should never exist',
    notes: 'nor this',
  });
  assert.deepEqual(
    Object.keys(session).sort(),
    ['difficultyTierEnd', 'domain', 'id', 'pairingCode', 'score', 'timestamp']
  );
  assert.equal(session.patientName, undefined);

  const reminder = normaliseReminder({
    docId: 'reminderEvents-A-1',
    pairingCode: PATIENT,
    type: 'medicine',
    status: 'dismissed',
    timestamp: NOW,
    address: 'should never exist',
  });
  assert.deepEqual(Object.keys(reminder).sort(), ['id', 'pairingCode', 'status', 'timestamp', 'type']);
  assert.equal(reminder.address, undefined);
  assert.equal(normaliseSession(null), null);
});

test('a server that answers with another patient rows shows none of them', async () => {
  const store = freshStore();
  const remote = createFakeRemote({
    leak: true, // the mistake this test exists to survive
    sessions: [
      remoteSession(PATIENT, 3, 70),
      remoteSession(STRANGER, 2, 95),
      remoteSession(STRANGER, 1, 20),
    ],
    reminderEvents: [
      remoteReminder(PATIENT, 2),
      remoteReminder(STRANGER, 1, 'hydration', 'missed'),
    ],
  });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });

  assert.equal(snapshot.sessions.length, 1);
  assert.equal(snapshot.reminderEvents.length, 1);
  for (const row of [...snapshot.sessions, ...snapshot.reminderEvents]) {
    assert.equal(row.pairingCode, PATIENT);
  }
  // And the query itself was constrained, which is the first of the two filters.
  assert.equal(remote.calls.length, 2);
  for (const call of remote.calls) {
    assert.equal(call.pairingCode, PATIENT);
  }
  assert.deepEqual(
    remote.calls.map((c) => c.collection).sort(),
    [STORES.reminderEvents, STORES.sessions]
  );
});

test('the dashboard read never asks for a code it was not given', async () => {
  const store = freshStore();
  const remote = createFakeRemote();
  await assert.rejects(
    () => loadCaregiverData({ store, remote, code: 'nonsense', now }),
    /valid pairing code/
  );
  assert.equal(remote.calls.length, 0, 'nothing was read at all');
});

test('another device history is not shown just because the server is unreachable', async () => {
  /* This device has played sessions of its own, and its own code is STRANGER.
   * A caregiver asking about PATIENT must get nothing, not this device's rows. */
  const store = freshStore();
  await store.setSetting(SETTINGS.pairingCode, STRANGER);
  await store.saveSession({ domain: 'memory_recall', score: 88, difficultyTierEnd: 3 });

  const remote = createFakeRemote({ fail: Object.assign(new Error('unavailable'), { code: 'unavailable' }) });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });

  assert.equal(snapshot.source, SOURCE.none);
  assert.deepEqual(snapshot.sessions, []);
  assert.deepEqual(snapshot.reminderEvents, []);
  assert.equal(snapshot.isOwnDevice, false);
  assert.equal(snapshot.error.kind, READ_ERROR.unreachable);
});

// ------------------------------------------------------------------ data paths

test('a configured device reads the patient sessions from the server, oldest first', async () => {
  const store = freshStore();
  const remote = createFakeRemote({
    sessions: [
      remoteSession(PATIENT, 1, 80),
      remoteSession(PATIENT, 5, 40),
      remoteSession(PATIENT, 3, 60, 2, 'routine_matching'),
    ],
    reminderEvents: [remoteReminder(PATIENT, 1)],
  });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });

  assert.equal(snapshot.source, SOURCE.remote);
  assert.equal(snapshot.readAt, NOW);
  assert.deepEqual(snapshot.sessions.map((s) => s.score), [40, 60, 80], 'sorted here, not by Firestore');
  assert.equal(snapshot.fromCache, false);
  assert.equal(snapshot.error, null);
});

test('both domains come out of one read and chart separately', async () => {
  const store = freshStore();
  const remote = createFakeRemote({
    sessions: [
      remoteSession(PATIENT, 4, 40, 1, 'memory_recall'),
      remoteSession(PATIENT, 3, 60, 2, 'memory_recall'),
      remoteSession(PATIENT, 2, 90, 3, 'routine_matching'),
    ],
  });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });
  const memory = buildSeries(snapshot.sessions, 'memory_recall', { now: NOW, ...TZ });
  const routine = buildSeries(snapshot.sessions, 'routine_matching', { now: NOW, ...TZ });
  assert.deepEqual(memory.scores, [40, 60]);
  assert.deepEqual(routine.scores, [90]);
});

test('on the patient own device the local records are used when the server cannot be read', async () => {
  const store = freshStore();
  await store.setSetting(SETTINGS.pairingCode, PATIENT);
  await store.setSetting(SETTINGS.lastSyncAt, NOW - 2 * DAY_MS);
  await store.saveSession({ domain: 'memory_recall', score: 70, difficultyTierEnd: 2 });
  await store.logReminderEvent({ type: 'medicine', status: 'dismissed' });

  const remote = createFakeRemote({ fail: Object.assign(new Error('unavailable'), { code: 'unavailable' }) });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });

  assert.equal(snapshot.source, SOURCE.local);
  assert.equal(snapshot.isOwnDevice, true);
  assert.equal(snapshot.sessions.length, 1);
  assert.equal(snapshot.sessions[0].score, 70);
  assert.equal(snapshot.reminderEvents.length, 1);
  assert.equal(snapshot.lastSyncAt, NOW - 2 * DAY_MS);
  assert.equal(snapshot.error.kind, READ_ERROR.unreachable);
});

test('a refused read is reported as refused, not as an empty history', async () => {
  const store = freshStore();
  const denied = Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
  const remote = createFakeRemote({ fail: denied });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });

  assert.equal(snapshot.error.kind, READ_ERROR.denied);
  assert.equal(snapshot.source, SOURCE.none);
  const words = describeFreshness(snapshot, NOW, TZ);
  assert.match(words.syncNote, /refused/);
  assert.match(words.syncNote, /anonymous sign-in/, 'it names the likely cause');
  assert.equal(words.syncValue, 'Unavailable');
});

test('a local-only device reads its own records and never calls the network', async () => {
  const store = freshStore();
  await store.setSetting(SETTINGS.pairingCode, PATIENT);
  await store.saveSession({ domain: 'routine_matching', score: 65, difficultyTierEnd: 2 });

  const remote = createFakeRemote({ configured: false });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });

  assert.equal(remote.calls.length, 0, 'an unconfigured remote is not called');
  assert.equal(snapshot.remoteConfigured, false);
  assert.equal(snapshot.source, SOURCE.local);
  assert.equal(snapshot.sessions.length, 1);
});

test('rows still queued for upload are counted, but only on this device own history', async () => {
  const store = freshStore();
  await store.setSetting(SETTINGS.pairingCode, PATIENT);
  await store.saveSession({ domain: 'memory_recall', score: 70, difficultyTierEnd: 2 });
  await store.logReminderEvent({ type: 'hydration', status: 'missed' });

  const own = await loadCaregiverData({ store, remote: createFakeRemote({ configured: false }), code: PATIENT, now });
  assert.deepEqual(own.pending, { sessions: 1, reminderEvents: 1 });

  const other = await loadCaregiverData({
    store,
    remote: createFakeRemote({ configured: false }),
    code: STRANGER,
    now,
  });
  assert.equal(other.pending, null, 'a pending count for someone else device is meaningless');
});

test('a cached answer from the SDK is passed through as cached, not as fresh', async () => {
  const store = freshStore();
  const remote = createFakeRemote({ fromCache: true, sessions: [remoteSession(PATIENT, 1, 70)] });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });
  assert.equal(snapshot.fromCache, true);
  const words = describeFreshness(snapshot, NOW, TZ);
  assert.match(words.warning, /cached/i);
  assert.match(words.syncNote, /own cache/);
});

test('the caregiver screens never write anything but the stored code', async () => {
  const driver = createMemoryDriver();
  const store = createRecordStore(driver, { now });
  const writes = [];
  const wrapped = {
    ...store,
    setSetting: async (key, value) => { writes.push(key); return store.setSetting(key, value); },
    saveSession: async () => { throw new Error('the dashboard must not write sessions'); },
    logReminderEvent: async () => { throw new Error('the dashboard must not write reminder events'); },
    markSynced: async () => { throw new Error('the dashboard must not touch sync state'); },
    clearHistory: async () => { throw new Error('the dashboard must not clear history'); },
  };
  await saveCode(wrapped, PATIENT);
  await loadCaregiverData({
    store: wrapped,
    remote: createFakeRemote({ sessions: [remoteSession(PATIENT, 1, 70)] }),
    code: PATIENT,
    now,
  });
  assert.deepEqual(writes, [CAREGIVER_CODE_KEY], 'exactly one setting was written, and nothing else');
});

// -------------------------------------------------------------- reminder log

test('the reminder log reads newest first, with the type and what happened', () => {
  const log = buildReminderLog(
    [
      remoteReminder(PATIENT, 2, 'medicine', 'dismissed'),
      remoteReminder(PATIENT, 0, 'hydration', 'missed'),
      remoteReminder(PATIENT, 1, 'appointment', 'dismissed'),
    ].map((row) => ({ ...row, id: row.docId })),
    { now: NOW, ...TZ }
  );
  assert.deepEqual(log.rows.map((r) => r.type), ['hydration', 'appointment', 'medicine']);
  assert.deepEqual(log.rows.map((r) => r.typeLabel), ['Water', 'Appointment', 'Medicine']);
  assert.deepEqual(log.rows.map((r) => r.statusLabel), ['No answer', 'Marked done', 'Marked done']);
  assert.deepEqual(log.rows.map((r) => r.tone), ['warn', 'good', 'good']);
  assert.match(log.rows[0].when, /^Today at /);
  assert.match(log.rows[1].when, /^Yesterday at /);
  assert.equal(log.done, 2);
  assert.equal(log.missed, 1);
});

test('the log summary is a sentence, not a ratio, and it matches the rows', () => {
  const empty = buildReminderLog([], { now: NOW });
  assert.equal(empty.rows.length, 0);
  assert.equal(empty.summary, 'No reminders have been recorded yet.');

  const allDone = buildReminderLog(
    [remoteReminder(PATIENT, 1), remoteReminder(PATIENT, 2, 'hydration')].map((r) => ({ ...r, id: r.docId })),
    { now: NOW }
  );
  assert.match(allDone.summary, /Every one of the last 2 reminders was marked done/);

  const noneDone = buildReminderLog(
    [
      remoteReminder(PATIENT, 1, 'medicine', 'missed'),
      remoteReminder(PATIENT, 2, 'hydration', 'missed'),
    ].map((r) => ({ ...r, id: r.docId })),
    { now: NOW }
  );
  assert.match(noneDone.summary, /None of the last 2 reminders were marked done/);

  const mixed = buildReminderLog(
    [
      remoteReminder(PATIENT, 1, 'medicine', 'dismissed'),
      remoteReminder(PATIENT, 2, 'hydration', 'missed'),
      remoteReminder(PATIENT, 3, 'medicine', 'dismissed'),
    ].map((r) => ({ ...r, id: r.docId })),
    { now: NOW }
  );
  assert.match(mixed.summary, /2 were marked done and 1 went unanswered/);
});

test('the log is capped, and says how many it is showing out of how many it has', () => {
  const many = Array.from({ length: LOG_LIMIT + 6 }, (_, i) => ({
    ...remoteReminder(PATIENT, i, 'medicine', i % 2 ? 'missed' : 'dismissed'),
    id: `r-${i}`,
  }));
  const log = buildReminderLog(many, { now: NOW });
  assert.equal(log.shown, LOG_LIMIT);
  assert.equal(log.total, LOG_LIMIT + 6);
  assert.equal(log.rows.length, LOG_LIMIT);
});

test('a reminder row the app itself could not have written is left out', () => {
  const log = buildReminderLog(
    [
      { id: 'a', type: 'medicine', status: 'dismissed', timestamp: NOW },
      { id: 'b', type: 'walk', status: 'dismissed', timestamp: NOW },
      { id: 'c', type: 'medicine', status: 'snoozed', timestamp: NOW },
      { id: 'd', type: 'medicine', status: 'dismissed', timestamp: 0 },
      null,
    ],
    { now: NOW }
  );
  assert.deepEqual(log.rows.map((r) => r.id), ['a']);
});

// ------------------------------------------------------------- last synced

test('"Last synced" is never a fabricated time', () => {
  const nothingRead = {
    source: SOURCE.none,
    sessions: [],
    reminderEvents: [],
    remoteConfigured: true,
    lastSyncAt: null,
    error: null,
  };
  const words = describeFreshness(nothingRead, NOW, TZ);
  assert.equal(words.syncValue, 'Unavailable');
  assert.equal(words.activityValue, 'Nothing recorded yet');
  assert.ok(words.syncNote.length > 0, 'it says why instead of showing a time');
  assert.match(words.warning, /No records could be read/);

  const neverUploaded = describeFreshness(
    { source: SOURCE.local, sessions: [], reminderEvents: [], lastSyncAt: null, remoteConfigured: false, error: null },
    NOW,
    TZ
  );
  assert.equal(neverUploaded.syncValue, 'Not yet');
  assert.match(neverUploaded.syncNote, /Nothing has been uploaded/);
});

test('a remote read reports when the dashboard read, a local one when the device uploaded', () => {
  const remoteWords = describeFreshness(
    {
      source: SOURCE.remote,
      readAt: NOW,
      fromCache: false,
      sessions: [{ timestamp: NOW - DAY_MS }],
      reminderEvents: [],
      lastSyncAt: null,
      remoteConfigured: true,
      error: null,
    },
    NOW,
    TZ
  );
  assert.match(remoteWords.syncValue, /^Today at /);
  assert.match(remoteWords.syncNote, /read the records from the server/);
  assert.match(remoteWords.sourceWords, /synced records/);

  const localWords = describeFreshness(
    {
      source: SOURCE.local,
      readAt: NOW,
      sessions: [{ timestamp: NOW }],
      reminderEvents: [],
      lastSyncAt: NOW - DAY_MS,
      remoteConfigured: true,
      error: null,
    },
    NOW,
    TZ
  );
  assert.match(localWords.syncValue, /^Yesterday at /, 'the upload time, not the read time');
  assert.match(localWords.syncNote, /last uploaded/);
  assert.match(localWords.sourceWords, /this device/);
});

test('stale data is called stale, and fresh data is not', () => {
  const snapshot = (daysAgo) => ({
    source: SOURCE.remote,
    readAt: NOW,
    fromCache: false,
    sessions: [{ timestamp: NOW - daysAgo * DAY_MS }],
    reminderEvents: [],
    lastSyncAt: NOW,
    remoteConfigured: true,
    error: null,
  });
  assert.equal(describeFreshness(snapshot(0), NOW, TZ).warning, '');
  assert.equal(describeFreshness(snapshot(3), NOW, TZ).warning, '');
  const stale = describeFreshness(snapshot(12), NOW, TZ);
  assert.match(stale.warning, /Nothing new has been recorded for a while/);
  assert.match(stale.warning, /more than a week old/);
  assert.match(describeFreshness(snapshot(3), NOW, TZ).activityNote, /3 days old/);
});

test('newestTimestamp looks across both collections', () => {
  assert.equal(
    newestTimestamp({ sessions: [{ timestamp: NOW - DAY_MS }], reminderEvents: [{ timestamp: NOW }] }),
    NOW
  );
  assert.equal(newestTimestamp({ sessions: [], reminderEvents: [] }), null);
  assert.equal(newestTimestamp({ sessions: [{ timestamp: 0 }], reminderEvents: [] }), null);
});

test('an empty but successful read is an empty state, not an error', async () => {
  const store = freshStore();
  const remote = createFakeRemote({ sessions: [], reminderEvents: [] });
  const snapshot = await loadCaregiverData({ store, remote, code: PATIENT, now });
  assert.equal(snapshot.source, SOURCE.remote);
  assert.equal(snapshot.error, null);
  assert.deepEqual(snapshot.sessions, []);
  const words = describeFreshness(snapshot, NOW, TZ);
  assert.equal(words.warning, '', 'nothing recorded yet is not a staleness warning');
  assert.equal(words.activityValue, 'Nothing recorded yet');
  const series = buildSeries(snapshot.sessions, 'memory_recall', { now: NOW, ...TZ });
  assert.equal(series.count, 0, 'the chart gets an honest empty series');
});

// ---------------------------------------------------- structure, read by source

/**
 * Comments in these files legitimately talk about Firebase and about the absent
 * orderBy, so the source is stripped of comments and strings before the
 * structural assertions below. Otherwise the tests would be asserting against
 * prose, and a rename in a comment could fail a build.
 */
const codeOf = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\/\/[^\n]*/g, ' ')
  .replace(/'[^'\n]*'/g, "''")
  .replace(/"[^"\n]*"/g, '""');

test('caregiverData imports no Firebase and no build-time env', () => {
  const raw = readFileSync(join(ROOT, 'src', 'lib', 'caregiverData.js'), 'utf8');
  const imports = raw.match(/^import[^;]+;/gm) || [];
  assert.ok(imports.length > 0);
  for (const line of imports) {
    assert.doesNotMatch(line, /firebase/i, `${line} - the read logic must stay testable without the SDK`);
    assert.doesNotMatch(line, /config\/env/, `${line} - import.meta.env would break node --test`);
  }
  const code = codeOf('src', 'lib', 'caregiverData.js');
  assert.doesNotMatch(code, /import\.meta/);
  // Whatever it does read has to come through the injected remote or the store.
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest/);
});

test('the remote read is constrained on the server, with no orderBy to need an index', () => {
  const src = readFileSync(join(ROOT, 'src', 'lib', 'remote.js'), 'utf8');
  assert.match(src, /where\(\s*'pairingCode'\s*,\s*'=='\s*,\s*pairingCode\s*\)/);
  assert.match(src, /firestore\.limit\(/, 'a read is bounded');
  const code = codeOf('src', 'lib', 'remote.js');
  assert.doesNotMatch(code, /orderBy/, 'an equality filter plus an orderBy needs a composite index');
  // Read-only: the dashboard path must not gain a write.
  assert.doesNotMatch(code, /deleteDoc|updateDoc|addDoc/);
  assert.match(code, /getDocs\(/);
});

test('the dashboard is read-only and its remote is composed at the page, not inside the logic', () => {
  const page = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverDashboard.jsx'), 'utf8');
  assert.match(page, /createFirestoreRemote\(\)/);
  assert.doesNotMatch(page, /saveSession|logReminderEvent|logAnswer|markSynced|clearHistory/);
  assert.doesNotMatch(page, /setSetting/, 'the dashboard itself stores nothing');
  assert.match(page, /loadCaregiverData/);
});

test('the published security rules are untouched by this step', () => {
  const rules = readFileSync(join(ROOT, 'firestore.rules'), 'utf8');
  // Exactly the model step 10 published: authenticated create only, never
  // update or delete, and no unauthenticated access of any kind.
  assert.equal((rules.match(/allow create/g) || []).length, 2);
  assert.equal((rules.match(/allow update, delete: if false/g) || []).length, 3);
  assert.doesNotMatch(rules, /if true/);
  for (const match of rules.match(/allow create[^;]*/g) || []) {
    assert.match(match, /request\.auth != null/, `a create without auth: ${match}`);
  }
  /* The caregiver read has to be allowed by a rule, and that rule must still
   * require a signed-in device - anonymous auth, exactly as before. */
  for (const match of rules.match(/allow (read|get|list)[^;]*/g) || []) {
    assert.match(match, /request\.auth != null/, `an unauthenticated read: ${match}`);
  }
});

test('the pairing screen asks for nothing but a code', () => {
  const page = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverPairing.jsx'), 'utf8');
  const inputs = page.match(/<input[\s\S]*?\/>/g) || [];
  assert.equal(inputs.length, 1, 'one field, and it is the code');
  assert.doesNotMatch(page, /type="password"|type="email"|autoComplete="username"/);
  assert.doesNotMatch(page, /\b(name|address|diagnosis|medication|doctor)\b\s*:/i);
  assert.match(page, /Back to patient home/, 'there is always a way back to the patient side');
});

test('every stored pairing code is a real pairing code by the privacy module rule', async () => {
  const store = freshStore();
  await saveCode(store, PATIENT);
  const stored = await store.getSetting(CAREGIVER_CODE_KEY, null);
  assert.ok(isPairingCode(stored));
  assert.equal(stored.length, PAIRING_CODE_LENGTH);
  // And it is the only caregiver-written setting, so nothing else can be stored
  // under a name the privacy guard would have to police.
  assert.equal(SYNCED.pending, 0, 'sanity: store enums unchanged by this step');
});
