import test from 'node:test';
import assert from 'node:assert/strict';
import * as tf from '@tensorflow/tfjs';
import {
  MODEL_STORE,
  createModel,
  disposeModel,
  loadModel,
  predictBatch,
  pretrain,
  saveModel,
  trainOnExamples,
} from '../src/ai/model.js';
import { INPUT_DIM } from '../src/ai/personalize.js';
import { PATIENT_FEATURE_LEN } from '../src/ai/features.js';
import { DIFFICULTY_FEATURE_LEN } from '../src/ai/challengeProfiles.js';
import { createPersonalizer } from '../src/ai/personalizer.js';
import { PHASE, answerQuestion, continueSession, revealOptions, startSession } from '../src/lib/sessionEngine.js';
import { WORD_RECALL } from '../src/data/wordRecall.js';

/**
 * aiModel.test.js - the part that actually loads TensorFlow.js.
 *
 * This is the on-device model and the controller that owns it, run under Node with
 * the CPU backend. It proves the network is the right shape, that it only ever
 * hands back finite probabilities, that it learns the plain prior from pretraining
 * and then bends toward a patient's own examples, and - crucially - that every
 * storage and lifecycle path degrades to a value rather than a throw, since a
 * model failure must never reach the person playing.
 *
 * IndexedDB does not exist in Node, so the real save/load path here exercises the
 * graceful-failure branch (save -> false, load -> null); a genuine round-trip is
 * proven separately through in-memory IO handlers, which use the same tfjs
 * serialisation the browser store does.
 */

const STRONG_EASY = [0.95, 0.95, 0.6, 0, 0.5, 0.5, 0.5, 0.1, 0.1, 0.1, 0.1];
const WEAK_HARD = [0.05, 0.05, 0.4, 0.8, 0.2, 0.5, 0.5, 0.9, 0.9, 0.9, 0.9];

/** A store stub with just the async read the personalizer uses. */
const storeOf = (answers = []) => ({ answers: async () => answers });

/** Synthetic word-recall history: `n` answers, timestamps increasing. */
function wordHistory(n, correct = true) {
  return Array.from({ length: n }, (_, i) => ({
    domain: 'word_recall',
    questionId: `wr-${i}`,
    correct: typeof correct === 'function' ? correct(i) : correct,
    difficultyTierEnd: 1 + (i % 3),
    timestamp: 1000 + i * 1000,
  }));
}

/* ---- the network --------------------------------------------------------- */

test('createModel has the documented 11-input shape', () => {
  assert.equal(INPUT_DIM, PATIENT_FEATURE_LEN + DIFFICULTY_FEATURE_LEN);
  assert.equal(INPUT_DIM, 11);
  const model = createModel();
  try {
    assert.deepEqual(model.inputs[0].shape, [null, INPUT_DIM]);
    assert.deepEqual(model.outputs[0].shape, [null, 1]);
  } finally {
    disposeModel(model);
  }
});

test('predictBatch returns one finite probability per row, and [] for none', () => {
  const model = createModel();
  try {
    const out = predictBatch(model, [STRONG_EASY, WEAK_HARD]);
    assert.equal(out.length, 2);
    for (const p of out) assert.ok(Number.isFinite(p) && p >= 0 && p <= 1);
    assert.deepEqual(predictBatch(model, []), []);
    assert.deepEqual(predictBatch(model, null), []);
    assert.deepEqual(predictBatch(null, [STRONG_EASY]), []);
  } finally {
    disposeModel(model);
  }
});

test('pretraining teaches the prior: strong+easy beats weak+hard', async () => {
  const model = createModel();
  try {
    await pretrain(model, { rows: 200, epochs: 25 });
    const [easy, hard] = predictBatch(model, [STRONG_EASY, WEAK_HARD]);
    assert.ok(Number.isFinite(easy) && Number.isFinite(hard));
    assert.ok(easy > hard, `expected ${easy} > ${hard}`);
  } finally {
    disposeModel(model);
  }
});

test('trainOnExamples is a safe no-op on empty input', async () => {
  const model = createModel();
  try {
    const same = await trainOnExamples(model, []);
    assert.equal(same, model);
    await trainOnExamples(model, null); // must not throw
  } finally {
    disposeModel(model);
  }
});

test('trainOnExamples learns a separable signal from a fresh model', async () => {
  const model = createModel(); // no pretrain: starts near 0.5 everywhere
  try {
    const examples = [];
    for (let i = 0; i < 24; i += 1) {
      examples.push({ x: STRONG_EASY, y: 1 });
      examples.push({ x: WEAK_HARD, y: 0 });
    }
    await trainOnExamples(model, examples, { epochs: 60 });
    const [easy, hard] = predictBatch(model, [STRONG_EASY, WEAK_HARD]);
    assert.ok(easy > 0.5 && hard < 0.5, `learned separation: easy=${easy} hard=${hard}`);
  } finally {
    disposeModel(model);
  }
});

test('fine-tuning bends a pretrained model further toward the patient examples', async () => {
  const model = createModel();
  try {
    await pretrain(model, { rows: 120, epochs: 12 });
    const before = predictBatch(model, [STRONG_EASY, WEAK_HARD]);
    const examples = [];
    for (let i = 0; i < 20; i += 1) {
      examples.push({ x: STRONG_EASY, y: 1 });
      examples.push({ x: WEAK_HARD, y: 0 });
    }
    await trainOnExamples(model, examples, { epochs: 25 });
    const after = predictBatch(model, [STRONG_EASY, WEAK_HARD]);
    // The weights actually moved, the ordering still matches the labels, and the
    // two rounds are pushed further apart - the model adapted to this patient.
    assert.ok(Math.abs(after[0] - before[0]) > 1e-3, 'weights moved');
    assert.ok(after[0] > after[1], `strong+easy > weak+hard (${after})`);
    assert.ok((after[0] - after[1]) > (before[0] - before[1]) - 1e-6, 'separation not lost');
  } finally {
    disposeModel(model);
  }
});

/* ---- persistence --------------------------------------------------------- */

test('MODEL_STORE is an on-device indexeddb URL (no network)', () => {
  assert.match(MODEL_STORE, /^indexeddb:\/\//);
});

test('save/load degrade to false/null without IndexedDB, never throw', async () => {
  const model = createModel();
  try {
    const saved = await saveModel(model);
    assert.equal(saved, false); // no IndexedDB in Node
    const loaded = await loadModel();
    assert.equal(loaded, null);
  } finally {
    disposeModel(model);
  }
});

test('disposeModel is safe on null and on a real model', () => {
  disposeModel(null);
  disposeModel(undefined);
  disposeModel({});
  const model = createModel();
  disposeModel(model);
  disposeModel(model); // twice is fine
});

test('a trained model round-trips through tfjs serialisation identically', async () => {
  const model = createModel();
  try {
    await pretrain(model, { rows: 120, epochs: 12 });
    const before = predictBatch(model, [STRONG_EASY, WEAK_HARD]);

    let artifacts = null;
    await model.save(tf.io.withSaveHandler(async (a) => {
      artifacts = a;
      return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
    }));
    const reloaded = await tf.loadLayersModel(tf.io.fromMemory(artifacts));
    try {
      const after = predictBatch(reloaded, [STRONG_EASY, WEAK_HARD]);
      before.forEach((v, i) => assert.ok(Math.abs(v - after[i]) < 1e-6, 'prediction preserved'));
    } finally {
      disposeModel(reloaded);
    }
  } finally {
    disposeModel(model);
  }
});

/* ---- the controller ------------------------------------------------------ */

test('createPersonalizer returns null for a domain we do not personalise', () => {
  assert.equal(createPersonalizer({ domain: 'memory_recall', store: storeOf() }), null);
  assert.equal(createPersonalizer({ domain: 'routine_matching', store: storeOf() }), null);
});

test('a brand-new patient is playable before and after the model loads', async () => {
  const p = createPersonalizer({ domain: 'word_recall', store: storeOf([]) });
  assert.ok(p);
  // Usable on the prior immediately - init() has not run yet.
  const early = p.nextQuestion({ tier: 1 });
  assert.ok(early && early.id.startsWith('wr-ai'), 'a round before init');

  await p.init();
  const dbg = p.debug();
  assert.equal(dbg.domain, 'word_recall');
  assert.equal(dbg.modelReady, true);
  assert.equal(dbg.historyCount, 0);
  // No history -> the model has no influence yet, by design.
  assert.equal(dbg.influence, 0);
  assert.equal(p.usingModel, false);

  const q = p.nextQuestion({ tier: 2 });
  assert.ok(q && q.id.startsWith('wr-ai'));
  const note = p.describeQuestion(q.id);
  assert.ok(note && note.id === q.id, 'describes the round it built');
  assert.equal(p.describeQuestion('some-other-id'), null);
  p.dispose();
});

test('with enough history the model gains influence and still stays in-band', async () => {
  const p = createPersonalizer({ domain: 'word_recall', store: storeOf(wordHistory(30, true)) });
  await p.init();
  const dbg = p.debug();
  assert.equal(dbg.historyCount, 30);
  assert.ok(dbg.influence > 0, 'model now has a say');
  assert.equal(p.usingModel, true);

  // Every tier still has a real recommendation.
  for (const tier of [1, 2, 3]) {
    const q = p.nextQuestion({ tier });
    assert.ok(q && q.id.startsWith('wr-ai'), `tier ${tier} built`);
    assert.equal(q.tier, tier);
  }
  p.dispose();
});

test('update folds the live tally in without breaking recommendations', async () => {
  const p = createPersonalizer({ domain: 'number_sequence', store: storeOf(wordHistory(0)) });
  await p.init();
  p.update({ asked: 3, correct: 0, streakWrong: 3, streakRight: 0 });
  const q = p.nextQuestion({ tier: 2 });
  assert.ok(q && q.id.startsWith('ns-ai'));
  p.dispose();
});

test('a personalizer controller drives a full engine session end to end', async () => {
  const p = createPersonalizer({ domain: 'word_recall', store: storeOf(wordHistory(20, true)) });
  await p.init();
  const nextQuestion = p.nextQuestion; // methods use no `this`, so an unbound ref is fine
  const rand = (() => { let s = 99; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();

  let state = startSession({ bank: WORD_RECALL, tier: 1, now: 0, rand, nextQuestion });
  assert.ok(state.question.id.startsWith('wr-ai'), 'AI supplied the opening round');
  let clock = 0;
  let guard = 0;
  while (state.phase !== PHASE.DONE && guard < 60) {
    guard += 1;
    if (state.phase === PHASE.STUDY) state = revealOptions(state);
    if (state.phase === PHASE.ASK) {
      clock += 4000;
      state = answerQuestion(state, state.question.answerId, clock).state;
      p.update({ asked: state.asked, correct: state.correct, streakRight: state.streakRight, streakWrong: state.streakWrong });
    }
    if (state.phase === PHASE.FEEDBACK || state.phase === PHASE.TIER) {
      state = continueSession(state, { bank: WORD_RECALL, now: clock, rand, nextQuestion });
    }
  }
  assert.equal(state.phase, PHASE.DONE);
  assert.equal(state.asked, state.maxQuestions);
  p.dispose();
});

test('init survives a store whose read rejects (falls back to no history)', async () => {
  const badStore = { answers: async () => { throw new Error('db unavailable'); } };
  const p = createPersonalizer({ domain: 'word_recall', store: badStore });
  await p.init(); // must not reject
  assert.equal(p.debug().historyCount, 0);
  const q = p.nextQuestion({ tier: 1 });
  assert.ok(q && q.id.startsWith('wr-ai'));
  p.dispose();
});
