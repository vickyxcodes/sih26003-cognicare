import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITEMS, itemCategory } from '../src/data/catalog.js';
import { MEMORY_RECALL, MEMORY_RECALL_STUDY_MS } from '../src/data/memoryRecall.js';
import { ROUTINE_MATCHING, ROUTINE_QUESTION } from '../src/data/routineMatching.js';
import { BANKS, FIRST_BANK, nextBank } from '../src/data/banks.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The drawings live in JSX, so read the ART keys out of the source. */
function drawnItemIds() {
  const src = readFileSync(join(ROOT, 'src', 'components', 'Picture.jsx'), 'utf8');
  const body = src.slice(src.indexOf('const ART = {'));
  return new Set([...body.matchAll(/^ {2}([a-z][a-zA-Z]*):\s*\(/gm)].map((m) => m[1]));
}

const drawn = drawnItemIds();

/**
 * Both domains are held to the same invariants below - that is the point of
 * building domain 2 on the same shapes as domain 1 rather than a parallel game.
 */
const banks = [MEMORY_RECALL, ROUTINE_MATCHING];

test('every catalogued item has a drawing and every drawing is catalogued', () => {
  for (const id of Object.keys(ITEMS)) {
    assert.ok(drawn.has(id), `${id} is in the catalogue but has no picture`);
  }
  for (const id of drawn) {
    assert.ok(ITEMS[id], `${id} is drawn but missing from the catalogue`);
  }
});

test('each domain offers well over the six questions the spec requires', () => {
  for (const bank of banks) {
    assert.ok(bank.questions.length >= 6, `${bank.domain} has only ${bank.questions.length}`);
    for (const tier of [1, 2, 3]) {
      const count = bank.questions.filter((q) => q.tier === tier).length;
      assert.ok(count >= 6, `${bank.domain} tier ${tier} has only ${count} questions`);
    }
  }
});

test('every question is answerable, unambiguous and has exactly two options', () => {
  for (const bank of banks) {
    const ids = new Set();
    for (const q of bank.questions) {
      assert.ok(!ids.has(q.id), `duplicate question id ${q.id}`);
      ids.add(q.id);
      assert.equal(q.options.length, 2, `${q.id} does not offer two options`);
      assert.notEqual(q.options[0].id, q.options[1].id, `${q.id} offers the same option twice`);
      assert.ok(
        q.options.some((o) => o.id === q.answerId),
        `${q.id} has an answer that is not among its options`
      );
      for (const o of q.options) {
        assert.ok(o.text && o.text.trim(), `${q.id} has an option with no words`);
        if (o.item) assert.ok(drawn.has(o.item), `${q.id} shows an undrawn item: ${o.item}`);
      }
      assert.ok(q.prompt.endsWith('?'), `${q.id} prompt should be a question`);
    }
  }
});

test('memory recall shows the item it then asks about, for the tier duration', () => {
  for (const q of MEMORY_RECALL.questions) {
    assert.equal(q.studyItem, q.answerId, `${q.id} asks about something it never showed`);
    assert.equal(q.studyMs, MEMORY_RECALL_STUDY_MS[q.tier], `${q.id} study time does not match its tier`);
    assert.match(q.studyPrompt, /remember/i);
  }
});

test('difficulty is real: easy tiers pair unlike objects, tier 3 pairs alike ones', () => {
  for (const q of MEMORY_RECALL.questions) {
    const wrong = q.options.find((o) => o.id !== q.answerId);
    const same = itemCategory(q.answerId) === itemCategory(wrong.id);
    if (q.tier === 3) {
      assert.ok(same, `${q.id} is tier 3 but ${q.answerId}/${wrong.id} are easy to tell apart`);
    } else {
      assert.ok(!same, `${q.id} is tier ${q.tier} but ${q.answerId}/${wrong.id} are both ${itemCategory(q.answerId)}`);
    }
  }
});

test('study time shortens as the tier rises', () => {
  assert.ok(MEMORY_RECALL_STUDY_MS[1] > MEMORY_RECALL_STUDY_MS[2]);
  assert.ok(MEMORY_RECALL_STUDY_MS[2] > MEMORY_RECALL_STUDY_MS[3]);
  assert.ok(MEMORY_RECALL_STUDY_MS[3] >= 2000, 'never flash a picture faster than 2s');
});

/* --------------------------------------------- domain 2: routine matching */

test('routine matching asks for an object by its use, with nothing to memorise', () => {
  for (const q of ROUTINE_MATCHING.questions) {
    assert.equal(q.studyItem, null, `${q.id} has a study picture - the cue must stay on screen`);
    assert.equal(q.studyMs, 0, `${q.id} would hold a study screen`);
    assert.equal(q.studyPrompt, null);
    assert.ok(drawn.has(q.answerId), `${q.id} answers with an undrawn object: ${q.answerId}`);
    // A cue (the moment in the day) and then always the same short question.
    assert.ok(q.prompt.endsWith(ROUTINE_QUESTION), `${q.id} does not end with the standard question`);
    const cue = q.prompt.slice(0, -ROUTINE_QUESTION.length).trim();
    assert.ok(cue.length > 10, `${q.id} has no real cue, only the question`);
    assert.ok(cue.endsWith('.'), `${q.id} cue should be a complete sentence`);
    assert.ok(cue.split(/\s+/).length <= 9, `${q.id} cue is too long to take in: "${cue}"`);
  }
});

test('the routine cue never names the object it is asking for', () => {
  for (const q of ROUTINE_MATCHING.questions) {
    const cue = q.prompt.slice(0, -ROUTINE_QUESTION.length).toLowerCase();
    for (const word of ITEMS[q.answerId].label.toLowerCase().split(/\s+/)) {
      if (['of', 'a', 'the'].includes(word)) continue;
      assert.ok(!cue.includes(word), `${q.id} gives the answer away: "${cue}" names "${word}"`);
    }
  }
});

test('every routine moment is distinct, so a session never repeats itself', () => {
  const cues = ROUTINE_MATCHING.questions.map((q) => q.prompt);
  assert.equal(new Set(cues).size, cues.length, 'two questions describe the same moment');
});

test('routine difficulty is real: only tier 3 pairs objects of the same kind', () => {
  for (const q of ROUTINE_MATCHING.questions) {
    const wrong = q.options.find((o) => o.id !== q.answerId);
    const same = itemCategory(q.answerId) === itemCategory(wrong.id);
    if (q.tier === 3) {
      assert.ok(same, `${q.id} is tier 3 but ${q.answerId}/${wrong.id} are easy to tell apart`);
    } else {
      assert.ok(!same, `${q.id} is tier ${q.tier} but both objects are ${itemCategory(q.answerId)}`);
    }
  }
});

/* ------------------------------------------------- the two-domain rotation */

test('a visit plays every domain in turn, memory recall first', () => {
  assert.deepEqual(BANKS.map((b) => b.domain), [
    'memory_recall',
    'routine_matching',
    'word_recall',
    'number_sequence',
    'pattern_matching',
    'about_me',
  ]);
  assert.equal(FIRST_BANK.domain, 'memory_recall');
  assert.equal(nextBank(MEMORY_RECALL).domain, 'routine_matching');
  assert.equal(nextBank(ROUTINE_MATCHING).domain, 'word_recall');
  assert.equal(
    nextBank(BANKS[BANKS.length - 1]).domain,
    FIRST_BANK.domain,
    'the rotation comes back round'
  );
  assert.equal(nextBank(null).domain, FIRST_BANK.domain, 'an unknown bank falls back, never crashes');
});

test('each domain carries its own wording so no screen describes the wrong game', () => {
  const seen = new Set();
  for (const bank of banks) {
    assert.ok(bank.name && bank.unitLabel, `${bank.domain} is missing its labels`);
    assert.ok(!seen.has(bank.unitLabel), 'the two domains should not count in the same words');
    seen.add(bank.unitLabel);
    assert.match(bank.doneLine(3, 8), /3[\s\S]*8/, `${bank.domain} closing line drops the count`);
    for (const direction of ['easier', 'harder']) {
      const detail = bank.tierDetail[direction];
      assert.ok(detail && detail.endsWith('.'), `${bank.domain} has no ${direction} detail line`);
    }
    assert.notEqual(bank.tierDetail.easier, bank.tierDetail.harder);
  }
});
