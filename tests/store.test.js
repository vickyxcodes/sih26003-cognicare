import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRecordStore, DOMAINS, STORES, SYNCED } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { assertSafeRecord, isPairingCode, makePairingCode } from '../src/lib/privacy.js';
import { MEMORY_RECALL } from '../src/data/memoryRecall.js';
import { ROUTINE_MATCHING } from '../src/data/routineMatching.js';
import {
  answerQuestion,
  continueSession,
  revealOptions,
  sessionSummary,
  startSession,
  PHASE,
} from '../src/lib/sessionEngine.js';

/**
 * The storage layer is pure logic over an injected driver, so these tests
 * exercise the real code the app runs - the same `createRecordStore` - with an
 * in-memory driver instead of IndexedDB.
 */
const freshStore = () => {
  const driver = createMemoryDriver();
  return { driver, store: createRecordStore(driver, { now: () => 1_700_000_000_000 }) };
};

const answer = (over = {}) => ({
  domain: 'memory_recall',
  questionId: 'mr-1',
  correct: true,
  difficultyTierEnd: 1,
  timestamp: 1_700_000_000_000,
  ...over,
});

test('an answer is stored immediately, with exactly the fields the spec lists', async () => {
  const { store } = freshStore();
  const saved = await store.logAnswer(answer());
  assert.ok(saved.id, 'a stored answer gets an id');
  assert.deepEqual(
    Object.keys(saved).sort(),
    ['correct', 'difficultyTierEnd', 'domain', 'id', 'questionId', 'timestamp'].sort()
  );
  const all = await store.answers();
  assert.equal(all.length, 1, 'the write happened on the call, not on some later flush');
});

test('answers accumulate one row per tap and are never batched or overwritten', async () => {
  const { store } = freshStore();
  for (let i = 0; i < 5; i += 1) {
    await store.logAnswer(answer({ questionId: `mr-${i + 1}`, correct: i % 2 === 0, timestamp: 1000 + i }));
  }
  const rows = await store.answers();
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((r) => r.questionId), ['mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5']);
  assert.deepEqual(rows.map((r) => r.correct), [true, false, true, false, true]);
});

test('bad records are refused rather than silently stored', async () => {
  const { store } = freshStore();
  await assert.rejects(() => store.logAnswer(answer({ domain: 'memoryrecall' })), /domain must be one of/);
  await assert.rejects(() => store.logAnswer(answer({ difficultyTierEnd: 4 })), /difficultyTierEnd/);
  await assert.rejects(() => store.saveSession({ domain: 'memory_recall', score: 140, difficultyTierEnd: 1 }), /percent/);
  await assert.rejects(
    () => store.logReminderEvent({ type: 'water', status: 'dismissed' }),
    /type must be one of/
  );
  await assert.rejects(
    () => store.logReminderEvent({ type: 'hydration', status: 'ignored' }),
    /status must be one of/
  );
});

test('the domains stored are exactly the ones the Firestore schema allows', () => {
  assert.deepEqual(DOMAINS, [
    'memory_recall',
    'routine_matching',
    'word_recall',
    'number_sequence',
    'pattern_matching',
    'about_me',
  ]);
});

test('a patient profile and unfinished draft stay local to the fixed profile keys', async () => {
  const { store } = freshStore();
  const profile = { name: 'Rina', age: '70', city: 'Guwahati', emergencyContactPhone: '98765 43210' };
  await store.savePatientProfileDraft(profile);
  assert.equal((await store.getPatientProfileDraft()).name, 'Rina');
  await store.savePatientProfile(profile);
  assert.equal((await store.getPatientProfile()).emergencyContactPhone, '98765 43210');
  await store.clearPatientProfileDraft();
  assert.equal(await store.getPatientProfileDraft(), null);
});

test('personal and medical fields cannot be written, even by accident', async () => {
  const { store } = freshStore();

  // Layer 1: records are built from a fixed field list, so anything extra is
  // dropped on the way in rather than reaching storage.
  const savedAnswer = await store.logAnswer({ ...answer(), patientName: 'R. Sharma' });
  assert.equal(savedAnswer.patientName, undefined);
  const savedSession = await store.saveSession({
    domain: 'memory_recall',
    score: 50,
    difficultyTierEnd: 1,
    timestamp: 1,
    diagnosis: 'early alzheimers',
    notes: 'forgot her daughter today',
  });
  assert.deepEqual(
    Object.keys(savedSession).filter((k) => k === 'diagnosis' || k === 'notes'),
    []
  );

  // Layer 2: the guard itself, which also covers caller-named keys (settings)
  // and the payloads the sync layer will build in step 10.
  await assert.rejects(() => store.setSetting('diagnosis', 'x'), /personal or medical data/);
  assert.throws(() => assertSafeRecord({ address: '12 Nehru Road' }), /must not be stored/);
  assert.throws(() => assertSafeRecord({ patient_name: 'R' }), /must not be stored/);
  assert.throws(() => assertSafeRecord({ nested: { doctor: 'x' } }), /record\.nested: field "doctor"/);
  assert.throws(() => assertSafeRecord({ freeText: 'x'.repeat(200) }), /too long/);
  assert.doesNotThrow(() => assertSafeRecord(answer()));
});

test('a finished session is stored as a syncable row the chart can plot', async () => {
  const { store } = freshStore();
  const saved = await store.saveSession({
    domain: 'memory_recall',
    score: 75,
    difficultyTierEnd: 2,
    asked: 4,
    correct: 3,
    durationMs: 90_000,
    endReason: 'complete',
    timestamp: 1_700_000_000_000,
  });
  assert.equal(saved.score, 75);
  assert.equal(saved.synced, SYNCED.pending, 'new rows start unsynced so step 10 can find them');
  const pending = await store.pendingSync();
  assert.equal(pending.sessions.length, 1);
  assert.equal(pending.reminderEvents.length, 0);
});

test('what a real played session logs matches what was actually played', async () => {
  const { store } = freshStore();
  // A seeded random source makes the picked questions identical on every run.
  let seed = 42;
  const seeded = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  let state = startSession({ bank: MEMORY_RECALL, now: 0, rand: seeded, maxQuestions: 4 });
  let asked = 0;
  let clock = 0;
  while (state.phase !== PHASE.DONE) {
    if (state.phase === PHASE.STUDY) {
      state = revealOptions(state);
    } else if (state.phase === PHASE.ASK) {
      asked += 1;
      clock += 1000;
      const wrong = state.question.options.find((o) => o.id !== state.question.answerId);
      const step = answerQuestion(state, asked === 3 ? wrong.id : state.question.answerId, clock);
      await store.logAnswer(step.record);
      state = step.state;
    } else {
      state = continueSession(state, { bank: MEMORY_RECALL, now: clock, rand: seeded });
    }
  }
  await store.saveSession(sessionSummary(state, clock));

  const answers = await store.answers();
  assert.equal(answers.length, 4, 'one row per tap');
  assert.equal(answers.filter((a) => a.correct).length, 3);
  const [session] = await store.sessions();
  assert.equal(session.asked, 4);
  assert.equal(session.correct, 3);
  assert.equal(session.score, 75, 'the stored score is the percent the caregiver sees');
  assert.equal(
    answers.filter((a) => a.correct).length,
    session.correct,
    'answer rows and the session row cannot disagree'
  );
});

/**
 * The same play-and-log walk in domain 2. The store validates the domain against
 * a fixed enum, so this test is what proves a routine answer is storable at all -
 * and that nothing about logging had to be special-cased for the second game.
 */
test('a played routine session logs the same way, under the same validation', async () => {
  const { store } = freshStore();
  let seed = 11;
  const seeded = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  let state = startSession({ bank: ROUTINE_MATCHING, now: 0, rand: seeded, maxQuestions: 6 });
  assert.equal(state.phase, PHASE.ASK, 'a routine question opens on the cue, not a study screen');
  let asked = 0;
  let clock = 0;
  while (state.phase !== PHASE.DONE) {
    if (state.phase === PHASE.ASK) {
      asked += 1;
      clock += 1000;
      const wrong = state.question.options.find((o) => o.id !== state.question.answerId);
      const step = answerQuestion(state, asked === 2 ? wrong.id : state.question.answerId, clock);
      await store.logAnswer(step.record);
      state = step.state;
    } else {
      state = continueSession(state, { bank: ROUTINE_MATCHING, now: clock, rand: seeded });
    }
  }
  await store.saveSession(sessionSummary(state, clock));

  const answers = await store.answers();
  assert.equal(answers.length, 6, 'one row per tap, in this domain too');
  assert.ok(answers.every((a) => a.domain === 'routine_matching'));
  assert.ok(answers.every((a) => /^rm-\d+$/.test(a.questionId)));
  assert.equal(answers.filter((a) => a.correct).length, 5);

  const [session] = await store.sessions();
  assert.equal(session.domain, 'routine_matching');
  assert.equal(session.correct, 5);
  assert.equal(session.score, 83, 'the percent the caregiver sees for this domain');
  assert.equal(session.synced, SYNCED.pending, 'domain 2 rows queue for step 10 like domain 1');
});

test('both domains land in one history the caregiver can separate', async () => {
  const { store } = freshStore();
  await store.logAnswer(answer({ timestamp: 1 }));
  await store.logAnswer(answer({ domain: 'routine_matching', questionId: 'rm-1', timestamp: 2 }));
  const rows = await store.answers();
  assert.deepEqual(rows.map((r) => r.domain), ['memory_recall', 'routine_matching']);
});

test('reminder events are stored with the two statuses the spec defines', async () => {
  const { store } = freshStore();
  await store.logReminderEvent({ type: 'medicine', status: 'dismissed', timestamp: 10 });
  await store.logReminderEvent({ type: 'hydration', status: 'missed', timestamp: 20 });
  const rows = await store.reminderEvents();
  assert.deepEqual(rows.map((r) => `${r.type}:${r.status}`), ['medicine:dismissed', 'hydration:missed']);
  assert.ok(rows.every((r) => r.synced === SYNCED.pending));
});

test('marking rows synced empties the queue and survives a missing row', async () => {
  const { store } = freshStore();
  const a = await store.saveSession({ domain: 'memory_recall', score: 60, difficultyTierEnd: 1, timestamp: 1 });
  const b = await store.saveSession({ domain: 'routine_matching', score: 80, difficultyTierEnd: 1, timestamp: 2 });
  const marked = await store.markSynced(STORES.sessions, [a.id, b.id, 9999]);
  assert.equal(marked, 2, 'an ack for a row that no longer exists is skipped, not thrown');
  const pending = await store.pendingSync();
  assert.equal(pending.sessions.length, 0);
});

test('history can be cleared for a demo reset without losing the pairing', async () => {
  const { store } = freshStore();
  await store.setSetting('pairingCode', 'K7M2QP');
  await store.logAnswer(answer());
  await store.saveSession({ domain: 'memory_recall', score: 50, difficultyTierEnd: 1, timestamp: 1 });
  await store.logReminderEvent({ type: 'appointment', status: 'missed', timestamp: 2 });

  await store.clearHistory();
  assert.equal((await store.answers()).length, 0);
  assert.equal((await store.sessions()).length, 0);
  assert.equal((await store.reminderEvents()).length, 0);
  assert.equal(await store.getSetting('pairingCode'), 'K7M2QP');
});

test('reads come back oldest-first and can be filtered by domain and date', async () => {
  const { store } = freshStore();
  await store.saveSession({ domain: 'memory_recall', score: 40, difficultyTierEnd: 1, timestamp: 300 });
  await store.saveSession({ domain: 'memory_recall', score: 90, difficultyTierEnd: 1, timestamp: 100 });
  await store.saveSession({ domain: 'routine_matching', score: 70, difficultyTierEnd: 1, timestamp: 200 });
  assert.deepEqual((await store.sessions()).map((s) => s.timestamp), [100, 200, 300]);
  assert.deepEqual((await store.sessions({ domain: 'memory_recall' })).map((s) => s.score), [90, 40]);
  assert.deepEqual((await store.sessions({ since: 200 })).map((s) => s.timestamp), [200, 300]);
  assert.deepEqual((await store.sessions({ limit: 1 })).map((s) => s.timestamp), [300]);
});

test('settings are a key/value store, not a growing pile of rows', async () => {
  const { driver, store } = freshStore();
  await store.setSetting('pairingCode', 'AAAAAA');
  await store.setSetting('pairingCode', 'BBBBBB');
  assert.equal(await store.getSetting('pairingCode'), 'BBBBBB');
  assert.equal((await driver.getAll(STORES.settings)).length, 1);
  assert.equal(await store.getSetting('nothingHere', 'fallback'), 'fallback');
});

test('pairing codes avoid characters an elderly reader could confuse', () => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 200; i += 1) {
    const code = makePairingCode(rand);
    assert.equal(code.length, 6);
    assert.ok(isPairingCode(code), `${code} should be a valid pairing code`);
    assert.ok(!/[O0I1]/.test(code), `${code} contains a confusable character`);
  }
  assert.ok(!isPairingCode('abc123'), 'lower case is not a code');
  assert.ok(!isPairingCode('K7M2Q'), 'a short code is not a code');
});

/* ---------------------------------------------------------------- wiring ---- */
/**
 * The rules above are unit-tested, but a store nothing calls logs nothing. With
 * no browser available these last checks read the source to prove the game
 * screen is actually wired to it, and that IndexedDB stays behind its adapter.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

test('the game screen writes every answer, and the session, through the store', () => {
  const play = read('src', 'pages', 'Play.jsx');
  assert.match(play, /import \{[^}]*recordAnswer[^}]*\} from '\.\.\/lib\/db\.js'/);
  assert.match(play, /recordAnswer\(record\)/, 'every answer must be written as it happens');
  assert.match(play, /recordSession\(sessionSummary\(session\)\)/);
  assert.ok(
    !/answers\.push|pending\.push|queue\.push/.test(play),
    'answers must not be collected in an array and written at the end'
  );
  assert.ok(
    !/await recordAnswer/.test(play),
    'the tap handler must not await storage - the next screen cannot wait on a disk write'
  );
});

test('IndexedDB is confined to one adapter file', () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.jsx?$/.test(entry)) files.push(full);
    }
  };
  walk(join(ROOT, 'src'));
  for (const file of files) {
    const rel = relative(ROOT, file);
    const src = readFileSync(file, 'utf8');
    if (/from 'idb'/.test(src) || /\bindexedDB\b/.test(src)) {
      assert.equal(rel, join('src', 'lib', 'idbDriver.js'), `${rel} should not touch IndexedDB directly`);
    }
  }
});
