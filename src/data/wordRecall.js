import { listWords } from './wording.js';

/**
 * Game domain 3 - word recall.
 *
 * A short list of ordinary words is shown, then taken away, and the patient taps
 * the one they were just shown. Same engine, same screen and same two-to-four
 * large buttons as the first two domains; the only thing that is new is what is
 * being remembered - words instead of a picture.
 *
 * Every word is a concrete, everyday English noun a person has used all their
 * life (cup, bread, garden). Nothing abstract, nothing rare, and nothing longer
 * than one word, so reading the option is never the difficult part.
 *
 * Difficulty grows on two axes at once, which is how the existing adaptive
 * system already moves the other domains:
 *
 *   tier 1  2 words to hold, 2 choices, the wrong word unrelated
 *   tier 2  3 words to hold, 3 choices, the wrong words unrelated
 *   tier 3  4 words to hold, 4 choices, and every wrong word is a near
 *           neighbour of one that *was* shown (bread/toast, clock/watch), so
 *           recognising the gist is not enough
 *
 * The study screen is also held for less time as the tier rises, exactly as in
 * memory recall - never below the two-second floor the spec sets.
 */

/** How long the words stay on screen, per tier. Never below 2000ms. */
export const WORD_RECALL_STUDY_MS = { 1: 5000, 2: 4200, 3: 3600 };

/** How many choices a tier offers. The spec allows 2-4; this uses the full range. */
export const WORD_RECALL_CHOICES = { 1: 2, 2: 3, 3: 4 };

/**
 * [tier, the words shown, the one asked about, the words never shown]
 *
 * The answer is always one of the shown words and the distractors are never
 * among them, so exactly one option can be correct. Both are machine-checked.
 */
const ROUNDS = [
  [1, ['Cup', 'Dog'], 'Cup', ['Hat']],
  [1, ['Sun', 'Bed'], 'Bed', ['Car']],
  [1, ['Key', 'Rain'], 'Rain', ['Fish']],
  [1, ['Tree', 'Milk'], 'Tree', ['Shoe']],
  [1, ['Bird', 'Door'], 'Door', ['Salt']],
  [1, ['Bread', 'Moon'], 'Bread', ['Bus']],
  [1, ['Chair', 'Rice'], 'Chair', ['Star']],
  [1, ['Clock', 'Hand'], 'Hand', ['Road']],

  [2, ['Tea', 'House', 'Shoe'], 'House', ['Rain', 'Bird']],
  [2, ['Water', 'Letter', 'Car'], 'Letter', ['Tree', 'Soap']],
  [2, ['Flower', 'Spoon', 'Bus'], 'Spoon', ['Clock', 'Milk']],
  [2, ['Table', 'Moon', 'Key'], 'Moon', ['Fish', 'Bread']],
  [2, ['Garden', 'Salt', 'Dog'], 'Garden', ['Window', 'Hat']],
  [2, ['Light', 'Towel', 'Rice'], 'Towel', ['Door', 'Star']],
  [2, ['Morning', 'Hand', 'Cup'], 'Morning', ['Road', 'Bed']],
  [2, ['Phone', 'Star', 'Bread'], 'Phone', ['Sun', 'Chair']],

  [3, ['Bread', 'Clock', 'River', 'Hat'], 'Bread', ['Toast', 'Watch', 'Cap']],
  [3, ['Chair', 'Milk', 'Letter', 'Rain'], 'Letter', ['Table', 'Water', 'Snow']],
  [3, ['Dog', 'Garden', 'Spoon', 'Moon'], 'Garden', ['Cat', 'Fork', 'Star']],
  [3, ['Shoe', 'Window', 'Tea', 'Road'], 'Window', ['Sock', 'Coffee', 'Street']],
  [3, ['Bird', 'Soap', 'Table', 'Light'], 'Soap', ['Fish', 'Towel', 'Lamp']],
  [3, ['Key', 'Bus', 'Rice', 'Morning'], 'Bus', ['Lock', 'Train', 'Evening']],
  [3, ['House', 'Salt', 'Flower', 'Hand'], 'Flower', ['Home', 'Sugar', 'Foot']],
  [3, ['Door', 'Car', 'Star', 'Bed'], 'Star', ['Gate', 'Van', 'Pillow']],
];

/**
 * The question asked is always the same five words; only the list changes.
 * A familiar, unchanging question is one less thing to work out each time.
 */
export const WORD_RECALL_QUESTION = 'Which word did you just see?';

const wordId = (word) => `w-${word.toLowerCase()}`;

const option = (word) => ({ id: wordId(word), item: null, text: word });

export const WORD_RECALL = {
  domain: 'word_recall',
  name: 'Remember the words',
  /** The direct route to this game, and how the play screen recognises it. */
  path: '/play/words',
  /** How the counter in the header reads: "Word 3 of 8". */
  unitLabel: 'Word',
  benefit: 'Strengthens short-term memory for familiar words.',
  difficultyGuide: {
    1: 'Remember two words with two choices.',
    2: 'Remember three words and see them for less time.',
    3: 'Remember four words with close word neighbours.',
  },
  /** What the difficulty transition adds, in this domain's own terms. */
  tierDetail: {
    easier: 'The next words stay on screen for longer.',
    harder: 'The next rounds show more words, more quickly.',
  },
  doneLine: (correct, asked) => `You remembered ${correct} of ${asked} words today.`,
  /** How a wrong answer is put, warmly, in this domain's own terms. */
  missLine: (words) => `The word was ${words}`,
  questions: ROUNDS.map(([tier, shown, answer, distractors], i) => ({
    id: `wr-${i + 1}`,
    tier,
    /** Nothing is drawn here, so there is no `studyItem`; the words are the study. */
    studyItem: null,
    studyMs: WORD_RECALL_STUDY_MS[tier],
    studyPrompt: `Remember these words: ${listWords(shown)}.`,
    studyCards: shown.map((word) => ({ id: `wr-${i + 1}-${wordId(word)}`, text: word })),
    prompt: WORD_RECALL_QUESTION,
    answerId: wordId(answer),
    options: [option(answer), ...distractors.map(option)],
  })),
};
