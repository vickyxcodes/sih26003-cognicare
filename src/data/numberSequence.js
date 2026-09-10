import { listWords } from './wording.js';

/**
 * Game domain 4 - number sequence.
 *
 * A short run of single digits appears, is taken away, and the patient is asked
 * one plain question about it. Same engine, same screen, same large buttons; the
 * thing being held in mind is a short sequence rather than a picture or a word.
 *
 * Single digits only, and never the same digit twice in one sequence. Two-digit
 * numbers turn this into arithmetic, and a repeat would make "which came first"
 * ambiguous.
 *
 * Difficulty is the length of the sequence, the number of choices, and which
 * part of the sequence is asked for - in that order of effect:
 *
 *   tier 1  2 digits, 2 choices, "which did you just see" - recognition only,
 *           and the wrong option is a digit that was never on screen
 *   tier 2  3 digits, 3 choices, "which came last" - recency, the easiest
 *           position to hold, but now every choice really was shown
 *   tier 3  4 digits, 4 choices, "which came first" - the longest run and the
 *           position that fades first
 *
 * From tier 2 on, every option is a digit the patient actually saw, so a wrong
 * answer means the order was lost rather than the digits.
 */

/** How long the sequence stays on screen, per tier. Never below 2000ms. */
export const NUMBER_SEQUENCE_STUDY_MS = { 1: 5000, 2: 4200, 3: 3600 };

/** The one question each tier asks. Unchanging within a tier, so it is learnable. */
export const NUMBER_SEQUENCE_QUESTION = {
  1: 'Which number did you just see?',
  2: 'Which number came last?',
  3: 'Which number came first?',
};

/** Digits are spoken as words, or "4 7" is read aloud as "forty-seven". */
const NUMBER_WORDS = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
};

/**
 * [tier, the sequence shown, the digit asked for, a digit never shown]
 *
 * The fourth entry exists only at tier 1, where the wrong option has to come
 * from outside the sequence; at tiers 2 and 3 the options are the sequence
 * itself. A test asserts the answer is really the last digit at tier 2 and the
 * first at tier 3, so a typo here cannot make a question unanswerable.
 */
const ROUNDS = [
  [1, [4, 7], 4, 2],
  [1, [3, 8], 8, 5],
  [1, [6, 2], 6, 9],
  [1, [9, 5], 5, 1],
  [1, [1, 7], 7, 4],
  [1, [8, 3], 3, 6],
  [1, [2, 9], 9, 7],
  [1, [5, 6], 5, 3],

  [2, [2, 7, 5], 5, null],
  [2, [8, 1, 6], 6, null],
  [2, [3, 9, 4], 4, null],
  [2, [6, 2, 8], 8, null],
  [2, [1, 5, 9], 9, null],
  [2, [7, 4, 2], 2, null],
  [2, [9, 6, 3], 3, null],
  [2, [4, 8, 1], 1, null],

  [3, [3, 8, 2, 6], 3, null],
  [3, [7, 1, 9, 4], 7, null],
  [3, [5, 2, 8, 3], 5, null],
  [3, [9, 4, 6, 1], 9, null],
  [3, [2, 6, 3, 7], 2, null],
  [3, [8, 5, 1, 9], 8, null],
  [3, [4, 9, 7, 2], 4, null],
  [3, [6, 3, 5, 8], 6, null],
];

const digitId = (digit) => `n-${digit}`;

/**
 * The button shows the numeral, because that is what was on screen; the label
 * is the word, so a screen reader and the feedback line both say "four".
 */
const option = (digit) => ({
  id: digitId(digit),
  item: null,
  text: String(digit),
  label: NUMBER_WORDS[digit],
});

export const NUMBER_SEQUENCE = {
  domain: 'number_sequence',
  name: 'Remember the numbers',
  /** The direct route to this game, and how the play screen recognises it. */
  path: '/play/numbers',
  /** How the counter in the header reads: "Number 3 of 8". */
  unitLabel: 'Number',
  benefit: 'Practises holding a short sequence and its order in mind.',
  difficultyGuide: {
    1: 'Recognise a short pair of numbers.',
    2: 'Remember which number came last in a longer run.',
    3: 'Remember which number came first in the longest run.',
  },
  /** What the difficulty transition adds, in this domain's own terms. */
  tierDetail: {
    easier: 'The next sequences are shorter and stay for longer.',
    harder: 'The next sequences are longer and go by more quickly.',
  },
  doneLine: (correct, asked) => `You remembered ${correct} of ${asked} numbers today.`,
  /** How a wrong answer is put, warmly, in this domain's own terms. */
  missLine: (words) => `The number was ${words}`,
  questions: ROUNDS.map(([tier, sequence, answer, extra], i) => ({
    id: `ns-${i + 1}`,
    tier,
    /** Nothing is drawn here, so there is no `studyItem`; the digits are the study. */
    studyItem: null,
    studyMs: NUMBER_SEQUENCE_STUDY_MS[tier],
    studyPrompt: `Remember these numbers: ${listWords(sequence.map((d) => NUMBER_WORDS[d]))}.`,
    studyCards: sequence.map((digit, at) => ({
      id: `ns-${i + 1}-c${at}`,
      text: String(digit),
    })),
    prompt: NUMBER_SEQUENCE_QUESTION[tier],
    answerId: digitId(answer),
    options: extra === null
      ? sequence.map(option)
      : [option(answer), option(extra)],
  })),
};
