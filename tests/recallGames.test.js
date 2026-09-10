import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  WORD_RECALL,
  WORD_RECALL_CHOICES,
  WORD_RECALL_QUESTION,
  WORD_RECALL_STUDY_MS,
} from '../src/data/wordRecall.js';
import {
  NUMBER_SEQUENCE,
  NUMBER_SEQUENCE_QUESTION,
  NUMBER_SEQUENCE_STUDY_MS,
} from '../src/data/numberSequence.js';
import {
  PATTERN_MATCHING,
  PATTERN_MATCHING_QUESTION,
  PATTERN_MATCHING_STUDY_MS,
  PATTERN_SHAPES,
  patternWords,
} from '../src/data/patternMatching.js';
import { listWords } from '../src/data/wording.js';
import { BANKS, FIRST_BANK, nextBank, optionWords } from '../src/data/banks.js';
import { createRecordStore, DOMAINS } from '../src/lib/store.js';
import { createMemoryDriver } from '../src/lib/memoryDriver.js';
import { buildSeries, describeTrend } from '../src/lib/trends.js';
import {
  DROP_AFTER_WRONG,
  MAX_QUESTIONS,
  MAX_TIER,
  MIN_TIER,
  PHASE,
  RAISE_AFTER_RIGHT,
  TIER_MESSAGE,
  TIER_MS,
  answerQuestion,
  continueSession,
  revealOptions,
  sessionSummary,
  startSession,
} from '../src/lib/sessionEngine.js';

/**
 * The three memorise-then-recall domains: word recall, number sequence and
 * pattern matching.
 *
 * None of them got its own game loop, its own storage path or its own screen, so
 * most of what is worth proving here is that the *shared* systems really do carry
 * them: the same engine plays them, the same adaptive difficulty moves them, the
 * same store logs them and the same caregiver chart reads them back. Those
 * assertions are deliberately the same shape as the ones domain 2 is held to in
 * `sessionEngine.test.js`, for the same reason - if any of the three had needed
 * special casing, these would be testing a second implementation.
 *
 * What *is* new is the question data, so it is checked hard: enough questions per
 * tier, exactly one right answer, choices a patient can actually tell apart, and
 * a difficulty gradient that is real rather than declared in a comment.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The three domains this file is about, with what each one should look like. */
const NEW_BANKS = [
  { bank: WORD_RECALL, prefix: 'wr', studyMs: WORD_RECALL_STUDY_MS, choices: { 1: 2, 2: 3, 3: 4 } },
  { bank: NUMBER_SEQUENCE, prefix: 'ns', studyMs: NUMBER_SEQUENCE_STUDY_MS, choices: { 1: 2, 2: 3, 3: 4 } },
  { bank: PATTERN_MATCHING, prefix: 'pm', studyMs: PATTERN_MATCHING_STUDY_MS, choices: { 1: 2, 2: 3, 3: 4 } },
];

const TIERS = [1, 2, 3];

/** Deterministic rand so a session can be replayed exactly. */
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Play a whole session through the real engine calls the screen makes, answering
 * correctly or not per `answers`. Copied in shape from `sessionEngine.test.js`
 * on purpose: the same helper has to drive these domains too, or they are not
 * really on the same loop.
 */
function playSession({ bank, answers, now = 0, tier = 1 }) {
  const rand = seeded();
  let state = startSession({ bank, tier, now, rand });
  const records = [];
  const tierScreens = [];
  const phases = [state.phase];
  let clock = now;
  for (const wantCorrect of answers) {
    if (state.phase === PHASE.DONE) break;
    state = revealOptions(state);
    const pick = wantCorrect
      ? state.question.answerId
      : state.question.options.find((o) => o.id !== state.question.answerId).id;
    clock += 5000;
    const result = answerQuestion(state, pick, clock);
    state = result.state;
    records.push(result.record);
    state = continueSession(state, { bank, now: clock, rand });
    if (state.phase === PHASE.TIER) {
      tierScreens.push(state.tierChange);
      clock += TIER_MS;
      state = continueSession(state, { bank, now: clock, rand });
    }
    phases.push(state.phase);
  }
  return { state, records, tierScreens, phases };
}

/* ------------------------------------------------- the questions themselves */

test('each new domain offers well over the six questions the spec requires', () => {
  for (const { bank } of NEW_BANKS) {
    assert.ok(bank.questions.length >= 6, `${bank.domain} has only ${bank.questions.length}`);
    for (const tier of TIERS) {
      const count = bank.questions.filter((q) => q.tier === tier).length;
      assert.ok(count >= 6, `${bank.domain} tier ${tier} has only ${count} questions`);
    }
    assert.deepEqual(
      [...new Set(bank.questions.map((q) => q.tier))].sort(),
      TIERS,
      `${bank.domain} must serve all three difficulty tiers`
    );
  }
});

test('every question has exactly one correct answer among two to four choices', () => {
  for (const { bank, prefix, choices } of NEW_BANKS) {
    const ids = new Set();
    for (const q of bank.questions) {
      assert.ok(!ids.has(q.id), `duplicate question id ${q.id}`);
      ids.add(q.id);
      assert.match(q.id, new RegExp(`^${prefix}-\\d+$`), `${q.id} is not a ${bank.domain} id`);

      // The spec's accessibility rule: never fewer than two, never more than four.
      assert.ok(
        q.options.length >= 2 && q.options.length <= 4,
        `${q.id} offers ${q.options.length} choices`
      );
      assert.equal(
        q.options.length,
        choices[q.tier],
        `${q.id} should offer ${choices[q.tier]} choices at tier ${q.tier}`
      );

      // Exactly one option can be right: the answer is present, and present once.
      const matching = q.options.filter((o) => o.id === q.answerId);
      assert.equal(matching.length, 1, `${q.id} has ${matching.length} options matching its answer`);

      // ...and no two options are the same thing wearing a different id.
      const optionIds = q.options.map((o) => o.id);
      assert.equal(new Set(optionIds).size, optionIds.length, `${q.id} offers the same option twice`);
      const words = q.options.map((o) => optionWords(o));
      assert.equal(new Set(words).size, words.length, `${q.id} offers two options that read alike`);

      // Every option can be named, so every button has an accessible name.
      for (const o of q.options) {
        assert.ok(optionWords(o).trim(), `${q.id} has an option with nothing to call it`);
        assert.equal(o.item, null, `${q.id} should not draw from the picture catalogue`);
      }

      assert.ok(q.prompt.endsWith('?'), `${q.id} prompt should be a question`);
      assert.equal(q.tier >= MIN_TIER && q.tier <= MAX_TIER, true, `${q.id} has an out-of-range tier`);
    }
  }
});

test('every question hides something first, and holds it long enough to take in', () => {
  for (const { bank, studyMs } of NEW_BANKS) {
    for (const q of bank.questions) {
      assert.equal(q.studyItem, null, `${q.id} should have no catalogue picture`);
      assert.ok(q.studyCards && q.studyCards.length >= 2, `${q.id} has nothing to memorise`);
      assert.equal(q.studyMs, studyMs[q.tier], `${q.id} study time does not match its tier`);
      assert.match(q.studyPrompt, /remember/i, `${q.id} does not ask the patient to remember`);
      const cardIds = q.studyCards.map((c) => c.id);
      assert.equal(new Set(cardIds).size, cardIds.length, `${q.id} repeats a study card id`);
      for (const card of q.studyCards) {
        assert.ok(card.text || card.shape, `${q.id} has a blank study card`);
      }
    }
    assert.ok(studyMs[1] > studyMs[2], `${bank.domain} tier 2 should be quicker than tier 1`);
    assert.ok(studyMs[2] > studyMs[3], `${bank.domain} tier 3 should be quicker than tier 2`);
    assert.ok(studyMs[3] >= 2000, `${bank.domain} must never flash faster than 2s`);
  }
});

test('difficulty is real: more to hold and more to choose from as the tier rises', () => {
  for (const { bank } of NEW_BANKS) {
    const held = TIERS.map(
      (tier) => bank.questions.find((q) => q.tier === tier).studyCards.length
    );
    assert.ok(held[0] < held[1] && held[1] < held[2], `${bank.domain} holds ${held} - not a gradient`);
    for (const tier of TIERS) {
      const sizes = new Set(bank.questions.filter((q) => q.tier === tier).map((q) => q.studyCards.length));
      assert.equal(sizes.size, 1, `${bank.domain} tier ${tier} is inconsistent about how much to hold`);
    }
  }
});

/* ------------------------------------------------------ word recall in detail */

test('word recall asks about a word it really showed, and never about one it did not', () => {
  for (const q of WORD_RECALL.questions) {
    const shown = q.studyCards.map((c) => c.text);
    const answer = q.options.find((o) => o.id === q.answerId);
    assert.ok(shown.includes(answer.text), `${q.id} asks about a word it never showed`);
    for (const wrong of q.options.filter((o) => o.id !== q.answerId)) {
      assert.ok(!shown.includes(wrong.text), `${q.id} offers "${wrong.text}", which WAS shown`);
    }
    // Word recall shows exactly as many words as it offers choices, so the tier
    // step raises both the load and the number of buttons together.
    assert.equal(q.studyCards.length, q.options.length, `${q.id} shows a different count than it offers`);
    assert.equal(q.studyCards.length, WORD_RECALL_CHOICES[q.tier], `${q.id} does not match its tier's size`);
    assert.equal(q.prompt, WORD_RECALL_QUESTION, 'the question never changes, only the words');
    assert.equal(q.studyPrompt, `Remember these words: ${listWords(shown)}.`);
  }
});

test('every word is short, familiar and one plain word - nothing to decipher', () => {
  const words = new Set();
  for (const q of WORD_RECALL.questions) {
    for (const text of [...q.studyCards.map((c) => c.text), ...q.options.map((o) => o.text)]) {
      words.add(text);
      assert.match(text, /^[A-Z][a-z]{1,8}$/, `"${text}" is not one short capitalised word`);
    }
  }
  assert.ok(words.size >= 20, `only ${words.size} distinct words across the whole bank`);
});

test('word recall tier 3 puts a near neighbour of a shown word among the choices', () => {
  /* The tier-3 rule is that recognising the gist is not enough: at least one
   * wrong word is a close relative of one that really was shown (bread/toast,
   * clock/watch). Checked by an explicit list rather than by cleverness, because
   * "close relative" is a judgment about English, not something to infer. */
  const NEIGHBOURS = {
    Toast: 'Bread', Watch: 'Clock', Cap: 'Hat', Table: 'Chair', Water: 'Milk',
    Snow: 'Rain', Cat: 'Dog', Fork: 'Spoon', Star: 'Moon', Sock: 'Shoe',
    Coffee: 'Tea', Street: 'Road', Fish: 'Bird', Towel: 'Soap', Lamp: 'Light',
    Lock: 'Key', Train: 'Bus', Evening: 'Morning', Home: 'House', Sugar: 'Salt',
    Foot: 'Hand', Gate: 'Door', Van: 'Car', Pillow: 'Bed',
  };
  for (const q of WORD_RECALL.questions.filter((one) => one.tier === 3)) {
    const shown = q.studyCards.map((c) => c.text);
    const wrong = q.options.filter((o) => o.id !== q.answerId).map((o) => o.text);
    const close = wrong.filter((word) => shown.includes(NEIGHBOURS[word]));
    assert.equal(
      close.length,
      wrong.length,
      `${q.id} is tier 3 but ${wrong.filter((w) => !close.includes(w))} are unrelated to anything shown`
    );
  }
});

/* -------------------------------------------------- number sequence in detail */

test('a number sequence is single digits, never repeated, so a position question is answerable', () => {
  for (const q of NUMBER_SEQUENCE.questions) {
    const digits = q.studyCards.map((c) => c.text);
    for (const digit of digits) {
      assert.match(digit, /^[1-9]$/, `${q.id} shows "${digit}", which is not a single digit`);
    }
    assert.equal(new Set(digits).size, digits.length, `${q.id} repeats a digit - "which came first" would be ambiguous`);
    assert.equal(q.prompt, NUMBER_SEQUENCE_QUESTION[q.tier]);
  }
});

test('the number asked for is the one the tier says: seen, last, then first', () => {
  for (const q of NUMBER_SEQUENCE.questions) {
    const digits = q.studyCards.map((c) => c.text);
    const answer = q.options.find((o) => o.id === q.answerId).text;
    if (q.tier === 1) {
      assert.ok(digits.includes(answer), `${q.id} asks about a digit it never showed`);
    } else if (q.tier === 2) {
      assert.equal(answer, digits[digits.length - 1], `${q.id} asks for the last digit but answers otherwise`);
    } else {
      assert.equal(answer, digits[0], `${q.id} asks for the first digit but answers otherwise`);
    }
  }
});

test('from tier 2 on, every choice is a digit the patient really saw', () => {
  for (const q of NUMBER_SEQUENCE.questions) {
    const digits = q.studyCards.map((c) => c.text);
    const offered = q.options.map((o) => o.text);
    if (q.tier === 1) {
      // Tier 1 is recognition, so the wrong option has to come from outside.
      const outside = offered.filter((d) => !digits.includes(d));
      assert.equal(outside.length, 1, `${q.id} should offer exactly one digit that was never shown`);
    } else {
      assert.deepEqual([...offered].sort(), [...digits].sort(), `${q.id} choices are not the sequence itself`);
    }
  }
});

test('digits are spoken as words, or "4 7" would be read aloud as forty-seven', () => {
  for (const q of NUMBER_SEQUENCE.questions) {
    assert.match(q.studyPrompt, /^Remember these numbers: [a-z, ]+ and [a-z]+\.$/, q.id);
    assert.doesNotMatch(q.studyPrompt, /\d/, `${q.id} reads a numeral out loud`);
    for (const o of q.options) {
      assert.match(o.label, /^[a-z]+$/, `${q.id} option ${o.id} has no spoken word`);
      assert.match(o.text, /^[1-9]$/, `${q.id} option ${o.id} should show the numeral`);
      assert.equal(optionWords(o), o.label, 'the spoken name wins over the numeral');
    }
  }
});

/* ------------------------------------------------- pattern matching in detail */

test('a pattern is a row of known shapes, and each candidate is a distinct row', () => {
  for (const q of PATTERN_MATCHING.questions) {
    const shown = q.studyCards.map((c) => c.shape);
    for (const shape of shown) {
      assert.ok(PATTERN_SHAPES[shape], `${q.id} uses an unknown shape "${shape}"`);
    }
    assert.equal(q.prompt, PATTERN_MATCHING_QUESTION);
    assert.equal(q.studyPrompt, `Remember this pattern: ${patternWords(shown)}.`);

    const rows = q.options.map((o) => o.cards.map((c) => c.shape).join('|'));
    assert.equal(new Set(rows).size, rows.length, `${q.id} offers the same pattern twice`);
    const answer = q.options.find((o) => o.id === q.answerId);
    assert.deepEqual(answer.cards.map((c) => c.shape), shown, `${q.id} does not offer the pattern it showed`);
    for (const o of q.options) {
      assert.equal(o.cards.length, shown.length, `${q.id} offers a row of a different length`);
      assert.equal(o.text, null, 'a pattern button carries no words, only shapes');
      assert.equal(optionWords(o), patternWords(o.cards.map((c) => c.shape)));
    }
  }
});

test('every shape is told apart by outline AND colour, so neither cue is required', () => {
  const shapes = Object.keys(PATTERN_SHAPES);
  assert.ok(shapes.length >= 3, 'too few shapes to build a pattern from');
  const colours = shapes.map((s) => PATTERN_SHAPES[s].color);
  assert.equal(new Set(colours).size, shapes.length, 'two shapes share a colour');
  const labels = shapes.map((s) => PATTERN_SHAPES[s].label);
  assert.equal(new Set(labels).size, shapes.length, 'two shapes share a name');
  for (const colour of colours) {
    assert.match(colour, /^#[0-9a-f]{6}$/, `${colour} is not a plain hex colour`);
  }
  // ...and each one is actually drawn, or the row would render empty boxes.
  const art = readFileSync(join(ROOT, 'src', 'components', 'CardRow.jsx'), 'utf8');
  const drawn = art.slice(art.indexOf('const SHAPE_PATH = {'));
  for (const shape of shapes) {
    assert.match(drawn, new RegExp(`^ {2}${shape}:`, 'm'), `${shape} has no drawing in CardRow.jsx`);
  }
});

test('pattern difficulty is real: unrelated rows, then one change, then a reordering', () => {
  for (const q of PATTERN_MATCHING.questions) {
    const right = q.options.find((o) => o.id === q.answerId).cards.map((c) => c.shape);
    for (const o of q.options.filter((one) => one.id !== q.answerId)) {
      const wrong = o.cards.map((c) => c.shape);
      const differences = right.filter((shape, at) => shape !== wrong[at]).length;
      const sameShapes =
        [...right].sort().join() === [...wrong].sort().join();
      if (q.tier === 1) {
        assert.equal(differences, right.length, `${q.id} tier 1 shares a position with the answer`);
      } else if (q.tier === 2) {
        assert.equal(differences, 1, `${q.id} tier 2 differs in ${differences} places, not one`);
      } else {
        assert.ok(sameShapes, `${q.id} tier 3 wrong row uses different shapes, not a reordering`);
        assert.ok(differences >= 2, `${q.id} tier 3 reordering moved only ${differences} shapes`);
      }
    }
  }
});

/* ----------------------------------- the shared engine really does play them */

test('each new domain opens on a study screen and then hides what it showed', () => {
  for (const { bank } of NEW_BANKS) {
    const state = startSession({ bank, now: 0, rand: seeded() });
    assert.equal(state.phase, PHASE.STUDY, `${bank.domain} must hide what it shows`);
    assert.equal(state.domain, bank.domain);
    assert.equal(state.bankName, bank.name);
    assert.equal(state.tier, MIN_TIER, 'a session opens at the easiest tier');
    assert.ok(state.question.studyCards.length, 'there is a row to memorise');
    assert.ok(state.question.options.length >= 2 && state.question.options.length <= 4);
    assert.equal(state.asked, 0);

    // ...and the options only appear once the study screen has been left.
    const asking = revealOptions(state);
    assert.equal(asking.phase, PHASE.ASK);
    assert.equal(asking.question.id, state.question.id, 'the same question, now being asked');
  }
});

test('a right answer and a wrong answer are handled the way both older domains handle them', () => {
  for (const { bank } of NEW_BANKS) {
    const asking = revealOptions(startSession({ bank, now: 0, rand: seeded() }));

    const right = answerQuestion(asking, asking.question.answerId, 1000);
    assert.equal(right.record.correct, true);
    assert.equal(right.state.phase, PHASE.FEEDBACK);
    assert.equal(right.state.correct, 1);
    assert.equal(right.state.streakRight, 1);
    assert.equal(right.state.streakWrong, 0);

    const other = asking.question.options.find((o) => o.id !== asking.question.answerId).id;
    const wrong = answerQuestion(asking, other, 1000);
    assert.equal(wrong.record.correct, false);
    assert.equal(wrong.state.correct, 0, 'a wrong answer scores nothing');
    assert.equal(wrong.state.streakWrong, 1);
    assert.equal(wrong.state.asked, 1, 'but it still counts as asked');

    // A tap while the row is still on screen is not an answer at all.
    const early = answerQuestion(startSession({ bank, now: 0, rand: seeded() }), asking.question.answerId, 5);
    assert.equal(early.record, null, 'a tap during the study screen must not count');
    assert.equal(early.state.asked, 0);
  }
});

test('every answer in every new domain produces exactly the record the spec logs', () => {
  for (const { bank, prefix } of NEW_BANKS) {
    const { records } = playSession({ bank, answers: [true, false, true] });
    assert.equal(records.length, 3);
    for (const record of records) {
      assert.deepEqual(Object.keys(record).sort(), [
        'correct',
        'difficultyTierEnd',
        'domain',
        'questionId',
        'timestamp',
      ]);
      assert.equal(record.domain, bank.domain);
      assert.match(record.questionId, new RegExp(`^${prefix}-\\d+$`));
      assert.equal(typeof record.correct, 'boolean');
      assert.ok(record.difficultyTierEnd >= MIN_TIER && record.difficultyTierEnd <= MAX_TIER);
      assert.ok(record.timestamp > 0);
    }
    assert.deepEqual(records.map((r) => r.correct), [true, false, true]);
  }
});

test('a whole session plays through the shared loop, ends cleanly and repeats nothing', () => {
  for (const { bank } of NEW_BANKS) {
    const { state, records } = playSession({ bank, answers: Array(MAX_QUESTIONS + 3).fill(true) });
    assert.equal(records.length, MAX_QUESTIONS, `${bank.domain} lost or gained an answer`);
    assert.equal(state.phase, PHASE.DONE);
    assert.equal(state.endReason, 'complete');
    assert.equal(state.asked, MAX_QUESTIONS);
    assert.equal(new Set(state.usedIds).size, state.usedIds.length, `${bank.domain} repeated a question`);

    const summary = sessionSummary(state, 60000);
    assert.deepEqual(
      { domain: summary.domain, asked: summary.asked, score: summary.score },
      { domain: bank.domain, asked: MAX_QUESTIONS, score: 100 }
    );
  }
});

test('the same seed replays the same session in each new domain', () => {
  for (const { bank } of NEW_BANKS) {
    const a = playSession({ bank, answers: [true, false, true] }).records.map((r) => r.questionId);
    const b = playSession({ bank, answers: [true, false, true] }).records.map((r) => r.questionId);
    assert.deepEqual(a, b, `${bank.domain} is not reproducible`);
  }
});

test('the existing adaptive difficulty moves all three of them, both ways', () => {
  for (const { bank } of NEW_BANKS) {
    const up = playSession({ bank, answers: Array(RAISE_AFTER_RIGHT).fill(true) });
    assert.equal(up.tierScreens.length, 1, `${bank.domain}: one transition for one change`);
    assert.deepEqual(
      { from: up.tierScreens[0].from, to: up.tierScreens[0].to, direction: up.tierScreens[0].direction },
      { from: 1, to: 2, direction: 'harder' }
    );
    assert.equal(up.tierScreens[0].message, TIER_MESSAGE.harder, 'one wording serves every domain');
    assert.equal(up.state.tier, 2);
    assert.equal(up.state.question.tier, 2, 'and the harder questions really are served');

    const down = playSession({ bank, answers: Array(DROP_AFTER_WRONG).fill(false), tier: 3 });
    assert.equal(down.tierScreens.length, 1);
    assert.equal(down.tierScreens[0].direction, 'easier');
    assert.equal(down.tierScreens[0].message, TIER_MESSAGE.easier);
    assert.equal(down.state.tier, 2);

    const climb = playSession({ bank, answers: Array(MAX_QUESTIONS).fill(true) });
    assert.deepEqual(climb.tierScreens.map((t) => t.to), [2, 3], `${bank.domain} cannot reach tier 3`);
    assert.equal(climb.state.tier, MAX_TIER);

    const mixed = playSession({ bank, answers: [true, false, true, false] });
    assert.equal(mixed.tierScreens.length, 0, 'a mixed run leaves the difficulty where it is');
    assert.equal(sessionSummary(mixed.state, 60000).score, 50);
  }
});

test('all three tiers are actually playable end to end, not just present in the data', () => {
  for (const { bank } of NEW_BANKS) {
    for (const tier of TIERS) {
      const { state, records } = playSession({
        bank,
        tier,
        answers: [true, false, true, false, true, false],
      });
      assert.equal(records.length, 6, `${bank.domain} tier ${tier} could not be played`);
      assert.ok(
        records.every((r) => r.difficultyTierEnd === tier),
        `${bank.domain} tier ${tier} drifted mid-run`
      );
      assert.equal(state.tier, tier, 'a mixed run holds the tier it started on');
    }
  }
});

/* --------------------------------- the shared storage and caregiver systems */

const freshStore = () => createRecordStore(createMemoryDriver(), { now: () => 1_700_000_000_000 });

test('the store accepts all three new domains, and would refuse a typo of one', async () => {
  for (const { bank } of NEW_BANKS) {
    assert.ok(DOMAINS.includes(bank.domain), `${bank.domain} is not a storable domain`);
  }
  const store = freshStore();
  await assert.rejects(
    () => store.logAnswer({
      domain: 'word_recal',
      questionId: 'wr-1',
      correct: true,
      difficultyTierEnd: 1,
      timestamp: 1,
    }),
    /domain must be one of/,
    'a near-miss domain must not be stored'
  );
});

test('every bank has a domain the store accepts, and every domain has a bank', () => {
  assert.deepEqual(BANKS.map((b) => b.domain), DOMAINS, 'BANKS and DOMAINS have drifted apart');
});

test('a session in each new domain is logged through the existing store, tap by tap', async () => {
  for (const { bank } of NEW_BANKS) {
    const store = freshStore();
    const { records, state } = playSession({ bank, answers: [true, true, false, true] });
    for (const record of records) await store.logAnswer(record);
    await store.saveSession(sessionSummary(state, 60000));

    const answers = await store.answers();
    assert.equal(answers.length, 4, `${bank.domain}: one row per tap, written on the tap`);
    assert.deepEqual(answers.map((r) => r.correct), [true, true, false, true]);
    assert.ok(answers.every((r) => r.domain === bank.domain));
    assert.ok(answers.every((r) => r.id), 'every row got an id');

    const sessions = await store.sessions();
    assert.equal(sessions.length, 1, 'and one session row for the chart');
    assert.equal(sessions[0].domain, bank.domain);
    assert.equal(sessions[0].score, 75);
    assert.ok(sessions[0].difficultyTierEnd >= MIN_TIER);

    // Per-answer detail stays local; only the session row is queued for sync.
    const pending = await store.pendingSync();
    assert.equal(pending.sessions.length, 1, 'the session row is waiting to sync');
    assert.equal(pending.reminderEvents.length, 0, 'no reminder was recorded here');
    assert.equal(answers.every((r) => r.synced === undefined), true, 'answers are never marked for sync');
  }
});

test('the caregiver chart reads a new domain back without knowing it is new', async () => {
  const store = freshStore();
  const day = 24 * 60 * 60 * 1000;
  const now = 1_700_000_000_000;
  for (const { bank } of NEW_BANKS) {
    let at = now - 4 * day;
    for (const score of [80, 74, 66]) {
      await store.saveSession({
        domain: bank.domain,
        score,
        difficultyTierEnd: 2,
        timestamp: at,
        asked: 8,
        correct: Math.round((score / 100) * 8),
        durationMs: 60000,
      });
      at += day;
    }
  }
  const rows = await store.sessions();
  for (const { bank } of NEW_BANKS) {
    const series = buildSeries(rows, bank.domain, { now });
    assert.equal(series.count, 3, `${bank.domain} did not reach the chart`);
    assert.deepEqual(series.scores, [80, 74, 66], 'oldest first, as the chart draws it');
    const reading = describeTrend(series, { label: bank.name, now });
    assert.ok(reading.headline.startsWith(bank.name), 'the reading names the game it is about');
    assert.ok(reading.detail.length > 20, 'words, not only a number');
  }
});

/* -------------------------------------------- wired into the app, not orphaned */

test('each new game has its own route, and every route is registered and allowed', () => {
  const app = readFileSync(join(ROOT, 'src', 'App.jsx'), 'utf8');
  const checker = readFileSync(join(ROOT, 'scripts', 'check-static.mjs'), 'utf8');
  const paths = BANKS.map((b) => b.path);
  assert.equal(new Set(paths).size, paths.length, 'two games share a route');
  for (const { bank } of NEW_BANKS) {
    assert.ok(bank.path && bank.path.startsWith('/play'), `${bank.domain} has no route of its own`);
    assert.ok(
      app.includes(`path="${bank.path}"`),
      `${bank.path} is not routed in App.jsx, so the game cannot be opened`
    );
    assert.ok(checker.includes(`'${bank.path}'`), `${bank.path} is not in the static checker's route list`);
  }
});

test('the rotation reaches every new domain, so a patient never has to choose one', () => {
  // "Play again" walks from the first bank through nextBank; over one full lap it
  // must visit all five domains, in order, and come back to where it started.
  const visited = [];
  let bank = FIRST_BANK;
  for (let i = 0; i < BANKS.length; i += 1) {
    visited.push(bank.domain);
    bank = nextBank(bank);
  }
  assert.deepEqual(visited, BANKS.map((b) => b.domain), 'the rotation does not visit every domain once');
  assert.equal(bank.domain, FIRST_BANK.domain, 'the rotation loops back to the start');
  for (const { bank: newBank } of NEW_BANKS) {
    assert.ok(visited.includes(newBank.domain), `the rotation never reaches ${newBank.domain}`);
  }
});

test('each new domain carries its own wording, so no screen describes the wrong game', () => {
  const labels = new Set(BANKS.map((b) => b.unitLabel));
  assert.equal(labels.size, BANKS.length, 'two domains count in the same words');
  const names = new Set(BANKS.map((b) => b.name));
  assert.equal(names.size, BANKS.length, 'two domains would label the same chart');

  for (const { bank } of NEW_BANKS) {
    assert.ok(bank.name && bank.name.length > 3, 'a chart needs a human name');
    assert.ok(bank.unitLabel, `${bank.domain} is missing its counter word`);
    assert.match(bank.doneLine(3, 8), /3[\s\S]*8/, `${bank.domain} closing line drops the count`);
    for (const direction of ['easier', 'harder']) {
      const detail = bank.tierDetail[direction];
      assert.ok(detail && detail.endsWith('.'), `${bank.domain} has no ${direction} detail line`);
    }
    assert.notEqual(bank.tierDetail.easier, bank.tierDetail.harder);
    const missed = bank.missLine('the thing');
    assert.ok(missed.includes('the thing'), `${bank.domain} miss line drops the answer`);
    assert.doesNotMatch(missed, /wrong|incorrect|no\b/i, 'feedback is never sharp');
  }
});

test('nothing in the three new games asks for typing, drawing or a gesture', () => {
  /* The interaction is one tap on one button, and that is a property of the data
   * as much as of the screen: every question resolves to a fixed, small list of
   * options with an id to tap. Nothing here is free text or a coordinate. */
  for (const { bank } of NEW_BANKS) {
    for (const q of bank.questions) {
      assert.ok(Array.isArray(q.options), `${q.id} has no list of options to tap`);
      assert.ok(q.options.every((o) => typeof o.id === 'string' && o.id.length));
      assert.equal(typeof q.answerId, 'string', `${q.id} answer is not a tappable option id`);
    }
  }
  const cardRow = readFileSync(join(ROOT, 'src', 'components', 'CardRow.jsx'), 'utf8');
  assert.doesNotMatch(cardRow, /<input|<textarea|contentEditable|draggable/i);
  assert.doesNotMatch(cardRow, /onClick|onPointer|onMouse/, 'the row is display only - the button around it is tapped');
});
