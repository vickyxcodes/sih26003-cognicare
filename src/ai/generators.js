/**
 * generators - build a real round from a chosen profile.
 *
 * This is where a profile stops being metadata and becomes an actual question in
 * the engine's own shape ({ id, tier, studyItem, studyMs, studyPrompt, studyCards,
 * prompt, options, answerId }). Every knob the AI can pick is consumed here:
 *   - word count / sequence length / row length -> how much is shown
 *   - study time                                -> how long it is shown (>= floor)
 *   - distractor similarity                     -> how alike the wrong options are
 *   - recall mode (numbers)                     -> what is actually asked
 *   - choice count                              -> how many buttons
 *
 * The rounds obey the same invariants the authored data does - exactly one correct
 * option, distractors that make the question fair - so they play through the
 * unchanged session engine and screen with no special casing. If anything cannot
 * be built, `buildQuestion` returns null and the caller falls back to the authored
 * round, so a generator bug can never stop a game from starting.
 */
import { listWords } from '../data/wording.js';
import { PATTERN_SHAPES, patternWords } from '../data/patternMatching.js';
import { clampProfile, STUDY_MS_FLOOR } from './challengeProfiles.js';

/* ---- word_recall --------------------------------------------------------- */

/**
 * Everyday nouns grouped by nearness, so "distractor similarity" is a real thing:
 * a similar distractor is a group-mate of a shown word (bread/toast), an unrelated
 * one comes from a group with nothing on screen.
 *
 * Every word here also has an Assamese translation in i18n's WORD_TRANSLATIONS, so
 * a generated round reads as cleanly in Assamese as an authored one - the same
 * bar the fixed rounds meet.
 */
const WORD_GROUPS = [
  ['Milk', 'Water', 'Tea', 'Coffee'],
  ['Bread', 'Toast', 'Rice'],
  ['Clock', 'Watch'],
  ['Hat', 'Cap', 'Shoe'],
  ['Chair', 'Table'],
  ['Rain', 'Snow'],
  ['Cat', 'Dog', 'Bird', 'Fish'],
  ['Fork', 'Spoon'],
  ['Star', 'Moon', 'Sun'],
  ['Road', 'Street'],
  ['Bus', 'Car', 'Train', 'Van'],
  ['Soap', 'Towel'],
  ['Lamp', 'Light'],
  ['Key', 'Lock', 'Gate', 'Door', 'Window'],
  ['House', 'Home'],
  ['Salt', 'Sugar'],
  ['Hand', 'Foot'],
  ['Bed', 'Pillow'],
  ['Tree', 'Flower', 'Garden'],
  ['Phone', 'Letter'],
  ['Morning', 'Evening'],
];
const WORD_POOL = [...new Set(WORD_GROUPS.flat())];
const GROUP_OF = new Map();
for (const group of WORD_GROUPS) for (const word of group) GROUP_OF.set(word, group);

const wordId = (word) => `w-${word.toLowerCase()}`;
const wordOption = (word) => ({ id: wordId(word), item: null, text: word });

/** Fisher-Yates over a copy, using the injected rand for deterministic tests. */
function shuffled(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function neighboursOf(word, exclude) {
  return (GROUP_OF.get(word) || []).filter((w) => w !== word && !exclude.has(w));
}

function buildWordQuestion(profile, { rand, uid }) {
  const { wordCount, choiceCount, distractorSimilarity } = profile;
  const shown = shuffled(WORD_POOL, rand).slice(0, wordCount);
  if (shown.length < wordCount) return null;
  const answer = shown[Math.floor(rand() * shown.length)];
  const shownSet = new Set(shown);

  const distractors = [];
  const taken = new Set(shown);
  const wantSimilar = distractorSimilarity >= 0.45;
  if (wantSimilar) {
    // Group-mates of shown words that were not themselves shown.
    const pool = shuffled(shown, rand).flatMap((w) => neighboursOf(w, shownSet));
    for (const w of pool) {
      if (distractors.length >= choiceCount - 1) break;
      if (!taken.has(w)) { distractors.push(w); taken.add(w); }
    }
  }
  // Fill the rest with words from groups that are not on screen (unrelated).
  const shownGroups = new Set(shown.map((w) => GROUP_OF.get(w)));
  const unrelated = shuffled(WORD_POOL, rand).filter(
    (w) => !taken.has(w) && (wantSimilar ? true : !shownGroups.has(GROUP_OF.get(w))),
  );
  for (const w of unrelated) {
    if (distractors.length >= choiceCount - 1) break;
    if (!taken.has(w)) { distractors.push(w); taken.add(w); }
  }
  if (distractors.length < choiceCount - 1) return null;

  const options = shuffled([wordOption(answer), ...distractors.map(wordOption)], rand);
  return {
    studyPrompt: `Remember these words: ${listWords(shown)}.`,
    studyCards: shown.map((word, at) => ({ id: `${uid}-c${at}`, text: word })),
    prompt: 'Which word did you just see?',
    answerId: wordId(answer),
    options,
  };
}

/* ---- number_sequence ----------------------------------------------------- */

const NUMBER_WORDS = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
};
const NUMBER_PROMPT = { saw: 'Which number did you just see?', last: 'Which number came last?', first: 'Which number came first?', second: 'Which number came second?' };
const digitId = (digit) => `n-${digit}`;
const digitOption = (digit) => ({ id: digitId(digit), item: null, text: String(digit), label: NUMBER_WORDS[digit] });

function buildNumberQuestion(profile, { rand, uid }) {
  const { seqLength, recallMode } = profile;
  const sequence = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rand).slice(0, seqLength);
  if (sequence.length < seqLength) return null;

  let answer;
  let options;
  if (recallMode === 'saw') {
    answer = sequence[Math.floor(rand() * sequence.length)];
    const unshown = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !sequence.includes(d)), rand);
    const distractors = unshown.slice(0, Math.max(1, Math.min(profile.choiceCount, 4) - 1));
    options = shuffled([answer, ...distractors].map(digitOption), rand);
  } else {
    const index = recallMode === 'last' ? sequence.length - 1 : recallMode === 'second' ? 1 : 0;
    answer = sequence[index];
    // Options are digits that really were shown, so a wrong answer means the order
    // was lost rather than the digit. Cap choices at the sequence length.
    const others = shuffled(sequence.filter((d) => d !== answer), rand);
    const want = Math.min(profile.choiceCount, sequence.length) - 1;
    options = shuffled([answer, ...others.slice(0, want)].map(digitOption), rand);
  }
  return {
    studyPrompt: `Remember these numbers: ${listWords(sequence.map((d) => NUMBER_WORDS[d]))}.`,
    studyCards: sequence.map((digit, at) => ({ id: `${uid}-c${at}`, text: String(digit) })),
    prompt: NUMBER_PROMPT[recallMode] || NUMBER_PROMPT.saw,
    answerId: digitId(answer),
    options,
    // Carried onto the question so Assamese localisation asks the right thing:
    // the fixed rounds encode the recall in the tier, a generated one may not.
    recallMode,
  };
}

/* ---- pattern_matching ---------------------------------------------------- */

const SHAPE_KEYS = Object.keys(PATTERN_SHAPES);
const patternId = (pattern) => `p-${pattern.map((shape) => shape[0]).join('')}`;
const sameCells = (a, b) => a.reduce((n, shape, i) => n + (shape === b[i] ? 1 : 0), 0);

function patternOption(pattern, qid) {
  return {
    id: patternId(pattern),
    item: null,
    text: null,
    label: patternWords(pattern),
    cards: pattern.map((shape, at) => ({ id: `${qid}-${patternId(pattern)}-c${at}`, shape })),
  };
}

function buildPatternQuestion(profile, { rand, uid }) {
  const { rowLength, choiceCount, similarity } = profile;
  const answer = shuffled(SHAPE_KEYS, rand).slice(0, Math.min(rowLength, SHAPE_KEYS.length));
  if (answer.length < 2) return null;

  // Generate many candidate wrong rows, then pick the ones whose overlap with the
  // answer matches the wanted similarity: high overlap (reorders / one-cell) when
  // similar, low overlap when not.
  const seen = new Set([patternId(answer)]);
  const pool = [];
  for (let attempt = 0; attempt < 60 && pool.length < 24; attempt += 1) {
    const row = attempt < 30
      ? shuffled(answer, rand) // a reordering of the same shapes
      : shuffled(SHAPE_KEYS, rand).slice(0, answer.length); // a fresh row
    const id = patternId(row);
    if (seen.has(id)) continue;
    seen.add(id);
    pool.push({ row, overlap: sameCells(answer, row) / answer.length });
  }
  if (pool.length < choiceCount - 1) return null;

  const wantSimilar = similarity >= 0.5;
  pool.sort((a, b) => (wantSimilar ? b.overlap - a.overlap : a.overlap - b.overlap));
  const wrong = pool.slice(0, choiceCount - 1).map((c) => c.row);

  const options = shuffled([answer, ...wrong].map((p) => patternOption(p, uid)), rand);
  return {
    studyPrompt: `Remember this pattern: ${patternWords(answer)}.`,
    studyCards: answer.map((shape, at) => ({ id: `${uid}-c${at}`, shape })),
    prompt: 'Which pattern did you just see?',
    answerId: patternId(answer),
    options,
  };
}

const BUILDERS = {
  word_recall: buildWordQuestion,
  number_sequence: buildNumberQuestion,
  pattern_matching: buildPatternQuestion,
};

const ID_PREFIX = { word_recall: 'wr-ai', number_sequence: 'ns-ai', pattern_matching: 'pm-ai' };

/**
 * Build a full question for a domain from a profile, at the given tier. Returns
 * null for an unsupported domain or on any failure - the caller's cue to fall
 * back to the authored round. The profile is clamped first, so even a bad profile
 * yields a safe round rather than an unfair one.
 */
export function buildQuestion(domain, profile, tier, { rand = Math.random, seq = 0 } = {}) {
  const builder = BUILDERS[domain];
  if (!builder) return null;
  const safe = clampProfile(domain, profile);
  if (!safe) return null;
  const uid = `${ID_PREFIX[domain]}-${tier}-${seq}-${Math.floor(rand() * 1e6)}`;
  try {
    const built = builder(safe, { rand, uid });
    if (!built || !built.options || built.options.length < 2) return null;
    // Exactly one option carries the answer id - the engine's whole notion of correct.
    const correct = built.options.filter((o) => o.id === built.answerId).length;
    if (correct !== 1) return null;
    return {
      id: uid,
      tier,
      studyItem: null,
      studyMs: Math.max(STUDY_MS_FLOOR, safe.studyMs),
      studyPrompt: built.studyPrompt,
      studyCards: built.studyCards,
      prompt: built.prompt,
      answerId: built.answerId,
      options: built.options,
      // Only number rounds set this; it lets localisation ask the right question.
      ...(built.recallMode ? { recallMode: built.recallMode } : null),
    };
  } catch {
    return null;
  }
}
