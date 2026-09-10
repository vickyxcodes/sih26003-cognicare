import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_VOICE, createSpeaker } from '../src/lib/speak.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

/** A stand-in for window.speechSynthesis that just records the call order. */
function fakeSynth() {
  const calls = [];
  return {
    calls,
    cancel() {
      calls.push(['cancel']);
    },
    speak(utterance) {
      calls.push(['speak', utterance]);
    },
  };
}

/** A stand-in for `new SpeechSynthesisUtterance(text)`. */
const makeUtterance = (text) => ({ text });

const spoken = (synth) => synth.calls.filter((c) => c[0] === 'speak').map((c) => c[1]);

/* ----------------------------------------------------------- the pure helper */

test('a device with no speech is silent, not broken', () => {
  const s = createSpeaker({});
  assert.equal(s.isSupported(), false);
  assert.equal(s.speak('hello'), false);
  assert.equal(s.prime(), false);
  assert.doesNotThrow(() => s.cancel());
});

test('each prompt cancels the one before it, so the current screen always wins', () => {
  const synth = fakeSynth();
  const s = createSpeaker({ synth, makeUtterance });
  s.speak('look at the cup');
  s.speak('which one did you just see');
  assert.deepEqual(
    spoken(synth).map((u) => u.text),
    ['look at the cup', 'which one did you just see']
  );
  // Every speak is immediately preceded by a cancel: no backlog can build up.
  assert.deepEqual(synth.calls.map((c) => c[0]), ['cancel', 'speak', 'cancel', 'speak']);
});

test('the spoken utterance carries the elderly-friendly voice settings', () => {
  const synth = fakeSynth();
  createSpeaker({ synth, makeUtterance }).speak('hello');
  const u = spoken(synth)[0];
  assert.equal(u.lang, DEFAULT_VOICE.lang);
  assert.equal(u.rate, DEFAULT_VOICE.rate);
  assert.ok(u.rate < 1, 'a little slower than the browser default');
  assert.equal(u.volume, 1);
});

test('empty or blank text says nothing', () => {
  const synth = fakeSynth();
  const s = createSpeaker({ synth, makeUtterance });
  assert.equal(s.speak(''), false);
  assert.equal(s.speak('   '), false);
  assert.equal(s.speak(null), false);
  assert.equal(s.speak(undefined), false);
  assert.equal(synth.calls.length, 0);
});

test('prime opens the queue once, silently, for iOS', () => {
  const synth = fakeSynth();
  const s = createSpeaker({ synth, makeUtterance });
  assert.equal(s.isPrimed(), false);
  assert.equal(s.prime(), true);
  assert.equal(s.isPrimed(), true);
  assert.equal(spoken(synth)[0].volume, 0, 'the priming utterance must be inaudible');

  const before = spoken(synth).length;
  assert.equal(s.prime(), false, 'a second prime is a no-op');
  assert.equal(spoken(synth).length, before);
});

test('muting stops current speech and refuses new speech until turned back on', () => {
  const synth = fakeSynth();
  const s = createSpeaker({ synth, makeUtterance });
  s.setEnabled(false);
  assert.equal(s.isEnabled(), false);
  assert.equal(s.speak('hello'), false);
  assert.ok(synth.calls.some((c) => c[0] === 'cancel'), 'muting also silences what is playing');
  s.setEnabled(true);
  assert.equal(s.speak('hello'), true);
});

test('a synth that throws is swallowed and reported, never reaching the caller', () => {
  const errors = [];
  const throwing = {
    cancel() {},
    speak() {
      throw new Error('boom');
    },
  };
  const s = createSpeaker({ synth: throwing, makeUtterance, onError: (e) => errors.push(e) });
  assert.equal(s.speak('hello'), false);
  assert.equal(errors.length, 1);
});

/* --------------------------------------------------- the helper is wired in */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}
const srcFiles = walk(SRC).filter((f) => ['.js', '.jsx'].includes(extname(f)));

test('the browser speech API is confined to one adapter file', () => {
  for (const file of srcFiles) {
    if (/speechSynthesis|SpeechSynthesisUtterance/.test(readFileSync(file, 'utf8'))) {
      assert.equal(
        relative(SRC, file).replace(/\\/g, '/'),
        'lib/voice.js',
        `${relative(ROOT, file)} touches the speech API directly - it must go through voice.js`
      );
    }
  }
});

test('the game screen speaks its prompts through the helper, never inline', () => {
  const play = read('src', 'pages', 'Play.jsx');
  assert.match(play, /import \{[^}]*\bspeak\b[^}]*\} from '\.\.\/lib\/voice\.js'/);
  assert.match(play, /speak\(displayQuestion\.studyPrompt, englishQuestion\.studyPrompt\)/, 'the spoken study prompt comes from the localized question with a fallback');
  assert.match(play, /displayQuestion\.prompt/);
  assert.match(play, /choicesSpeech\(displayQuestion, language\)/, 'the spoken ask phase must include every localized option');
  assert.ok(!/speechSynthesis/.test(play), 'the screen must not touch the speech API directly');
  // The feedback, tier and finished screens each say their own line too.
  assert.ok((play.match(/\bspeak\(/g) || []).length >= 5, 'every screen should speak for itself');
  assert.match(play, /cancelSpeech/, 'leaving the game must be able to stop speech');
});

test('home greets on arrival and primes the speech queue inside the Play tap', () => {
  const home = read('src', 'pages', 'PatientHome.jsx');
  assert.match(home, /from '\.\.\/lib\/voice\.js'/);
  assert.match(home, /speak\(t\('home\.greeting'\), translate\('en', 'home\.greeting'\)\)/, 'a localized spoken greeting with a fallback');
  assert.match(
    home,
    /primeSpeech\(\);?[\s\S]{0,60}navigate\('\/play'\)/,
    'the tap must prime speech before leaving for the game (iOS needs the gesture)'
  );
});
