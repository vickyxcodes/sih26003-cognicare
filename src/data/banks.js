/**
 * banks - the five game domains and the order a visit plays them.
 *
 * The patient still has exactly one button. Rather than asking someone with
 * dementia to choose between five games - a decision, and the app's whole design
 * is about removing decisions - each session simply plays the next domain:
 * remember-the-picture, everyday-routines, remember-the-words,
 * remember-the-numbers, match-the-pattern, then back to the beginning. Every
 * domain therefore gets exercised over a few sessions, which is also what keeps
 * all five trend lines on the caregiver chart alive.
 *
 * Each bank also carries its own `path`, so a caregiver (or a test) can open one
 * game directly without the play screen needing to know any domain by name.
 */
import { MEMORY_RECALL } from './memoryRecall.js';
import { ROUTINE_MATCHING } from './routineMatching.js';
import { WORD_RECALL } from './wordRecall.js';
import { NUMBER_SEQUENCE } from './numberSequence.js';
import { PATTERN_MATCHING } from './patternMatching.js';
import { ABOUT_ME } from './aboutMe.js';

export const BANKS = [
  MEMORY_RECALL,
  ROUTINE_MATCHING,
  WORD_RECALL,
  NUMBER_SEQUENCE,
  PATTERN_MATCHING,
  ABOUT_ME,
];

/** The game a fresh visit opens with. */
export const FIRST_BANK = BANKS[0];

/** The next domain in the rotation - what "Play again" starts. */
export function nextBank(bank) {
  const at = BANKS.findIndex((b) => b.domain === (bank && bank.domain));
  return BANKS[(at + 1) % BANKS.length];
}

/**
 * What to call an option out loud.
 *
 * Most options carry their own words ("Cup"), but a pattern is a row of drawn
 * shapes with nothing written on it, so it carries a `label` instead. One
 * function, so the button's accessible name and the feedback sentence can never
 * describe an option differently.
 */
export function optionWords(option) {
  if (!option) return '';
  return option.label || option.text || '';
}
