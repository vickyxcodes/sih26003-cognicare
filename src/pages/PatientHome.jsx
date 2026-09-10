import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartMark, PlayIcon } from '../components/icons.jsx';
import { getStore } from '../lib/db.js';
import { ensureIdentity } from '../lib/sync.js';
import { cancelSpeech, primeSpeech, speak } from '../lib/voice.js';
import { useLanguage } from '../components/LanguageContext.jsx';
import { t as translate } from '../lib/i18n.js';

/**
 * Patient Home.
 *
 * Deliberately simple: the patient has one large memory-game button and a
 * small set of clear activity cards, with no settings or multi-step menu to
 * navigate.
 * The greeting is spoken aloud on arrival so a patient who cannot read the screen
 * still knows what to do; on iOS that first line may wait for the Play tap, since
 * Safari only lets speech begin inside a gesture. That same tap primes the speech
 * queue before moving to the game, so every prompt in /play can then be spoken.
 */
export default function PatientHome() {
  const navigate = useNavigate();
  const store = useMemo(() => getStore(), []);
  const [pairingCode, setPairingCode] = useState(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    speak(t('home.greeting'), translate('en', 'home.greeting'));
    return () => cancelSpeech();
  }, [language, t]);

  useEffect(() => {
    let live = true;
    ensureIdentity(store)
      .then(({ pairingCode: code }) => {
        if (live) setPairingCode(code);
      })
      .catch((error) => console.warn('[CogniCare] could not prepare the caregiver code', error));
    return () => {
      live = false;
    };
  }, [store]);

  return (
    <main className="home-screen">
      <header className="home-brand">
        <div className="home-mark">
          <HeartMark className="h-12 w-12" />
        </div>
        <div>
          <p className="home-title">CogniCare</p>
          <p className="home-subtitle">{t('home.subtitle')}</p>
        </div>
      </header>

      <section className="home-intro" aria-labelledby="home-heading">
        <p className="home-eyebrow">{t('home.eyebrow')}</p>
        <h1 id="home-heading">{t('home.title')}</h1>
        <p>{t('home.intro')}</p>
      </section>

      <button
        type="button"
        onClick={() => {
          primeSpeech();
          navigate('/play');
        }}
        className="home-primary tap-target min-h-tap-xl w-full flex-col gap-3 px-8 py-8 text-white shadow-tap animate-soft-pulse"
        aria-label={t('home.playAria')}
      >
        <span className="home-action-icon"><PlayIcon className="h-14 w-14" /></span>
        <span className="text-4xl font-bold tracking-wide">{t('home.memory')}</span>
        <span className="text-lg font-medium text-white/80">{t('home.memorySub')}</span>
      </button>

      <section className="home-games" aria-label={t('home.choose')}>
        <Link to="/play/routine" className="home-game-card tap-target min-h-[180px] flex-col items-start justify-start gap-2 px-5 py-5 text-left">
          <span className="home-game-kicker">{t('home.activity2')}</span>
          <span className="text-xl font-bold">{t('home.routine')}</span>
          <span className="text-sm font-medium text-ink-soft/75">{t('home.routineSub')}</span>
        </Link>
        <Link to="/play/words" className="home-game-card tap-target min-h-[180px] flex-col items-start justify-start gap-2 px-5 py-5 text-left">
          <span className="home-game-kicker">{t('home.activity3')}</span>
          <span className="text-xl font-bold">{t('home.words')}</span>
          <span className="text-sm font-medium text-ink-soft/75">{t('home.wordsSub')}</span>
        </Link>
        <Link to="/play/numbers" className="home-game-card tap-target min-h-[180px] flex-col items-start justify-start gap-2 px-5 py-5 text-left">
          <span className="home-game-kicker">{t('home.activity4')}</span>
          <span className="text-xl font-bold">{t('home.numbers')}</span>
          <span className="text-sm font-medium text-ink-soft/75">{t('home.numbersSub')}</span>
        </Link>
        <Link to="/play/patterns" className="home-game-card tap-target min-h-[180px] flex-col items-start justify-start gap-2 px-5 py-5 text-left">
          <span className="home-game-kicker">{t('home.activity5')}</span>
          <span className="text-xl font-bold">{t('home.patterns')}</span>
          <span className="text-sm font-medium text-ink-soft/75">{t('home.patternsSub')}</span>
        </Link>
        <Link to="/play/about-me" className="home-game-card tap-target min-h-[180px] flex-col items-start justify-start gap-2 px-5 py-5 text-left">
          <span className="home-game-kicker">{t('home.activity6')}</span>
          <span className="text-xl font-bold">{t('home.aboutMe')}</span>
          <span className="text-sm font-medium text-ink-soft/75">{t('home.aboutMeSub')}</span>
        </Link>
      </section>

      <footer className="home-footer">
        <Link to="/patient/profile" className="home-caregiver-link min-h-tap">{t('home.editProfile')}</Link>
        <Link to="/caregiver" className="home-caregiver-link min-h-tap">
          {t('home.caregivers')} <span aria-hidden="true">→</span>
        </Link>

        {pairingCode ? (
          <p className="home-code">
            {t('home.caregiverCode')} <span>{pairingCode}</span>
          </p>
        ) : <p className="home-code home-code-loading">{t('home.preparing')}</p>}
      </footer>
    </main>
  );
}
