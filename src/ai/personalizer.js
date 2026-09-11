/**
 * personalizer - the browser-side controller that drives it all.
 *
 * One of these is created per game (only for the domains we personalise), lazily,
 * so importing this file is what pulls TensorFlow in - never the initial load. It:
 *
 *   1. reads the patient's own answer history from the store,
 *   2. turns it into the feature vector and a per-tier recommendation using only
 *      the heuristic prior at first, so `nextQuestion` works from the very first
 *      round while the model is still loading,
 *   3. in the background, loads a saved model (or creates and pretrains one), fine
 *      tunes it on the reconstructed history, saves it, and recomputes the
 *      recommendation now that the model has a say,
 *   4. recomputes cheaply after each answer from the running session tally, so the
 *      challenge tracks the patient within a single sitting too.
 *
 * `nextQuestion` is synchronous - it reads the latest precomputed recommendation
 * and builds the round - because the session engine calls it synchronously. Every
 * step is guarded: if anything at all goes wrong (no history, model load/train/
 * predict failure, a bad profile) the controller quietly yields authored rounds
 * and the deterministic engine, and the patient sees a normal game.
 */
import { extractPatientFeatures, reconstructExamples } from './features.js';
import { influenceFor, recommendByTier, MIN_DATA } from './personalize.js';
import { supportsProfiles } from './challengeProfiles.js';
import { buildQuestion } from './generators.js';
import {
  createModel,
  disposeModel,
  loadModel,
  predictBatch,
  pretrain,
  saveModel,
  trainOnExamples,
} from './model.js';

/**
 * Create a personalizer for one domain, or return null for a domain we do not
 * personalise (the caller then never loads TensorFlow for that game).
 *
 * `store` is the record store (async `answers()` read only). `rand` is injected
 * for deterministic tests. Call `init()` to kick off the background model work;
 * `nextQuestion`/`describe` are usable immediately, on the prior alone.
 */
export function createPersonalizer({ domain, store, rand = Math.random }) {
  if (!supportsProfiles(domain)) return null;

  let model = null;
  let answers = [];
  let running = null;
  let recommendation = null;
  let influence = 0;
  let modelReady = false;
  let seq = 0;
  let disposed = false;
  let lastBuilt = null;

  const predict = (rows) => (model && modelReady ? predictBatch(model, rows) : []);

  /** Recompute features + per-tier recommendation from history and running tally. */
  const recompute = () => {
    const features = extractPatientFeatures(answers, domain, { running });
    influence = influenceFor(features.meta.domainCount + (running?.asked || 0));
    recommendation = recommendByTier({
      domain,
      features,
      predict: modelReady ? predict : null,
      influence,
    });
  };

  // Seed a prior-only recommendation now, from the empty history, so `nextQuestion`
  // builds a sane round even if it is called before `init()` has run - the game is
  // never left waiting on the controller.
  recompute();

  const controller = {
    /**
     * Build the next round for the engine, or return null to defer to the authored
     * round. Synchronous by contract. Any failure yields null (fallback), never a
     * throw into the game loop. Remembers what it built so the screen can show the
     * matching explanation, immune to any later recompute.
     */
    nextQuestion({ tier } = {}) {
      try {
        const sel = recommendation?.byTier?.[tier];
        if (!sel || !sel.profile) return null;
        seq += 1;
        const question = buildQuestion(domain, sel.profile, tier, { rand, seq });
        if (question) {
          lastBuilt = {
            id: question.id,
            note: sel.note || '',
            usedModel: Boolean(sel.usedModel),
            direction: sel.direction,
          };
        }
        return question;
      } catch {
        return null;
      }
    },

    /**
     * The honest explanation for a round this layer built, matched by id so it can
     * only ever describe the round actually on screen. Null for an authored round.
     */
    describeQuestion(id) {
      return lastBuilt && lastBuilt.id === id ? lastBuilt : null;
    },

    /** Fold the live session tally in and recompute (cheap, synchronous). */
    update(runningTally) {
      running = runningTally || null;
      recompute();
    },

    /** True once the model is trained and actually influencing selections. */
    get usingModel() {
      return modelReady && influence > 0;
    },

    /** A snapshot for an optional caregiver/developer diagnostic. */
    debug() {
      return {
        domain,
        modelReady,
        influence,
        usingModel: controller.usingModel,
        historyCount: answers.filter((r) => r.domain === domain).length,
        byTier: recommendation?.byTier || null,
      };
    },

    /**
     * Read history, seed the prior-only recommendation, then in the background get
     * a model going and recompute with it. Resolves when the (optional) model work
     * has settled; callers do not need to await it to start playing.
     */
    async init() {
      try {
        answers = (await store.answers()) || [];
      } catch {
        answers = [];
      }
      recompute(); // prior-only: playable immediately
      await ensureModel();
      return controller;
    },

    /** Release the model. Safe to call more than once. */
    dispose() {
      disposed = true;
      disposeModel(model);
      model = null;
      modelReady = false;
    },
  };

  /** Load or build+pretrain the model, fine-tune on this patient, then save. */
  async function ensureModel() {
    try {
      let loaded = await loadModel();
      if (!loaded) {
        loaded = createModel();
        await pretrain(loaded);
      }
      if (disposed) {
        disposeModel(loaded);
        return;
      }
      model = loaded;

      // Fine-tune on the patient's own history once there is enough to be worth it.
      const examples = reconstructExamples(answers, domain);
      if (examples.length >= MIN_DATA) {
        await trainOnExamples(model, examples);
        await saveModel(model);
      } else if (examples.length) {
        // Not enough to fine-tune, but keep the pretrained model for next time.
        await saveModel(model);
      }

      if (disposed) {
        controller.dispose();
        return;
      }
      modelReady = true;
      recompute(); // now with the model's say blended in
    } catch {
      // Any TF failure: stay on the prior. Gameplay never sees this.
      disposeModel(model);
      model = null;
      modelReady = false;
    }
  }

  return controller;
}
