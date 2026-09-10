import test from 'node:test';
import assert from 'node:assert/strict';
import { BANKS } from '../src/data/banks.js';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_SETTING,
  listWordsLocalized,
  localizeBank,
  localizeQuestion,
  t,
} from '../src/lib/i18n.js';
import { DEFAULT_VOICE, createSpeaker } from '../src/lib/speak.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { createRecordStore } from '../src/lib/store.js';

test('patient language support is exactly English and Assamese', () => {
  assert.deepEqual(Object.keys(LANGUAGES), ['en', 'as']);
  assert.equal(DEFAULT_LANGUAGE, 'en');
  assert.equal(LANGUAGE_SETTING, 'patient-language');
  assert.equal(t('as', 'language.label'), 'ভাষা');
  assert.equal(t('en', 'language.label'), 'Language');
  assert.equal(listWordsLocalized(['বৃত্ত', 'হীৰা', 'বৰ্গ'], 'as'), 'বৃত্ত, হীৰা আৰু বৰ্গ');
});

test('the selected language uses the existing local settings store and survives a reload read', async () => {
  const store = createRecordStore(createMemoryDriver());
  await store.setSetting(LANGUAGE_SETTING, 'as');
  assert.equal(await store.getSetting(LANGUAGE_SETTING, DEFAULT_LANGUAGE), 'as');
  assert.equal(await store.getSetting('missing-language', DEFAULT_LANGUAGE), DEFAULT_LANGUAGE);
});

test('every game has a localized bank and localized question display data', () => {
  assert.equal(BANKS.length, 5);
  for (const bank of BANKS) {
    const displayBank = localizeBank(bank, 'as');
    assert.notEqual(displayBank.name, bank.name, `${bank.domain} name should be localized`);
    assert.notEqual(displayBank.benefit, bank.benefit, `${bank.domain} benefit should be localized`);
    for (const question of bank.questions) {
      const display = localizeQuestion(bank, question, 'as');
      assert.ok(display.prompt, `${question.id} needs a localized prompt`);
      assert.ok(display.options.length >= 2, `${question.id} keeps its choices`);
      assert.ok(display.options.every((option) => option.label || option.text || option.cards), `${question.id} choices stay accessible`);
      if (question.studyPrompt) assert.ok(display.studyPrompt, `${question.id} needs a localized study prompt`);
    }
  }
});

test('the voice selects Assamese when present and falls back to the closest available voice', () => {
  const calls = [];
  const voices = [{ lang: 'en-US', name: 'English' }, { lang: 'as-IN', name: 'Assamese' }];
  const synth = {
    getVoices: () => voices,
    cancel: () => calls.push(['cancel']),
    speak: (utterance) => calls.push(['speak', utterance]),
  };
  const speaker = createSpeaker({ synth, language: 'as', makeUtterance: (text) => ({ text }) });
  speaker.speak('নমস্কাৰ');
  assert.equal(calls.at(-1)[1].lang, 'as-IN');
  assert.equal(calls.at(-1)[1].voice.name, 'Assamese');

  const fallback = createSpeaker({
    synth: { ...synth, getVoices: () => [{ lang: 'en-US', name: 'English' }] },
    language: 'as',
    makeUtterance: (text) => ({ text }),
  });
  fallback.speak('নমস্কাৰ', 'hello');
  assert.equal(calls.at(-1)[1].lang, 'en-US', 'the fallback utterance uses the available voice locale');
  assert.equal(calls.at(-1)[1].voice.name, 'English', 'the closest available voice is used');
  assert.equal(calls.at(-1)[1].text, 'hello', 'unsupported Assamese voices receive an audible English fallback');
  assert.equal(fallback.setLanguage('invalid'), 'en');
  fallback.speak('hello');
  assert.equal(calls.at(-1)[1].lang, DEFAULT_VOICE.lang, 'invalid values safely use English');
});
