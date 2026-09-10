/**
 * voice - the app's single speech entry point, and the only file allowed to touch
 * the browser's speech API.
 *
 * Same shape as `db.js`: pick the real implementation once, wrap it so a failure
 * can never interrupt a game, and let every screen import only these functions.
 * A test (`tests/speak.test.js`) fails if `speechSynthesis` or
 * `SpeechSynthesisUtterance` appears anywhere else under `src/`, which is what
 * keeps the "one reusable speak() helper" rule true as the app grows.
 */
import { createSpeaker } from './speak.js';
import { DEFAULT_LANGUAGE, isLanguage } from './i18n.js';

let speaker = null;
let speechLanguage = DEFAULT_LANGUAGE;

function build() {
  const hasWindow = typeof window !== 'undefined';
  const synth = hasWindow ? window.speechSynthesis || null : null;
  const makeUtterance =
    hasWindow && window.SpeechSynthesisUtterance
      ? (text) => new window.SpeechSynthesisUtterance(text)
      : null;

  const made = createSpeaker({
    synth,
    makeUtterance,
    language: speechLanguage,
    onError: (error) => console.warn('[CogniCare] speech failed:', error),
  });
  if (!made.isSupported()) {
    console.warn('[CogniCare] speech synthesis unavailable - the game stays fully playable in silence');
  }
  return made;
}

/** The shared speaker, created on first use. */
export function getSpeaker() {
  if (!speaker) speaker = build();
  return speaker;
}

/** Say one line now, interrupting anything still being spoken. `fallbackText` is
 * used only when Assamese is selected but this browser has no Assamese voice. */
export function speak(text, fallbackText = '') {
  return getSpeaker().speak(text, fallbackText);
}

/** Open the speech queue from inside a user gesture (the Play tap). */
export function primeSpeech() {
  return getSpeaker().prime();
}

/** Stop talking - used when a patient leaves a screen. */
export function cancelSpeech() {
  return getSpeaker().cancel();
}

export function isSpeechSupported() {
  return getSpeaker().isSupported();
}

/** Select the patient language for all future utterances. */
export function setSpeechLanguage(language) {
  speechLanguage = isLanguage(language) ? language : DEFAULT_LANGUAGE;
  if (speaker?.setLanguage) speaker.setLanguage(speechLanguage);
  return speechLanguage;
}

/** Replaces the speaker - used by tests and by nothing else. */
export function useSpeaker(custom) {
  speaker = custom;
  if (speaker?.setLanguage) speaker.setLanguage(speechLanguage);
  return speaker;
}
