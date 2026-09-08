import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartMark, PlayIcon } from '../components/icons.jsx';
import { getStore } from '../lib/db.js';
import { ensureIdentity } from '../lib/sync.js';
import { cancelSpeech, primeSpeech, speak } from '../lib/voice.js';

/**
 * Patient Home.
 *
 * Deliberately simple: the patient has a large memory-game button and a clear
 * everyday-routines option, with no settings or multi-step menu to navigate.
 * The greeting is spoken aloud on arrival so a patient who cannot read the screen
 * still knows what to do; on iOS that first line may wait for the Play tap, since
 * Safari only lets speech begin inside a gesture. That same tap primes the speech
 * queue before moving to the game, so every prompt in /play can then be spoken.
 */
export default function PatientHome() {
  const navigate = useNavigate();
  const store = useMemo(() => getStore(), []);
  const [pairingCode, setPairingCode] = useState(null);

  useEffect(() => {
    speak('Welcome to CogniCare. When you are ready, tap the big button to play.');
    return () => cancelSpeech();
  }, []);

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
          <p className="home-subtitle">Small moments of memory, every day</p>
        </div>
      </header>

      <section className="home-intro" aria-labelledby="home-heading">
        <p className="home-eyebrow">Ready when you are</p>
        <h1 id="home-heading">Let’s play together</h1>
        <p>Choose a gentle activity below. There is no timer to rush you.</p>
      </section>

      <button
        type="button"
        onClick={() => {
          primeSpeech();
          navigate('/play');
        }}
        className="home-primary tap-target min-h-tap-xl w-full flex-col gap-3 px-8 py-8 text-white shadow-tap animate-soft-pulse"
        aria-label="Play today's game"
      >
        <span className="home-action-icon"><PlayIcon className="h-14 w-14" /></span>
        <span className="text-4xl font-bold tracking-wide">Memory game</span>
        <span className="text-lg font-medium text-white/80">Remember the picture</span>
      </button>

      <Link to="/play/routine" className="home-secondary tap-target w-full min-h-tap-lg flex-col gap-1 px-6 text-center">
        <span className="text-2xl font-bold">Everyday routines</span>
        <span className="text-base font-medium text-ink-soft/75">Match an object to a moment</span>
      </Link>

      <footer className="home-footer">
        <Link to="/caregiver" className="home-caregiver-link min-h-tap">
          For caregivers <span aria-hidden="true">→</span>
        </Link>

        {pairingCode ? (
          <p className="home-code">
            Caregiver code <span>{pairingCode}</span>
          </p>
        ) : <p className="home-code home-code-loading">Preparing caregiver code…</p>}
      </footer>
    </main>
  );
}
