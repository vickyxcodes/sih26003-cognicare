import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHART_POINTS,
  NOT_A_DIAGNOSIS,
  RECENT_WINDOW,
  STEADY_BAND,
  TIER_MAX,
  TREND,
  buildSeries,
  compareRecent,
  describeDifficulty,
  describeTrend,
} from '../src/lib/trends.js';
import { chartConfig } from '../src/lib/chartSpec.js';
import { DAY_MS } from '../src/lib/timeWords.js';
import { DOMAINS } from '../src/lib/store.js';
import { BANKS } from '../src/data/banks.js';

/**
 * What the caregiver charts plot and what the sentence under each one says.
 *
 * The sentence is the part worth testing hardest. A chart that draws a slightly
 * wrong curve is cosmetic; a headline that says "steady" over a falling line, or
 * that reads like a diagnosis, is the bug the spec explicitly forbids. So the
 * wording is asserted, not just the direction.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TZ = { timeZone: 'Asia/Kolkata' };
const NOW = Date.UTC(2026, 8, 6, 3, 45);
const opts = { ...TZ, now: NOW };

/** Sessions ending `daysAgo` days before NOW, in the shape both data sources use. */
const session = (daysAgo, score, tier = 2, domain = 'memory_recall') => ({
  id: `s-${domain}-${daysAgo}`,
  pairingCode: 'K7M2QP',
  domain,
  score,
  difficultyTierEnd: tier,
  timestamp: NOW - daysAgo * DAY_MS,
});

/** `scores` oldest-first, one session per day working back from NOW. */
const seriesOf = (scores, { tiers, domain = 'memory_recall' } = {}) => buildSeries(
  scores.map((score, i) => session(scores.length - i, score, tiers ? tiers[i] : 2, domain)),
  domain,
  opts
);

test('a series keeps only the asked-for domain, oldest first', () => {
  const rows = [
    session(3, 60, 2, 'memory_recall'),
    session(2, 90, 3, 'routine_matching'),
    session(1, 70, 2, 'memory_recall'),
  ];
  const memory = buildSeries(rows, 'memory_recall', opts);
  assert.equal(memory.count, 2);
  assert.deepEqual(memory.scores, [60, 70], 'oldest first, and the other domain is not here');

  const routine = buildSeries(rows, 'routine_matching', opts);
  assert.deepEqual(routine.scores, [90]);
  // Every domain the store accepts can be charted, so neither line is ever blank
  // for want of a code path.
  for (const domain of DOMAINS) {
    assert.ok(buildSeries(rows, domain, opts), `${domain} must be chartable`);
  }
});

test('rows that cannot be plotted honestly are dropped, not coerced', () => {
  const rows = [
    session(5, 50),
    { ...session(4, 50), timestamp: 0 },
    { ...session(3, 50), score: null },
    { ...session(2, 50), score: 140 },
    { ...session(1, 50), score: -5 },
    null,
  ];
  const series = buildSeries(rows, 'memory_recall', opts);
  assert.equal(series.count, 1, 'only the one complete row survives');
  assert.equal(series.total, 1);
});

test('a series is capped at the last CHART_POINTS sessions but reports the true total', () => {
  const scores = Array.from({ length: CHART_POINTS + 5 }, (_, i) => 40 + i);
  const series = seriesOf(scores);
  assert.equal(series.count, CHART_POINTS);
  assert.equal(series.total, CHART_POINTS + 5, 'the count shown and the count held are different facts');
  assert.deepEqual(series.scores, scores.slice(-CHART_POINTS), 'the RECENT ones are kept');
});

test('every point carries a readable label and a full timestamp for the tooltip', () => {
  const series = seriesOf([55, 65]);
  assert.equal(series.labels.length, 2);
  for (const point of series.points) {
    assert.match(point.label, /^\d{1,2} [A-Z][a-z]{2,3}$/, `axis label: ${point.label}`);
    assert.match(point.when, / at \d{1,2}:\d{2} (am|pm)$/, `tooltip title: ${point.when}`);
    assert.ok(point.tier >= 1 && point.tier <= TIER_MAX);
  }
  assert.equal(series.oldest, series.points[0].timestamp);
  assert.equal(series.newest, series.points[series.points.length - 1].timestamp);
});

test('a difficulty tier outside 1-3 is clamped rather than drawn off the axis', () => {
  const series = buildSeries(
    [session(2, 50, 9), session(1, 50, -4)],
    'memory_recall',
    opts
  );
  assert.deepEqual(series.tiers, [TIER_MAX, 1]);
});

test('an empty or junk input gives an empty series, never a throw', () => {
  for (const input of [[], null, undefined, 'nonsense', [null, undefined]]) {
    const series = buildSeries(input, 'memory_recall', opts);
    assert.equal(series.count, 0);
    assert.deepEqual(series.points, []);
    assert.equal(series.newest, null);
  }
});

test('compareRecent reports up, down and steady against the band', () => {
  assert.equal(compareRecent([]).direction, TREND.none);
  assert.equal(compareRecent([70]).direction, TREND.single);
  assert.equal(compareRecent([40, 45, 50, 70, 75, 80]).direction, TREND.up);
  assert.equal(compareRecent([80, 75, 70, 50, 45, 40]).direction, TREND.down);
  assert.equal(compareRecent([70, 72, 68, 71, 69, 70]).direction, TREND.steady);
});

test('movement inside STEADY_BAND is steady, and just outside it is not', () => {
  const flat = [60, 60, 60];
  const inside = compareRecent([...flat, 60 + STEADY_BAND, 60 + STEADY_BAND, 60 + STEADY_BAND]);
  assert.equal(inside.direction, TREND.steady, 'exactly the band is still level');
  const outside = compareRecent([...flat, 60 + STEADY_BAND + 1, 60 + STEADY_BAND + 1, 60 + STEADY_BAND + 1]);
  assert.equal(outside.direction, TREND.up);
  assert.equal(outside.recent, 69);
  assert.equal(outside.earlier, 60);
});

test('with three sessions the window is two against one, not one against one', () => {
  /* A single newest session against its neighbour is one lucky game away from
   * reading as a trend, so the window rounds up. */
  const three = compareRecent([90, 20, 20]);
  assert.equal(three.recent, 20, 'the last two are the recent pair');
  assert.equal(three.earlier, 90);
  assert.equal(three.direction, TREND.down);

  const six = compareRecent([50, 50, 50, 50, 50, 50]);
  assert.equal(six.direction, TREND.steady);
  // Six or more settles at the spec's three-against-three.
  const window = compareRecent([0, 0, 0, 100, 100, 100]);
  assert.equal(window.recent, 100);
  assert.equal(window.earlier, 0);
  assert.equal(RECENT_WINDOW, 3);
});

test('describeDifficulty says which way the level moved, or that it held', () => {
  assert.equal(describeDifficulty([1]), '', 'one session cannot show movement');
  assert.match(describeDifficulty([1, 3]), /rose from 1 to 3 of 3/);
  assert.match(describeDifficulty([1, 3]), /harder/);
  assert.match(describeDifficulty([3, 1]), /dropped from 3 to 1 of 3/);
  assert.match(describeDifficulty([2, 2, 2]), /stayed at 2 of 3/);
  assert.match(describeDifficulty([2, 2, 2]), /comparable/);
});

test('a reading always leads with words - a bare number is never the interpretation', () => {
  const cases = [
    seriesOf([]),
    seriesOf([70]),
    seriesOf([40, 45, 50, 70, 75, 80]),
    seriesOf([80, 75, 70, 50, 45, 40]),
    seriesOf([70, 71, 69, 70, 72, 70]),
  ];
  for (const series of cases) {
    const reading = describeTrend(series, { label: 'Remember the picture', now: NOW });
    assert.ok(reading.headline.length > 12, 'there is a sentence');
    assert.doesNotMatch(reading.headline, /^\d/, `a headline must not open with a number: ${reading.headline}`);
    assert.match(reading.headline, /^Remember the picture/, 'the game is named the way the patient sees it');
    assert.ok(reading.headline.endsWith('.'));
    assert.ok(reading.detail.length > 12, 'the numbers arrive as supporting detail');
  }
});

test('the headline matches the direction of the line', () => {
  const up = describeTrend(seriesOf([40, 45, 50, 70, 75, 80]), { label: 'Memory', now: NOW });
  assert.equal(up.direction, TREND.up);
  assert.equal(up.headline, 'Memory has been improving across the last 6 sessions.');

  const down = describeTrend(seriesOf([80, 75, 70, 50, 45, 40]), { label: 'Routine', now: NOW });
  assert.equal(down.direction, TREND.down);
  assert.equal(down.headline, 'Routine has declined across the last 6 sessions.');
  assert.match(down.detail, /averaged about \d+% of the answers correct/);

  const steady = describeTrend(seriesOf([70, 71, 69, 70, 72, 70]), { label: 'Memory', now: NOW });
  assert.equal(steady.headline, 'Memory has been steady across the last 6 sessions.');
});

test('too little data is said plainly instead of being drawn as a trend', () => {
  const none = describeTrend(seriesOf([]), { label: 'Memory', now: NOW });
  assert.equal(none.direction, TREND.none);
  assert.equal(none.headline, 'Memory has not been played yet.');
  assert.match(none.detail, /fills in on its own/);
  assert.equal(none.sessions, 0);

  const one = describeTrend(seriesOf([64]), { label: 'Memory', now: NOW });
  assert.equal(one.direction, TREND.single);
  assert.equal(one.headline, 'Memory has been played once so far.');
  assert.match(one.detail, /One session cannot show a trend/);
  assert.match(one.detail, /64%/, 'the one score is still reported, after the words');

  const two = describeTrend(seriesOf([80, 40]), { label: 'Memory', now: NOW });
  assert.match(two.headline, /across the two sessions so far\.$/);
  assert.match(two.detail, /Two sessions is a start rather than a trend/);
});

test('no reading anywhere uses clinical or diagnostic language', () => {
  /* The spec's hard rule: these words describe a game score, never a person's
   * health. Checked across every branch, including the difficulty sentence. */
  const forbidden = /\b(diagnos\w*|dementia|alzheimer\w*|impair\w*|patient is|deteriorat\w*|symptom\w*|cognitive decline|disease|abnormal|severe|mild cognitive|prognos\w*|condition of)\b/i;
  const readings = [
    describeTrend(seriesOf([]), { label: 'Memory', now: NOW }),
    describeTrend(seriesOf([70]), { label: 'Memory', now: NOW }),
    describeTrend(seriesOf([80, 40]), { label: 'Memory', now: NOW }),
    describeTrend(seriesOf([80, 75, 70, 50, 45, 40], { tiers: [3, 3, 2, 2, 1, 1] }), { label: 'Memory', now: NOW }),
    describeTrend(seriesOf([40, 45, 50, 70, 75, 80], { tiers: [1, 1, 2, 2, 3, 3] }), { label: 'Memory', now: NOW }),
  ];
  for (const reading of readings) {
    for (const words of [reading.headline, reading.detail, reading.difficulty]) {
      assert.doesNotMatch(words || '', forbidden, `clinical wording: ${words}`);
    }
  }
});

test('the not-a-diagnosis note says all three things it has to say', () => {
  assert.match(NOT_A_DIAGNOSIS, /practice game/i);
  assert.match(NOT_A_DIAGNOSIS, /not a medical measurement/i);
  assert.match(NOT_A_DIAGNOSIS, /do not diagnose/i);
  assert.match(NOT_A_DIAGNOSIS, /doctor/i, 'it points somewhere useful rather than only warning');
});

test('every game domain has a bank with a name the dashboard can label a chart with', () => {
  assert.equal(BANKS.length, DOMAINS.length, 'a domain with no bank could never be charted');
  for (const bank of BANKS) {
    assert.ok(DOMAINS.includes(bank.domain), `${bank.domain} is not a stored domain`);
    assert.ok(bank.name && bank.name.length > 3, 'a chart needs a human name');
    const reading = describeTrend(seriesOf([70, 72], { domain: bank.domain }), {
      label: bank.name,
      now: NOW,
    });
    assert.ok(reading.headline.startsWith(bank.name), reading.headline);
  }
});

test('chartConfig draws the score and the difficulty from the series it is given', () => {
  const series = seriesOf([40, 60, 80], { tiers: [1, 2, 3] });
  const config = chartConfig(series);
  assert.equal(config.type, 'line');
  assert.deepEqual(config.data.labels, series.labels);

  const [score, difficulty] = config.data.datasets;
  assert.deepEqual(score.data, [40, 60, 80]);
  assert.equal(score.yAxisID, 'y');
  assert.deepEqual(difficulty.data, [1, 2, 3]);
  assert.equal(difficulty.yAxisID, 'level');
  assert.equal(difficulty.stepped, true, 'a tier is a step, not a slope');

  // Readable for a caregiver: a percent axis that always spans 0-100 so two
  // charts can be compared by eye, and a difficulty axis fixed to the real tiers.
  assert.equal(config.options.scales.y.min, 0);
  assert.equal(config.options.scales.y.max, 100);
  assert.equal(config.options.scales.level.min, 1);
  assert.equal(config.options.scales.level.max, TIER_MAX);
  assert.equal(config.options.responsive, true);
  assert.equal(config.options.maintainAspectRatio, false);
  assert.ok(score.borderWidth >= 3, 'thick enough to see on a tablet');
});

test('chart tooltips name the day and explain both numbers in words', () => {
  const series = seriesOf([40, 60]);
  const config = chartConfig(series);
  const { title, label } = config.options.plugins.tooltip.callbacks;
  assert.equal(title([{ dataIndex: 1 }]), series.points[1].when);
  assert.equal(title([{ dataIndex: 99 }]), '', 'an out-of-range index must not throw');
  assert.match(label({ datasetIndex: 0, parsed: { y: 60 } }), /60% of answers correct/);
  assert.match(label({ datasetIndex: 1, parsed: { y: 2 } }), /Difficulty level 2 of 3/);
});

test('chart animation is switched off under prefers-reduced-motion', () => {
  assert.equal(chartConfig(seriesOf([40, 60]), { reducedMotion: true }).options.animation, false);
  assert.ok(chartConfig(seriesOf([40, 60]), { reducedMotion: false }).options.animation.duration > 0);
});

/**
 * Chart.js is the fourth library to get the confinement treatment, after idb,
 * firebase and speechSynthesis: one adapter file, loaded lazily, so the patient
 * bundle never carries a charting library it has no screen for.
 */
test('chart.js is confined to the one component that draws with it', () => {
  const walk = (dir, out = []) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, out);
      else out.push(full);
    }
    return out;
  };
  const files = walk(join(ROOT, 'src')).filter((f) => ['.js', '.jsx'].includes(extname(f)));
  const allowed = join('src', 'components', 'TrendChart.jsx');
  let found = 0;
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    if (!/from\s+'chart\.js|import\(\s*'chart\.js/.test(src)) continue;
    found += 1;
    assert.equal(relative(ROOT, file), allowed, `${relative(ROOT, file)} imports chart.js directly`);
  }
  assert.equal(found, 1, 'exactly one file imports chart.js');

  const adapter = readFileSync(join(ROOT, allowed), 'utf8');
  assert.match(adapter, /import\(\s*'chart\.js\/auto'\s*\)/, 'the library is loaded lazily');
  // The instance is owned here and given up here: two destroy() calls, one for
  // the rebuild-on-new-data path and one for unmount.
  assert.ok(
    (adapter.match(/\.destroy\(\)/g) || []).length >= 2,
    'a chart must be destroyed on data change and on unmount'
  );
  assert.match(adapter, /return \(\) => \{/, 'the effect returns a cleanup function');
});
