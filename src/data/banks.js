/**
 * banks - the two game domains and the order a visit plays them.
 *
 * The patient still has exactly one button. Rather than asking someone with
 * dementia to choose between two games - a decision, and the app's whole design
 * is about removing decisions - each session simply plays the next domain:
 * remember-the-picture, then everyday-routines, then back again. Both domains
 * therefore get exercised on a normal day, which is also what keeps both trend
 * lines on the caregiver chart alive.
 */
import { MEMORY_RECALL } from './memoryRecall.js';
import { ROUTINE_MATCHING } from './routineMatching.js';

export const BANKS = [MEMORY_RECALL, ROUTINE_MATCHING];

/** The game a fresh visit opens with. */
export const FIRST_BANK = BANKS[0];

/** The next domain in the rotation - what "Play again" starts. */
export function nextBank(bank) {
  const at = BANKS.findIndex((b) => b.domain === (bank && bank.domain));
  return BANKS[(at + 1) % BANKS.length];
}
