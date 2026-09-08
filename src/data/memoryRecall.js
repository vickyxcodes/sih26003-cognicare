import { itemLabel } from './catalog.js';

/**
 * Game domain 1 - memory recall.
 *
 * Each question is a genuine short-term recall exercise, not an identification
 * quiz: one picture is shown on its own for a few seconds, it disappears, and
 * the patient picks it out of two options. Difficulty comes from how long the
 * picture is shown and how close the wrong option is:
 *
 *   tier 1  4.0s, distractor from a completely different category (cup / shoe)
 *   tier 2  3.2s, still a different category but less everyday objects
 *   tier 3  2.6s, distractor from the SAME category (cup / glass of water)
 *
 * Two options at every tier, on purpose. The spec fixes two, and for a dementia
 * patient more choices on screen is extra load rather than a graded challenge -
 * so the challenge is put into the recall itself.
 */
export const MEMORY_RECALL_STUDY_MS = { 1: 4000, 2: 3200, 3: 2600 };

/** [tier, item shown, wrong option] */
const PAIRS = [
  [1, 'cup', 'shoe'],
  [1, 'clock', 'banana'],
  [1, 'toothbrush', 'plate'],
  [1, 'umbrella', 'apple'],
  [1, 'flower', 'key'],
  [1, 'telephone', 'towel'],
  [1, 'bed', 'spoon'],
  [1, 'ball', 'medicine'],

  [2, 'envelope', 'comb'],
  [2, 'lamp', 'book'],
  [2, 'chair', 'medicine'],
  [2, 'soap', 'ball'],
  [2, 'moon', 'key'],
  [2, 'spectacles', 'banana'],
  [2, 'kettle', 'flower'],
  [2, 'towel', 'clock'],

  [3, 'cup', 'glass'],
  [3, 'spoon', 'plate'],
  [3, 'comb', 'toothbrush'],
  [3, 'soap', 'towel'],
  [3, 'sun', 'moon'],
  [3, 'chair', 'bed'],
  [3, 'book', 'ball'],
  [3, 'apple', 'banana'],
  [3, 'key', 'lamp'],
  [3, 'envelope', 'telephone'],
];

const option = (id) => ({ id, item: id, text: itemLabel(id) });

export const MEMORY_RECALL = {
  domain: 'memory_recall',
  name: 'Remember the picture',
  /** How the counter in the header reads: "Picture 3 of 8". */
  unitLabel: 'Picture',
  /** What the difficulty transition adds, in this domain's own terms. */
  tierDetail: {
    easier: 'The next pictures stay on screen for longer.',
    harder: 'The next pictures are a little quicker.',
  },
  doneLine: (correct, asked) => `You remembered ${correct} of ${asked} pictures today.`,
  questions: PAIRS.map(([tier, show, distractor], i) => ({
    id: `mr-${i + 1}`,
    tier,
    studyItem: show,
    studyMs: MEMORY_RECALL_STUDY_MS[tier],
    studyPrompt: `Look at the ${itemLabel(show)}. Try to remember it.`,
    prompt: 'Which one did you just see?',
    answerId: show,
    options: [option(show), option(distractor)],
  })),
};
