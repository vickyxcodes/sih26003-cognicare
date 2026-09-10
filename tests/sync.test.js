import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SETTINGS,
  SYNC_STATE,
  SYNCED_STORES,
  backoffMs,
  createSyncManager,
  ensureIdentity,
  isDeviceId,
  makeDeviceId,
  planSync,
  remoteDocId,
  remotePayload,
} from '../src/lib/sync.js';
import { STORES, SYNCED, createRecordStore } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { FORBIDDEN_FIELDS, isPairingCode } from '../src/lib/privacy.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

const SESSION = {
  domain: 'memory_recall',
  score: 75,
  difficultyTierEnd: 2,
  asked: 8,
  correct: 6,
  durationMs: 132000,
  endReason: 'complete',
};
const REMINDER = { type: 'medicine', status: 'dismissed' };

/**
 * A stand-in for Firestore that behaves like the published security rules and
 * like the real SDK's failure modes:
 *
 *   online   the write lands and is acknowledged
 *   offline  nothing reaches the server ('unavailable'), reads fail too
 *   fail     the server refuses and stores nothing
 *   hang     the write LANDS but nothing answers afterwards - not the
 *            acknowledgement and not a read either. The uncertain result that a
 *            naive retry turns into a duplicate.
 *   ackLost  the write LANDS, the acknowledgement is lost, but the server can
 *            still be read - so the same run can confirm it
 *
 * Writing twice to the same document id always fails with 'permission-denied',
 * because `firestore.rules` allows create and forbids update. That is the
 * property the whole duplicate-safety design leans on, so the fake enforces it.
 */
function createFakeRemote({ configured = true, mode = 'online' } = {}) {
  const docs = new Map();
  const writes = [];
  const reads = [];
  const state = { mode };
  const fail = (code) => {
    const error = new Error(code);
    error.code = code;
    return error;
  };
  return {
    docs,
    writes,
    reads,
    state,
    isConfigured: () => configured,
    async put({ collection, docId, payload }) {
      writes.push({ collection, docId, payload, mode: state.mode });
      if (state.mode === 'offline' || state.mode === 'fail') throw fail('unavailable');
      if (state.mode === 'denied') throw fail('permission-denied'); // rules said no
      const key = `${collection}/${docId}`;
      if (docs.has(key)) throw fail('permission-denied'); // create-only rules
      docs.set(key, payload);
      if (state.mode === 'hang' || state.mode === 'ackLost') await new Promise(() => {});
    },
    async exists({ collection, docId }) {
      reads.push(`${collection}/${docId}`);
      if (state.mode === 'offline' || state.mode === 'hang') throw fail('unavailable');
      return docs.has(`${collection}/${docId}`);
    },
  };
}

function setup({ configured = true, mode = 'online', online = true, ...overrides } = {}) {
  const store = createRecordStore(createMemoryDriver());
  const remote = createFakeRemote({ configured, mode });
  const clock = { online, now: 1758000000000 };
  const manager = createSyncManager({
    store,
    remote,
    online: () => clock.online,
    now: () => clock.now,
    rand: () => 0.42,
    timeoutMs: 20,
    log: () => {},
    ...overrides,
  });
  return {
    store,
    remote,
    manager,
    clock,
    goOffline() {
      clock.online = false;
      remote.state.mode = 'offline';
    },
    goOnline() {
      clock.online = true;
      remote.state.mode = 'online';
    },
  };
}

const pendingCount = async (store) => {
  const { sessions, reminderEvents } = await store.pendingSync();
  return sessions.length + reminderEvents.length;
};

test('a document id is derived from the row, so it is the same every retry', () => {
  const device = makeDeviceId(() => 0.42);
  assert.ok(isDeviceId(device));
  const first = remoteDocId(STORES.sessions, device, 7);
  assert.equal(first, remoteDocId(STORES.sessions, device, 7), 'not stable across calls');
  assert.notEqual(first, remoteDocId(STORES.sessions, device, 8), 'two rows share an id');
  assert.notEqual(
    first,
    remoteDocId(STORES.reminderEvents, device, 7),
    'a session and a reminder event share an id'
  );
  assert.notEqual(
    first,
    remoteDocId(STORES.sessions, makeDeviceId(() => 0.9), 7),
    'two devices would overwrite each other'
  );
  // Firestore refuses '/', '.' and '..' as document ids and reserves __x__.
  assert.ok(!first.includes('/'), 'a document id must not contain a slash');
  assert.doesNotMatch(first, /^\.\.?$|^__.*__$/);
  assert.throws(() => remoteDocId('answers', device, 1), /not a synced store/);
  assert.throws(() => remoteDocId(STORES.sessions, 'short', 1), /device id/);
  assert.throws(() => remoteDocId(STORES.sessions, device, 0), /positive integer/);
});

test('the pairing code and device id are minted once and then never change', async () => {
  const store = createRecordStore(createMemoryDriver());
  const first = await ensureIdentity(store, { rand: () => 0.42 });
  assert.ok(isPairingCode(first.pairingCode));
  assert.ok(isDeviceId(first.deviceId));
  // A different random source: the stored values must still win.
  const second = await ensureIdentity(store, { rand: () => 0.9 });
  assert.deepEqual(second, first, 'a second call re-issued the identity');
  assert.equal(await store.getSetting(SETTINGS.pairingCode), first.pairingCode);
  assert.equal(await store.getSetting(SETTINGS.deviceId), first.deviceId);
});

test('only the agreed fields leave the device, always tagged with the pairing code', () => {
  const session = remotePayload(STORES.sessions, { ...SESSION, id: 3, timestamp: 10, synced: 0 }, 'PPPPPP');
  assert.deepEqual(Object.keys(session).sort(), [
    'difficultyTierEnd', 'domain', 'pairingCode', 'score', 'timestamp',
  ]);
  // The per-answer detail and the raw counts stay local by design.
  for (const field of ['asked', 'correct', 'durationMs', 'endReason', 'id', 'synced']) {
    assert.equal(session[field], undefined, `${field} must not be sent`);
  }
  const reminder = remotePayload(STORES.reminderEvents, { ...REMINDER, id: 1, timestamp: 20 }, 'PPPPPP');
  assert.deepEqual(Object.keys(reminder).sort(), ['pairingCode', 'status', 'timestamp', 'type']);
  assert.throws(() => remotePayload(STORES.sessions, SESSION, 'nope'), /pairing code/);
  assert.throws(() => remotePayload('answers', {}, 'PPPPPP'), /not a synced store/);
});

test('the queue is sent oldest first, so a partial flush leaves no holes', async () => {
  const { store, remote, manager } = setup();
  await store.saveSession({ ...SESSION, timestamp: 300 });
  await store.saveSession({ ...SESSION, timestamp: 100 });
  await store.logReminderEvent({ ...REMINDER, timestamp: 200 });
  const jobs = planSync(await store.pendingSync(), { pairingCode: 'PPPPPP', deviceId: makeDeviceId(() => 0.42) });
  assert.deepEqual(jobs.map((j) => j.timestamp), [100, 200, 300]);
  await manager.flush();
  assert.deepEqual(remote.writes.map((w) => w.payload.timestamp), [100, 200, 300]);
  manager.stop();
});

test('backoff grows and is capped', () => {
  assert.equal(backoffMs(1), 5000);
  assert.equal(backoffMs(2), 10000);
  assert.equal(backoffMs(3), 20000);
  assert.equal(backoffMs(99), 300000);
  assert.equal(backoffMs(0), 5000, 'a first attempt must still wait');
});

test('local-only mode queues everything and never touches the network', async () => {
  const { store, remote, manager } = setup({ configured: false });
  await store.saveSession(SESSION);
  await store.logReminderEvent(REMINDER);
  const run = await manager.flush();
  assert.equal(run.state, SYNC_STATE.localOnly);
  assert.equal(remote.writes.length, 0, 'a device with no .env must not call Firestore');
  assert.equal(await pendingCount(store), 2, 'rows must stay queued, not be dropped');
  assert.equal(await store.getSetting(SETTINGS.lastSyncAt), null);
  manager.stop();
});

test('per-answer detail is never queued for Firestore', async () => {
  const { store, remote, manager } = setup();
  for (const questionId of ['mr-1', 'mr-2', 'mr-3']) {
    await store.logAnswer({ domain: 'memory_recall', questionId, correct: true, difficultyTierEnd: 1 });
  }
  await store.saveSession(SESSION);
  await manager.flush();
  assert.equal((await store.answers()).length, 3, 'answers must still be on the device');
  assert.deepEqual(Object.keys(await store.pendingSync()).sort(), ['reminderEvents', 'sessions']);
  assert.equal(remote.writes.length, 1, 'only the session summary should have been sent');
  for (const key of remote.docs.keys()) assert.doesNotMatch(key, /^answers\//);
  for (const write of remote.writes) {
    assert.equal(write.payload.questionId, undefined);
    for (const field of Object.keys(write.payload)) {
      assert.ok(!FORBIDDEN_FIELDS.includes(field.toLowerCase()), `${field} must never be sent`);
    }
  }
  manager.stop();
});

test('online, then offline, then reconnected: the whole sequence end to end', async () => {
  const kit = setup();
  const { store, remote, manager } = kit;

  // 1. a record made while online
  const first = await store.saveSession({ ...SESSION, timestamp: 1000 });

  // 2. it is in local storage immediately, and honestly marked unsent
  assert.ok(first.id, 'the row exists the moment the session ends');
  assert.equal(first.synced, SYNCED.pending);
  assert.equal(await pendingCount(store), 1);

  const firstRun = await manager.flush();
  assert.equal(firstRun.state, SYNC_STATE.synced);
  assert.equal(remote.docs.size, 1);
  assert.equal((await store.sessions())[0].synced, SYNCED.done, 'marked only after the ack');

  // 3. the network goes away
  kit.goOffline();
  const writesBefore = remote.writes.length;

  // 4. more records, made offline - the patient side does not stop
  await store.logAnswer({ domain: 'routine_matching', questionId: 'rm-4', correct: true, difficultyTierEnd: 2 });
  await store.saveSession({ ...SESSION, domain: 'routine_matching', score: 62, timestamp: 2000 });
  await store.saveSession({ ...SESSION, score: 88, timestamp: 3000 });
  await store.logReminderEvent({ ...REMINDER, timestamp: 2500 });
  await store.logReminderEvent({ type: 'hydration', status: 'missed', timestamp: 2600 });
  assert.equal(await pendingCount(store), 4);
  assert.equal((await store.sessions()).length, 3, 'history is readable offline');
  assert.equal((await store.answers()).length, 1);

  // 5. they stay queued, and nothing is falsely marked synced
  const offlineRun = await manager.flush();
  assert.equal(offlineRun.state, SYNC_STATE.offline);
  assert.equal(remote.writes.length, writesBefore, 'no pointless attempt while offline');
  assert.equal(remote.docs.size, 1);
  assert.equal(await pendingCount(store), 4, 'the queue survived the offline flush');

  // 6. connectivity returns
  kit.goOnline();

  // 7. the queue is flushed
  const backRun = await manager.flush();
  assert.equal(backRun.state, SYNC_STATE.synced);
  assert.equal(backRun.sent, 4);
  assert.equal(remote.docs.size, 5, 'every queued record reached Firestore exactly once');

  // 8. synced state follows the successful writes, not the attempt
  assert.equal(await pendingCount(store), 0);
  for (const row of [...(await store.sessions()), ...(await store.reminderEvents())]) {
    assert.equal(row.synced, SYNCED.done);
  }
  assert.equal(await store.getSetting(SETTINGS.lastSyncAt), kit.clock.now);

  // 9. syncing again, repeatedly, creates nothing new
  const settled = remote.writes.length;
  await manager.flush();
  await manager.flush();
  await manager.flush();
  assert.equal(remote.docs.size, 5, 'a repeated sync duplicated records');
  assert.equal(remote.writes.length, settled, 'a synced row was offered to Firestore twice');

  // 10. and the patient side is untouched by any of it
  const afterwards = await store.saveSession({ ...SESSION, timestamp: 4000 });
  assert.equal(afterwards.synced, SYNCED.pending);
  assert.equal((await store.sessions()).length, 4);
  manager.stop();
});

test('a write that lands but is never acknowledged does not become two records', async () => {
  const kit = setup({ mode: 'hang' });
  const { store, remote, manager } = kit;
  await store.saveSession({ ...SESSION, timestamp: 1000 });

  // The write reaches the server; the acknowledgement does not come back.
  const run = await manager.flush();
  assert.equal(run.state, SYNC_STATE.retrying, 'an unacknowledged write must not count as sent');
  assert.equal(remote.docs.size, 1, 'the server did take it');
  assert.equal(await pendingCount(store), 1, 'but the row stays queued, because we cannot know');

  // The retry addresses the same document id: the create-only rules refuse it,
  // and one server read proves the record is already there.
  kit.goOnline();
  const retry = await manager.flush();
  assert.equal(retry.state, SYNC_STATE.synced);
  assert.equal(remote.writes.length, 2, 'the retry should have been attempted');
  assert.equal(remote.writes[0].docId, remote.writes[1].docId, 'a retry must reuse the id');
  assert.equal(remote.docs.size, 1, 'the retry created a duplicate record');
  assert.equal(await pendingCount(store), 0);
  assert.equal(remote.reads.length, 2, 'each uncertain result must be checked against the server');
  manager.stop();
});

test('an uncertain write the server can confirm is settled in the same run', async () => {
  const { store, remote, manager } = setup({ mode: 'ackLost' });
  await store.saveSession({ ...SESSION, timestamp: 1000 });

  const run = await manager.flush();
  assert.equal(run.state, SYNC_STATE.synced, 'a confirmed write should not need a retry');
  assert.equal(remote.writes.length, 1);
  assert.equal(remote.reads.length, 1, 'the server must be asked, not assumed');
  assert.equal(remote.docs.size, 1);
  assert.equal(await pendingCount(store), 0);
  manager.stop();
});

test('a reload cannot duplicate a record: a new manager reuses the same identity', async () => {
  const store = createRecordStore(createMemoryDriver());
  const remote = createFakeRemote({ mode: 'hang' });
  const build = (online) =>
    createSyncManager({ store, remote, online: () => online, rand: () => 0.42, timeoutMs: 20, log: () => {} });

  await store.saveSession({ ...SESSION, timestamp: 1000 });
  const before = build(true);
  await before.flush(); // lands, ack lost
  before.stop();

  // A reload: fresh manager, fresh in-memory state, same IndexedDB.
  remote.state.mode = 'online';
  const after = build(true);
  await after.flush();
  after.stop();

  assert.equal(remote.docs.size, 1, 'the record was written twice across a reload');
  assert.equal([...remote.docs.keys()][0], `sessions/${remote.writes[0].docId}`);
  assert.equal(await pendingCount(store), 0, 'the row should be settled after the reload');
});

test('a Firestore failure leaves the local record alone, and a retry recovers it', async () => {
  const kit = setup({ mode: 'fail' });
  const { store, remote, manager } = kit;
  await store.saveSession({ ...SESSION, timestamp: 1000 });
  await store.logReminderEvent({ ...REMINDER, timestamp: 1100 });

  const failed = await manager.flush();
  assert.equal(failed.state, SYNC_STATE.retrying);
  assert.equal(failed.sent, 0);
  assert.equal(remote.docs.size, 0);
  assert.equal((await store.sessions()).length, 1, 'a failed sync must never delete a record');
  assert.equal((await store.reminderEvents()).length, 1);
  assert.equal(await pendingCount(store), 2, 'both rows must still be queued');
  assert.equal(await store.getSetting(SETTINGS.lastSyncAt), null, 'nothing was synced');

  kit.goOnline();
  const recovered = await manager.flush();
  assert.equal(recovered.state, SYNC_STATE.synced);
  assert.equal(recovered.sent, 2);
  assert.equal(remote.docs.size, 2);
  assert.equal(await pendingCount(store), 0);
  manager.stop();
});

test('a row is never marked synced while nothing can confirm it', async () => {
  const { store, manager, remote } = setup({ mode: 'hang' });
  await store.saveSession({ ...SESSION, timestamp: 1000 });
  for (let i = 0; i < 3; i += 1) await manager.flush();
  assert.equal(await pendingCount(store), 1, 'an unconfirmable write must stay queued');
  assert.equal((await store.sessions())[0].synced, SYNCED.pending);
  assert.equal(remote.docs.size, 1, 'and it must not be written again');
  manager.stop();
});

test('rules that refuse a write keep the row queued rather than losing it', async () => {
  const { store, remote, manager } = setup({ mode: 'denied' });
  await store.saveSession({ ...SESSION, timestamp: 1000 });

  const run = await manager.flush();
  assert.equal(run.state, SYNC_STATE.blocked, 'a refused write must be reported, not hidden');
  assert.equal(remote.docs.size, 0);
  assert.equal(await pendingCount(store), 1);
  await manager.flush();
  assert.equal(await pendingCount(store), 1, 'still queued, still not synced');
  assert.equal((await store.sessions()).length, 1, 'and still on the device');
  manager.stop();
});

test('one broken row cannot stall the rest of the queue for ever', async () => {
  const { store, remote, manager } = setup({ mode: 'fail', maxFailuresPerRun: 2 });
  for (const timestamp of [1000, 2000, 3000, 4000]) {
    await store.saveSession({ ...SESSION, timestamp });
  }
  await manager.flush();
  assert.equal(remote.writes.length, 2, 'the run should stop after the failure budget');
  assert.equal(await pendingCount(store), 4);
  manager.stop();
});

test('the patient side keeps recording normally while sync is impossible', async () => {
  const { store, remote, manager } = setup({ mode: 'offline', online: false });
  manager.start();

  // A whole visit's worth of writes, with the network down the entire time.
  for (const [i, correct] of [true, false, true, true].entries()) {
    await store.logAnswer({
      domain: 'routine_matching',
      questionId: `rm-${i}`,
      correct,
      difficultyTierEnd: 2,
    });
  }
  await store.saveSession({ ...SESSION, domain: 'routine_matching', score: 75, timestamp: 5000 });
  await store.logReminderEvent({ type: 'hydration', status: 'missed', timestamp: 5100 });
  await store.logReminderEvent({ type: 'medicine', status: 'dismissed', timestamp: 5200 });

  assert.equal((await store.answers()).length, 4, 'every tap must still be logged offline');
  assert.equal((await store.sessions()).length, 1);
  assert.equal((await store.reminderEvents()).length, 2);
  assert.equal(await pendingCount(store), 3, 'and be waiting, honestly unsent');
  assert.equal(remote.docs.size, 0);
  manager.stop();
});

test('the loop runs on start-up, on reconnect and when a row is queued, and stops', async () => {
  const store = createRecordStore(createMemoryDriver());
  const remote = createFakeRemote();
  const listeners = { online: null, queue: null };
  let onlineNow = false;
  const manager = createSyncManager({
    store,
    remote,
    online: () => onlineNow,
    rand: () => 0.42,
    log: () => {},
    timeoutMs: 20,
    startupDelayMs: 2,
    sweepMs: 5,
    watchOnline: (fn) => {
      listeners.online = fn;
      return () => { listeners.online = null; };
    },
    watchQueue: (fn) => {
      listeners.queue = fn;
      return () => { listeners.queue = null; };
    },
  });

  manager.start();
  assert.equal(typeof listeners.online, 'function', 'nothing is listening for a reconnect');
  await sleep(20);
  assert.ok(manager.status().runs >= 1, 'the loop never ran on its own');
  assert.equal(manager.status().state, SYNC_STATE.offline);

  // Reconnect: the event alone must be enough to drain the queue.
  await store.saveSession({ ...SESSION, timestamp: 1000 });
  onlineNow = true;
  listeners.online();
  await sleep(20);
  assert.equal(remote.docs.size, 1, 'coming back online did not flush the queue');

  // A row written mid-session must not wait for the next sweep.
  const row = await store.saveSession({ ...SESSION, timestamp: 2000 });
  listeners.queue(row);
  await sleep(20);
  assert.equal(remote.docs.size, 2, 'a freshly queued row did not trigger a sync');

  manager.stop();
  assert.equal(listeners.online, null, 'the reconnect listener was left attached');
  assert.equal(listeners.queue, null);
  const runs = manager.status().runs;
  await store.saveSession({ ...SESSION, timestamp: 3000 });
  await sleep(20);
  assert.equal(manager.status().runs, runs, 'the sweep kept running after stop()');
  assert.equal(remote.docs.size, 2);
});

test('the Firestore adapter creates one document at a known id, signed in first', () => {
  const remote = read('src', 'lib', 'remote.js');
  assert.match(remote, /setDoc\(/, 'a derived document id is the whole idempotency story');
  assert.doesNotMatch(remote, /addDoc\(/, 'addDoc would mint a new id on every retry');
  assert.doesNotMatch(remote, /merge:\s*true/, 'a merge is an update, which the rules forbid');
  assert.match(remote, /ensureAnonymousAuth\(\)/, 'a write must never be unauthenticated');
  assert.ok(
    remote.indexOf('ensureAnonymousAuth') < remote.indexOf('setDoc('),
    'sign-in has to happen before the write'
  );
  assert.match(remote, /getDocFromServer\(/, 'the local cache cannot confirm a write');
  assert.doesNotMatch(remote, /patients/, 'pairing is step 11, not this step');
});

test('the sync layer is wired into the app, and the game knows nothing about it', () => {
  const main = read('src', 'main.jsx');
  assert.match(main, /createSyncManager\(/);
  assert.match(main, /createFirestoreRemote\(/);
  assert.match(main, /watchQueue:\s*onQueued/, 'a finished session must nudge the sync');
  assert.match(main, /\.start\(\)/);

  const db = read('src', 'lib', 'db.js');
  assert.match(db, /export function onQueued/);
  assert.match(db, /saveSession[\s\S]{0,60}announceQueued/, 'a session must announce itself');
  assert.match(db, /logReminderEvent[\s\S]{0,60}announceQueued/);
  assert.doesNotMatch(db, /logAnswer[^\n]*announceQueued/, 'answers are local only');

  // sync.js is pure logic over an injected remote. Its import list is the proof:
  // the SDK would drag in a browser, and `config/env.js` reads `import.meta.env`,
  // which does not exist in Node - either one would make these tests impossible.
  const sync = read('src', 'lib', 'sync.js');
  const syncImports = [...sync.matchAll(/from\s+'([^']+)'|import\(\s*'([^']+)'/g)].map((m) => m[1] || m[2]);
  assert.deepEqual(
    syncImports.sort(),
    ['./privacy.js', './store.js'],
    'sync.js must import nothing but local pure modules'
  );

  for (const file of [
    ['src', 'pages', 'Play.jsx'],
    ['src', 'components', 'ReminderOverlay.jsx'],
    ['src', 'lib', 'sessionEngine.js'],
    ['src', 'lib', 'reminderEngine.js'],
  ]) {
    const specs = [...read(...file).matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    for (const spec of specs) {
      assert.doesNotMatch(spec, /sync|remote|firebase/, `${file.join('/')} imports the network`);
    }
  }
});

test('the security rules still allow nothing but authenticated creates', () => {
  const rules = read('firestore.rules');
  for (const collection of SYNCED_STORES) {
    assert.ok(rules.includes(`match /${collection}/`), `${collection} is not in the rules`);
  }
  const creates = [...rules.matchAll(/allow create:\s*if\s+([^;]+);/g)].map((m) => m[1].replace(/\s+/g, ' '));
  assert.equal(creates.length, SYNCED_STORES.length + 1, 'the two synced stores and caregiver link must be protected');
  for (const condition of creates) {
    assert.match(condition, /request\.auth != null/, 'an unauthenticated write would be allowed');
    assert.match(condition, /request\.resource\.data\.pairingCode is string/);
  }
  assert.equal((rules.match(/allow update, delete: if false/g) || []).length, 3);
  assert.doesNotMatch(rules, /allow[a-z, ]*:\s*if\s+true/, 'no rule may be left open');
});
