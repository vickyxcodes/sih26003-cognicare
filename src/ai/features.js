/**
 * features - turn gameplay history into the numbers the model reads.
 *
 * Two jobs, both pure and both defended against empty or broken data:
 *
 *   extractPatientFeatures  the patient's current "state" as a fixed-length,
 *                           all-in-0..1 vector - recent accuracy, this game's
 *                           accuracy, whether it is trending up or down, how much
 *                           they have played, and so on. A brand-new patient with
 *                           no history gets sensible neutral defaults, never a NaN.
 *
 *   reconstructExamples     training rows built from the answers already in the
 *                           store: for each past answer, the patient state *before*
 *                           it and the difficulty of that round, labelled with
 *                           whether it was right. This is how the model learns an
 *                           individual from data the app was already keeping.
 *
 * Only gameplay/performance is used. Nothing from the About Me profile (name, age,
 * city, family, favourites, contacts) is read here or anywhere in this layer - that
 * data personalises *content*, and is deliberately not a predictor of ability.
 */
import {
  clamp01,
  defaultProfile,
  finiteOr,
  profileFeatures,
} from './challengeProfiles.js';

/** How many of the most recent answers count as "recent". */
export const RECENT_WINDOW = 12;
/** The vector the model reads. Order is fixed; see the keys below. */
export const PATIENT_FEATURE_LEN = 7;
export const PATIENT_FEATURE_KEYS = [
  'domainAccuracy',
  'recentAccuracy',
  'accuracyTrend',
  'recentMistakes',
  'volume',
  'avgTier',
  'responseTime',
];

/** Neutral state for someone we have never seen play: assume a moderate player. */
const NEUTRAL = {
  domainAccuracy: 0.6,
  recentAccuracy: 0.6,
  accuracyTrend: 0.5,
  recentMistakes: 0,
  volume: 0,
  avgTier: 0,
  responseTime: 0.5,
};

const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);
const isAnswer = (r) => r && typeof r === 'object' && Number.isFinite(r.timestamp);
const asBit = (r) => (r.correct ? 1 : 0);

/**
 * Fold an in-progress session's running tally into a history-derived accuracy, so
 * personalisation responds within a single session and not only across sessions.
 */
function blendRunning(histAcc, histN, running) {
  if (!running || !Number.isFinite(running.asked) || running.asked <= 0) return histAcc;
  const runAcc = clamp01((running.correct || 0) / running.asked);
  const n = Math.min(histN, RECENT_WINDOW);
  return clamp01((histAcc * n + runAcc * running.asked) / (n + running.asked));
}

/**
 * The patient-state vector plus a small `meta` the UI and explanations can read.
 * `answers` is the raw answer history (any domains); `domain` scopes the
 * game-specific parts. `running` (optional) is the current session's tally.
 */
export function extractPatientFeatures(answers, domain, { running = null } = {}) {
  const all = (Array.isArray(answers) ? answers : []).filter(isAnswer);
  const domainRows = all.filter((r) => r.domain === domain);
  const recentAll = all.slice(-RECENT_WINDOW);
  const recentDomain = domainRows.slice(-RECENT_WINDOW);

  const histDomainAcc = finiteOr(mean(recentDomain.map(asBit)), NEUTRAL.domainAccuracy);
  const histRecentAcc = finiteOr(mean(recentAll.map(asBit)), NEUTRAL.recentAccuracy);

  const domainAccuracy = blendRunning(histDomainAcc, recentDomain.length, running);
  const recentAccuracy = blendRunning(histRecentAcc, recentAll.length, running);

  // Trend: newer half vs older half of this game's recent answers. Needs a little
  // history to mean anything, so it stays neutral until there are four rounds.
  let accuracyTrend = NEUTRAL.accuracyTrend;
  if (recentDomain.length >= 4) {
    const half = Math.floor(recentDomain.length / 2);
    const older = mean(recentDomain.slice(0, half).map(asBit));
    const newer = mean(recentDomain.slice(half).map(asBit));
    if (older != null && newer != null) accuracyTrend = clamp01(0.5 + (newer - older) / 2);
  }
  if (running && Number.isFinite(running.streakWrong) && running.streakWrong >= 2) accuracyTrend = clamp01(accuracyTrend - 0.15);
  if (running && Number.isFinite(running.streakRight) && running.streakRight >= 3) accuracyTrend = clamp01(accuracyTrend + 0.15);

  const wrongRecent = recentDomain.filter((r) => !r.correct).length + (running ? Math.max(0, (running.asked || 0) - (running.correct || 0)) : 0);
  const recentMistakes = clamp01(wrongRecent / RECENT_WINDOW);

  const volume = clamp01((domainRows.length + (running?.asked || 0)) / 24);

  const tierMean = mean(recentDomain.map((r) => finiteOr(r.difficultyTierEnd, 1)));
  const avgTier = clamp01(((tierMean == null ? 1 : tierMean) - 1) / 2);

  const meta = {
    domainCount: domainRows.length,
    totalCount: all.length,
    domainAccuracy,
    recentAccuracy,
    accuracyTrend,
    trendDir: accuracyTrend > 0.58 ? 'up' : accuracyTrend < 0.42 ? 'down' : 'steady',
  };
  const values = {
    domainAccuracy,
    recentAccuracy,
    accuracyTrend,
    recentMistakes,
    volume,
    avgTier,
    responseTime: NEUTRAL.responseTime,
  };
  const vector = PATIENT_FEATURE_KEYS.map((k) => clamp01(finiteOr(values[k], NEUTRAL[k])));
  meta.skill = skillOf(vector);
  return { vector, meta };
}

/**
 * One skill scalar 0..1 from the patient vector - accuracy-led, with a small trend
 * nudge. Used by the heuristic prior (bootstrap and fallback) and the explanation.
 */
export function skillOf(vector) {
  const [domainAccuracy, recentAccuracy, accuracyTrend] = vector;
  return clamp01(0.6 * domainAccuracy + 0.25 * recentAccuracy + 0.15 * accuracyTrend);
}

/** How many past answers to train on at most - a per-user model, not a dataset. */
export const MAX_TRAIN_EXAMPLES = 120;

/**
 * Training rows from the answers already stored. For each answer, the patient
 * state built only from what came *before* it (no peeking at the outcome) joined
 * to the difficulty of that round, labelled with whether it was correct.
 *
 * The stored answers record a tier, not a full profile, so the round's difficulty
 * is taken from that tier's authored-equivalent profile. That is enough to teach
 * the model this individual's success-vs-difficulty curve; the model's ability to
 * score in-between candidate profiles comes from its generic pretraining.
 */
export function reconstructExamples(answers, domain) {
  const all = (Array.isArray(answers) ? answers : []).filter(isAnswer);
  const domainRows = all.filter((r) => r.domain === domain);
  if (!domainRows.length) return [];
  const examples = [];
  for (let i = 0; i < domainRows.length; i += 1) {
    const priorAll = all.filter((r) => r.timestamp < domainRows[i].timestamp);
    const { vector } = extractPatientFeatures(priorAll, domain);
    const tier = finiteOr(domainRows[i].difficultyTierEnd, 1);
    const diff = profileFeatures(domain, defaultProfile(domain, tier));
    examples.push({ x: [...vector, ...diff], y: domainRows[i].correct ? 1 : 0 });
  }
  return examples.slice(-MAX_TRAIN_EXAMPLES);
}
