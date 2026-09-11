import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTY_FEATURE_LEN,
  NUMBER_MODES,
  STUDY_MS_FLOOR,
  candidateProfiles,
  clampProfile,
  defaultProfile,
  overallDifficulty,
  profileFeatures,
  supportsProfiles,
} from '../src/ai/challengeProfiles.js';
import {
  PATIENT_FEATURE_KEYS,
  PATIENT_FEATURE_LEN,
  RECENT_WINDOW,
  extractPatientFeatures,
  reconstructExamples,
  skillOf,
} from '../src/ai/features.js';
import {
  INPUT_DIM,
  INFLUENCE_RAMP,
  MIN_DATA,
  TARGET_LOW,
  explain,
  heuristicSuccess,
  influenceFor,
  recommendByTier,
  selectProfile,
} from '../src/ai/personalize.js';
import { buildQuestion } from '../src/ai/generators.js';
import {
  PHASE,
  answerQuestion,
  continueSession,
  revealOptions,
  startSession,
} from '../src/lib/sessionEngine.js';
import { WORD_RECALL } from '../src/data/wordRecall.js';
import { localizeQuestion } from '../src/lib/i18n.js';

/**
 * ai.test.js - the personalisation layer with the model left out.
 *
 * Everything here is pure: challenge profiles, feature extraction, candidate
 * scoring/selection and the round generators, plus how they behave when the model
 * is absent (`predict` null) or misbehaving. That is deliberate - the whole point
 * of the design is that the game is fully playable and safe on the heuristic prior
 * alone, so that story has to hold without ever loading TensorFlow. The model
 * itself, and the browser-side controller that owns it, are covered in
 * `aiModel.test.js`.
 */

const DOMAINS = ['word_recall', 'number_sequence', 'pattern_matching'];
const TIERS = [1, 2, 3];

/** Deterministic rand, same LCG the other game tests use, so rounds replay. */
function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** A synthetic answer history: one record per result, timestamps increasing. */
function history(domain, results, { tier = 1, start = 1_000 } = {}) {
  return results.map((correct, i) => ({
    domain,
    questionId: `${domain}-${i}`,
    correct: Boolean(correct),
    difficultyTierEnd: typeof tier === 'function' ? tier(i) : tier,
    timestamp: start + i * 1000,
  }));
}

const featuresOf = (answers, domain, running = null) =>
  extractPatientFeatures(answers, domain, { running });

/* ---- challenge profiles -------------------------------------------------- */

test('supportsProfiles marks exactly the three generated domains', () => {
  for (const d of DOMAINS) assert.equal(supportsProfiles(d), true);
  for (const d of ['memory_recall', 'routine_matching', 'about_me', 'nonsense']) {
    assert.equal(supportsProfiles(d), false);
  }
});

test('every candidate profile sits inside the safety band', () => {
  for (const domain of DOMAINS) {
    for (const tier of TIERS) {
      const candidates = candidateProfiles(domain, tier);
      assert.ok(candidates.length >= 2, `${domain} t${tier} has candidates`);
      for (const p of candidates) {
        assert.ok(p.studyMs >= STUDY_MS_FLOOR, `${domain} t${tier} study >= floor`);
        assert.ok(p.choiceCount >= 2 && p.choiceCount <= 4, `${domain} t${tier} choices 2..4`);
        const count = p.wordCount ?? p.seqLength ?? p.rowLength;
        assert.ok(count >= 2 && count <= 5, `${domain} t${tier} load 2..5`);
      }
    }
  }
});

test('candidates get harder as the tier rises', () => {
  for (const domain of DOMAINS) {
    const byTier = TIERS.map((tier) => {
      const ds = candidateProfiles(domain, tier).map((p) => overallDifficulty(profileFeatures(domain, p)));
      return ds.reduce((a, b) => a + b, 0) / ds.length;
    });
    assert.ok(byTier[1] > byTier[0], `${domain} t2 > t1`);
    assert.ok(byTier[2] > byTier[1], `${domain} t3 > t2`);
  }
});

test('profileFeatures is always four finite numbers in 0..1', () => {
  const samples = [
    ['word_recall', { wordCount: 5, choiceCount: 4, studyMs: 3200, distractorSimilarity: 0.9 }],
    ['number_sequence', { seqLength: 5, choiceCount: 4, studyMs: 3200, recallMode: 'second' }],
    ['pattern_matching', { rowLength: 4, choiceCount: 4, studyMs: 3000, similarity: 0.95 }],
    ['word_recall', null],
    ['unknown_domain', { wordCount: 3 }],
  ];
  for (const [domain, profile] of samples) {
    const f = profileFeatures(domain, profile);
    assert.equal(f.length, DIFFICULTY_FEATURE_LEN);
    for (const x of f) assert.ok(Number.isFinite(x) && x >= 0 && x <= 1);
  }
});

test('clampProfile drags an out-of-band profile back inside the bounds', () => {
  const word = clampProfile('word_recall', { wordCount: 99, choiceCount: 9, studyMs: 50, distractorSimilarity: 5 });
  assert.deepEqual(word, { wordCount: 5, choiceCount: 4, studyMs: STUDY_MS_FLOOR, distractorSimilarity: 1 });

  const num = clampProfile('number_sequence', { seqLength: -3, choiceCount: 0, studyMs: 999999, recallMode: 'bogus' });
  assert.equal(num.seqLength, 2);
  assert.equal(num.choiceCount, 2);
  assert.ok(NUMBER_MODES.includes(num.recallMode));

  const pat = clampProfile('pattern_matching', { rowLength: 12, choiceCount: 4, studyMs: NaN, similarity: -1 });
  assert.ok(pat.rowLength <= 4 && pat.rowLength >= 2);
  assert.ok(Number.isFinite(pat.studyMs) && pat.studyMs >= STUDY_MS_FLOOR);
  assert.equal(pat.similarity, 0);
});

/* ---- feature extraction -------------------------------------------------- */

test('a brand-new patient gets neutral, finite features - never a NaN', () => {
  for (const domain of DOMAINS) {
    const { vector, meta } = featuresOf([], domain);
    assert.equal(vector.length, PATIENT_FEATURE_LEN);
    assert.equal(PATIENT_FEATURE_KEYS.length, PATIENT_FEATURE_LEN);
    for (const x of vector) assert.ok(Number.isFinite(x) && x >= 0 && x <= 1);
    assert.equal(meta.domainCount, 0);
    assert.ok(Number.isFinite(meta.skill));
  }
});

test('garbage rows are ignored rather than poisoning the vector', () => {
  const dirty = [null, undefined, {}, { domain: 'word_recall' }, { timestamp: 'x' }];
  const { vector, meta } = featuresOf(dirty, 'word_recall');
  assert.equal(meta.domainCount, 0);
  for (const x of vector) assert.ok(Number.isFinite(x));
});

test('recent accuracy and trend track the history direction', () => {
  const strong = featuresOf(history('word_recall', Array(10).fill(true)), 'word_recall');
  const weak = featuresOf(history('word_recall', Array(10).fill(false)), 'word_recall');
  assert.ok(strong.meta.domainAccuracy > 0.9);
  assert.ok(weak.meta.domainAccuracy < 0.1);
  assert.ok(strong.meta.skill > weak.meta.skill);

  // Improving over time reads as an upward trend; declining as downward.
  const rising = featuresOf(history('word_recall', [false, false, false, false, true, true, true, true]), 'word_recall');
  const falling = featuresOf(history('word_recall', [true, true, true, true, false, false, false, false]), 'word_recall');
  assert.equal(rising.meta.trendDir, 'up');
  assert.equal(falling.meta.trendDir, 'down');
});

test('the running session tally shifts features within a sitting', () => {
  const base = history('word_recall', [true, true, true, true]);
  const withRun = featuresOf(base, 'word_recall', { asked: 4, correct: 0, streakWrong: 2, streakRight: 0 });
  const noRun = featuresOf(base, 'word_recall');
  // A rough patch this session pulls recent accuracy and the trend down.
  assert.ok(withRun.meta.recentAccuracy < noRun.meta.recentAccuracy);
  assert.ok(withRun.meta.accuracyTrend <= noRun.meta.accuracyTrend);
});

test('volume only reflects the domain asked about', () => {
  const mixed = [
    ...history('word_recall', Array(6).fill(true), { start: 1000 }),
    ...history('number_sequence', Array(6).fill(true), { start: 8000 }),
  ];
  const word = featuresOf(mixed, 'word_recall');
  const pattern = featuresOf(mixed, 'pattern_matching');
  assert.equal(word.meta.domainCount, 6);
  assert.equal(pattern.meta.domainCount, 0);
  assert.equal(word.meta.totalCount, 12);
});

test('skillOf is monotonic in accuracy', () => {
  const low = skillOf([0.1, 0.1, 0.5, 0, 0, 0, 0.5]);
  const mid = skillOf([0.5, 0.5, 0.5, 0, 0, 0, 0.5]);
  const high = skillOf([0.95, 0.95, 0.5, 0, 0, 0, 0.5]);
  assert.ok(low < mid && mid < high);
  for (const s of [low, mid, high]) assert.ok(s >= 0 && s <= 1);
});

/* ---- training-row reconstruction ----------------------------------------- */

test('reconstructExamples is empty with no domain history', () => {
  assert.deepEqual(reconstructExamples([], 'word_recall'), []);
  assert.deepEqual(reconstructExamples(history('number_sequence', [true]), 'word_recall'), []);
});

test('reconstructExamples builds model-shaped rows from prior state only', () => {
  const answers = history('word_recall', [true, false, true, true], { tier: (i) => 1 + (i % 3) });
  const examples = reconstructExamples(answers, 'word_recall');
  assert.equal(examples.length, answers.length);
  examples.forEach((ex, i) => {
    assert.equal(ex.x.length, INPUT_DIM);
    for (const v of ex.x) assert.ok(Number.isFinite(v) && v >= 0 && v <= 1);
    assert.equal(ex.y, answers[i].correct ? 1 : 0);
  });
  // The first row is built from an empty prior (no peeking at its own outcome):
  // its patient half equals the brand-new-patient vector.
  const neutral = featuresOf([], 'word_recall').vector;
  assert.deepEqual(examples[0].x.slice(0, PATIENT_FEATURE_LEN), neutral);
});

/* ---- heuristic prior, influence ramp ------------------------------------- */

test('heuristicSuccess rises with skill and falls with difficulty', () => {
  assert.ok(heuristicSuccess(0.9, 0.3) > heuristicSuccess(0.5, 0.3));
  assert.ok(heuristicSuccess(0.5, 0.3) > heuristicSuccess(0.5, 0.8));
  for (const s of [0, 0.5, 1]) for (const d of [0, 0.5, 1]) {
    const p = heuristicSuccess(s, d);
    assert.ok(p >= 0 && p <= 1);
  }
  // A matched skill/difficulty sits in the "challenging but achievable" band.
  assert.ok(heuristicSuccess(0.5, 0.5) > 0.5 && heuristicSuccess(0.5, 0.5) < 0.8);
});

test('influence is zero until MIN_DATA and ramps to one', () => {
  for (let n = 0; n < MIN_DATA; n += 1) assert.equal(influenceFor(n), 0);
  assert.ok(influenceFor(MIN_DATA + 1) > 0);
  assert.ok(influenceFor(MIN_DATA + Math.floor(INFLUENCE_RAMP / 2)) < 1);
  assert.equal(influenceFor(MIN_DATA + INFLUENCE_RAMP), 1);
  assert.equal(influenceFor(9999), 1);
  assert.equal(influenceFor(NaN), 0);
});

/* ---- selection ----------------------------------------------------------- */

test('selection stays in the tier and aims for the achievable band', () => {
  const features = featuresOf(history('word_recall', Array(12).fill(true)), 'word_recall');
  for (const tier of TIERS) {
    const sel = selectProfile({ domain: 'word_recall', tier, features });
    const allowed = candidateProfiles('word_recall', tier).map((p) => JSON.stringify(p));
    assert.ok(allowed.includes(JSON.stringify(sel.profile)), `t${tier} picks a real candidate`);
    assert.ok(sel.success >= 0 && sel.success <= 1);
  }
});

test('a strong player is pushed at least as hard as a struggling one', () => {
  const strong = featuresOf(history('word_recall', Array(12).fill(true)), 'word_recall');
  const weak = featuresOf(history('word_recall', Array(12).fill(false)), 'word_recall');
  for (const tier of TIERS) {
    const s = selectProfile({ domain: 'word_recall', tier, features: strong });
    const w = selectProfile({ domain: 'word_recall', tier, features: weak });
    assert.ok(s.difficulty >= w.difficulty - 1e-9, `t${tier}: strong >= weak difficulty`);
    assert.notEqual(s.direction, 'easier');
    assert.notEqual(w.direction, 'harder');
  }
});

test('with no model the prior alone still picks a round for every tier', () => {
  const features = featuresOf([], 'number_sequence');
  const rec = recommendByTier({ domain: 'number_sequence', features, predict: null, influence: 0 });
  for (const tier of TIERS) {
    assert.ok(rec.byTier[tier].profile, `t${tier} has a profile`);
  }
  assert.equal(rec.usedModel, false);
});

test('a model that throws or returns garbage degrades to the prior, never throws', () => {
  const features = featuresOf(history('word_recall', Array(20).fill(true)), 'word_recall');
  const priorOnly = selectProfile({ domain: 'word_recall', tier: 2, features, predict: null, influence: 0 });

  const thrower = () => { throw new Error('backend gone'); };
  const garbage = () => ['not', 'numbers'];
  const wrongLen = () => [0.5];
  for (const predict of [thrower, garbage, wrongLen]) {
    const sel = selectProfile({ domain: 'word_recall', tier: 2, features, predict, influence: 1 });
    assert.equal(sel.usedModel, false);
    assert.deepEqual(sel.profile, priorOnly.profile);
  }
});

test('influence blends the model in: a high-scoring model can push harder', () => {
  const features = featuresOf(history('word_recall', Array(12).fill(false)), 'word_recall');
  const optimistic = (rows) => rows.map(() => 0.99); // model thinks everything is easy
  const prior = selectProfile({ domain: 'word_recall', tier: 3, features, predict: null, influence: 0 });
  const blended = selectProfile({ domain: 'word_recall', tier: 3, features, predict: optimistic, influence: 1 });
  assert.equal(blended.usedModel, true);
  assert.ok(blended.success > prior.success);
  // Still a real, in-band candidate - the model cannot escape the tier.
  const allowed = candidateProfiles('word_recall', 3).map((p) => JSON.stringify(p));
  assert.ok(allowed.includes(JSON.stringify(blended.profile)));
});

test('an unsupported domain yields a null profile (the fall-back signal)', () => {
  const features = featuresOf([], 'memory_recall');
  const sel = selectProfile({ domain: 'memory_recall', tier: 1, features });
  assert.equal(sel.profile, null);
  assert.equal(sel.usedModel, false);
});

/* ---- explanations -------------------------------------------------------- */

test('the explanation is grounded, honest, and empty for a standard round', () => {
  const def = defaultProfile('word_recall', 2);
  assert.equal(explain('word_recall', def, def, { domainAccuracy: 0.9 }, 'matched'), '');

  const harder = { ...def, wordCount: def.wordCount + 1 };
  const note = explain('word_recall', harder, def, { domainAccuracy: 0.9 }, 'harder');
  assert.match(note, /\d+ words/);
  assert.doesNotMatch(note, /AI|algorithm|model|neural/i);

  const easier = { ...def, studyMs: def.studyMs + 800 };
  const gentle = explain('word_recall', easier, def, { trendDir: 'down' }, 'easier');
  assert.ok(gentle.length > 0);
  assert.doesNotMatch(gentle, /AI|algorithm|model|neural/i);
});

/* ---- generators produce engine-valid rounds ------------------------------ */

/** Assert a generated question obeys every invariant the engine relies on. */
function assertPlayable(q, { expectCards } = {}) {
  assert.ok(q, 'question built');
  assert.ok(Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 4);
  const ids = q.options.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length, 'option ids unique');
  assert.equal(q.options.filter((o) => o.id === q.answerId).length, 1, 'exactly one correct option');
  assert.ok(q.studyMs >= STUDY_MS_FLOOR, 'study time >= floor');
  assert.ok(Array.isArray(q.studyCards) && q.studyCards.length >= 2, 'has a study row');
  const cardIds = q.studyCards.map((c) => c.id);
  assert.equal(new Set(cardIds).size, cardIds.length, 'study card ids unique');
  if (expectCards != null) assert.equal(q.studyCards.length, expectCards);
  assert.ok(q.studyItem === null, 'generated rounds memorise a row, not a picture');
}

test('word rounds are built to spec and are engine-valid', () => {
  const rand = seeded(3);
  for (const distractorSimilarity of [0.1, 0.85]) {
    const q = buildQuestion('word_recall',
      { wordCount: 4, choiceCount: 4, studyMs: 3600, distractorSimilarity }, 3, { rand, seq: 1 });
    assertPlayable(q, { expectCards: 4 });
    assert.equal(q.options.length, 4);
    assert.match(q.studyPrompt, /^Remember these words:/);
  }
});

test('number rounds honour recall mode and carry it onto the question', () => {
  const rand = seeded(5);
  const saw = buildQuestion('number_sequence',
    { seqLength: 3, choiceCount: 3, studyMs: 4200, recallMode: 'saw' }, 1, { rand, seq: 1 });
  assertPlayable(saw, { expectCards: 3 });
  assert.equal(saw.recallMode, 'saw');
  assert.match(saw.prompt, /just see/);

  const ordered = buildQuestion('number_sequence',
    { seqLength: 4, choiceCount: 4, studyMs: 3600, recallMode: 'first' }, 3, { rand, seq: 2 });
  assertPlayable(ordered, { expectCards: 4 });
  assert.equal(ordered.recallMode, 'first');
  // In an order question, the answer is one of the digits actually shown.
  const shown = ordered.studyCards.map((c) => Number(c.text));
  const answerDigit = Number(ordered.answerId.replace('n-', ''));
  assert.ok(shown.includes(answerDigit));
});

test('pattern rounds are built to spec and are engine-valid', () => {
  const rand = seeded(9);
  for (const similarity of [0.1, 0.95]) {
    const q = buildQuestion('pattern_matching',
      { rowLength: 3, choiceCount: 3, studyMs: 3400, similarity }, 2, { rand, seq: 1 });
    assertPlayable(q, { expectCards: 3 });
    assert.equal(q.options.length, 3);
    for (const opt of q.options) assert.ok(Array.isArray(opt.cards) && opt.cards.length === 3);
  }
});

test('Words and Numbers move on several dimensions at once', () => {
  const rand = seeded(11);
  // Three word profiles that differ in count, choices and study time.
  const w1 = buildQuestion('word_recall', { wordCount: 2, choiceCount: 2, studyMs: 5200, distractorSimilarity: 0.1 }, 1, { rand, seq: 1 });
  const w2 = buildQuestion('word_recall', { wordCount: 3, choiceCount: 3, studyMs: 4200, distractorSimilarity: 0.2 }, 2, { rand, seq: 2 });
  const w3 = buildQuestion('word_recall', { wordCount: 5, choiceCount: 4, studyMs: 3200, distractorSimilarity: 0.85 }, 3, { rand, seq: 3 });
  const cards = [w1, w2, w3].map((q) => q.studyCards.length);
  const choices = [w1, w2, w3].map((q) => q.options.length);
  const times = [w1, w2, w3].map((q) => q.studyMs);
  assert.deepEqual(cards, [2, 3, 5]);
  assert.deepEqual(choices, [2, 3, 4]);
  assert.ok(times[0] > times[1] && times[1] > times[2]);

  // Number recall mode changes what is asked; length changes the row.
  const nSaw = buildQuestion('number_sequence', { seqLength: 2, choiceCount: 2, studyMs: 5000, recallMode: 'saw' }, 1, { rand, seq: 4 });
  const nFirst = buildQuestion('number_sequence', { seqLength: 4, choiceCount: 4, studyMs: 3400, recallMode: 'first' }, 3, { rand, seq: 5 });
  assert.notEqual(nSaw.prompt, nFirst.prompt);
  assert.equal(nSaw.studyCards.length, 2);
  assert.equal(nFirst.studyCards.length, 4);
});

test('generation is deterministic for a fixed seed and profile', () => {
  const profile = { wordCount: 3, choiceCount: 3, studyMs: 4000, distractorSimilarity: 0.5 };
  const a = buildQuestion('word_recall', profile, 2, { rand: seeded(42), seq: 1 });
  const b = buildQuestion('word_recall', profile, 2, { rand: seeded(42), seq: 1 });
  assert.deepEqual(a, b);
});

test('buildQuestion returns null for an unsupported domain', () => {
  assert.equal(buildQuestion('memory_recall', { wordCount: 3 }, 1, { rand: seeded() }), null);
  assert.equal(buildQuestion('routine_matching', {}, 1, { rand: seeded() }), null);
});

test('the number Assamese prompt follows the round recall mode', () => {
  const rand = seeded(13);
  const first = buildQuestion('number_sequence', { seqLength: 4, choiceCount: 4, studyMs: 3600, recallMode: 'first' }, 3, { rand, seq: 1 });
  const second = buildQuestion('number_sequence', { seqLength: 4, choiceCount: 4, studyMs: 3600, recallMode: 'second' }, 3, { rand, seq: 2 });
  const bank = { domain: 'number_sequence' };
  const pFirst = localizeQuestion(bank, first, 'as').prompt;
  const pSecond = localizeQuestion(bank, second, 'as').prompt;
  assert.notEqual(pFirst, pSecond);
  // English is a pass-through of what the generator wrote.
  assert.equal(localizeQuestion(bank, first, 'en').prompt, first.prompt);
});

/* ---- the engine plays generated rounds, and falls back cleanly ----------- */

/** A nextQuestion hook driven by the prior-only recommendation for a history. */
function priorHook(domain, answers, rand) {
  let seq = 0;
  const features = featuresOf(answers, domain);
  const rec = recommendByTier({ domain, features, predict: null, influence: 0 });
  return ({ tier }) => {
    const sel = rec.byTier[tier];
    if (!sel || !sel.profile) return null;
    seq += 1;
    return buildQuestion(domain, sel.profile, tier, { rand, seq });
  };
}

test('a full session plays entirely on AI-generated rounds', () => {
  const rand = seeded(21);
  const answers = history('word_recall', Array(12).fill(true));
  const nextQuestion = priorHook('word_recall', answers, rand);

  let state = startSession({ bank: WORD_RECALL, tier: 1, now: 0, rand, nextQuestion });
  assert.ok(state.question.id.startsWith('wr-ai'), 'first round is AI-generated');
  let clock = 0;
  let guard = 0;
  while (state.phase !== PHASE.DONE && guard < 50) {
    guard += 1;
    if (state.phase === PHASE.STUDY) state = revealOptions(state);
    if (state.phase === PHASE.ASK) {
      clock += 4000;
      state = answerQuestion(state, state.question.answerId, clock).state;
    }
    if (state.phase === PHASE.FEEDBACK || state.phase === PHASE.TIER) {
      state = continueSession(state, { bank: WORD_RECALL, now: clock, rand, nextQuestion });
    }
  }
  assert.equal(state.phase, PHASE.DONE);
  assert.equal(state.endReason, 'complete');
  assert.equal(state.asked, state.maxQuestions);
});

test('when the hook declines, the engine falls back to authored rounds', () => {
  const rand = seeded(1);
  const decline = () => null;
  const state = startSession({ bank: WORD_RECALL, tier: 1, now: 0, rand, nextQuestion: decline });
  // The authored bank supplied the round, not the generator.
  assert.ok(!state.question.id.startsWith('wr-ai'));
  assert.ok(WORD_RECALL.questions.some((q) => q.id === state.question.id));
});

test('a throwing hook can never break the game loop', () => {
  const rand = seeded(2);
  const boom = () => { throw new Error('hook blew up'); };
  const state = startSession({ bank: WORD_RECALL, tier: 1, now: 0, rand, nextQuestion: boom });
  assert.ok(state.question, 'still got a question');
  assert.ok(WORD_RECALL.questions.some((q) => q.id === state.question.id));
});

test('the AI never changes the tier - it only fills the tier it is given', () => {
  const rand = seeded(4);
  const seen = [];
  const nextQuestion = ({ tier }) => {
    seen.push(tier);
    return buildQuestion('word_recall', defaultProfile('word_recall', tier), tier, { rand, seq: seen.length });
  };
  let state = startSession({ bank: WORD_RECALL, tier: 1, now: 0, rand, nextQuestion });
  // Answer wrong twice: the engine (not the hook) must drop the tier.
  let clock = 0;
  for (let i = 0; i < 2; i += 1) {
    if (state.phase === PHASE.STUDY) state = revealOptions(state);
    const wrong = state.question.options.find((o) => o.id !== state.question.answerId).id;
    clock += 4000;
    state = answerQuestion(state, wrong, clock).state;
    state = continueSession(state, { bank: WORD_RECALL, now: clock, rand, nextQuestion });
  }
  assert.ok(seen.every((t) => t >= 1 && t <= 3), 'hook only ever asked for tiers 1..3');
  assert.ok(state.tier < 1 + 1 || state.phase === PHASE.TIER, 'tier eased after two wrong');
});
