/**
 * Game domain 5 - pattern matching.
 *
 * A short row of simple coloured shapes appears, is taken away, and the patient
 * taps the row that matches. Same engine, same screen, same large buttons - and
 * strictly tap-only: there is nothing to draw, nothing to drag or drop, no
 * two-finger interaction of any kind, and a choice is one tap on one button,
 * exactly as in the other four domains.
 *
 * Four shapes, each with its own colour as well as its own outline, so the row
 * can be read by shape or by colour. Nobody has to rely on colour vision, and
 * nobody has to rely on fine shape discrimination either.
 *
 * Difficulty is the length of the row, the number of choices, and - most of all
 * - how close the wrong rows are:
 *
 *   tier 1  2 shapes, 2 choices, the wrong row shares nothing with the right one
 *   tier 2  3 shapes, 3 choices, each wrong row differs in exactly one place
 *   tier 3  4 shapes, 4 choices, every row uses the *same four shapes* and only
 *           the order differs, so the pattern has to be held as a sequence
 */

/** How long the pattern stays on screen, per tier. Never below 2000ms. */
export const PATTERN_MATCHING_STUDY_MS = { 1: 4600, 2: 3800, 3: 3200 };

/**
 * The whole shape vocabulary: four shapes, four colours, one name each.
 *
 * Kept here with the questions rather than in the component, so the spoken
 * prompt, the accessible label and the drawing all read from one list and
 * cannot describe different shapes.
 */
export const PATTERN_SHAPES = {
  circle: { label: 'circle', color: '#0f766e' },
  square: { label: 'square', color: '#e9a23b' },
  triangle: { label: 'triangle', color: '#cf4b3a' },
  diamond: { label: 'diamond', color: '#15803d' },
};

/**
 * [tier, the pattern shown, ...the wrong patterns]
 *
 * The first row is always the answer. Tests assert that no two rows in a
 * question are the same pattern, that the tier-2 wrong rows differ in exactly
 * one place, and that the tier-3 wrong rows are re-orderings of the same four
 * shapes - so the gradient above is checked rather than claimed.
 */
const ROUNDS = [
  [1, ['circle', 'square'], ['triangle', 'diamond']],
  [1, ['triangle', 'circle'], ['diamond', 'square']],
  [1, ['square', 'diamond'], ['circle', 'triangle']],
  [1, ['diamond', 'triangle'], ['square', 'circle']],
  [1, ['circle', 'diamond'], ['square', 'triangle']],
  [1, ['square', 'triangle'], ['diamond', 'circle']],
  [1, ['triangle', 'square'], ['circle', 'diamond']],
  [1, ['diamond', 'circle'], ['triangle', 'square']],

  [2, ['circle', 'square', 'triangle'], ['circle', 'diamond', 'triangle'], ['diamond', 'square', 'triangle']],
  [2, ['square', 'triangle', 'diamond'], ['square', 'circle', 'diamond'], ['square', 'triangle', 'circle']],
  [2, ['triangle', 'diamond', 'circle'], ['square', 'diamond', 'circle'], ['triangle', 'diamond', 'square']],
  [2, ['diamond', 'circle', 'square'], ['diamond', 'triangle', 'square'], ['triangle', 'circle', 'square']],
  [2, ['circle', 'triangle', 'square'], ['circle', 'triangle', 'diamond'], ['diamond', 'triangle', 'square']],
  [2, ['square', 'diamond', 'circle'], ['triangle', 'diamond', 'circle'], ['square', 'diamond', 'triangle']],
  [2, ['triangle', 'circle', 'diamond'], ['triangle', 'square', 'diamond'], ['square', 'circle', 'diamond']],
  [2, ['diamond', 'square', 'triangle'], ['circle', 'square', 'triangle'], ['diamond', 'square', 'circle']],

  [3, ['circle', 'square', 'triangle', 'diamond'],
    ['square', 'circle', 'triangle', 'diamond'],
    ['circle', 'square', 'diamond', 'triangle'],
    ['triangle', 'square', 'circle', 'diamond']],
  [3, ['diamond', 'triangle', 'square', 'circle'],
    ['triangle', 'diamond', 'square', 'circle'],
    ['diamond', 'triangle', 'circle', 'square'],
    ['diamond', 'square', 'triangle', 'circle']],
  [3, ['square', 'diamond', 'circle', 'triangle'],
    ['diamond', 'square', 'circle', 'triangle'],
    ['square', 'diamond', 'triangle', 'circle'],
    ['square', 'circle', 'diamond', 'triangle']],
  [3, ['triangle', 'circle', 'diamond', 'square'],
    ['circle', 'triangle', 'diamond', 'square'],
    ['triangle', 'circle', 'square', 'diamond'],
    ['triangle', 'diamond', 'circle', 'square']],
  [3, ['circle', 'diamond', 'square', 'triangle'],
    ['diamond', 'circle', 'square', 'triangle'],
    ['circle', 'diamond', 'triangle', 'square'],
    ['circle', 'square', 'diamond', 'triangle']],
  [3, ['square', 'triangle', 'diamond', 'circle'],
    ['triangle', 'square', 'diamond', 'circle'],
    ['square', 'triangle', 'circle', 'diamond'],
    ['square', 'diamond', 'triangle', 'circle']],
  [3, ['diamond', 'circle', 'triangle', 'square'],
    ['circle', 'diamond', 'triangle', 'square'],
    ['diamond', 'circle', 'square', 'triangle'],
    ['diamond', 'triangle', 'circle', 'square']],
  [3, ['triangle', 'square', 'circle', 'diamond'],
    ['square', 'triangle', 'circle', 'diamond'],
    ['triangle', 'square', 'diamond', 'circle'],
    ['triangle', 'circle', 'square', 'diamond']],
];

/**
 * The question asked is always the same six words; only the pattern changes.
 * A familiar, unchanging question is one less thing to work out each time.
 */
export const PATTERN_MATCHING_QUESTION = 'Which pattern did you just see?';

/** A pattern's id is its shapes in order, so two different rows cannot collide. */
const patternId = (pattern) => `p-${pattern.map((shape) => shape[0]).join('')}`;

/** "circle, square, triangle" - in order, because the order is the question. */
export function patternWords(pattern) {
  return pattern.map((shape) => PATTERN_SHAPES[shape].label).join(', ');
}

/**
 * A pattern is offered as a row of drawn shapes with no words on the button, so
 * the patient compares pictures rather than reading. `label` is what a screen
 * reader and the feedback line say instead.
 */
const option = (pattern, questionId) => ({
  id: patternId(pattern),
  item: null,
  text: null,
  label: patternWords(pattern),
  cards: pattern.map((shape, at) => ({
    id: `${questionId}-${patternId(pattern)}-c${at}`,
    shape,
  })),
});

export const PATTERN_MATCHING = {
  domain: 'pattern_matching',
  name: 'Match the pattern',
  /** The direct route to this game, and how the play screen recognises it. */
  path: '/play/patterns',
  /** How the counter in the header reads: "Pattern 3 of 8". */
  unitLabel: 'Pattern',
  benefit: 'Builds visual order and pattern recognition.',
  difficultyGuide: {
    1: 'Remember a short row of clearly different shapes.',
    2: 'Rows are longer and differ by only one place.',
    3: 'The same shapes move around, so their order matters.',
  },
  /** What the difficulty transition adds, in this domain's own terms. */
  tierDetail: {
    easier: 'The next patterns are shorter and easier to tell apart.',
    harder: 'The next patterns are longer and look more alike.',
  },
  doneLine: (correct, asked) => `You matched ${correct} of ${asked} patterns today.`,
  /** How a wrong answer is put, warmly, in this domain's own terms. */
  missLine: (words) => `The pattern was ${words}`,
  questions: ROUNDS.map(([tier, answer, ...wrong], i) => {
    const id = `pm-${i + 1}`;
    return {
      id,
      tier,
      /** Nothing is drawn from the picture catalogue, so there is no `studyItem`. */
      studyItem: null,
      studyMs: PATTERN_MATCHING_STUDY_MS[tier],
      studyPrompt: `Remember this pattern: ${patternWords(answer)}.`,
      studyCards: answer.map((shape, at) => ({ id: `${id}-c${at}`, shape })),
      prompt: PATTERN_MATCHING_QUESTION,
      answerId: patternId(answer),
      options: [answer, ...wrong].map((pattern) => option(pattern, id)),
    };
  }),
};
