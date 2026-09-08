import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGE,
  DAY_MS,
  dayDistance,
  dayKey,
  describeAge,
  formatClock,
  formatDay,
  formatWeekday,
  formatWhen,
  isStamp,
} from '../src/lib/timeWords.js';

/**
 * Every caregiver-facing timestamp goes through this module, so the branches are
 * pinned here rather than eyeballed on a screen. A fixed time zone is passed in
 * on every call: without it these tests would pass or fail depending on where
 * the machine running them happens to be.
 */
const TZ = { timeZone: 'Asia/Kolkata' };

/** 2026-09-06 09:15 IST, chosen because the project's "today" is 2026-09-06. */
const NOW = Date.UTC(2026, 8, 6, 3, 45);

test('a timestamp is only usable if it is a real positive number', () => {
  assert.equal(isStamp(NOW), true);
  for (const bad of [0, -1, NaN, Infinity, null, undefined, '', '1700000000000', {}]) {
    assert.equal(isStamp(bad), false, `${JSON.stringify(bad)} must not pass as a timestamp`);
  }
});

test('a missing timestamp formats as empty string, never "Invalid Date"', () => {
  for (const bad of [null, undefined, 0, NaN, 'nonsense']) {
    assert.equal(formatWhen(bad, NOW, TZ), '');
    assert.equal(formatClock(bad, TZ), '');
    assert.equal(formatDay(bad, TZ), '');
    assert.equal(formatWeekday(bad, TZ), '');
  }
});

test('the day key is the calendar day in the reader time zone, and it sorts', () => {
  assert.equal(dayKey(NOW, TZ), '2026-09-06');
  // 23:30 IST on the 6th is still 18:00 UTC on the 6th; the key must follow the
  // reader, not UTC, or "Today" would flip at the wrong moment of the evening.
  assert.equal(dayKey(Date.UTC(2026, 8, 6, 18, 0), TZ), '2026-09-06');
  assert.equal(dayKey(Date.UTC(2026, 8, 6, 19, 0), TZ), '2026-09-07');
  assert.ok(dayKey(NOW, TZ) < dayKey(NOW + DAY_MS, TZ), 'keys compare as strings');
  assert.equal(dayKey(null, TZ), null);
});

test('day distance counts calendar days, not elapsed hours', () => {
  assert.equal(dayDistance(NOW, NOW, TZ), 0);
  // 40 minutes earlier but on the previous calendar day: one day, not zero.
  const lateLastNight = Date.UTC(2026, 8, 5, 18, 40);
  assert.equal(dayKey(lateLastNight, TZ), '2026-09-06');
  const beforeMidnight = Date.UTC(2026, 8, 5, 18, 20);
  assert.equal(dayDistance(beforeMidnight, NOW, TZ), 1);
  assert.equal(dayDistance(NOW - 7 * DAY_MS, NOW, TZ), 7);
  assert.equal(dayDistance(null, NOW, TZ), null);
});

test('the clock is lower case and free of the odd spaces ICU inserts', () => {
  const words = formatClock(NOW, TZ);
  assert.match(words, /^\d{1,2}:\d{2} (am|pm)$/, `got ${JSON.stringify(words)}`);
  assert.doesNotMatch(words, /[  ]/);
});

test('formatWhen names today and yesterday rather than dating them', () => {
  assert.match(formatWhen(NOW, NOW, TZ), /^Today at \d{1,2}:\d{2} (am|pm)$/);
  assert.match(formatWhen(NOW - DAY_MS, NOW, TZ), /^Yesterday at /);
});

/**
 * ICU abbreviates September as "Sep" in some versions and "Sept" in others, so
 * the month is matched as three or four letters rather than pinned to whichever
 * one this machine happens to ship. Both read correctly to a caregiver.
 */
const MONTH = '[A-Z][a-z]{2,3}';

test('formatWhen names the weekday inside the last week, then the date', () => {
  const threeDays = formatWhen(NOW - 3 * DAY_MS, NOW, TZ);
  assert.match(threeDays, new RegExp(`^[A-Z][a-z]{2} \\d{1,2} ${MONTH} at `), `got ${threeDays}`);

  const twoWeeks = formatWhen(NOW - 14 * DAY_MS, NOW, TZ);
  assert.match(twoWeeks, new RegExp(`^\\d{1,2} ${MONTH} at `), `got ${twoWeeks}`);
  assert.doesNotMatch(twoWeeks, /2026/, 'the current year is not worth the words');
});

test('a date from another year says so, because "6 Sep" alone would be ambiguous', () => {
  const lastYear = formatWhen(Date.UTC(2025, 8, 6, 3, 45), NOW, TZ);
  assert.match(lastYear, new RegExp(`^\\d{1,2} ${MONTH} 2025 at `), `got ${lastYear}`);
});

test('describeAge grades how old the newest record is, in words', () => {
  assert.deepEqual(describeAge(null, NOW, TZ), {
    level: AGE.unknown,
    days: null,
    words: 'no dated records yet',
  });
  assert.equal(describeAge(NOW, NOW, TZ).level, AGE.recent);
  assert.equal(describeAge(NOW, NOW, TZ).words, 'from today');
  assert.equal(describeAge(NOW - DAY_MS, NOW, TZ).words, 'from yesterday');
  assert.equal(describeAge(NOW - 3 * DAY_MS, NOW, TZ).level, AGE.quiet);
  assert.equal(describeAge(NOW - 3 * DAY_MS, NOW, TZ).words, '3 days old');
  assert.equal(describeAge(NOW - 9 * DAY_MS, NOW, TZ).level, AGE.stale);
  assert.equal(describeAge(NOW - 9 * DAY_MS, NOW, TZ).words, 'more than a week old');
  assert.equal(describeAge(NOW - 21 * DAY_MS, NOW, TZ).words, '3 weeks old');
});

test('a record dated in the future is treated as current, never as negative days', () => {
  const ahead = describeAge(NOW + 2 * DAY_MS, NOW, TZ);
  assert.equal(ahead.level, AGE.recent);
  assert.equal(ahead.days, 0);
  assert.doesNotMatch(ahead.words, /-/);
});

test('the same inputs always produce the same words - nothing reads the real clock', () => {
  const once = formatWhen(NOW - 4 * DAY_MS, NOW, TZ);
  const twice = formatWhen(NOW - 4 * DAY_MS, NOW, TZ);
  assert.equal(once, twice);
  // A different reader time zone is allowed to disagree, which is the point of
  // injecting it: the caller decides, the module does not guess.
  const elsewhere = formatWhen(NOW, NOW, { timeZone: 'Pacific/Auckland' });
  assert.match(elsewhere, /at \d{1,2}:\d{2} (am|pm)$/);
});
