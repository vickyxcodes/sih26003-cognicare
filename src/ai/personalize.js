/**
 * personalize - choose the round, and say why, without ever leaving the tier.
 *
 * Given the patient-state vector, the candidate profiles for the current tier and
 * a `predict` function (the TensorFlow model, injected so this file stays pure and
 * fully testable), this scores each candidate's chance of success and picks the
 * one that is challenging but achievable - the hardest candidate the patient is
 * still likely to get right, not simply the hardest candidate.
 *
 * Two things keep it safe:
 *   - the model's estimate is *blended* with a plain heuristic prior, weighted by
 *     how much this patient has actually played (`influence`). A brand-new patient
 *     is driven by the prior; the model only takes over once there is data to
 *     trust. If the model is missing, throws, or returns a non-finite number, the
 *     prior stands in and a round is still chosen.
 *   - every candidate is already inside the tier's bounds (see challengeProfiles),
 *     so no selection here can exceed the existing deterministic difficulty.
 *
 * When no candidate can be scored at all, or the domain is not one we personalise,
 * `selectProfile` returns a null profile - the caller's signal to fall back to the
 * authored, deterministic round.
 */
import {
  candidateProfiles,
  clamp01,
  defaultProfile,
  finiteOr,
  overallDifficulty,
  profileFeatures,
  supportsProfiles,
} from './challengeProfiles.js';
import { PATIENT_FEATURE_LEN, skillOf } from './features.js';
import { DIFFICULTY_FEATURE_LEN } from './challengeProfiles.js';

export const INPUT_DIM = PATIENT_FEATURE_LEN + DIFFICULTY_FEATURE_LEN;

/** The success band we aim a round into: challenging, but likely to be got right. */
export const TARGET_LOW = 0.6;
export const TARGET = 0.72;

/** How the model's say grows with data: nothing under 6 domain answers, full by ~24. */
export const MIN_DATA = 6;
export const INFLUENCE_RAMP = 18;

const HEUR_K = 4;
const HEUR_BIAS = 0.62;

/** A plain prior: the more a patient's skill exceeds a round's difficulty, the more
 * likely success. Matched skill/difficulty sits around 0.65 - a good target. */
export function heuristicSuccess(skill, difficulty) {
  const z = HEUR_K * (clamp01(skill) - clamp01(difficulty)) + HEUR_BIAS;
  return clamp01(1 / (1 + Math.exp(-z)));
}

/** The model's influence, 0..1, from how many domain answers exist. */
export function influenceFor(domainCount) {
  const n = finiteOr(domainCount, 0);
  if (n < MIN_DATA) return 0;
  return clamp01((n - MIN_DATA) / INFLUENCE_RAMP);
}

const maxBy = (list, score) => list.reduce((best, item) => (score(item) > score(best) ? item : best), list[0]);

/**
 * Score every candidate and pick one. `predict(rows)` may be null (no model yet);
 * it must return one probability per row or null/garbage, all of which degrade to
 * the heuristic prior rather than throwing.
 */
export function selectProfile({ domain, tier, features, predict = null, influence = 0 }) {
  if (!supportsProfiles(domain)) return { profile: null, usedModel: false };
  const candidates = candidateProfiles(domain, tier);
  if (!candidates.length) return { profile: null, usedModel: false };

  const patientVec = features?.vector || [];
  const skill = features?.meta?.skill ?? skillOf(patientVec);
  const diffFeatures = candidates.map((p) => profileFeatures(domain, p));
  const rows = diffFeatures.map((df) => [...patientVec, ...df]);

  let modelOut = null;
  if (predict && influence > 0) {
    try {
      const out = predict(rows);
      if (Array.isArray(out) && out.length === rows.length) modelOut = out;
    } catch {
      modelOut = null;
    }
  }

  let anyModel = false;
  const scored = candidates.map((profile, i) => {
    const difficulty = overallDifficulty(diffFeatures[i]);
    const prior = heuristicSuccess(skill, difficulty);
    const m = modelOut ? Number(modelOut[i]) : NaN;
    const useM = Number.isFinite(m) && m >= 0 && m <= 1;
    if (useM) anyModel = true;
    const success = useM ? clamp01(influence * m + (1 - influence) * prior) : prior;
    return { profile, difficulty, success };
  });

  // Prefer the hardest candidate still likely to be got right; if none clears the
  // floor, the one most likely to succeed (the gentlest). Never just "the hardest".
  const inBand = scored.filter((s) => s.success >= TARGET_LOW);
  const chosen = inBand.length ? maxBy(inBand, (s) => s.difficulty) : maxBy(scored, (s) => s.success);

  const def = defaultProfile(domain, tier);
  const defDifficulty = overallDifficulty(profileFeatures(domain, def));
  const eps = 0.04;
  const direction = chosen.difficulty > defDifficulty + eps
    ? 'harder'
    : chosen.difficulty < defDifficulty - eps
      ? 'easier'
      : 'matched';

  return {
    profile: chosen.profile,
    difficulty: chosen.difficulty,
    success: chosen.success,
    direction,
    usedModel: anyModel,
    note: explain(domain, chosen.profile, def, features?.meta, direction),
    candidates: scored,
  };
}

/** A recommendation for every tier, so a mid-session tier change has one ready. */
export function recommendByTier({ domain, features, predict = null, influence = 0 }) {
  const byTier = {};
  let usedModel = false;
  for (const tier of [1, 2, 3]) {
    const sel = selectProfile({ domain, tier, features, predict, influence });
    byTier[tier] = sel;
    usedModel = usedModel || sel.usedModel;
  }
  return { byTier, usedModel };
}

/**
 * A warm, jargon-free sentence built from the *actual* chosen profile against the
 * standard round and the patient's measured recent play - never a canned "AI
 * analysed you". Returns '' when the round is the standard one (nothing to say).
 */
export function explain(domain, profile, def, meta, direction) {
  if (!profile || direction === 'matched') return '';
  const clause = profileClause(domain, profile, def, direction);
  if (direction === 'harder') {
    const why = meta && meta.domainAccuracy >= 0.75
      ? 'Your recent answers have been strong, so'
      : 'You have been doing well, so';
    return `${why} this round ${clause}.`;
  }
  const why = meta && meta.trendDir === 'down'
    ? 'The last few rounds looked tricky, so'
    : 'To keep things comfortable,';
  return `${why} this round ${clause}.`;
}

/** The concrete, game-specific half of the sentence, from real profile fields. */
function profileClause(domain, profile, def, direction) {
  const harder = direction === 'harder';
  if (domain === 'word_recall') {
    if (profile.wordCount !== def.wordCount) {
      return harder ? `shows ${profile.wordCount} words to remember` : `shows just ${profile.wordCount} words`;
    }
    if (profile.distractorSimilarity > def.distractorSimilarity + 0.1) return 'has choices that look more alike';
    return harder ? 'shows the words for a little less time' : 'keeps the words on screen a little longer';
  }
  if (domain === 'number_sequence') {
    if (profile.seqLength !== def.seqLength) {
      return harder ? `uses a longer run of ${profile.seqLength} numbers` : `uses a shorter run of ${profile.seqLength} numbers`;
    }
    if (profile.recallMode !== def.recallMode) {
      return harder ? 'asks about the order, not just what you saw' : 'just asks which number you saw';
    }
    return harder ? 'shows the numbers a little more briefly' : 'shows the numbers a little longer';
  }
  if (domain === 'pattern_matching') {
    if (profile.rowLength !== def.rowLength) {
      return harder ? `uses a longer row of ${profile.rowLength} shapes` : `uses a shorter row of ${profile.rowLength} shapes`;
    }
    if (profile.similarity > def.similarity + 0.1) return 'has patterns that look more alike';
    return harder ? 'shows the pattern a little more briefly' : 'shows the pattern a little longer';
  }
  return harder ? 'is a little more challenging' : 'is a little gentler';
}
