import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALERT_HEADLINE,
  ALERT_NOT_A_DIAGNOSIS,
  DECLINE_MIN_DROP,
  DECLINE_RUN,
  NOT_A_DIAGNOSIS,
  TREND,
  buildSeries,
  declineAlerts,
  describeDecline,
  describeTrend,
  trailingDecline,
} from '../src/lib/trends.js';
import { DAY_MS } from '../src/lib/timeWords.js';
import { DOMAINS } from '../src/lib/store.js';
import { BANKS } from '../src/data/banks.js';

/**
 * The decline alert.
 *
 * This is the one thing on the dashboard that asks a caregiver to act, so the
 * question these tests answer is not "does it fire" but "does it fire only when
 * it should". A false alert sends a relative to a doctor over two unlucky games;
 * a missed one is a signal nobody sees. Both directions are asserted, and the
 * whole thing is judged from the same `buildSeries` output the chart draws, so a
 * disagreement between the line and the alert is not expressible.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TZ = { timeZone: 'Asia/Kolkata' };
const NOW = Date.UTC(2026, 8, 6, 3, 45);
const opts = { ...TZ, now: NOW };

const session = (daysAgo, score, tier = 2, domain = 'memory_recall') => ({
  id: `s-${domain}-${daysAgo}`,
  pairingCode: 'K7M2QP',
  domain,
  score,
  difficultyTierEnd: tier,
  timestamp: NOW - daysAgo * DAY_MS,
});

/** `scores` oldest-first, one session per day working back from NOW. */
const seriesOf = (scores, domain = 'memory_recall') => buildSeries(
  scores.map((score, i) => session(scores.length - i, score, 2, domain)),
  domain,
  opts
);

const declineOf = (scores, label = 'Remember the picture') =>
  describeDecline(seriesOf(scores), { label });

// ------------------------------------------------------------- the run itself

test('trailingDecline counts backwards from the newest session, not the longest run anywhere', () => {
  // A run that ended two sessions ago is over, and must not be reported.
  const recovered = trailingDecline(seriesOf([90, 70, 50, 80, 85]));
  assert.equal(recovered.sessions, 1, 'the newest session is higher than the one before it');
  assert.equal(recovered.drop, 0);

  const falling = trailingDecline(seriesOf([50, 90, 80, 70, 60]));
  assert.equal(falling.sessions, 4, 'the four that end at the newest one');
  assert.equal(falling.from, 90);
  assert.equal(falling.to, 60);
  assert.equal(falling.drop, 30);
});

test('an equal score breaks the run - flat is not falling', () => {
  const run = trailingDecline(seriesOf([80, 70, 70, 60]));
  assert.equal(run.sessions, 2, '70 → 70 is not a fall, so the run is only the last two');
});

test('trailingDecline on an empty series reports nothing rather than throwing', () => {
  const empty = trailingDecline(seriesOf([]));
  assert.equal(empty.sessions, 0);
  assert.equal(empty.drop, 0);
  assert.equal(empty.from, null);
  assert.deepEqual(empty.points, []);
  for (const junk of [null, undefined, {}, { points: null }]) {
    assert.equal(trailingDecline(junk).sessions, 0, 'junk input must not throw');
  }
});

// ------------------------------------------------------ when it fires, exactly

test('exactly 3 consecutive falling sessions trigger the alert', () => {
  const alert = declineOf([80, 70, 60]);
  assert.equal(alert.alert, true);
  assert.equal(alert.run, DECLINE_RUN);
  assert.equal(alert.reason, 'declining-run');
  assert.equal(DECLINE_RUN, 3, 'the spec asks for three');
});

test('2 falling sessions do not trigger it, and 3 do - the boundary in one test', () => {
  assert.equal(declineOf([80, 60]).alert, false, 'two sessions is one drop, not a trend');
  assert.equal(declineOf([80, 60]).reason, 'too-few-sessions');
  assert.equal(declineOf([80, 70, 60]).alert, true);
});

test('more than 3 falling sessions still trigger it, and report the whole run', () => {
  const long = declineOf([95, 88, 80, 71, 62, 50]);
  assert.equal(long.alert, true);
  assert.equal(long.run, 6);
  assert.equal(long.drop, 45);
  assert.match(long.detail, /each of the last 6 sessions/);
});

test('0, 1 and 2 sessions never trigger it, and say which condition failed', () => {
  for (const scores of [[], [40], [80, 40]]) {
    const alert = declineOf(scores);
    assert.equal(alert.alert, false, `${scores.length} sessions must not alert`);
    assert.equal(alert.reason, 'too-few-sessions');
    assert.equal(alert.detail, '', 'no sentence is offered for an alert that is not shown');
  }
});

test('a break in the sequence resets the condition', () => {
  /* Three falls, then one better session. The history still contains a long
   * decline, but it is over, and the alert is about now. */
  const recovered = declineOf([90, 80, 70, 60, 75]);
  assert.equal(recovered.alert, false);
  assert.equal(recovered.reason, 'run-too-short');
  assert.equal(recovered.run, 1);

  // One good session in the middle also breaks it: only the tail counts.
  const interrupted = declineOf([90, 80, 95, 85]);
  assert.equal(interrupted.alert, false);
  assert.equal(interrupted.run, 2, 'the run restarts at the interruption');

  // And it fires again once a new run of three has genuinely formed.
  const relapsed = declineOf([90, 80, 70, 60, 75, 65, 55]);
  assert.equal(relapsed.alert, true);
  assert.equal(relapsed.run, 3, 'counted from the recovery, not from the start of history');
});

test('an improving trend never triggers it', () => {
  for (const scores of [[40, 55, 70], [40, 45, 50, 60, 75, 90], [30, 100]]) {
    assert.equal(declineOf(scores).alert, false, `rising scores must not alert: ${scores}`);
  }
});

test('steady and identical scores never trigger it', () => {
  assert.equal(declineOf([70, 70, 70, 70]).alert, false, 'identical scores are not a decline');
  assert.equal(declineOf([70, 70, 70, 70]).run, 1);
  assert.equal(declineOf([70, 72, 69, 71, 70]).alert, false, 'a wobble is not a decline');
  assert.equal(declineOf([60, 60, 60]).reason, 'run-too-short');
});

test('a fall too small to mean anything does not trigger it', () => {
  /* Monotonic is not sufficient. A session is eight questions at most, so one
   * question is worth about 12 points - a three-point slide over three sessions
   * is noise, and an alert on it would be an alert on nothing. */
  const tiny = declineOf([80, 79, 78]);
  assert.equal(tiny.alert, false);
  assert.equal(tiny.reason, 'movement-too-small');
  assert.equal(tiny.run, 3, 'the run is real - it is the size that is not');

  // The boundary itself: exactly DECLINE_MIN_DROP counts, one less does not.
  const exact = declineOf([80, 78, 80 - DECLINE_MIN_DROP]);
  assert.equal(exact.drop, DECLINE_MIN_DROP);
  assert.equal(exact.alert, true, 'exactly the threshold is enough');
  const under = declineOf([80, 78, 80 - DECLINE_MIN_DROP + 1]);
  assert.equal(under.alert, false);
});

test('a session with an unusable score cannot create or extend a run', () => {
  /* The alert reads the same series the chart draws, so rows dropped for being
   * unplottable are dropped here too - a missing score must never become a 0%
   * that looks like a collapse. */
  const withJunk = buildSeries(
    [
      session(4, 80),
      { ...session(3, 0), score: null },
      { ...session(2, 0), score: undefined },
      session(1, 78),
    ],
    'memory_recall',
    opts
  );
  const alert = describeDecline(withJunk, { label: 'Remember the picture' });
  assert.equal(withJunk.count, 2, 'the two unusable rows are not points');
  assert.equal(alert.alert, false, 'a null score must not be charted as 0% and alerted on');
  assert.equal(alert.reason, 'too-few-sessions');

  // Nor may a row with no timestamp fill a gap in a run.
  const noStamp = buildSeries(
    [session(3, 90), { ...session(2, 70), timestamp: 0 }, session(1, 50)],
    'memory_recall',
    opts
  );
  assert.equal(noStamp.count, 2);
  assert.equal(describeDecline(noStamp, { label: 'Memory' }).alert, false);
});

// ------------------------------------------------------ the two domains, apart

test('the two domains are judged independently', () => {
  const rows = [
    // memory_recall falls three times; routine_matching climbs.
    session(6, 85, 2, 'memory_recall'),
    session(4, 70, 2, 'memory_recall'),
    session(2, 55, 2, 'memory_recall'),
    session(5, 50, 2, 'routine_matching'),
    session(3, 65, 2, 'routine_matching'),
    session(1, 80, 2, 'routine_matching'),
  ];
  const readings = BANKS.map((bank) => ({
    series: buildSeries(rows, bank.domain, opts),
    label: bank.name,
  }));
  const { any, alerts, all } = declineAlerts(readings);

  assert.equal(any, true);
  assert.equal(alerts.length, 1, 'one domain only');
  assert.equal(alerts[0].domain, 'memory_recall');
  assert.equal(all.length, 2, 'both domains are reported on, alerting or not');
  const routine = all.find((one) => one.domain === 'routine_matching');
  assert.equal(routine.alert, false);
  assert.equal(routine.label, BANKS[1].name);
});

test('a decline in one domain is not diluted by the other, and both can alert', () => {
  const rows = [
    session(6, 90, 2, 'memory_recall'),
    session(5, 75, 2, 'memory_recall'),
    session(4, 60, 2, 'memory_recall'),
    session(3, 88, 2, 'routine_matching'),
    session(2, 74, 2, 'routine_matching'),
    session(1, 61, 2, 'routine_matching'),
  ];
  const { any, alerts } = declineAlerts(
    BANKS.map((bank) => ({ series: buildSeries(rows, bank.domain, opts), label: bank.name }))
  );
  assert.equal(any, true);
  assert.equal(alerts.length, 2);
  assert.deepEqual(alerts.map((a) => a.domain), ['memory_recall', 'routine_matching']);
});

test("another domain's sessions cannot form a run", () => {
  /* Interleaved rows that would look like a decline if the domain filter were
   * dropped: 90, 70, 50 across the two games, but neither game falls on its own. */
  const rows = [
    session(4, 90, 2, 'memory_recall'),
    session(3, 70, 2, 'routine_matching'),
    session(2, 50, 2, 'memory_recall'),
    session(1, 95, 2, 'routine_matching'),
  ];
  for (const domain of DOMAINS) {
    const alert = describeDecline(buildSeries(rows, domain, opts), { label: domain });
    assert.equal(alert.alert, false, `${domain} has only two sessions of its own`);
    assert.equal(alert.sessions, 2);
  }
});

test('declineAlerts survives junk input and an empty dashboard', () => {
  for (const input of [null, undefined, [], 'nonsense']) {
    const result = declineAlerts(input);
    assert.equal(result.any, false);
    assert.deepEqual(result.alerts, []);
  }
  const empty = declineAlerts(BANKS.map((bank) => ({ series: seriesOf([], bank.domain), label: bank.name })));
  assert.equal(empty.any, false, 'a dashboard with no sessions raises nothing');
});

// -------------------------------------------------------------- the wording

test('the alert carries the exact required sentence', () => {
  assert.equal(ALERT_HEADLINE, 'Consider a check-in with a doctor');
  const alert = declineOf([80, 70, 60]);
  assert.equal(alert.headline, ALERT_HEADLINE);
  // And the page renders the constant rather than a retyped copy.
  const card = readFileSync(join(ROOT, 'src', 'components', 'DeclineAlert.jsx'), 'utf8');
  assert.match(card, /\{ALERT_HEADLINE\}/);
  assert.doesNotMatch(card, /Consider a check-in with a doctor/, 'the string is imported, not duplicated');
});

test('the alert states it is not a diagnosis, in the same card', () => {
  const alert = declineOf([80, 70, 60]);
  assert.equal(alert.notADiagnosis, ALERT_NOT_A_DIAGNOSIS);
  assert.match(ALERT_NOT_A_DIAGNOSIS, /not a diagnosis/i);
  assert.match(ALERT_NOT_A_DIAGNOSIS, /doctor/i, 'it points somewhere rather than only warning');
  assert.match(ALERT_NOT_A_DIAGNOSIS, /tiredness|noisy|interruption|unlucky/i, 'innocent explanations are offered');

  const card = readFileSync(join(ROOT, 'src', 'components', 'DeclineAlert.jsx'), 'utf8');
  assert.match(card, /\{ALERT_NOT_A_DIAGNOSIS\}/);
  assert.match(card, /This is not a diagnosis\./, 'said plainly as well as at length');
  /* Both must be inside the same <section>, so the disclaimer cannot end up a
   * scroll away from the headline that needs it. */
  const section = card.slice(card.indexOf('<section'), card.indexOf('</section>'));
  assert.ok(section.includes('{ALERT_HEADLINE}'), 'the headline is in the card');
  assert.ok(section.includes('{ALERT_NOT_A_DIAGNOSIS}'), 'so is the disclaimer');
});

test('no alert wording anywhere is clinical or diagnostic', () => {
  const forbidden = /\b(diagnos(?:e|es|ed|ing|able)|dementia|alzheimer\w*|impair\w*|patient is|deteriorat\w*|symptom\w*|cognitive decline|disease|abnormal|severe|mild cognitive|prognos\w*|condition of|suffer\w*|urgent|emergency|immediately)\b/i;
  const alerts = [
    declineOf([80, 70, 60]),
    declineOf([95, 88, 80, 71, 62, 50]),
    declineOf([100, 60, 20]),
  ];
  for (const alert of alerts) {
    for (const words of [alert.headline, alert.detail, alert.suggestion]) {
      assert.doesNotMatch(words, forbidden, `clinical wording: ${words}`);
    }
  }
  /* "not a diagnosis" is the one place the word may appear, and only as a
   * denial - so it is checked separately rather than being exempted wholesale. */
  assert.doesNotMatch(ALERT_NOT_A_DIAGNOSIS, /\b(dementia|alzheimer\w*|impair\w*|deteriorat\w*|disease)\b/i);
  assert.match(ALERT_NOT_A_DIAGNOSIS, /not a diagnosis/i);
});

test('the alert sentence is repeatable to a doctor as it stands', () => {
  const alert = declineOf([90, 75, 60], 'Remember the picture');
  assert.match(alert.detail, /^Remember the picture/, 'it names the game, not a database domain');
  assert.match(alert.detail, /last 3 sessions/);
  assert.match(alert.detail, /from about 90% of the answers correct to about 60%/);
  assert.match(alert.detail, /on the patient’s device/, 'it is scoped to a game on a device');
  assert.match(alert.suggestion, /next ordinary appointment/);
  assert.doesNotMatch(alert.detail, /^\d/, 'a number is never the whole message');
});

test('an alert is labelled with the game name the patient sees', () => {
  for (const bank of BANKS) {
    const alert = describeDecline(seriesOf([85, 70, 55], bank.domain), { label: bank.name });
    assert.equal(alert.alert, true);
    assert.equal(alert.domain, bank.domain);
    assert.ok(alert.detail.startsWith(bank.name), alert.detail);
  }
});

// ------------------------------------------- the interpretation under a chart

test('the interpretation still says improving, steady or declining in words', () => {
  const cases = [
    { scores: [40, 45, 50, 70, 75, 80], word: /improving/, direction: TREND.up },
    { scores: [80, 75, 70, 50, 45, 40], word: /declined/, direction: TREND.down },
    { scores: [70, 71, 69, 70, 72, 70], word: /steady/, direction: TREND.steady },
  ];
  for (const { scores, word, direction } of cases) {
    const reading = describeTrend(seriesOf(scores), { label: 'Remember the picture', now: NOW });
    assert.equal(reading.direction, direction);
    assert.match(reading.headline, word);
    assert.match(reading.headline, /^Remember the picture/);
    assert.doesNotMatch(reading.headline, /^\d/, 'never a bare number');
    assert.ok(reading.detail.length > 20);
  }
});

test('insufficient data says there is not enough information, in those words', () => {
  const none = describeTrend(seriesOf([]), { label: 'Remember the picture', now: NOW });
  assert.match(none.detail, /not enough information/i);
  assert.match(none.headline, /has not been played yet\./);

  const one = describeTrend(seriesOf([64]), { label: 'Remember the picture', now: NOW });
  assert.match(one.detail, /not enough information to determine a trend/i);
  assert.match(one.headline, /played once so far\./);

  const two = describeTrend(seriesOf([80, 40]), { label: 'Remember the picture', now: NOW });
  assert.match(two.detail, /Two sessions is a start rather than a trend/);
});

test('a declining reading and a fired alert agree, and both come from one series', () => {
  /* The consistency requirement, expressed as an assertion: the chart, the
   * sentence and the alert are all built from the same `buildSeries` output, so
   * a line that falls and a headline that says "steady" is not expressible. */
  const series = seriesOf([90, 78, 66]);
  const reading = describeTrend(series, { label: 'Remember the picture', now: NOW });
  const alert = describeDecline(series, { label: 'Remember the picture' });
  assert.equal(reading.direction, TREND.down);
  assert.equal(alert.alert, true);
  assert.equal(alert.sessions, series.count, 'the alert counts the sessions the chart drew');
  assert.equal(alert.run, 3);

  // And where the reading is steady, the alert is silent.
  const flat = seriesOf([70, 70, 70]);
  assert.equal(describeTrend(flat, { label: 'Memory', now: NOW }).direction, TREND.steady);
  assert.equal(describeDecline(flat, { label: 'Memory' }).alert, false);
});

test('a decline gentle enough to read as steady does not raise an alert either', () => {
  /* The two rules answer different questions - "which way is it going" and "is
   * this worth mentioning" - so they can legitimately differ. What must never
   * happen is an alert with no visible decline: this asserts the gap falls the
   * safe way. */
  const series = seriesOf([80, 79, 78]);
  assert.equal(describeTrend(series, { label: 'Memory', now: NOW }).direction, TREND.steady);
  assert.equal(describeDecline(series, { label: 'Memory' }).alert, false);
});

// ------------------------------------------------------------------ the page

test('the dashboard renders the alert above the charts, and only from the same series', () => {
  const page = readFileSync(join(ROOT, 'src', 'pages', 'CaregiverDashboard.jsx'), 'utf8');
  assert.match(page, /declineAlerts\(/, 'the page uses the tested function');
  assert.match(page, /<DeclineAlert alerts=\{decline\.alerts\}/);
  // Built from `charts`, which is what the trend lines are drawn from.
  assert.match(page, /declineAlerts\(\s*charts\.map\(/);
  assert.ok(
    page.indexOf('<DeclineAlert') < page.indexOf('<TrendChart'),
    'the alert is above the charts on the page'
  );
  // No second idea of a trend anywhere on the page.
  assert.doesNotMatch(page, /compareRecent|trailingDecline/, 'the page does not recompute a trend');
  assert.match(page, /NOT_A_DIAGNOSIS/, 'the page-level note is still rendered');
  assert.ok(NOT_A_DIAGNOSIS.length > 80);
});

test('the alert card renders nothing when nothing is wrong', () => {
  const card = readFileSync(join(ROOT, 'src', 'components', 'DeclineAlert.jsx'), 'utf8');
  assert.match(card, /if \(list\.length === 0\) return null;/, 'no empty card, no placeholder');
  assert.match(card, /role="status"/);
  assert.match(card, /aria-live="polite"/, 'announced, but not as an assertive interruption');
  // Warn, not bad: this is "mention it at the next appointment", not an emergency.
  assert.match(card, /border-warn|bg-warn-light/);
  assert.doesNotMatch(card, /bg-bad|text-bad/, 'red would read as an emergency');
  // Still not the patient design system.
  assert.doesNotMatch(card, /btn-primary|min-h-tap-lg|min-h-tap-xl/);
});

test('the decline rule lives in trends.js and nowhere else', () => {
  const strip = (src) => src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
  for (const file of [
    join('src', 'components', 'DeclineAlert.jsx'),
    join('src', 'pages', 'CaregiverDashboard.jsx'),
    join('src', 'lib', 'caregiverData.js'),
  ]) {
    const code = strip(readFileSync(join(ROOT, file), 'utf8'));
    assert.doesNotMatch(code, /DECLINE_RUN\s*=|DECLINE_MIN_DROP\s*=/, `${file} redefines a threshold`);
    assert.doesNotMatch(code, /\.score\s*<\s*/, `${file} compares scores itself`);
  }
  assert.equal(DECLINE_MIN_DROP, 5, 'the threshold is one number, in one place');
});
