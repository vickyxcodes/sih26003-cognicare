/**
 * speak - the whole voice behaviour as one small, pure helper.
 *
 * No `window`, no browser speech API, no imports: the synthesiser and a way to
 * build an utterance are injected, exactly like `now`/`rand` are injected into the
 * game engine. That is what lets `node --test` prove the rules (newest prompt wins,
 * silence when unsupported, prime-once) with a fake synth and no browser, and it is
 * why the app has one voice path instead of scattered speak calls that could each
 * drift in rate, language, or interrupt behaviour.
 *
 * The real synthesiser is wired in exactly one adapter file, `src/lib/voice.js`.
 */

/**
 * A touch slower than the browser default, so a prompt is easy to follow, and an
 * Indian-English voice hint (the app is English-only; the browser falls back to
 * whatever English voice it has if en-IN is not installed).
 */
export const DEFAULT_VOICE = { lang: 'en-IN', rate: 0.9, pitch: 1, volume: 1 };

export function createSpeaker(options = {}) {
  const {
    synth = null,
    makeUtterance = null,
    voice = DEFAULT_VOICE,
    onError = () => {},
  } = options;

  // Voice needs both halves of the API: the controller to speak/cancel, and a
  // constructor for the utterance. Missing either means this device has no speech,
  // so every call becomes a safe no-op and the game plays on in silence.
  const supported = Boolean(synth && makeUtterance);
  let enabled = true;
  let primed = false;

  function build(text) {
    const utterance = makeUtterance(String(text));
    utterance.lang = voice.lang;
    utterance.rate = voice.rate;
    utterance.pitch = voice.pitch;
    utterance.volume = voice.volume;
    return utterance;
  }

  function cancel() {
    if (!supported) return;
    try {
      synth.cancel();
    } catch (error) {
      onError(error);
    }
  }

  /**
   * Say one line. The previous utterance is always cancelled first: the screens
   * advance on their own timers, so the words for the screen the patient is looking
   * at now must win over whatever was said for the one before it - never a backlog
   * of prompts read out after the moment has passed.
   */
  function speak(text) {
    if (!supported || !enabled) return false;
    const line = String(text ?? '').trim();
    if (!line) return false;
    try {
      synth.cancel();
      synth.speak(build(line));
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  /**
   * Unlock speech from inside a real tap.
   *
   * iOS Safari refuses to speak unless the first utterance of the session starts
   * inside a user gesture, so the Play button calls this. It speaks a single silent
   * space - inaudible, but enough to open the queue so the prompts fired later by
   * timers are allowed to play. Idempotent: only the first tap needs to do it.
   */
  function prime() {
    if (!supported || primed) return false;
    primed = true;
    try {
      synth.cancel();
      const utterance = build(' ');
      utterance.volume = 0;
      synth.speak(utterance);
      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  return {
    speak,
    cancel,
    prime,
    isSupported: () => supported,
    isEnabled: () => enabled,
    isPrimed: () => primed,
    setEnabled: (value) => {
      enabled = Boolean(value);
      if (!enabled) cancel();
      return enabled;
    },
  };
}
