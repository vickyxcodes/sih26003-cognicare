import { itemLabel } from './catalog.js';

/**
 * Game domain 2 - daily routine matching.
 *
 * The patient is told a moment from an ordinary day and picks the object that
 * belongs to it: "It is time to brush your teeth" -> the toothbrush, not the
 * kettle. Same interaction as domain 1 - two large picture-and-word buttons -
 * and the same engine, so difficulty, logging and voice all behave identically.
 *
 * The cue is words, not a picture, and there is nothing to memorise: the
 * sentence stays on screen above the options for as long as the patient needs
 * it. That is why these questions carry no `studyItem`, which is the signal the
 * engine reads to open straight on the question instead of a study screen.
 *
 * Difficulty is the closeness of the wrong object:
 *
 *   tier 1  the wrong object has nothing to do with the moment (teeth / kettle)
 *   tier 2  the wrong object is plausible in daily life but for another moment
 *           (a dark room: the lamp, or the spectacles?)
 *   tier 3  the wrong object is from the SAME category and a near neighbour of
 *           the right one, so only the cue tells them apart (hot tea: cup, or
 *           glass of water?)
 */

/** [tier, the object needed, the wrong object, the moment being described] */
const CUES = [
  [1, 'toothbrush', 'kettle', 'It is time to brush your teeth.'],
  [1, 'kettle', 'shoe', 'You want to boil water for tea.'],
  [1, 'medicine', 'book', 'It is time to take your tablet.'],
  [1, 'book', 'plate', 'You want to sit and read.'],
  [1, 'umbrella', 'spoon', 'It is raining outside.'],
  [1, 'spoon', 'towel', 'You are going to eat your soup.'],
  [1, 'shoe', 'cup', 'You are going out for a walk.'],
  [1, 'bed', 'telephone', 'It is night and time to sleep.'],

  [2, 'soap', 'glass', 'You want to wash your hands.'],
  [2, 'telephone', 'clock', 'You want to call your daughter.'],
  [2, 'envelope', 'book', 'You want to send a note to a friend.'],
  [2, 'lamp', 'spectacles', 'The room is dark this evening.'],
  [2, 'spectacles', 'lamp', 'The words are too small to read.'],
  [2, 'key', 'comb', 'You are leaving and must lock up.'],
  [2, 'towel', 'bed', 'Your face is wet after washing.'],
  [2, 'clock', 'telephone', 'You want to know the time.'],

  [3, 'cup', 'glass', 'You would like some hot tea.'],
  [3, 'glass', 'cup', 'You are thirsty and want something cold.'],
  [3, 'toothbrush', 'comb', 'It is time to clean your teeth.'],
  [3, 'comb', 'toothbrush', 'You want to tidy your hair.'],
  [3, 'spoon', 'plate', 'You want to stir your tea.'],
  [3, 'plate', 'spoon', 'You need somewhere to put your food.'],
  [3, 'bed', 'chair', 'You feel tired and want to lie down.'],
  [3, 'chair', 'bed', 'You want to sit down to eat.'],
];

/**
 * The question asked is always the same five words; only the moment changes.
 * A familiar, unchanging question is one less thing to work out each time.
 */
export const ROUTINE_QUESTION = 'Which one do you need?';

const option = (id) => ({ id, item: id, text: itemLabel(id) });

export const ROUTINE_MATCHING = {
  domain: 'routine_matching',
  name: 'Everyday routines',
  /** The direct route to this game, and how the play screen recognises it. */
  path: '/play/routine',
  /** How the counter in the header reads: "Question 3 of 8". */
  unitLabel: 'Question',
  benefit: 'Practises connecting familiar objects with daily routines.',
  difficultyGuide: {
    1: 'The helpful object is easy to tell apart.',
    2: 'Both choices are familiar everyday objects.',
    3: 'The choices are close neighbours, so the cue matters more.',
  },
  /** What the difficulty transition adds, in this domain's own terms. */
  tierDetail: {
    easier: 'The next ones are easier to tell apart.',
    harder: 'The next ones look more alike.',
  },
  doneLine: (correct, asked) => `You matched ${correct} of ${asked} correctly today.`,
  /** How a wrong answer is put, warmly, in this domain's own terms. */
  missLine: (words) => `It was the ${words}`,
  questions: CUES.map(([tier, need, wrong, cue], i) => ({
    id: `rm-${i + 1}`,
    tier,
    /** Nothing to memorise: the cue stays on screen with the options. */
    studyItem: null,
    studyMs: 0,
    studyPrompt: null,
    prompt: `${cue} ${ROUTINE_QUESTION}`,
    answerId: need,
    options: [option(need), option(wrong)],
  })),
};
