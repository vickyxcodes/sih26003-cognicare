/**
 * wording - the one rule for saying a short list out loud.
 *
 * The three memorise-then-recall domains all have to read a handful of things
 * to the patient before hiding them ("Cup, Dog and Hat"). Written once here so
 * the spoken prompt has the same rhythm in every game rather than three
 * slightly different join calls.
 */

/** "Cup", "Cup and Dog", "Tea, House and Shoe" - never a bare comma at the end. */
export function listWords(words) {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}
