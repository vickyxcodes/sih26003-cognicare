import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import HomeButton from '../components/HomeButton.jsx';
import Picture from '../components/Picture.jsx';
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, RetryIcon } from '../components/icons.jsx';
import { FIRST_BANK, nextBank } from '../data/banks.js';
import { BANKS } from '../data/banks.js';
import { recordAnswer, recordSession } from '../lib/db.js';
import { cancelSpeech, speak } from '../lib/voice.js';
import {
  FEEDBACK_MS,
  PHASE,
  TIER_MS,
  answerQuestion,
  continueSession,
  revealOptions,
  sessionSummary,
  startSession,
} from '../lib/sessionEngine.js';

/**
 * /play - one game session, in either domain.
 *
 * The screen only ever asks for one thing at a time, and the study picture, the
 * feedback and the difficulty transition all move on by themselves so the patient
 * never has to find a "next" button. All the rules live in sessionEngine; this
 * file is layout plus timers.
 *
 * Both game domains run through this one screen. A memory-recall question opens on
 * the study picture; a routine-matching question has nothing to memorise, so the
 * engine opens it straight on the cue and its options. Everything after that -
 * the tap, the write, the feedback, the difficulty change, the ending - is shared,
 * and the words that differ per domain (the counter, the closing line, what the
 * tier change explains) come from the bank rather than from this file.
 *
 * Every screen speaks for itself: the study/ask prompts here, and the feedback,
 * tier-change and finished screens each say their own words on mount, all through
 * the one `speak()` helper. Voice is a help, never a requirement - with the sound
 * off, or on a browser with no speech, the game is unchanged.
 */
export default function Play() {
  const location = useLocation();
  const requestedBank = location.pathname.endsWith('/play/routine') ? BANKS[1] : FIRST_BANK;
  const [bank, setBank] = useState(requestedBank);
  const [session, setSession] = useState(() => (
    requestedBank === BANKS[1]
      ? startSession({ bank: requestedBank })
      : startSession({ bank: FIRST_BANK })
  ));
  const savedSessionAt = useRef(null);
  /**
   * A reminder can cover this screen at any moment (the overlay lives in the
   * patient shell). While it does, the game holds still: no timer runs, so the
   * study picture cannot disappear behind the card and no question can be
   * answered by a patient who never saw it.
   */
  const { reminderOnScreen = false } = useOutletContext() || {};

  useEffect(() => {
    if (reminderOnScreen) return undefined;
    if (session.phase === PHASE.STUDY) {
      const timer = setTimeout(() => setSession(revealOptions), session.question.studyMs);
      return () => clearTimeout(timer);
    }
    if (session.phase === PHASE.FEEDBACK) {
      const timer = setTimeout(() => setSession((s) => continueSession(s, { bank })), FEEDBACK_MS);
      return () => clearTimeout(timer);
    }
    if (session.phase === PHASE.TIER) {
      const timer = setTimeout(() => setSession((s) => continueSession(s, { bank })), TIER_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [session, bank, reminderOnScreen]);

  /**
   * Speak the prompt for the two phases this component renders itself. The study
   * picture is announced when it appears, and the question when the options do;
   * the feedback, tier and finished screens speak from their own components below.
   * Keyed on the question id so re-speaking only happens on a real change of screen
   * - and on the reminder clearing, which is a real change of screen: the patient
   * comes back to a question they were part-way through and hears it again.
   */
  useEffect(() => {
    if (!session.question || reminderOnScreen) return;
    if (session.phase === PHASE.STUDY) speak(session.question.studyPrompt);
    else if (session.phase === PHASE.ASK) speak(session.question.prompt);
  }, [session.phase, session.question?.id, reminderOnScreen]);

  /** Leaving the game (home button, or the route unmounting) stops any speech. */
  useEffect(() => () => cancelSpeech(), []);

  /**
   * The session-level row the caregiver chart plots, written once when the
   * session ends. A session where nothing was answered is not written at all: a
   * 0% row would look like a collapse on the trend line and could raise a false
   * decline alert.
   */
  useEffect(() => {
    if (session.phase !== PHASE.DONE || session.asked === 0) return;
    if (savedSessionAt.current === session.startedAt) return;
    savedSessionAt.current = session.startedAt;
    recordSession(sessionSummary(session));
  }, [session]);

  /**
   * One tap = one answer = one immediate write. The engine decides what the
   * record contains; storing it is deliberately not awaited, so a slow or broken
   * database can never stall the next screen.
   */
  const choose = (optionId) => {
    const { state, record } = answerQuestion(session, optionId);
    if (!record) return;
    recordAnswer(record);
    setSession(state);
  };

  /**
   * "Play again" starts the other domain, so a patient who plays twice gets both
   * exercises without ever being asked to choose between them.
   */
  const playAgain = () => {
    const next = nextBank(bank);
    setBank(next);
    setSession(startSession({ bank: next }));
  };

  const { phase, question, lastAnswer } = session;
  const questionNumber = Math.min(session.asked + 1, session.maxQuestions);

  return (
    <main className="screen flex min-h-screen flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <HomeButton onLeave={cancelSpeech} />
        <p className="text-lg font-semibold text-ink-soft">
          {phase === PHASE.DONE
            ? 'All done'
            : `${bank.unitLabel} ${questionNumber} of ${session.maxQuestions}`}
        </p>
      </header>

      {phase === PHASE.STUDY && (
        <section className="flex flex-1 flex-col items-center justify-center gap-6">
          <p className="text-center text-3xl font-semibold">{question.studyPrompt}</p>
          <div className="card animate-pop-in flex flex-col items-center gap-3 px-10 py-8">
            <Picture id={question.studyItem} className="h-48 w-48" />
            <p className="text-3xl font-bold">{question.options.find((o) => o.id === question.answerId).text}</p>
          </div>
        </section>
      )}

      {phase === PHASE.ASK && (
        <section className="flex flex-1 flex-col justify-center gap-8">
          <h1 className="text-center text-4xl font-bold leading-snug">{question.prompt}</h1>
          <div className="grid gap-6 sm:grid-cols-2">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.id)}
                aria-label={opt.text}
                className="tap-target min-h-tap-xl flex-col gap-3 border-4 border-primary/30 bg-card px-6 py-8 shadow-card"
              >
                {opt.item ? <Picture id={opt.item} className="h-40 w-40" /> : null}
                <span className="text-3xl font-bold">{opt.text}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {phase === PHASE.FEEDBACK && <Feedback answer={lastAnswer} question={question} />}

      {phase === PHASE.TIER && <TierChange change={session.tierChange} detail={bank.tierDetail[session.tierChange.direction]} />}

      {phase === PHASE.DONE && (
        <Finished
          line={bank.doneLine(session.correct, session.asked)}
          onPlayAgain={playAgain}
        />
      )}
    </main>
  );
}

/**
 * Feedback is warm either way. A wrong answer shows the right picture again
 * with a kind sentence - there is no red cross, no "wrong", and no score
 * flashing on screen, because being corrected sharply is what makes people stop
 * playing.
 */
function Feedback({ answer, question }) {
  const right = answer.correct;
  const item = question.options.find((o) => o.id === question.answerId);
  useEffect(() => {
    speak(right ? "Yes, that's right!" : `It was the ${item.text}. That one is tricky. Well tried.`);
  }, []);
  return (
    <section
      className="flex flex-1 flex-col items-center justify-center gap-6"
      aria-live="assertive"
    >
      <div
        className={`card animate-pop-in flex flex-col items-center gap-4 px-12 py-10 ${
          right ? 'bg-primary-light' : 'bg-white'
        }`}
      >
        {right ? (
          <CheckIcon className="h-24 w-24 text-good" />
        ) : (
          <RetryIcon className="h-20 w-20 text-warn" />
        )}
        <p className="text-center text-4xl font-bold leading-snug">
          {right ? "Yes, that's right!" : `It was the ${item.text}`}
        </p>
        {!right && <Picture id={question.answerId} className="h-36 w-36" />}
        {!right && <p className="text-center text-2xl text-ink-soft">That one is tricky. Well tried.</p>}
      </div>
    </section>
  );
}

/**
 * The difficulty change, held for two seconds.
 *
 * Deliberately unlike every other screen in the app: a full block of solid
 * colour, one moving arrow, and one sentence. A patient must never feel the game
 * changed under them without being told, and a caregiver watching from across the
 * room should be able to see it happen. The sentence comes from the engine and
 * the detail line from the bank, so it explains the change in the terms of the
 * game actually being played, and the voice reads exactly what is on screen.
 */
function TierChange({ change, detail }) {
  const easier = change.direction === 'easier';
  useEffect(() => {
    speak(`${change.message}. ${detail}`);
  }, []);
  return (
    <section
      role="status"
      aria-live="assertive"
      className={`animate-tier-in flex flex-1 flex-col items-center justify-center gap-8 rounded-xl2 px-8 py-12 text-white ${
        easier ? 'bg-warn' : 'bg-primary'
      }`}
    >
      {easier ? (
        <ArrowDownIcon className="animate-arrow-down h-28 w-28" />
      ) : (
        <ArrowUpIcon className="animate-arrow-up h-28 w-28" />
      )}
      <p className="text-center text-4xl font-bold leading-snug">{change.message}</p>
      <p className="text-center text-2xl font-semibold text-white/90">{detail}</p>
    </section>
  );
}

/**
 * End of session: praise first, the count second, and one way to continue. The
 * count is worded by the bank ("remembered" pictures, "matched" routines), and
 * the same words are spoken and shown.
 */
function Finished({ line, onPlayAgain }) {
  useEffect(() => {
    speak(`Well done. ${line}`);
  }, []);
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="card flex flex-col items-center gap-4 px-10 py-10 text-center">
        <CheckIcon className="h-24 w-24 text-good" />
        <p className="text-4xl font-bold">Well done!</p>
        <p className="text-2xl text-ink-soft">{line}</p>
      </div>
      <button type="button" onClick={onPlayAgain} className="btn-primary min-h-tap-lg w-full max-w-md text-3xl">
        Play again
      </button>
    </section>
  );
}
