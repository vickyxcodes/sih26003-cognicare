/**
 * sessionEngine - the whole game loop as pure functions.
 *
 * No React, no IndexedDB, no speech, no imports at all: the engine takes state
 * in and hands new state back, plus (on an answer) the record that should be
 * persisted. That keeps the rules for both game domains in one testable place,
 * and it is why `npm test` can play whole sessions without a browser.
 *
 * A question is domain-agnostic:
 *   { id, tier, studyItem|null, studyMs, studyPrompt, prompt, options[], answerId }
 * plus an optional `studyCards[]` for the domains that memorise a small row of
 * words, digits or shapes rather than one picture.
 * An option is { id, item|null, text }, optionally with `cards[]` (a drawn row)
 * and `label` (what to call it when the button carries no words).
 */
export const PHASE = {
  STUDY: 'study',
  ASK: 'ask',
  FEEDBACK: 'feedback',
  TIER: 'tier',
  DONE: 'done',
};

/** A session is short by design - the spec caps it at 5-8 minutes. */
export const MAX_QUESTIONS = 8;
export const SESSION_MAX_MS = 6 * 60 * 1000;
export const FEEDBACK_MS = 1700;
export const MIN_TIER = 1;
export const MAX_TIER = 3;

/**
 * Adaptive difficulty.
 *
 * Two wrong in a row eases off; three right in a row steps up. The spec allows
 * two or three for the rise - three is the choice here, so the app is quicker to
 * help than to push, and a single lucky pair of guesses (two options means a coin
 * flip) cannot make the game harder.
 */
export const DROP_AFTER_WRONG = 2;
export const RAISE_AFTER_RIGHT = 3;

/** The transition screen is held long enough to be read, per the spec. */
export const TIER_MS = 2000;

export const TIER_MESSAGE = {
  easier: "Let's make this a little easier",
  harder: "Let's make this a little harder",
};

function shuffle(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The two objects a question offers, order-independent - so a pair and the same
 * pair with the answer reversed read as one pair.
 */
function pairKey(question) {
  if (!question) return null;
  return question.options
    .map((o) => o.id)
    .sort()
    .join('|');
}

/**
 * Next question at the current tier, preferring ones this session has not used.
 * Falls back to the whole tier pool so a long session can never dead-end.
 *
 * Both banks hold some pairs in both directions (cup/glass and glass/cup), which
 * is deliberate - the cue differs, so it is a different question. But asking them
 * back to back shows the patient the same two pictures twice running with the
 * answer swapped, which reads as the app repeating itself and is needlessly
 * disorienting, so the previous pair is skipped when anything else is available.
 */
function pickQuestion(bank, tier, usedIds, rand, lastPair = null) {
  if (!bank || !bank.questions) return null;
  const pool = bank.questions.filter((q) => q.tier === tier);
  if (!pool.length) return null;
  const fresh = pool.filter((q) => !usedIds.includes(q.id));
  const candidates = fresh.length ? fresh : pool;
  const varied = candidates.filter((q) => pairKey(q) !== lastPair);
  const question = shuffle(varied.length ? varied : candidates, rand)[0];
  return { ...question, options: shuffle(question.options, rand) };
}

/**
 * The optional personalised round.
 *
 * `nextQuestion` is an injected hook (the AI layer, in the app; absent in tests
 * and for the domains that are not personalised). When present it is offered the
 * current domain, tier and the ids already used, and may return a ready-built
 * question or nothing. Anything falsy, malformed, or a throw means "no opinion",
 * and the engine falls back to the authored pool below - so the deterministic
 * game is exactly what runs whenever the hook is absent or declines. The AI never
 * changes the tier; it only fills a round *within* the tier the engine chose.
 */
function offerQuestion(nextQuestion, { domain, tier, usedIds }) {
  if (typeof nextQuestion !== 'function') return null;
  try {
    const q = nextQuestion({ domain, tier, usedIds });
    return q && Array.isArray(q.options) && q.options.length ? q : null;
  } catch {
    return null;
  }
}

/**
 * Which screen a question opens on, decided by the question itself.
 *
 * `memory_recall` shows a picture to memorise and then hides it; `word_recall`,
 * `number_sequence` and `pattern_matching` show a small row of things to
 * memorise and then hide that. Both open on the study screen.
 * `routine_matching` has nothing to memorise - its cue has to stay on screen
 * beside the options - so a question with neither a `studyItem` nor any
 * `studyCards` opens straight on the ask. Reading it off the question is what
 * lets every domain share this one loop instead of each needing its own engine.
 */
function openingPhase(question) {
  const study = question.studyItem || (question.studyCards && question.studyCards.length);
  return study ? PHASE.STUDY : PHASE.ASK;
}

export function startSession({
  bank,
  tier = MIN_TIER,
  now = Date.now(),
  rand = Math.random,
  maxQuestions = MAX_QUESTIONS,
  nextQuestion = null,
}) {
  const question = offerQuestion(nextQuestion, { domain: bank.domain, tier, usedIds: [] })
    || pickQuestion(bank, tier, [], rand);
  return {
    domain: bank.domain,
    bankName: bank.name,
    tier,
    maxQuestions,
    startedAt: now,
    phase: question ? openingPhase(question) : PHASE.DONE,
    endReason: question ? null : 'no-questions',
    endedAt: question ? null : now,
    question,
    usedIds: question ? [question.id] : [],
    asked: 0,
    correct: 0,
    streakRight: 0,
    streakWrong: 0,
    lastAnswer: null,
    tierChange: null,
  };
}

/** Study picture has been seen: hide it and show the options. */
export function revealOptions(state) {
  if (state.phase !== PHASE.STUDY) return state;
  return { ...state, phase: PHASE.ASK };
}

/**
 * Record an answer.
 *
 * Returns the next state *and* the record the caller must persist. Writing that
 * record is the caller's job (step 5) but deciding what it contains is the
 * engine's, so a lost write can never be a silent behaviour difference.
 */
export function answerQuestion(state, optionId, now = Date.now()) {
  if (state.phase !== PHASE.ASK) return { state, record: null };
  const correct = optionId === state.question.answerId;
  const next = {
    ...state,
    phase: PHASE.FEEDBACK,
    asked: state.asked + 1,
    correct: state.correct + (correct ? 1 : 0),
    streakRight: correct ? state.streakRight + 1 : 0,
    streakWrong: correct ? 0 : state.streakWrong + 1,
    lastAnswer: { optionId, correct, questionId: state.question.id },
  };
  const record = {
    domain: state.domain,
    questionId: state.question.id,
    correct,
    difficultyTierEnd: state.tier,
    timestamp: now,
  };
  return { state: next, record };
}

/** Has this session run out of questions or out of time? */
function finished(state, now) {
  if (state.asked >= state.maxQuestions) return 'complete';
  if (now - state.startedAt >= SESSION_MAX_MS) return 'time';
  return null;
}

/**
 * The adaptive decision, as a pure function of the current streaks.
 *
 * Returns null when the tier holds - including when the streak says to move but
 * the tier is already at the floor or the ceiling, so no transition screen is
 * shown for a change that did not happen.
 *
 * Struggling is checked before succeeding: only one streak can be non-zero at a
 * time, but the ordering states the intent - ease off first.
 */
export function tierDecision(state) {
  if (state.streakWrong >= DROP_AFTER_WRONG && state.tier > MIN_TIER) {
    return { tier: state.tier - 1, direction: 'easier' };
  }
  if (state.streakRight >= RAISE_AFTER_RIGHT && state.tier < MAX_TIER) {
    return { tier: state.tier + 1, direction: 'harder' };
  }
  return null;
}

/**
 * Leave the feedback (or tier-change) screen: end the session, show a tier
 * transition, or move on to the next question.
 *
 * The bank is passed in rather than stored in state so that state stays plain,
 * serializable data - which is what lets tests snapshot it and React hold it.
 */
export function continueSession(state, { bank, now = Date.now(), rand = Math.random, nextQuestion = null }) {
  if (state.phase !== PHASE.FEEDBACK && state.phase !== PHASE.TIER) return state;

  if (state.phase === PHASE.FEEDBACK) {
    const reason = finished(state, now);
    if (reason) return { ...state, phase: PHASE.DONE, endReason: reason, endedAt: now };

    const change = tierDecision(state);
    if (change) {
      // The tier moves now, but the next question waits behind a screen the
      // patient cannot miss: the game never silently changes underneath them.
      return {
        ...state,
        phase: PHASE.TIER,
        tier: change.tier,
        streakRight: 0,
        streakWrong: 0,
        lastAnswer: null,
        tierChange: {
          from: state.tier,
          to: change.tier,
          direction: change.direction,
          message: TIER_MESSAGE[change.direction],
        },
      };
    }
  }

  const question = offerQuestion(nextQuestion, { domain: state.domain, tier: state.tier, usedIds: state.usedIds })
    || pickQuestion(bank, state.tier, state.usedIds, rand, pairKey(state.question));
  if (!question) return { ...state, phase: PHASE.DONE, endReason: 'no-questions', endedAt: now };
  return {
    ...state,
    phase: openingPhase(question),
    question,
    usedIds: [...state.usedIds, question.id],
    lastAnswer: null,
    tierChange: null,
  };
}

export function sessionSummary(state, now = Date.now()) {
  const asked = state.asked;
  return {
    domain: state.domain,
    asked,
    correct: state.correct,
    /** Percent, so sessions of different lengths stay comparable on the chart. */
    score: asked ? Math.round((state.correct / asked) * 100) : 0,
    difficultyTierEnd: state.tier,
    durationMs: (state.endedAt || now) - state.startedAt,
    timestamp: state.endedAt || now,
  };
}
