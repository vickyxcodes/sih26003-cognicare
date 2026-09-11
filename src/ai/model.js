/**
 * model - the only file that touches TensorFlow.js.
 *
 * A deliberately tiny network: eleven inputs (seven about the patient's recent
 * play, four about a candidate round's difficulty) -> one hidden layer of eight
 * relu units -> a single sigmoid that reads as "chance this round is answered
 * correctly". About a hundred weights - the right size for the handful of rounds
 * one person plays, not a clinical dataset, and it predicts game success only.
 *
 * Everything here is wrapped so a failure is a value, never a throw that could
 * reach gameplay: create, pretrain, train, predict, save and load each guard
 * their own tensors and hand back something the caller can fall back from. This
 * module statically imports tfjs, so it is pulled in only when the personalizer
 * dynamically imports it - keeping TensorFlow out of the initial load.
 */
import * as tf from '@tensorflow/tfjs';
import { PATIENT_FEATURE_LEN, skillOf } from './features.js';
import { DIFFICULTY_FEATURE_LEN, overallDifficulty } from './challengeProfiles.js';
import { heuristicSuccess } from './personalize.js';

/** Where the trained model lives between sessions - on-device, no network. */
export const MODEL_STORE = 'indexeddb://cognicare-personalizer-v1';

const INPUT_DIM = PATIENT_FEATURE_LEN + DIFFICULTY_FEATURE_LEN;

/** A fresh, compiled network for the given input width. */
export function createModel(inputDim = INPUT_DIM) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputDim], units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  model.compile({ optimizer: tf.train.adam(0.01), loss: 'binaryCrossentropy' });
  return model;
}

/**
 * Teach a fresh model the plain prior before it has ever seen this patient:
 * higher skill -> more likely, harder round -> less likely, and the non-skill
 * inputs carry little. Built from random (skill, difficulty) points labelled with
 * the heuristic probability, so a brand-new model already behaves sensibly and
 * the influence blend has something reasonable to move toward.
 */
export async function pretrain(model, { rows = 220, epochs = 30 } = {}) {
  const xs = [];
  const ys = [];
  for (let i = 0; i < rows; i += 1) {
    const patient = Array.from({ length: PATIENT_FEATURE_LEN }, () => Math.random());
    const diff = Array.from({ length: DIFFICULTY_FEATURE_LEN }, () => Math.random());
    xs.push([...patient, ...diff]);
    ys.push([heuristicSuccess(skillOf(patient), overallDifficulty(diff))]);
  }
  const xt = tf.tensor2d(xs);
  const yt = tf.tensor2d(ys);
  try {
    await model.fit(xt, yt, { epochs, batchSize: 32, shuffle: true, verbose: 0 });
  } finally {
    xt.dispose();
    yt.dispose();
  }
  return model;
}

/**
 * Fine-tune on this patient's own reconstructed rows. Fewer, gentler epochs than
 * the pretrain: it should adjust the prior toward the individual, not overwrite
 * it from a dozen noisy examples. A no-op (kept safe) when there is nothing to
 * learn from.
 */
export async function trainOnExamples(model, examples, { epochs = 12 } = {}) {
  if (!Array.isArray(examples) || !examples.length) return model;
  const xs = examples.map((e) => e.x);
  const ys = examples.map((e) => [e.y]);
  const xt = tf.tensor2d(xs);
  const yt = tf.tensor2d(ys);
  try {
    await model.fit(xt, yt, { epochs, batchSize: 16, shuffle: true, verbose: 0 });
  } finally {
    xt.dispose();
    yt.dispose();
  }
  return model;
}

/**
 * One probability per input row, as a plain array. tf.tidy disposes the input and
 * output tensors either way; an empty input is answered without touching tfjs.
 */
export function predictBatch(model, rows) {
  if (!model || !Array.isArray(rows) || !rows.length) return [];
  return tf.tidy(() => {
    const out = model.predict(tf.tensor2d(rows));
    return Array.from(out.dataSync());
  });
}

/** Persist the trained model on the device. Returns true on success, never throws. */
export async function saveModel(model) {
  try {
    await model.save(MODEL_STORE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load a previously saved model, compiled and ready to train again. Returns null
 * when none is stored or the stored copy cannot be read (a corrupt or half-written
 * model), which the caller treats as "start fresh".
 */
export async function loadModel() {
  try {
    const model = await tf.loadLayersModel(MODEL_STORE);
    model.compile({ optimizer: tf.train.adam(0.01), loss: 'binaryCrossentropy' });
    return model;
  } catch {
    return null;
  }
}

/** Free a model's weights. Safe to call with null or a half-built model. */
export function disposeModel(model) {
  try {
    if (model && typeof model.dispose === 'function') model.dispose();
  } catch {
    /* nothing to free */
  }
}
