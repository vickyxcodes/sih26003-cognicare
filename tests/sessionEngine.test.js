import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DROP_AFTER_WRONG,
  MAX_QUESTIONS,
  MAX_TIER,
  MIN_TIER,
  PHASE,
  RAISE_AFTER_RIGHT,
  SESSION_MAX_MS,
  TIER_MESSAGE,
  TIER_MS,
  answerQuestion,
  continueSession,
  revealOptions,
  sessionSummary,
  startSession,
  tierDecision,
} from '../src/lib/sessionEngine.js';
import { MEMORY_RECALL } from '../src/data/memoryRecall.js';
import { ROUTINE_MATCHING } from '../src/data/routineMatching.js';

/** Deterministic rand so a session can be replayed exactly. */
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const bank = MEMORY_RECALL;

/**
 * Play a whole session, answering correctly or not per `answers`.
 *
 * The same helper drives both domains: `revealOptions` is a no-op on a question
 * that had nothing to study, so a routine session needs no special casing here -
 * which is the clearest evidence the two domains share one loop.
 */
function playSession({ answers, now = 0, tier = 1, bank: playing = bank }) {
  const rand = seeded();
  let state = startSession({ bank: playing, tier, now, rand });
  const records = [];
  const tierScreens = [];
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
    state = continueSession(state, { bank: playing, now: clock, rand });
    // A difficulty change puts a screen in the way before the next question.
    if (state.phase === PHASE.TIER) {
      tierScreens.push(state.tierChange);
      clock += TIER_MS;
      state = continueSession(state, { bank: playing, now: clock, rand });
    }
  }
  return { state, records, tierScreens };
}

test('a session starts by showing one picture to study', () => {
  const state = startSession({ bank, now: 0, rand: seeded() });
  assert.equal(state.phase, PHASE.STUDY);
  assert.equal(state.domain, 'memory_recall');
  assert.equal(state.tier, MIN_TIER);
  assert.ok(state.question.studyItem, 'a study picture must be chosen');
  assert.equal(state.question.options.length, 2, 'never more than two choices');
  assert.equal(state.asked, 0);
});

test('answers are only accepted while the options are showing', () => {
  const studying = startSession({ bank, now: 0, rand: seeded() });
  const ignored = answerQuestion(studying, studying.question.answerId, 10);
  assert.equal(ignored.record, null, 'a tap during the study phase must not count');
  assert.equal(ignored.state.asked, 0);

  const asking = revealOptions(studying);
  const counted = answerQuestion(asking, asking.question.answerId, 20);
  assert.equal(counted.state.asked, 1);
  assert.equal(counted.record.correct, true);
});

test('every answer produces exactly the record the spec asks to log', () => {
  const { records } = playSession({ answers: [true, false, true] });
  assert.equal(records.length, 3);
  for (const record of records) {
    assert.deepEqual(Object.keys(record).sort(), [
      'correct',
      'difficultyTierEnd',
      'domain',
      'questionId',
      'timestamp',
    ]);
    assert.equal(record.domain, 'memory_recall');
    assert.equal(typeof record.correct, 'boolean');
    assert.ok(record.difficultyTierEnd >= MIN_TIER && record.difficultyTierEnd <= MAX_TIER);
    assert.ok(record.timestamp > 0);
  }
  assert.deepEqual(records.map((r) => r.correct), [true, false, true]);
});

test('a session ends after the capped number of questions', () => {
  const { state } = playSession({ answers: Array(MAX_QUESTIONS + 4).fill(true) });
  assert.equal(state.phase, PHASE.DONE);
  assert.equal(state.endReason, 'complete');
  assert.equal(state.asked, MAX_QUESTIONS);
});

test('a slow session ends on the time cap instead of running forever', () => {
  const rand = seeded();
  let state = startSession({ bank, now: 0, rand });
  state = revealOptions(state);
  state = answerQuestion(state, state.question.answerId, 1000).state;
  state = continueSession(state, { bank, now: SESSION_MAX_MS + 1, rand });
  assert.equal(state.phase, PHASE.DONE);
  assert.equal(state.endReason, 'time');
});

test('questions do not repeat inside one session', () => {
  const { state } = playSession({ answers: Array(MAX_QUESTIONS).fill(true) });
  assert.equal(new Set(state.usedIds).size, state.usedIds.length);
});

test('streaks are tracked for the adaptive step and reset on a change of luck', () => {
  const { state } = playSession({ answers: [true, true, false] });
  assert.equal(state.streakRight, 0);
  assert.equal(state.streakWrong, 1);
  const good = playSession({ answers: [false, true, true] }).state;
  assert.equal(good.streakRight, 2);
  assert.equal(good.streakWrong, 0);
});

test('the summary scores in percent so sessions stay comparable', () => {
  const { state } = playSession({ answers: [true, true, true, false] });
  const summary = sessionSummary(state, 60000);
  assert.equal(summary.asked, 4);
  assert.equal(summary.correct, 3);
  assert.equal(summary.score, 75);
  assert.equal(summary.domain, 'memory_recall');
  assert.equal(summary.difficultyTierEnd, state.tier);
});

test('the same seed replays the same session', () => {
  const a = playSession({ answers: [true, false, true] }).records.map((r) => r.questionId);
  const b = playSession({ answers: [true, false, true] }).records.map((r) => r.questionId);
  assert.deepEqual(a, b);
});

/* ------------------------------------------------------- adaptive difficulty */

test('three right in a row steps the game up, once, and shows why', () => {
  const { state, tierScreens } = playSession({ answers: Array(RAISE_AFTER_RIGHT).fill(true) });
  assert.equal(tierScreens.length, 1, 'exactly one transition for one change');
  assert.deepEqual(
    { from: tierScreens[0].from, to: tierScreens[0].to, direction: tierScreens[0].direction },
    { from: 1, to: 2, direction: 'harder' }
  );
  assert.equal(tierScreens[0].message, TIER_MESSAGE.harder);
  assert.equal(state.tier, 2);
  assert.equal(state.question.tier, 2, 'the next question actually comes from the new tier');
  assert.equal(state.streakRight, 0, 'the streak resets so the next rise needs three more');
});

test('two wrong in a row eases the game off', () => {
  const { state, tierScreens } = playSession({
    answers: Array(DROP_AFTER_WRONG).fill(false),
    tier: 3,
  });
  assert.equal(tierScreens.length, 1);
  assert.deepEqual(
    { from: tierScreens[0].from, to: tierScreens[0].to, direction: tierScreens[0].direction },
    { from: 3, to: 2, direction: 'easier' }
  );
  assert.equal(tierScreens[0].message, TIER_MESSAGE.easier);
  assert.equal(state.tier, 2);
  assert.equal(state.streakWrong, 0);
});

test('easing off happens sooner than stepping up', () => {
  assert.ok(
    DROP_AFTER_WRONG < RAISE_AFTER_RIGHT,
    'the app must be quicker to help than to push'
  );
  assert.equal(playSession({ answers: [true, true], tier: 1 }).tierScreens.length, 0);
  assert.equal(playSession({ answers: [false, false], tier: 2 }).tierScreens.length, 1);
});

test('the tier never leaves 1-3, and no screen is shown for a change that cannot happen', () => {
  const floor = playSession({ answers: Array(6).fill(false), tier: MIN_TIER });
  assert.equal(floor.state.tier, MIN_TIER);
  assert.equal(floor.tierScreens.length, 0, 'nothing to announce at the easiest tier');

  const ceiling = playSession({ answers: Array(MAX_QUESTIONS).fill(true), tier: MAX_TIER });
  assert.equal(ceiling.state.tier, MAX_TIER);
  assert.equal(ceiling.tierScreens.length, 0);

  const climb = playSession({ answers: Array(MAX_QUESTIONS).fill(true) });
  assert.equal(climb.state.tier, MAX_TIER, 'a perfect session reaches the top tier');
  assert.deepEqual(climb.tierScreens.map((t) => t.to), [2, 3]);
});

test('a mixed run leaves the difficulty where it is', () => {
  const { state, tierScreens } = playSession({ answers: [true, false, true, false, true] });
  assert.equal(tierScreens.length, 0);
  assert.equal(state.tier, MIN_TIER);
});

test('the decision itself is a pure function of the streaks', () => {
  const at = (over) => ({ tier: 2, streakRight: 0, streakWrong: 0, ...over });
  assert.equal(tierDecision(at({})), null);
  assert.deepEqual(tierDecision(at({ streakWrong: DROP_AFTER_WRONG })), { tier: 1, direction: 'easier' });
  assert.deepEqual(tierDecision(at({ streakRight: RAISE_AFTER_RIGHT })), { tier: 3, direction: 'harder' });
  assert.equal(tierDecision(at({ tier: MIN_TIER, streakWrong: 9 })), null);
  assert.equal(tierDecision(at({ tier: MAX_TIER, streakRight: 9 })), null);
});

test('the transition is held long enough to read and says which way it went', () => {
  assert.ok(TIER_MS >= 2000, 'the spec asks for a two-second transition');
  assert.match(TIER_MESSAGE.easier, /easier/i);
  assert.match(TIER_MESSAGE.harder, /harder/i);
  assert.notEqual(TIER_MESSAGE.easier, TIER_MESSAGE.harder);
});

test('what is logged follows the tier the question was actually asked at', () => {
  const { records, state } = playSession({ answers: Array(4).fill(true) });
  assert.deepEqual(records.map((r) => r.difficultyTierEnd), [1, 1, 1, 2]);
  assert.equal(sessionSummary(state, 60000).difficultyTierEnd, 2, 'the session ends on the new tier');
});

test('a tier change cannot swallow a question or the end of the session', () => {
  const { state, records } = playSession({ answers: Array(MAX_QUESTIONS).fill(true) });
  assert.equal(records.length, MAX_QUESTIONS, 'every answer still produced a record');
  assert.equal(state.asked, MAX_QUESTIONS);
  assert.equal(state.phase, PHASE.DONE);
  assert.equal(state.endReason, 'complete');
  assert.equal(new Set(state.usedIds).size, state.usedIds.length, 'and no question repeated');
});

/* ------------------------------------------- the screen actually shows the change */

/**
 * No browser is available in this sandbox, so the only way to prove the engine's
 * transition reaches the patient is to read the screen that renders it.
 */
test('the game screen holds the transition and shows the engine wording', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const play = readFileSync(join(here, '..', 'src', 'pages', 'Play.jsx'), 'utf8');

  assert.match(play, /import \{[^}]*TIER_MS[^}]*\} from '\.\.\/lib\/sessionEngine\.js'/);
  assert.match(
    play,
    /session\.phase === PHASE\.TIER\)[\s\S]{0,200}TIER_MS/,
    'the transition is what TIER_MS times out, so the two-second hold is the engine constant'
  );
  assert.match(play, /phase === PHASE\.TIER && <TierChange/);
  assert.match(play, /change\.direction/, 'the transition still follows the engine direction');
  assert.match(play, /translate\(`tier\.\$\{change\.direction\}`\)/, 'the transition sentence is localized');
  assert.match(play, /animate-arrow-down/);
  assert.match(play, /animate-arrow-up/);
  assert.match(play, /aria-live="assertive"/, 'a screen reader must announce the change too');
  assert.ok(
    !/Let's make this/.test(play),
    'wording stays in TIER_MESSAGE so the step-7 voice cannot disagree with the screen'
  );
});

/* ------------------------------------------- domain 2 runs on the same engine */

/**
 * The tests below deliberately repeat the domain-1 assertions against the
 * routine bank. If domain 2 had needed its own loop these would be testing a
 * second implementation; because it did not, they are testing that one engine
 * is genuinely domain-agnostic - and they fail loudly if a later step
 * special-cases `memory_recall` anywhere inside it.
 */
const routine = { bank: ROUTINE_MATCHING };

test('a routine question opens straight on its options, with nothing to memorise', () => {
  const state = startSession({ bank: ROUTINE_MATCHING, now: 0, rand: seeded() });
  assert.equal(state.phase, PHASE.ASK, 'there is no picture to hide, so no study screen');
  assert.equal(state.domain, 'routine_matching');
  assert.equal(state.bankName, ROUTINE_MATCHING.name);
  assert.equal(state.question.studyItem, null);
  assert.equal(state.question.options.length, 2, 'still only ever two choices');
  assert.equal(state.asked, 0);
});

test('a routine session never takes the cue off the screen', () => {
  const rand = seeded();
  let state = startSession({ bank: ROUTINE_MATCHING, now: 0, rand });
  const phases = [state.phase];
  let clock = 0;
  while (state.phase !== PHASE.DONE) {
    clock += 4000;
    state =
      state.phase === PHASE.ASK
        ? answerQuestion(state, state.question.answerId, clock).state
        : continueSession(state, { bank: ROUTINE_MATCHING, now: clock, rand });
    phases.push(state.phase);
  }
  assert.ok(!phases.includes(PHASE.STUDY), 'a patient must not have to remember the sentence');
  assert.ok(phases.includes(PHASE.TIER), 'the difficulty screen still appears in this domain');
  assert.equal(state.asked, MAX_QUESTIONS);
  assert.equal(state.endReason, 'complete');
});

test('a whole routine session plays through the shared loop and logs every answer', () => {
  const { state, records } = playSession({ answers: Array(MAX_QUESTIONS).fill(true), ...routine });
  assert.equal(records.length, MAX_QUESTIONS);
  assert.equal(state.phase, PHASE.DONE);
  assert.equal(state.endReason, 'complete');
  assert.equal(new Set(state.usedIds).size, state.usedIds.length, 'no routine repeats in a session');
  for (const record of records) {
    assert.equal(record.domain, 'routine_matching');
    assert.match(record.questionId, /^rm-\d+$/);
  }
  const summary = sessionSummary(state, 60000);
  assert.deepEqual(
    { domain: summary.domain, asked: summary.asked, score: summary.score },
    { domain: 'routine_matching', asked: MAX_QUESTIONS, score: 100 }
  );
});

test('a record is the same shape in both domains, only the domain differs', () => {
  const one = playSession({ answers: [true, false] }).records;
  const two = playSession({ answers: [true, false], ...routine }).records;
  assert.deepEqual(Object.keys(two[0]).sort(), Object.keys(one[0]).sort());
  assert.deepEqual(two.map((r) => r.correct), one.map((r) => r.correct));
  assert.deepEqual([...new Set([...one, ...two].map((r) => r.domain))], [
    'memory_recall',
    'routine_matching',
  ]);
});

test('adaptive difficulty behaves identically in the routine domain', () => {
  const climb = playSession({ answers: Array(MAX_QUESTIONS).fill(true), ...routine });
  assert.deepEqual(climb.tierScreens.map((t) => t.to), [2, 3]);
  assert.equal(climb.state.tier, MAX_TIER);
  assert.equal(climb.state.question.tier, MAX_TIER, 'and the harder cues really are served');

  const ease = playSession({ answers: Array(DROP_AFTER_WRONG).fill(false), tier: 3, ...routine });
  assert.equal(ease.tierScreens.length, 1);
  assert.equal(ease.tierScreens[0].direction, 'easier');
  assert.equal(ease.tierScreens[0].message, TIER_MESSAGE.easier, 'one wording serves both domains');
  assert.equal(ease.state.tier, 2);

  const mixed = playSession({ answers: [true, false, true, false], ...routine });
  assert.equal(mixed.tierScreens.length, 0);
  assert.equal(sessionSummary(mixed.state, 60000).score, 50);
});

test('the routine domain replays the same session from the same seed', () => {
  const a = playSession({ answers: [true, true, false], ...routine });
  const b = playSession({ answers: [true, true, false], ...routine });
  assert.deepEqual(
    a.records.map((r) => r.questionId),
    b.records.map((r) => r.questionId)
  );
});

/**
 * Found by actually playing a session rather than by reading the code: both banks
 * hold some pairs in both directions, and two such questions in a row showed the
 * patient the same two pictures twice running with the answer swapped.
 */
test('the same two objects are never offered twice in a row, in either domain', () => {
  const key = (q) => q.options.map((o) => o.id).sort().join('|');
  for (const playing of [MEMORY_RECALL, ROUTINE_MATCHING]) {
    for (let seed = 1; seed <= 25; seed += 1) {
      const rand = seeded(seed);
      let state = startSession({ bank: playing, now: 0, rand });
      const pairs = [];
      let clock = 0;
      while (state.phase !== PHASE.DONE) {
        clock += 3000;
        if (state.phase === PHASE.STUDY) state = revealOptions(state);
        else if (state.phase === PHASE.ASK) {
          pairs.push(key(state.question));
          state = answerQuestion(state, state.question.answerId, clock).state;
        } else state = continueSession(state, { bank: playing, now: clock, rand });
      }
      assert.equal(state.asked, MAX_QUESTIONS);
      for (let i = 1; i < pairs.length; i += 1) {
        assert.notEqual(
          pairs[i],
          pairs[i - 1],
          `${playing.domain} seed ${seed} repeated the pair ${pairs[i]} back to back`
        );
      }
    }
  }
});

/**
 * And the screen itself plays them all. Without a browser, reading Play.jsx is the
 * only way to prove the patient can actually reach the later domains and that no
 * screen describes the wrong game while they are in it.
 */
test('the play screen rotates the domains and takes its wording from the bank', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const play = readFileSync(join(here, '..', 'src', 'pages', 'Play.jsx'), 'utf8');

  assert.match(play, /import \{[^}]*\bFIRST_BANK\b[^}]*\} from '\.\.\/data\/banks\.js'/);
  assert.match(play, /import \{[^}]*\bnextBank\b[^}]*\} from '\.\.\/data\/banks\.js'/);
  assert.match(play, /import \{[^}]*\bBANKS\b[^}]*\} from '\.\.\/data\/banks\.js'/);
  assert.match(play, /startSession\(\{ bank: FIRST_BANK \}\)/, 'a visit opens on domain 1');
  assert.match(
    play,
    /BANKS\.find\(\(b\) => b\.path === location\.pathname\)/,
    'every game is reachable by its own route, named by the bank rather than by this screen'
  );
  assert.match(play, /nextBank\(bank\)/, '"Play again" moves to the next domain');
  assert.match(play, /displayBank\.unitLabel/, 'the counter is worded by the localized bank');
  assert.match(play, /localizeDone\(/, 'so is the closing count');
  assert.match(play, /localizeBank\(bank, language\)\.tierDetail/, 'and what the difficulty change explains');
  assert.match(play, /localizeMiss\(/, 'and how a wrong answer is put');
  assert.ok(
    !/MEMORY_RECALL|ROUTINE_MATCHING|WORD_RECALL|NUMBER_SEQUENCE|PATTERN_MATCHING/.test(play),
    'the screen must not name a single domain, or it cannot play the others'
  );
});
