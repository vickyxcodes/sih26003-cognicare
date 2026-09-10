import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHECK_EVERY_MS,
  FIRE_WINDOW_MS,
  REPEAT_AFTER_MS,
  SLOT_SPAN_MS,
  STATUS,
  TIMEOUT_MS,
  dismissReminder,
  dueSlot,
  isResolved,
  reminderTick,
  showReminder,
  slotTime,
  slotsToday,
  startOfDay,
} from '../src/lib/reminderEngine.js';
import { REMINDER_SCHEDULE, REMINDER_WORDING, reminderWords } from '../src/data/reminders.js';
import { REMINDER_STATUSES, REMINDER_TYPES, SYNCED, createRecordStore } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

/**
 * Every instant in these tests is built with the same local `Date` the engine
 * uses, never a hard-coded epoch number, so the suite is correct in any timezone.
 * That is the point of the feature: a reminder means a wall-clock time in the
 * room the patient is sitting in, not an offset from UTC.
 */
const TUESDAY = [2026, 8, 8]; // 8 September 2026 is a Tuesday
const WEDNESDAY = [2026, 8, 9];
const at = (h, m = 0, day = TUESDAY) => new Date(day[0], day[1], day[2], h, m, 0, 0).getTime();

/** The drawings live in JSX, so read the ART keys out of the source. */
function drawnItemIds() {
  const src = read('src', 'components', 'Picture.jsx');
  const body = src.slice(src.indexOf('const ART = {'));
  return new Set([...body.matchAll(/^ {2}([a-z][a-zA-Z]*):\s*\(/gm)].map((m) => m[1]));
}

/* -------------------------------------------------------------- the schedule */

test('the bundled schedule only contains things the store can actually save', () => {
  const ids = new Set();
  for (const slot of REMINDER_SCHEDULE) {
    assert.ok(REMINDER_TYPES.includes(slot.type), `${slot.id} has a type the store would reject`);
    assert.match(slot.at, /^([01]\d|2[0-3]):[0-5]\d$/, `${slot.id} needs an HH:MM time`);
    assert.ok(!ids.has(slot.id), `${slot.id} is used twice`);
    ids.add(slot.id);
    if (slot.days) assert.ok(slot.days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6));
  }
  assert.deepEqual(
    [...new Set(REMINDER_SCHEDULE.map((s) => s.type))].sort(),
    [...REMINDER_TYPES].sort(),
    'all three reminder types the spec names are really scheduled'
  );
});

test('the two statuses the engine writes are exactly the two the store accepts', () => {
  assert.deepEqual(Object.values(STATUS).sort(), [...REMINDER_STATUSES].sort());
});

test('every reminder type has one plain sentence and one drawing that exists', () => {
  const drawn = drawnItemIds();
  for (const type of REMINDER_TYPES) {
    const words = REMINDER_WORDING[type];
    assert.ok(words, `${type} has no wording`);
    assert.ok(drawn.has(words.pictureId), `${type} points at a drawing that does not exist`);
    assert.match(words.line, /^[A-Z].*\.$/, 'a whole sentence, so it reads out as one');
    assert.ok(words.line.split(' ').length <= 12, `${type}: "${words.line}" is too long to take in`);
    assert.doesNotMatch(words.line, /diagnos|dementia|dose|\bmg\b/i, 'nothing clinical on a patient screen');
  }
  assert.equal(reminderWords({ type: 'nonsense' }), null, 'an unknown type shows nothing at all');
  assert.equal(reminderWords(null), null);
});

test('two reminders of the same type are far enough apart to be told apart', () => {
  const minutes = (slot) => Number(slot.at.slice(0, 2)) * 60 + Number(slot.at.slice(3));
  for (const type of REMINDER_TYPES) {
    const times = REMINDER_SCHEDULE.filter((s) => s.type === type).map(minutes).sort((a, b) => a - b);
    for (let i = 1; i < times.length; i += 1) {
      assert.ok(
        (times[i] - times[i - 1]) * 60_000 >= SLOT_SPAN_MS,
        `two ${type} slots are closer than one slot's lifetime, so an event could settle the wrong one`
      );
    }
  }
});

/* ------------------------------------------------- reading the clock and day */

test('a slot becomes a real instant in local wall-clock time', () => {
  const now = at(9, 30);
  assert.equal(slotTime({ at: '08:00' }, now), at(8));
  assert.equal(slotTime({ at: '20:05' }, now), at(20, 5));
  assert.equal(startOfDay(now), at(0), 'the day the overlay reads history from starts at midnight');
});

test('today means today: the schedule is read against the day now falls in', () => {
  const tuesday = slotsToday(REMINDER_SCHEDULE, at(12));
  const wednesday = slotsToday(REMINDER_SCHEDULE, at(12, 0, WEDNESDAY));
  assert.deepEqual(
    tuesday.map((s) => s.id),
    [
      'medicine-morning',
      'appointment-weekly',
      'hydration-late-morning',
      'medicine-afternoon',
      'hydration-afternoon',
      'hydration-evening',
      'medicine-night',
    ],
    'in time order, whatever order the data file happens to be in'
  );
  assert.ok(tuesday.some((s) => s.type === 'appointment'), 'the weekly appointment falls on this Tuesday');
  assert.ok(!wednesday.some((s) => s.type === 'appointment'), 'and not on the Wednesday');
  assert.equal(wednesday.length, tuesday.length - 1);
  assert.ok(tuesday.every((s) => s.dueAt >= at(0) && s.dueAt < at(0) + 86_400_000), 'all inside the one day');
});

/* --------------------------------------------------- when a reminder is shown */

const SCHEDULE = { schedule: REMINDER_SCHEDULE };

test('a reminder is due at its time and for half an hour after, never later', () => {
  const eight = at(8);
  assert.equal(dueSlot({ ...SCHEDULE, now: eight - 1, events: [] }), null, 'not a moment early');
  assert.equal(dueSlot({ ...SCHEDULE, now: eight, events: [] }).id, 'medicine-morning', 'on the minute');
  assert.equal(dueSlot({ ...SCHEDULE, now: eight + FIRE_WINDOW_MS - 1000, events: [] }).id, 'medicine-morning');
  assert.equal(
    dueSlot({ ...SCHEDULE, now: eight + FIRE_WINDOW_MS, events: [] }),
    null,
    'an hours-late medicine reminder would be worse than none'
  );
  assert.equal(dueSlot({ ...SCHEDULE, now: at(9, 30), events: [] }), null, 'the day never queues up behind itself');
});

test('a reminder already dealt with today is not announced a second time', () => {
  const eight = at(8);
  const dismissed = [{ type: 'medicine', status: STATUS.dismissed, timestamp: eight + 4000 }];
  assert.equal(dueSlot({ ...SCHEDULE, now: eight + 60_000, events: dismissed }), null);

  const missed = [{ type: 'medicine', status: STATUS.missed, timestamp: eight + TIMEOUT_MS }];
  assert.equal(
    dueSlot({ ...SCHEDULE, now: eight + 5 * 60_000, events: missed }),
    null,
    'a reminder that timed out is settled too - it is not shown again and again'
  );

  const otherType = [{ type: 'hydration', status: STATUS.dismissed, timestamp: eight + 4000 }];
  assert.equal(dueSlot({ ...SCHEDULE, now: eight + 60_000, events: otherType }).id, 'medicine-morning');

  const yesterday = [{ type: 'medicine', status: STATUS.dismissed, timestamp: eight - 86_400_000 }];
  assert.equal(dueSlot({ ...SCHEDULE, now: eight + 60_000, events: yesterday }).id, 'medicine-morning', 'each day is fresh');
});

test("this evening's medicine is not settled by this morning's", () => {
  const morning = [{ type: 'medicine', status: STATUS.dismissed, timestamp: at(8, 2) }];
  assert.equal(dueSlot({ ...SCHEDULE, now: at(20, 1), events: morning }).id, 'medicine-night');
});

test('when two reminders are ready at once the earlier one is shown first', () => {
  const schedule = [
    { id: 'later', type: 'hydration', at: '10:20' },
    { id: 'earlier', type: 'medicine', at: '10:00' },
  ];
  const now = at(10, 25);
  assert.equal(dueSlot({ schedule, now, events: [] }).id, 'earlier', 'never two cards at once');
  const done = [{ type: 'medicine', status: STATUS.dismissed, timestamp: now }];
  assert.equal(dueSlot({ schedule, now: now + 1000, events: done }).id, 'later', 'and the other follows straight after');
});

test('nothing is invented for the hours the app was closed', () => {
  assert.equal(
    dueSlot({ ...SCHEDULE, now: at(23), events: [] }),
    null,
    'opening the app at 23:00 must not pop up the whole day, nor log seven missed rows'
  );
  assert.deepEqual(dismissReminder(null, at(23)), { reminder: null, event: null });
  assert.deepEqual(reminderTick(null, at(23)), { reminder: null, event: null }, 'no card, no event, ever');
});

/* ------------------------------------------------- Done, the timeout, the repeat */

test('a Done tap ends the card and logs dismissed at the moment of the tap', () => {
  const slot = dueSlot({ ...SCHEDULE, now: at(8), events: [] });
  const shown = showReminder(slot, at(8));
  assert.deepEqual(shown, { slot, shownAt: at(8), repeated: false });

  const tapped = at(8) + 6000;
  const { reminder, event } = dismissReminder(shown, tapped);
  assert.equal(reminder, null, 'the card goes away on the one tap');
  assert.deepEqual(event, { type: 'medicine', status: 'dismissed', timestamp: tapped });
  assert.equal(dueSlot({ ...SCHEDULE, now: tapped + 1000, events: [event] }), null, 'and stays away');
});

test('an ignored reminder marks itself missed on the timeout, exactly once', () => {
  const shown = showReminder(dueSlot({ ...SCHEDULE, now: at(11), events: [] }), at(11));

  const early = reminderTick(shown, at(11) + TIMEOUT_MS - CHECK_EVERY_MS);
  assert.equal(early.event, null, 'a second before the deadline nothing is written');
  assert.ok(early.reminder, 'and the card is still on screen');

  const out = reminderTick(early.reminder, at(11) + TIMEOUT_MS);
  assert.deepEqual(out.event, { type: 'hydration', status: 'missed', timestamp: at(11) + TIMEOUT_MS });
  assert.equal(out.reminder, null, 'the card takes itself away - no one has to dismiss it');
  assert.deepEqual(reminderTick(null, at(11) + TIMEOUT_MS + 1000), { reminder: null, event: null }, 'not missed twice');
  assert.equal(dueSlot({ ...SCHEDULE, now: at(11) + TIMEOUT_MS + 1000, events: [out.event] }), null, 'nor re-announced');
});

test('the line is said once more part-way through the wait, and only once', () => {
  const slot = { id: 's', type: 'medicine', at: '08:00', dueAt: at(8) };
  const shown = showReminder(slot, at(8));

  assert.equal(
    reminderTick(shown, at(8) + REPEAT_AFTER_MS - 1000).reminder,
    shown,
    'an unchanged reminder comes back by identity, so the card knows not to speak again'
  );
  const again = reminderTick(shown, at(8) + REPEAT_AFTER_MS);
  assert.notEqual(again.reminder, shown, 'a new object is what makes the card speak');
  assert.equal(again.reminder.repeated, true);
  assert.equal(again.event, null);
  assert.equal(reminderTick(again.reminder, at(8) + REPEAT_AFTER_MS + 5000).reminder, again.reminder, 'never a third time');
  assert.ok(REPEAT_AFTER_MS < TIMEOUT_MS, 'the repeat has to land inside the wait to be any use');
});

test('a reminder shown at the last allowed second still settles its own slot', () => {
  const slot = slotsToday(REMINDER_SCHEDULE, at(8)).find((s) => s.id === 'medicine-morning');
  const latest = slot.dueAt + FIRE_WINDOW_MS - 1;
  const missedAt = latest + TIMEOUT_MS;
  const { event } = reminderTick(showReminder(slot, latest), missedAt);
  assert.equal(missedAt, slot.dueAt + SLOT_SPAN_MS - 1, 'the worst case is exactly the slot span');
  assert.ok(isResolved(slot, [event]), 'if the span were shorter this reminder would fire all over again');
});

/* ------------------------------------------------------------ a whole day run */

/**
 * The overlay's loop, ticked a second at a time through exactly the same engine
 * calls the component makes (`dueSlot` -> `showReminder` -> `reminderTick` ->
 * `dismissReminder`), with the events fed back in as they are written. This is
 * the closest a browser-free environment can get to running the feature: it
 * proves the scheduling, the announcing, the Done tap, the automatic timeout and
 * the de-duplication all hold together over a real day.
 *
 * `dismiss(reminder, now)` stands in for the patient. Returning false is a
 * patient who never touches the screen.
 */
function playDay({ from, to, dismiss = () => false, schedule = REMINDER_SCHEDULE, events = [] }) {
  const log = [...events];
  const shown = [];
  const spoken = [];
  let reminder = null;

  for (let now = from; now <= to; now += CHECK_EVERY_MS) {
    if (reminder) {
      const step = reminderTick(reminder, now);
      if (step.event) {
        log.push(step.event);
        reminder = null;
        continue;
      }
      if (step.reminder !== reminder) spoken.push(`${step.reminder.slot.id} again`);
      reminder = step.reminder;
      if (dismiss(reminder, now)) {
        log.push(dismissReminder(reminder, now).event);
        reminder = null;
      }
      continue;
    }
    const slot = dueSlot({ schedule, now, events: log });
    if (slot) {
      reminder = showReminder(slot, now);
      shown.push(slot.id);
      spoken.push(slot.id);
    }
  }
  return { events: log, written: log.slice(events.length), shown, spoken };
}

/** A patient who taps Done for everything except water, after `ms` on screen. */
const tapsExceptWater = (ms) => (reminder, now) =>
  reminder.slot.type !== 'hydration' && now - reminder.shownAt >= ms;

test('a full day with the app open: every slot announced once, in order', () => {
  const day = playDay({ from: at(7), to: at(21), dismiss: tapsExceptWater(8000) });

  assert.deepEqual(
    day.shown,
    [
      'medicine-morning',
      'appointment-weekly',
      'hydration-late-morning',
      'medicine-afternoon',
      'hydration-afternoon',
      'hydration-evening',
      'medicine-night',
    ],
    'seven reminders, each shown exactly once'
  );
  assert.deepEqual(
    day.events.map((e) => `${e.type}:${e.status}`),
    [
      'medicine:dismissed',
      'appointment:dismissed',
      'hydration:missed',
      'medicine:dismissed',
      'hydration:missed',
      'hydration:missed',
      'medicine:dismissed',
    ],
    'tapped Done four times; the three glasses of water timed out on their own'
  );
  assert.deepEqual(
    day.spoken.filter((s) => s.endsWith(' again')),
    ['hydration-late-morning again', 'hydration-afternoon again', 'hydration-evening again'],
    'only the ignored ones were repeated - a reminder dealt with quickly is said once'
  );

  const slots = slotsToday(REMINDER_SCHEDULE, at(12));
  day.events.forEach((event, i) => {
    assert.equal(event.type, slots[i].type);
    assert.ok(
      event.timestamp >= slots[i].dueAt && event.timestamp < slots[i].dueAt + SLOT_SPAN_MS,
      `${slots[i].id} was logged outside its own slot`
    );
  });
});

test('a day the app is only open in the evening logs only what it really showed', () => {
  const evening = playDay({ from: at(19), to: at(21) });
  assert.deepEqual(evening.shown, ['hydration-evening', 'medicine-night']);
  assert.deepEqual(
    evening.events.map((e) => `${e.type}:${e.status}`),
    ['hydration:missed', 'medicine:missed'],
    'the five earlier slots produce nothing at all: missed means seen and not acted on'
  );
});

/* --------------------------------------- the events, through the real storage */

test('every event a day produces is written to storage as it happens', async () => {
  const store = createRecordStore(createMemoryDriver());
  const day = playDay({ from: at(7), to: at(21), dismiss: tapsExceptWater(3000) });

  // One write per event, at the moment the event happened - not a batch at the end.
  for (const event of day.events) {
    const saved = await store.logReminderEvent(event);
    assert.ok(saved.id, 'the row exists the instant the reminder is over');
  }

  const rows = await store.reminderEvents();
  assert.equal(rows.length, day.events.length);
  assert.deepEqual(
    rows.map((r) => Object.keys(r).sort().join(',')),
    rows.map(() => 'id,status,synced,timestamp,type'),
    'exactly the fields the schema names - no patient detail rides along'
  );
  assert.deepEqual(rows.map((r) => r.timestamp), day.events.map((e) => e.timestamp), 'stamped when it happened');
  assert.deepEqual([...new Set(rows.map((r) => r.status))].sort(), ['dismissed', 'missed'], 'both outcomes are storable');
  assert.ok(rows.every((r) => r.synced === SYNCED.pending), 'queued for the sync step, not sent from here');
});

test('a reload reads the day back and does not announce a done reminder again', async () => {
  const store = createRecordStore(createMemoryDriver());
  const before = playDay({ from: at(11), to: at(11, 1), dismiss: () => true });
  for (const event of before.events) await store.logReminderEvent(event);

  // What the overlay does on mount: read today's events out of IndexedDB.
  const readBack = await store.reminderEvents({ since: startOfDay(at(11)) });
  assert.deepEqual(readBack.map((r) => `${r.type}:${r.status}`), ['hydration:dismissed']);

  const after = playDay({ from: at(11, 2), to: at(11, 29), events: readBack });
  assert.deepEqual(after.shown, [], 'the water the patient already said Done to is not asked for again');
  assert.deepEqual(after.written, [], 'and nothing new is logged');
});

/* ------------------------------------------------------------------ the wiring
 * There is no browser here, so the only way to prove the screen is connected to
 * the rules above is to read the source. These catch the failure that would
 * otherwise only show up in a demo: correct logic that nothing calls.
 */

test('the overlay speaks through the shared helper and logs the event on the spot', () => {
  const src = read('src', 'components', 'ReminderOverlay.jsx');
  assert.match(src, /import \{ speak \} from '\.\.\/lib\/voice\.js'/, 'the existing helper, not a second voice path');
  assert.match(src, /speak\(words\.line, fallbackWords\?\.line\)/);
  assert.match(src, /\{words\.line\}/, 'the sentence spoken is the sentence shown');
  assert.match(src, /import \{ readReminderEvents, recordReminderEvent \} from '\.\.\/lib\/db\.js'/);
  assert.match(src, /recordReminderEvent\(event\)/, 'written when the reminder ends');
  assert.ok(!/await recordReminderEvent/.test(src), 'and never awaited, so storage cannot freeze the card');
  assert.ok(!/speechSynthesis|new SpeechSynthesis/.test(src), 'no browser speech API outside voice.js');
  assert.ok(!/fetch\(|firebase|navigator\.onLine/.test(src), 'a reminder must work with the network off');
  for (const call of ['dueSlot(', 'showReminder(', 'reminderTick(', 'dismissReminder(', 'CHECK_EVERY_MS']) {
    assert.ok(src.includes(call), `the overlay must go through the engine: ${call} is missing`);
  }
  assert.ok(!/TIMEOUT_MS =|REPEAT_AFTER_MS =|\b90000\b|\b45000\b/.test(src), 'the rules live in the engine only');
});

test('Done is one enormous button and the only thing on the card to tap', () => {
  const src = read('src', 'components', 'ReminderOverlay.jsx');
  assert.equal((src.match(/<button\b/g) || []).length, 1, 'exactly one control');
  assert.match(src, /<button\s[\s\S]{0,200}type="button"/, 'every button declares its type');
  assert.match(src, /min-h-tap-xl/, 'the largest tap token (180px)');
  assert.match(src, /t\('reminder\.done'\)/, 'the button label is localized');
  assert.match(src, /role="dialog"[\s\S]{0,200}aria-modal="true"/, 'nothing behind it is reachable');
  assert.match(src, /aria-live="assertive"/, 'a screen reader announces it too');
  assert.ok(!/>\s*(Later|Snooze|Not now|Skip|Cancel)\s*</i.test(src), 'no second decision to make');
});

test('the overlay is mounted in the patient shell and nowhere else', () => {
  const app = read('src', 'App.jsx');
  const layout = app.slice(app.indexOf('function PatientLayout'), app.indexOf('export default function App'));
  assert.match(layout, /<ReminderOverlay onShowing=\{setReminderOnScreen\} \/>/, 'inside the patient layout');
  assert.match(layout, /<Outlet context=\{\{ reminderOnScreen \}\} \/>/, 'which is how the game is told to hold');
  assert.equal((app.match(/<ReminderOverlay\b/g) || []).length, 1);
  const routes = app.slice(app.indexOf('export default function App'));
  assert.match(routes, /path="\/caregiver"/);
  assert.ok(!/ReminderOverlay/.test(routes), 'a reminder must never cover a caregiver screen');
});

test('the game holds still while a reminder is covering it', () => {
  const play = read('src', 'pages', 'Play.jsx');
  assert.match(play, /import \{ useOutletContext \} from 'react-router-dom'/);
  assert.match(play, /const \{ reminderOnScreen = false \} = useOutletContext\(\) \|\| \{\}/);
  assert.match(
    play,
    /if \(reminderOnScreen\) return undefined;[\s\S]{0,80}PHASE\.STUDY/,
    'no timer runs behind the card, so a study picture cannot vanish unseen'
  );
  assert.match(play, /if \(!session\.question \|\| reminderOnScreen\) return;/, 'and the prompt is not spoken under it');
  assert.ok((play.match(/reminderOnScreen/g) || []).length >= 4, 'both effects restart when the reminder clears');
});

test('the reminder rules and the schedule need nothing from the outside world', () => {
  assert.ok(!/^import /m.test(read('src', 'lib', 'reminderEngine.js')), 'the engine imports nothing, like sessionEngine');
  assert.ok(!/^import /m.test(read('src', 'data', 'reminders.js')), 'the schedule is bundled data, never a fetch');
  assert.ok(CHECK_EVERY_MS > 0 && TIMEOUT_MS > CHECK_EVERY_MS, 'the loop has to be able to see the deadline pass');
});
