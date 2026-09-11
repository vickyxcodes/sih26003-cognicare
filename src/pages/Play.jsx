import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import HomeButton from '../components/HomeButton.jsx';
import Picture from '../components/Picture.jsx';
import CardRow from '../components/CardRow.jsx';
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, RetryIcon } from '../components/icons.jsx';
import { BANKS, FIRST_BANK, nextBank, optionWords } from '../data/banks.js';
import { recordAnswer, recordSession, getStore } from '../lib/db.js';
import { supportsProfiles } from '../ai/challengeProfiles.js';
import { cancelSpeech, speak } from '../lib/voice.js';
import { useLanguage } from '../components/LanguageContext.jsx';
import {
  listWordsLocalized,
  localizeBank,
  localizeDone,
  localizeMiss,
  localizeQuestion,
  t,
  t as translateText,
} from '../lib/i18n.js';
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
 * /play - one game session, in any domain.
 *
 * The screen only ever asks for one thing at a time, and the study screen, the
 * feedback and the difficulty transition all move on by themselves so the patient
 * never has to find a "next" button. All the rules live in sessionEngine; this
 * file is layout plus timers.
 *
 * All five game domains run through this one screen. A question that has
 * something to memorise - one picture, or a small row of words, digits or shapes
 * - opens on the study screen and then hides it; a routine-matching question has
 * nothing to memorise, so the engine opens it straight on the cue and its
 * options. Everything after that - the tap, the write, the feedback, the
 * difficulty change, the ending - is shared, and the words that differ per domain
 * (the counter, the closing line, the wrong-answer line, what the tier change
 * explains) come from the bank rather than from this file.
 *
 * Answering is always one tap on one large button, in every domain: there is no
 * typing, no drawing, no dragging and no two-finger interaction anywhere.
 *
 * Every screen speaks for itself: the study/ask prompts here, and the feedback,
 * tier-change and finished screens each say their own words on mount, all through
 * the one `speak()` helper. Voice is a help, never a requirement - with the sound
 * off, or on a browser with no speech, the game is unchanged.
 */

/** The option a question is actually about - the right answer. */
const answerOption = (question) => question.options.find((o) => o.id === question.answerId);

const choicesSpeech = (question, language) => {
  const labels = question.options.map(optionWords).filter(Boolean);
  return labels.length ? `${t(language, 'play.choicesAre')} ${listWordsLocalized(labels, language)}.` : '';
};

export default function Play({ bankOverride = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  /**
   * Each bank owns its own route, so a direct link opens that game and this file
   * still names no domain. Anything unrecognised falls back to the first game
   * rather than showing an error to a patient.
   */
  const requestedBank = bankOverride || BANKS.find((b) => b.path === location.pathname) || FIRST_BANK;
  const [bank, setBank] = useState(requestedBank);
  const [session, setSession] = useState(() => (
    requestedBank === FIRST_BANK
      ? startSession({ bank: FIRST_BANK })
      : startSession({ bank: requestedBank })
  ));
  const savedSessionAt = useRef(null);
  const partialSessionAt = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  /** The optional AI personalizer for this game (null for the games we don't personalize). */
  const personalizerRef = useRef(null);
  const { language, t: translate } = useLanguage();
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
      const timer = setTimeout(
        () => setSession((s) => continueSession(s, { bank, nextQuestion: personalizerRef.current?.nextQuestion })),
        FEEDBACK_MS,
      );
      return () => clearTimeout(timer);
    }
    if (session.phase === PHASE.TIER) {
      const timer = setTimeout(
        () => setSession((s) => continueSession(s, { bank, nextQuestion: personalizerRef.current?.nextQuestion })),
        TIER_MS,
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [session, bank, reminderOnScreen]);

  /**
   * Speak the prompt for the two phases this component renders itself. The study
   * picture is announced when it appears, and the question plus every available
   * choice when the options do;
   * the feedback, tier and finished screens speak from their own components below.
   * Keyed on the question id so re-speaking only happens on a real change of screen
   * - and on the reminder clearing, which is a real change of screen: the patient
   * comes back to a question they were part-way through and hears it again.
   */
  useEffect(() => {
    if (!session.question || reminderOnScreen) return;
    const displayQuestion = localizeQuestion(bank, session.question, language);
    const englishQuestion = localizeQuestion(bank, session.question, 'en');
    if (session.phase === PHASE.STUDY) speak(displayQuestion.studyPrompt, englishQuestion.studyPrompt);
    else if (session.phase === PHASE.ASK) {
      speak(
        `${displayQuestion.prompt} ${choicesSpeech(displayQuestion, language)}`,
        `${englishQuestion.prompt} ${choicesSpeech(englishQuestion, 'en')}`,
      );
    }
  }, [session.phase, session.question?.id, reminderOnScreen, language, bank]);

  /**
   * A patient may leave after one answer rather than finishing all eight. That
   * is still a useful session report, so save the partial attempt once when the
   * screen is left. The ref keeps this cleanup attached to the screen lifetime
   * without capturing an old question or writing a duplicate on every render.
   */
  const savePartialSession = () => {
    const current = sessionRef.current;
    if (
      current.phase === PHASE.DONE
      || current.asked === 0
      || partialSessionAt.current === current.startedAt
    ) return;
    partialSessionAt.current = current.startedAt;
    const endedAt = Date.now();
    recordSession({
      ...sessionSummary({ ...current, endedAt }, endedAt),
      endReason: 'abandoned',
    });
  };

  /** Leaving the game stops speech and preserves an answered partial attempt. */
  useEffect(() => () => {
    savePartialSession();
    cancelSpeech();
  }, []);

  /**
   * The optional on-device AI personalizer, wired per game.
   *
   * It is created only for the domains it can actually shape, and only in a
   * browser; the dynamic import is what pulls TensorFlow in, so the picture,
   * routine and about-me games never load it. Everything is best-effort: if the
   * import, model or init fails, `personalizerRef` stays null and the engine keeps
   * playing the authored, deterministic rounds - the patient sees a normal game.
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !supportsProfiles(bank.domain)) {
      personalizerRef.current = null;
      return undefined;
    }
    let controller = null;
    let live = true;
    import('../ai/personalizer.js')
      .then(({ createPersonalizer }) => {
        if (!live) return;
        controller = createPersonalizer({ domain: bank.domain, store: getStore() });
        personalizerRef.current = controller;
        // A tiny developer/caregiver diagnostic; harmless if never called.
        window.cognicareAI = () => (controller ? controller.debug() : null);
        controller?.init().catch(() => {});
      })
      .catch(() => {});
    return () => {
      live = false;
      personalizerRef.current = null;
      controller?.dispose();
    };
  }, [bank]);

  /**
   * After each answer, fold the running tally into the personalizer so the next
   * round tracks this sitting. Synchronous and cheap, and it runs before the
   * feedback timer fires the next `continueSession`, so the recommendation the
   * engine reads through `nextQuestion` is already up to date.
   */
  useEffect(() => {
    personalizerRef.current?.update({
      asked: session.asked,
      correct: session.correct,
      streakRight: session.streakRight,
      streakWrong: session.streakWrong,
    });
  }, [session.asked, session.correct, session.streakRight, session.streakWrong]);

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
    if (next.domain === 'about_me' || bank.domain === 'about_me') {
      navigate(next.path);
      return;
    }
    setBank(next);
    setSession(startSession({ bank: next }));
  };

  const skipGame = () => {
    const next = nextBank(bank);
    savePartialSession();
    cancelSpeech();
    if (next.domain === 'about_me') {
      navigate(next.path);
      return;
    }
    setBank(next);
    setSession(startSession({ bank: next }));
    navigate(next.path);
  };

  const { phase, question, lastAnswer } = session;
  const displayBank = localizeBank(bank, language);
  const displayQuestion = localizeQuestion(bank, question, language);
  const displayAnswer = displayQuestion ? answerOption(displayQuestion) : null;
  const questionNumber = Math.min(session.asked + 1, session.maxQuestions);
  const accuracy = session.asked ? `${Math.round((session.correct / session.asked) * 100)}%` : '—';
  const streak = session.streakRight
    ? translate('play.right', { count: session.streakRight })
    : session.streakWrong
      ? translate('play.toReset', { count: session.streakWrong })
      : '—';
  /**
   * The personalization badge, shown only when this round was actually built by
   * the AI layer to be harder or easier than the standard round (matched by id, so
   * it can only describe the round on screen). The one-line reason is grounded in
   * the real profile and recent play; it is authored in English, so the badge
   * stands alone in Assamese rather than mixing languages.
   */
  const aiRound = question && personalizerRef.current ? personalizerRef.current.describeQuestion(question.id) : null;
  const showAiBadge = Boolean(aiRound && aiRound.note);
  const aiExplain = showAiBadge && language === 'en' ? aiRound.note : '';

  return (
    <main className="screen flex min-h-screen flex-col gap-8">
      <header className="play-header flex items-center justify-between gap-4">
        <HomeButton onLeave={savePartialSession} />
        <p className="text-lg font-semibold text-ink-soft">
          {phase === PHASE.DONE
            ? translate('nav.allDone')
            : `${displayBank.unitLabel} ${questionNumber} / ${session.maxQuestions}`}
        </p>
        <button type="button" onClick={skipGame} className="btn-quiet play-skip" aria-label={translate('nav.skipAria')}>
          {translate('nav.skip')}
        </button>
      </header>

      <section className="play-overview" aria-label={`${displayBank.name} ${translate('play.progressAndDifficulty')}`}>
        <div className="play-level card">
          <div className="flex items-center justify-between gap-3">
            <p className="play-label">{translate('play.difficulty')}</p>
            <p className="play-level-number">{translate('play.level', { level: session.tier })}</p>
          </div>
          <p className="play-level-help">{displayBank.difficultyGuide[session.tier]}</p>
          <p className="play-benefit"><strong>{translate('play.helps')}</strong> {displayBank.benefit}</p>
        </div>
        <div className="play-stats card" aria-label={translate('play.currentStats')}>
          <div>
            <span className="play-label">{translate('play.progress')}</span>
            <strong>
              {session.asked}/{session.maxQuestions}
            </strong>
          </div>
          <div>
            <span className="play-label">{translate('play.accuracy')}</span>
            <strong>{accuracy}</strong>
          </div>
          <div>
            <span className="play-label">{translate('play.streak')}</span>
            <strong>{streak}</strong>
          </div>
        </div>
      </section>

      {phase === PHASE.STUDY && (
        <section className="flex flex-1 flex-col items-center justify-center gap-6">
          {showAiBadge && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg font-semibold text-primary">{translate('play.personalized')}</p>
              {aiExplain && <p className="max-w-xl text-center text-lg text-ink-soft">{aiExplain}</p>}
            </div>
          )}
          <p className="text-center text-3xl font-semibold">{displayQuestion.studyPrompt}</p>
          <div className="card animate-pop-in flex flex-col items-center gap-3 px-10 py-8">
            {displayQuestion.studyItem ? (
              <>
                <Picture id={displayQuestion.studyItem} className="h-48 w-48" />
                <p className="text-3xl font-bold">{optionWords(displayAnswer)}</p>
              </>
            ) : (
              <CardRow cards={displayQuestion.studyCards} />
            )}
          </div>
        </section>
      )}

      {phase === PHASE.ASK && (
        <section className="flex flex-1 flex-col justify-center gap-8">
          {showAiBadge && (
            <p className="text-center text-lg font-semibold text-primary">{translate('play.personalized')}</p>
          )}
          <h1 className="text-center text-4xl font-bold leading-snug">{displayQuestion.prompt}</h1>
          <div className="grid gap-6 sm:grid-cols-2">
            {displayQuestion.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.id)}
                aria-label={optionWords(opt)}
                className={`tap-target ${
                  /* Two choices get the largest button in the app; three or four
                     step down to 120px so every choice is still on screen at once
                     without scrolling - well above the 80px floor either way. */
                  displayQuestion.options.length > 2 ? 'min-h-tap-lg' : 'min-h-tap-xl'
                } flex-col gap-3 border-4 border-primary/30 bg-card px-6 py-8 shadow-card`}
              >
                {opt.item ? <Picture id={opt.item} className="h-40 w-40" /> : null}
                {opt.cards ? <CardRow cards={opt.cards} size="option" /> : null}
                {opt.text ? <span className="text-3xl font-bold">{opt.text}</span> : null}
              </button>
            ))}
          </div>
        </section>
      )}

      {phase === PHASE.FEEDBACK && <Feedback answer={lastAnswer} question={question} bank={bank} />}

      {phase === PHASE.TIER && <TierChange change={session.tierChange} bank={bank} />}

      {phase === PHASE.DONE && (
        <Finished
          line={localizeDone(bank.domain, session.correct, session.asked, language)}
          fallbackLine={localizeDone(bank.domain, session.correct, session.asked, 'en')}
          onPlayAgain={playAgain}
        />
      )}
    </main>
  );
}

/**
 * Feedback is warm either way. A wrong answer shows the right answer again
 * with a kind sentence - there is no red cross, no "wrong", and no score
 * flashing on screen, because being corrected sharply is what makes people stop
 * playing.
 *
 * The sentence itself comes from the bank, so it says "It was the Cup", "The
 * word was Garden" or "The pattern was circle, square" as the game requires,
 * and the voice reads exactly what is on screen.
 */
function Feedback({ answer, question, bank }) {
  const { language, t: translate } = useLanguage();
  const right = answer.correct;
  const displayQuestion = localizeQuestion(bank, question, language);
  const englishQuestion = localizeQuestion(bank, question, 'en');
  const item = answerOption(displayQuestion);
  const englishItem = answerOption(englishQuestion);
  const missed = localizeMiss(bank.domain, optionWords(item), language);
  const englishMissed = localizeMiss(bank.domain, optionWords(englishItem), 'en');
  useEffect(() => {
    speak(
      right ? translate('feedback.correct') : `${missed}. ${translate('feedback.tricky')}`,
      right ? translateText('en', 'feedback.correct') : `${englishMissed}. ${translateText('en', 'feedback.tricky')}`,
    );
  }, [right, missed, englishMissed, translate]);
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
          {right ? translate('feedback.correct') : missed}
        </p>
        {!right && item.item ? <Picture id={item.item} className="h-36 w-36" /> : null}
        {!right && item.cards ? <CardRow cards={item.cards} /> : null}
        {!right && <p className="text-center text-2xl text-ink-soft">{translate('feedback.tricky')}</p>}
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
function TierChange({ change, bank }) {
  const { language, t: translate } = useLanguage();
  const easier = change.direction === 'easier';
  const detail = localizeBank(bank, language).tierDetail[change.direction];
  const englishDetail = localizeBank(bank, 'en').tierDetail[change.direction];
  const message = translate(`tier.${change.direction}`);
  useEffect(() => {
    speak(`${message}. ${detail}`, `${translateText('en', `tier.${change.direction}`)}. ${englishDetail}`);
  }, [message, detail, englishDetail, translate, change.direction]);
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
      <p className="text-center text-4xl font-bold leading-snug">{message}</p>
      <p className="text-center text-2xl font-semibold text-white/90">{detail}</p>
    </section>
  );
}

/**
 * End of session: praise first, the count second, and one way to continue. The
 * count is worded by the bank ("remembered" pictures, "matched" routines), and
 * the same words are spoken and shown.
 */
function Finished({ line, fallbackLine, onPlayAgain }) {
  const { t: translate } = useLanguage();
  const englishLine = translateText('en', 'done.wellDone');
  useEffect(() => {
    speak(`${translate('done.wellDone')} ${line}`, `${englishLine} ${fallbackLine}`);
  }, [line, fallbackLine, translate, englishLine]);
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="card flex flex-col items-center gap-4 px-10 py-10 text-center">
        <CheckIcon className="h-24 w-24 text-good" />
        <p className="text-4xl font-bold">{translate('done.wellDone')}</p>
        <p className="text-2xl text-ink-soft">{line}</p>
      </div>
      <button type="button" onClick={onPlayAgain} className="btn-primary min-h-tap-lg w-full max-w-md text-3xl">
        {translate('nav.playAgain')}
      </button>
    </section>
  );
}
