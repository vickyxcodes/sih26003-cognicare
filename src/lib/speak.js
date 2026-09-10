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
 * Indian-English voice hint. The browser falls back to the closest available
 * voice if the requested locale is not installed.
 */
export const DEFAULT_VOICE = { lang: 'en-IN', rate: 0.9, pitch: 1, volume: 1 };
export const VOICE_LOCALES = { en: 'en-IN', as: 'as-IN' };

const validLanguage = (language) => Object.prototype.hasOwnProperty.call(VOICE_LOCALES, language)
  ? language
  : 'en';

function resolveVoice(synth, locale) {
  if (typeof synth?.getVoices !== 'function') return { voice: null, locale };
  const voices = synth.getVoices() || [];
  if (!voices.length) return { voice: null, locale: locale === 'as-IN' ? DEFAULT_VOICE.lang : locale };
  const exact = voices.find((voice) => String(voice.lang).toLowerCase() === locale.toLowerCase());
  if (exact) return { voice: exact, locale };
  const base = locale.split('-')[0].toLowerCase();
  const closest = voices.find((voice) => {
    const voiceLocale = String(voice.lang).toLowerCase();
    return voiceLocale === base || voiceLocale.startsWith(`${base}-`);
  });
  if (closest) return { voice: closest, locale };
  const fallback = voices.find((voice) => String(voice.lang).toLowerCase().startsWith('en-')) || voices[0] || null;
  return { voice: fallback, locale: fallback?.lang || locale };
}

export function createSpeaker(options = {}) {
  const {
    synth = null,
    makeUtterance = null,
    voice = DEFAULT_VOICE,
    language = 'en',
    onError = () => {},
  } = options;

  // Voice needs both halves of the API: the controller to speak/cancel, and a
  // constructor for the utterance. Missing either means this device has no speech,
  // so every call becomes a safe no-op and the game plays on in silence.
  const supported = Boolean(synth && makeUtterance);
  let enabled = true;
  let primed = false;
  let selectedLanguage = validLanguage(language);

  function build(text, fallbackText = '') {
    const requestedLocale = VOICE_LOCALES[selectedLanguage] || voice.lang;
    const resolved = resolveVoice(synth, requestedLocale);
    const hasAssameseVoice = resolved.locale.toLowerCase().startsWith('as');
    const line = selectedLanguage === 'as' && !hasAssameseVoice && fallbackText
      ? fallbackText
      : text;
    const utterance = makeUtterance(String(line));
    utterance.lang = resolved.locale;
    utterance.rate = voice.rate;
    utterance.pitch = voice.pitch;
    utterance.volume = voice.volume;
    if (resolved.voice) utterance.voice = resolved.voice;
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
  function speak(text, fallbackText = '') {
    if (!supported || !enabled) return false;
    const line = String(text ?? '').trim();
    if (!line) return false;
    try {
      synth.cancel();
      synth.speak(build(line, String(fallbackText ?? '').trim()));
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
    setLanguage: (next) => {
      selectedLanguage = validLanguage(next);
      cancel();
      return selectedLanguage;
    },
    setEnabled: (value) => {
      enabled = Boolean(value);
      if (!enabled) cancel();
      return enabled;
    },
  };
}
