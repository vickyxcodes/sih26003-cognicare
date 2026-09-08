/**
 * trends - what the caregiver charts plot, and what the words under them say.
 *
 * Both halves are here and both are pure, because the reading is the part that
 * can be wrong in a way that matters. A chart that draws a wobbly line is a
 * cosmetic bug; a sentence that says "steady" over a falling line, or that
 * sounds like a diagnosis, is a real one. So the series and the sentence are
 * built by the same tested function and the component only draws them.
 *
 * Two deliberate constraints from the spec live in this file:
 *   - a number is never the whole interpretation. Every reading leads with
 *     words and offers the averages afterwards as supporting detail.
 *   - nothing here diagnoses. The vocabulary is about game scores on a device,
 *     never about the patient's health, and `NOT_A_DIAGNOSIS` is rendered
 *     alongside the readings rather than being left implied.
 *
 * Only the fields both data sources carry are used - `score`, `difficultyTierEnd`
 * and `timestamp` - because a Firestore session document holds exactly those and
 * the dashboard must read the same on any device. See `caregiverData.js`.
 */
import { formatDay, formatWhen, isStamp } from './timeWords.js';

/** How many recent sessions a trend line shows. */
export const CHART_POINTS = 10;

/** The sessions treated as "recent" when comparing against what came before. */
export const RECENT_WINDOW = 3;

/** Percentage points of movement that still count as level, either way. */
export const STEADY_BAND = 8;

export const TIER_MAX = 3;

export const TREND = {
  none: 'none',
  single: 'single',
  up: 'up',
  down: 'down',
  steady: 'steady',
};

/**
 * How many consecutive sessions must fall before the alert appears.
 *
 * Three *sessions* forming a run that goes down at every step - so two
 * successive drops - is the reading taken of "trends downward across 3 or more
 * consecutive sessions". The alternative reading (three drops, i.e. four
 * sessions) would mean a patient playing every other day waits a week longer
 * for a signal that already exists, and the alert is only ever a suggestion to
 * mention something at an ordinary appointment. The number lives here so it can
 * be retuned in one place.
 */
export const DECLINE_RUN = 3;

/**
 * Percentage points the run must fall in total before it counts.
 *
 * Monotonic alone is not enough: 80 → 79 → 78 goes down at every step and means
 * nothing. A session is eight questions at most, so a single question is worth
 * about 12 points - five points therefore cannot be reached by rounding or by a
 * session of a different length, while any real regression clears it easily.
 */
export const DECLINE_MIN_DROP = 5;

/** The exact sentence the alert card leads with. */
export const ALERT_HEADLINE = 'Consider a check-in with a doctor';

/**
 * The stated reason the alert is not a medical claim. Kept beside the headline
 * so the two can never be rendered apart, and asserted by a test.
 */
export const ALERT_NOT_A_DIAGNOSIS =
  'This is not a diagnosis, and it does not mean anything is wrong. Lower scores in a row can '
  + 'come from tiredness, a noisy room, an interruption during the game, or a few unlucky '
  + 'questions. Only a doctor can say whether they mean anything at all.';

export const NOT_A_DIAGNOSIS =
  'These are scores from a practice game on the patient’s device. They are not a '
  + 'medical measurement and they do not diagnose anything. Share them with a doctor '
  + 'rather than reading a condition into them.';

const clampTier = (value) => {
  const tier = Math.round(Number(value));
  if (!Number.isFinite(tier)) return 1;
  return Math.min(TIER_MAX, Math.max(1, tier));
};

/**
 * A score is only plottable if it really is a number in 0-100.
 *
 * The `typeof` check is the load-bearing part: `Number(null)` and `Number('')`
 * are both 0, so a coercion test alone would turn a missing score into a
 * genuine-looking 0% point - the worst possible failure on a screen whose whole
 * job is to say whether things are getting worse.
 */
const usableScore = (value) => typeof value === 'number'
  && Number.isFinite(value)
  && value >= 0
  && value <= 100;

const average = (values) => (values.length
  ? Math.round(values.reduce((sum, n) => sum + n, 0) / values.length)
  : null);

/**
 * The last `limit` sessions of one domain, oldest first - the order a trend line
 * is read in. Rows that could not be plotted honestly (no timestamp, a score
 * outside 0-100) are dropped rather than coerced into a point.
 */
export function buildSeries(sessions, domain, options = {}) {
  const { limit = CHART_POINTS, now = Date.now() } = options;
  const usable = (Array.isArray(sessions) ? sessions : [])
    .filter((row) => row && row.domain === domain && isStamp(Number(row.timestamp)) && usableScore(row.score))
    .map((row) => ({
      timestamp: Number(row.timestamp),
      score: Math.round(Number(row.score)),
      tier: clampTier(row.difficultyTierEnd),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const points = (Number.isFinite(limit) ? usable.slice(-limit) : usable).map((point) => ({
    ...point,
    label: formatDay(point.timestamp, options),
    when: formatWhen(point.timestamp, now, options),
  }));

  return {
    domain,
    total: usable.length,
    count: points.length,
    points,
    scores: points.map((p) => p.score),
    tiers: points.map((p) => p.tier),
    labels: points.map((p) => p.label),
    newest: points.length ? points[points.length - 1].timestamp : null,
    oldest: points.length ? points[0].timestamp : null,
  };
}

/**
 * Direction of travel across a series: the most recent few sessions against the
 * ones before them. Deliberately not a line fit - a caregiver is being told
 * "lately, compared with before", and that is exactly what this compares.
 */
export function compareRecent(scores, { window = RECENT_WINDOW, band = STEADY_BAND } = {}) {
  const list = Array.isArray(scores) ? scores.filter((n) => Number.isFinite(n)) : [];
  if (list.length === 0) return { direction: TREND.none, recent: null, earlier: null, change: null };
  if (list.length === 1) return { direction: TREND.single, recent: list[0], earlier: null, change: null };
  /**
   * `ceil`, not `floor`: with three sessions the honest comparison is the last
   * two against the first, not the newest single session against its neighbour,
   * which is one lucky or unlucky game away from reading as a trend. Once there
   * are six or more the window settles at the spec's three-against-three.
   */
  const size = Math.min(window, Math.ceil(list.length / 2));
  const recent = average(list.slice(-size));
  const earlier = average(list.slice(-size * 2, -size));
  const change = recent - earlier;
  let direction = TREND.steady;
  if (change > band) direction = TREND.up;
  else if (change < -band) direction = TREND.down;
  return { direction, recent, earlier, change };
}

/** What the difficulty line adds to the reading, if anything. */
export function describeDifficulty(tiers) {
  const list = Array.isArray(tiers) ? tiers.filter((n) => Number.isFinite(n)) : [];
  if (list.length < 2) return '';
  const first = list[0];
  const last = list[list.length - 1];
  if (last > first) {
    return `The difficulty level rose from ${first} to ${last} of ${TIER_MAX} across these sessions, `
      + 'so the later questions were the harder ones.';
  }
  if (last < first) {
    return `The difficulty level dropped from ${first} to ${last} of ${TIER_MAX} across these sessions, `
      + 'so the later questions were the easier ones.';
  }
  return `The difficulty level stayed at ${last} of ${TIER_MAX} throughout, so these sessions are `
    + 'comparable with each other.';
}

/**
 * The words under a chart. Always a headline in plain language first; the
 * averages follow as detail, never on their own. `label` is the game's own name
 * from `src/data/banks.js`, so the dashboard and the patient screens call the
 * two domains the same thing.
 */
export function describeTrend(series, { label = 'This activity', now = Date.now() } = {}) {
  const points = (series && series.points) || [];
  const trend = compareRecent(points.map((p) => p.score));
  const sessions = points.length;
  const base = { direction: trend.direction, recent: trend.recent, earlier: trend.earlier, sessions };

  if (sessions === 0) {
    return {
      ...base,
      headline: `${label} has not been played yet.`,
      detail: 'There is not enough information to say anything about a trend. This chart fills in on '
        + 'its own as soon as the game is played on the patient’s device.',
      difficulty: '',
    };
  }

  if (sessions === 1) {
    return {
      ...base,
      headline: `${label} has been played once so far.`,
      detail: `There is not enough information to determine a trend. One session cannot show a trend - `
        + `two or three more will. That session ended with about ${trend.recent}% of the answers `
        + `correct, ${points[0].when.toLowerCase()}.`,
      difficulty: '',
    };
  }

  const difficulty = describeDifficulty(points.map((p) => p.tier));
  const span = sessions === 2 ? 'the two sessions so far' : `the last ${sessions} sessions`;
  const detailNumbers = `The most recent sessions averaged about ${trend.recent}% of the answers correct, `
    + `against about ${trend.earlier}% before that.`;
  const twoIsNotATrend = sessions === 2
    ? ' Two sessions is a start rather than a trend, so it is worth waiting for a few more.'
    : '';

  if (trend.direction === TREND.up) {
    return {
      ...base,
      headline: `${label} has been improving across ${span}.`,
      detail: `${detailNumbers}${twoIsNotATrend}`,
      difficulty,
    };
  }
  if (trend.direction === TREND.down) {
    return {
      ...base,
      headline: `${label} has declined across ${span}.`,
      detail: `${detailNumbers}${twoIsNotATrend}`,
      difficulty,
    };
  }
  return {
    ...base,
    headline: `${label} has been steady across ${span}.`,
    detail: `${detailNumbers}${twoIsNotATrend}`,
    difficulty,
  };
}

/**
 * The run of consecutive sessions that ends at the newest one and falls at every
 * step. Measured backwards from the end on purpose: a decline the patient has
 * already recovered from is not something to raise, and counting the longest run
 * anywhere in the history would keep raising it for ever.
 *
 * Takes a series built by `buildSeries`, so the domain filtering, the ordering
 * and the dropping of unplottable rows are the same ones the chart and the
 * reading used - there is no second idea of what a session is anywhere in this
 * file.
 */
export function trailingDecline(series) {
  const points = (series && series.points) || [];
  let length = 1;
  while (length < points.length) {
    const newer = points[points.length - length];
    const older = points[points.length - length - 1];
    if (!(newer.score < older.score)) break;
    length += 1;
  }
  if (points.length === 0) return { sessions: 0, drop: 0, from: null, to: null, points: [] };
  const run = points.slice(points.length - length);
  const from = run[0].score;
  const to = run[run.length - 1].score;
  return { sessions: run.length, drop: from - to, from, to, points: run };
}

/**
 * Whether to show the alert for one domain, and the words that go with it.
 *
 * Two conditions, both required: the last `DECLINE_RUN` sessions or more went
 * down at every step, and the run fell by at least `DECLINE_MIN_DROP` points in
 * total. Anything else returns `alert: false` with a `reason` naming which
 * condition failed, which is what makes "it did not fire, and here is why"
 * testable rather than a matter of trusting a boolean.
 *
 * Nothing here reads the patient's history in any other way, diagnoses
 * anything, or names a condition. `ALERT_NOT_A_DIAGNOSIS` travels with the
 * headline so the two cannot be rendered apart.
 */
export function describeDecline(series, { label = 'This activity' } = {}) {
  const run = trailingDecline(series);
  const sessions = (series && series.count) || 0;
  const base = {
    domain: (series && series.domain) || '',
    label,
    sessions,
    run: run.sessions,
    drop: run.drop,
    headline: ALERT_HEADLINE,
    notADiagnosis: ALERT_NOT_A_DIAGNOSIS,
  };

  if (sessions < DECLINE_RUN) {
    return { ...base, alert: false, reason: 'too-few-sessions', detail: '', suggestion: '' };
  }
  if (run.sessions < DECLINE_RUN) {
    return { ...base, alert: false, reason: 'run-too-short', detail: '', suggestion: '' };
  }
  if (run.drop < DECLINE_MIN_DROP) {
    return { ...base, alert: false, reason: 'movement-too-small', detail: '', suggestion: '' };
  }

  return {
    ...base,
    alert: true,
    reason: 'declining-run',
    /* The facts, in the caregiver's own terms: which game, how many sessions,
     * and how far - so the sentence can be repeated to a doctor as it stands. */
    detail: `${label} has gone down in each of the last ${run.sessions} sessions on the patient’s `
      + `device, from about ${run.from}% of the answers correct to about ${run.to}%.`,
    suggestion: 'It may be worth mentioning at the patient’s next ordinary appointment, along with '
      + 'anything else you have noticed. There is nothing to do differently on the device.',
  };
}

/**
 * The alert for the whole dashboard: every domain judged on its own, because a
 * patient can slip at one game while holding steady at the other, and averaging
 * the two would hide exactly that.
 */
export function declineAlerts(chartReadings) {
  const list = Array.isArray(chartReadings) ? chartReadings : [];
  const all = list.map(({ series, label }) => describeDecline(series, { label }));
  return { any: all.some((one) => one.alert), alerts: all.filter((one) => one.alert), all };
}
