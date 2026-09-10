import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { createRecordStore } from '../src/lib/store.js';
import {
  DEFAULT_REMEMBER_DELAY_MS,
  dueRememberThis,
  makeRememberThis,
} from '../src/lib/rememberThis.js';
import {
  dueManualReminders,
  makeManualReminder,
} from '../src/lib/manualReminder.js';

const NOW = 1_700_000_000_000;
const freshStore = () => {
  const driver = createMemoryDriver();
  return { driver, store: createRecordStore(driver, { now: () => NOW }) };
};

test('Remember This calculates the default two-hour delay and survives a read back', async () => {
  const { store } = freshStore();
  const saved = await store.saveRememberThis({ fact: 'Granddaughter visits on Sunday' });
  assert.equal(saved.delayMs, DEFAULT_REMEMBER_DELAY_MS);
  assert.equal(saved.dueAt, NOW + DEFAULT_REMEMBER_DELAY_MS);
  assert.equal((await store.rememberThis()).length, 1);
});

test('Remember This supports the ten-second demonstration delay and detects overdue records', async () => {
  const { store } = freshStore();
  await store.saveRememberThis({ fact: 'Call Sam', delayMs: 10 * 1000 });
  assert.equal((await store.refreshRememberThis())[0].status, 'pending');
  // The direct pure rule proves the closed-app case without depending on a timer.
  const item = makeRememberThis({ fact: 'Call Sam', delayMs: 10 * 1000, createdAt: NOW });
  assert.equal(dueRememberThis([item], NOW + 11 * 1000)[0].status, 'due');
});

test('a completed or dismissed memory never appears as due again, and multiple due memories remain distinct', async () => {
  const { store } = freshStore();
  const first = await store.saveRememberThis({ fact: 'First', delayMs: 10 * 1000 });
  const second = await store.saveRememberThis({ fact: 'Second', delayMs: 30 * 1000 });
  const refreshed = await store.refreshRememberThis();
  assert.deepEqual(refreshed.map((row) => row.status), ['pending', 'pending']);
  const firstDue = makeRememberThis({ fact: 'First', delayMs: 10 * 1000, createdAt: NOW });
  const secondDue = makeRememberThis({ fact: 'Second', delayMs: 30 * 1000, createdAt: NOW });
  assert.deepEqual(dueRememberThis([firstDue, secondDue], NOW + 31 * 1000).map((row) => row.fact), ['First', 'Second']);
  await store.completeRememberThis(first.id, { outcome: 'remembered', recallText: 'First', now: NOW + 31 * 1000 });
  await store.dismissRememberThis(second.id, NOW + 31 * 1000);
  assert.equal((await store.refreshRememberThis()).filter((row) => row.status === 'due').length, 0);
  const completed = (await store.rememberThis()).find((row) => row.id === first.id);
  assert.equal(completed.recallAttempted, true);
  assert.equal(completed.recallOutcome, 'remembered');
});

test('malformed delayed-recall rows are ignored safely', async () => {
  const { driver, store } = freshStore();
  await driver.put('rememberThis', { id: 1, fact: '', status: 'pending' });
  assert.deepEqual(await store.refreshRememberThis(), []);
});

test('manual reminders validate, persist, edit, complete and delete locally', async () => {
  const { store } = freshStore();
  await assert.rejects(() => store.saveManualReminder({ title: '', reminderAt: NOW + 1 }), /title/);
  const saved = await store.saveManualReminder({ title: 'Drink water', reminderAt: NOW + 10_000, type: 'hydration', note: 'One glass' });
  assert.equal((await store.manualReminders()).length, 1);
  await store.updateManualReminder(saved.id, { title: 'Drink more water', reminderAt: NOW + 20_000, type: 'hydration', note: '' });
  assert.equal((await store.manualReminders())[0].title, 'Drink more water');
  assert.equal((await store.dueManualReminders(NOW + 19_000)).length, 0);
  assert.equal((await store.dueManualReminders(NOW + 20_000)).length, 1);
  await store.completeManualReminder(saved.id, NOW + 20_000);
  assert.equal((await store.dueManualReminders(NOW + 30_000)).length, 0);
  await store.deleteManualReminder(saved.id);
  assert.equal((await store.manualReminders()).length, 0);
});

test('manual and system reminder records use separate local stores', async () => {
  const { store } = freshStore();
  await store.logReminderEvent({ type: 'medicine', status: 'dismissed', timestamp: NOW });
  await store.saveManualReminder({ title: 'Walk', reminderAt: NOW + 1_000, type: 'exercise' });
  assert.equal((await store.reminderEvents()).length, 1);
  assert.equal((await store.manualReminders()).length, 1);
  assert.equal((await store.pendingSync()).reminderEvents.length, 1);
});

test('manual due selection is ordered and ignores completed or malformed rows', () => {
  const rows = [
    makeManualReminder({ title: 'Later', reminderAt: NOW + 20, createdAt: NOW }),
    makeManualReminder({ title: 'Now', reminderAt: NOW - 20, createdAt: NOW }),
    { title: 'Broken', reminderAt: NOW - 30, status: 'scheduled', type: 'not-a-type' },
  ];
  rows[0].status = 'completed';
  assert.deepEqual(dueManualReminders(rows, NOW).map((row) => row.title), ['Now']);
});
