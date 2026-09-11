/**
 * challengeProfiles - what "a harder round" actually means, per game.
 *
 * The existing engine already decides a *tier* (1-3) from the streak. That stays
 * the safety boundary. Inside a tier this module describes the real, tunable
 * properties of a round - how many words, how long they show, how alike the wrong
 * answers are - as a plain data object, and it offers a small set of concrete
 * candidate profiles the game can actually generate at that tier. The AI layer
 * picks among these candidates; it never invents a value outside the tier's
 * bounds, and it never produces a knob the game ignores.
 *
 * Nothing here imports TensorFlow or touches storage: it is the shared vocabulary
 * the model, the selector and the generators all read from, so a profile can be
 * scored, chosen and built without any of them describing difficulty differently.
 *
 * Three domains are personalised on this system today - word_recall,
 * number_sequence and pattern_matching, the three that memorise a small row and
 * so can be generated to spec. memory_recall and routine_matching keep their
 * authored rounds (they draw from a fixed picture/cue set) and fall back to the
 * existing deterministic behaviour; `supportsProfiles()` says which is which.
 */

/** The spec's hard floor: a study screen is never held for less than this. */
export const STUDY_MS_FLOOR = 2000;
/** The window study time is normalised against (floor .. a generous ceiling). */
export const STUDY_MS_CEIL = 6000;

/** Item count is normalised across this range (2 words/digits/shapes .. 5). */
const LOAD_MIN = 2;
const LOAD_MAX = 5;

/** Number-recall modes, easiest to hardest, and how hard each reads to the model. */
export const NUMBER_MODES = ['saw', 'last', 'first', 'second'];
const NUMBER_MODE_HARDNESS = { saw: 0, last: 0.34, first: 0.67, second: 1 };

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

/** A finite number or the given default - the single guard against NaN/undefined. */
export const finiteOr = (value, fallback) => (Number.isFinite(value) ? value : fallback);

/** The four generic difficulty axes every domain maps its own profile onto. */
export const DIFFICULTY_FEATURE_LEN = 4;

const loadNorm = (count) => clamp01((finiteOr(count, LOAD_MIN) - LOAD_MIN) / (LOAD_MAX - LOAD_MIN));
const timePressureNorm = (studyMs) =>
  1 - clamp01((clamp(finiteOr(studyMs, STUDY_MS_CEIL), STUDY_MS_FLOOR, STUDY_MS_CEIL) - STUDY_MS_FLOOR)
    / (STUDY_MS_CEIL - STUDY_MS_FLOOR));

/**
 * A profile -> the four normalised difficulty axes [load, timePressure,
 * distractorSimilarity, recallHardness], each 0..1. This is the only shape the
 * model ever sees for a candidate, so one small network serves all three games.
 */
export function profileFeatures(domain, profile) {
  if (!profile) return new Array(DIFFICULTY_FEATURE_LEN).fill(0.5);
  if (domain === 'word_recall') {
    return [
      loadNorm(profile.wordCount),
      timePressureNorm(profile.studyMs),
      clamp01(finiteOr(profile.distractorSimilarity, 0.3)),
      clamp01((finiteOr(profile.choiceCount, 2) - 2) / 2),
    ];
  }
  if (domain === 'number_sequence') {
    const hardness = NUMBER_MODE_HARDNESS[profile.recallMode] ?? 0;
    return [
      loadNorm(profile.seqLength),
      timePressureNorm(profile.studyMs),
      profile.recallMode === 'saw' ? 0.2 : 0.7,
      clamp01(hardness),
    ];
  }
  if (domain === 'pattern_matching') {
    return [
      loadNorm(profile.rowLength),
      timePressureNorm(profile.studyMs),
      clamp01(finiteOr(profile.similarity, 0.4)),
      clamp01((finiteOr(profile.choiceCount, 2) - 2) / 2),
    ];
  }
  return new Array(DIFFICULTY_FEATURE_LEN).fill(0.5);
}

/** One difficulty scalar 0..1, weighted so item load and distractor similarity
 * count most - used by the heuristic prior, the tie-break and the explanation. */
const DIFFICULTY_WEIGHTS = [0.35, 0.2, 0.3, 0.15];
export function overallDifficulty(features) {
  const f = Array.isArray(features) ? features : [];
  let sum = 0;
  for (let i = 0; i < DIFFICULTY_FEATURE_LEN; i += 1) sum += DIFFICULTY_WEIGHTS[i] * finiteOr(f[i], 0.5);
  return clamp01(sum);
}

/**
 * The authored-equivalent profile for a tier, matching what the fixed rounds do.
 * It is the deterministic default the AI is measured against (harder/easier than
 * this) and the sane thing to build when the AI declines to personalise.
 */
const DEFAULTS = {
  word_recall: {
    1: { wordCount: 2, choiceCount: 2, studyMs: 5000, distractorSimilarity: 0.12 },
    2: { wordCount: 3, choiceCount: 3, studyMs: 4200, distractorSimilarity: 0.18 },
    3: { wordCount: 4, choiceCount: 4, studyMs: 3600, distractorSimilarity: 0.85 },
  },
  number_sequence: {
    1: { seqLength: 2, choiceCount: 2, studyMs: 5000, recallMode: 'saw' },
    2: { seqLength: 3, choiceCount: 3, studyMs: 4200, recallMode: 'last' },
    3: { seqLength: 4, choiceCount: 4, studyMs: 3600, recallMode: 'first' },
  },
  pattern_matching: {
    1: { rowLength: 2, choiceCount: 2, studyMs: 4600, similarity: 0.1 },
    2: { rowLength: 3, choiceCount: 3, studyMs: 3800, similarity: 0.55 },
    3: { rowLength: 4, choiceCount: 4, studyMs: 3200, similarity: 0.9 },
  },
};

/**
 * The candidate profiles offered at each tier, easiest first. Every value sits
 * inside the tier's safety band - counts 2..5 (2..4 for shapes), study time never
 * below the 2000ms floor, at most four choices - so whichever the AI picks is a
 * round the game can honestly build and the elderly UX still allows.
 */
const CANDIDATES = {
  word_recall: {
    1: [
      { wordCount: 2, choiceCount: 2, studyMs: 5200, distractorSimilarity: 0.1 },
      { wordCount: 2, choiceCount: 2, studyMs: 4400, distractorSimilarity: 0.35 },
      { wordCount: 3, choiceCount: 2, studyMs: 4400, distractorSimilarity: 0.35 },
    ],
    2: [
      { wordCount: 3, choiceCount: 3, studyMs: 4600, distractorSimilarity: 0.2 },
      { wordCount: 3, choiceCount: 3, studyMs: 3800, distractorSimilarity: 0.5 },
      { wordCount: 4, choiceCount: 3, studyMs: 3800, distractorSimilarity: 0.5 },
    ],
    3: [
      { wordCount: 4, choiceCount: 4, studyMs: 4000, distractorSimilarity: 0.6 },
      { wordCount: 4, choiceCount: 4, studyMs: 3400, distractorSimilarity: 0.85 },
      { wordCount: 5, choiceCount: 4, studyMs: 3200, distractorSimilarity: 0.85 },
    ],
  },
  number_sequence: {
    1: [
      { seqLength: 2, choiceCount: 2, studyMs: 5200, recallMode: 'saw' },
      { seqLength: 2, choiceCount: 2, studyMs: 4400, recallMode: 'last' },
      { seqLength: 3, choiceCount: 2, studyMs: 4400, recallMode: 'saw' },
    ],
    2: [
      { seqLength: 3, choiceCount: 3, studyMs: 4400, recallMode: 'last' },
      { seqLength: 3, choiceCount: 3, studyMs: 3800, recallMode: 'first' },
      { seqLength: 4, choiceCount: 3, studyMs: 3800, recallMode: 'last' },
    ],
    3: [
      { seqLength: 4, choiceCount: 4, studyMs: 4000, recallMode: 'first' },
      { seqLength: 4, choiceCount: 4, studyMs: 3400, recallMode: 'second' },
      { seqLength: 5, choiceCount: 4, studyMs: 3200, recallMode: 'first' },
    ],
  },
  pattern_matching: {
    1: [
      { rowLength: 2, choiceCount: 2, studyMs: 4800, similarity: 0.1 },
      { rowLength: 2, choiceCount: 2, studyMs: 4000, similarity: 0.4 },
      { rowLength: 3, choiceCount: 2, studyMs: 4000, similarity: 0.3 },
    ],
    2: [
      { rowLength: 3, choiceCount: 3, studyMs: 4000, similarity: 0.5 },
      { rowLength: 3, choiceCount: 3, studyMs: 3400, similarity: 0.7 },
      { rowLength: 4, choiceCount: 3, studyMs: 3400, similarity: 0.6 },
    ],
    3: [
      { rowLength: 4, choiceCount: 4, studyMs: 3600, similarity: 0.7 },
      { rowLength: 4, choiceCount: 4, studyMs: 3000, similarity: 0.9 },
      { rowLength: 4, choiceCount: 4, studyMs: 3000, similarity: 0.95 },
    ],
  },
};

/** True when a domain is personalised on this system (vs authored + deterministic). */
export function supportsProfiles(domain) {
  return Boolean(CANDIDATES[domain]);
}

const tierKey = (tier) => clamp(Math.round(finiteOr(tier, 1)), 1, 3);

/** The authored-equivalent profile for a domain and tier (a fresh copy). */
export function defaultProfile(domain, tier) {
  const byTier = DEFAULTS[domain];
  if (!byTier) return null;
  return { ...byTier[tierKey(tier)] };
}

/** Fresh candidate profiles for a domain and tier, easiest first. */
export function candidateProfiles(domain, tier) {
  const byTier = CANDIDATES[domain];
  if (!byTier) return [];
  return byTier[tierKey(tier)].map((p) => ({ ...p }));
}

/**
 * Clamp any profile back inside the safety band, whatever produced it. The
 * generators still call this so a bad hand-built profile in a test, or a future
 * candidate typo, can never show a 1-word round or a sub-floor study time.
 */
export function clampProfile(domain, profile) {
  if (!profile) return null;
  const studyMs = clamp(Math.round(finiteOr(profile.studyMs, STUDY_MS_CEIL)), STUDY_MS_FLOOR, STUDY_MS_CEIL);
  const choiceCount = clamp(Math.round(finiteOr(profile.choiceCount, 2)), 2, 4);
  if (domain === 'word_recall') {
    return {
      wordCount: clamp(Math.round(finiteOr(profile.wordCount, 2)), 2, 5),
      choiceCount,
      studyMs,
      distractorSimilarity: clamp01(finiteOr(profile.distractorSimilarity, 0.3)),
    };
  }
  if (domain === 'number_sequence') {
    return {
      seqLength: clamp(Math.round(finiteOr(profile.seqLength, 2)), 2, 5),
      choiceCount,
      studyMs,
      recallMode: NUMBER_MODES.includes(profile.recallMode) ? profile.recallMode : 'saw',
    };
  }
  if (domain === 'pattern_matching') {
    return {
      rowLength: clamp(Math.round(finiteOr(profile.rowLength, 2)), 2, 4),
      choiceCount,
      studyMs,
      similarity: clamp01(finiteOr(profile.similarity, 0.4)),
    };
  }
  return { ...profile, studyMs, choiceCount };
}
