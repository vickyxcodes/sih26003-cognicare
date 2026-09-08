import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartMark, PlayIcon } from '../components/icons.jsx';
import { cancelSpeech, primeSpeech, speak } from '../lib/voice.js';

/**
 * Patient Home.
 *
 * Deliberately almost empty: one enormous Play button is the only real control.
 * The greeting is spoken aloud on arrival so a patient who cannot read the screen
 * still knows what to do; on iOS that first line may wait for the Play tap, since
 * Safari only lets speech begin inside a gesture. That same tap primes the speech
 * queue before moving to the game, so every prompt in /play can then be spoken.
 */
export default function PatientHome() {
  const navigate = useNavigate();

  useEffect(() => {
    speak('Welcome to CogniCare. When you are ready, tap the big button to play.');
    return () => cancelSpeech();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-10">
      <div className="flex flex-col items-center gap-4 pt-6">
        <HeartMark className="h-20 w-20" />
        <p className="text-2xl font-semibold text-ink-soft">CogniCare</p>
      </div>

      <button
        type="button"
        onClick={() => {
          primeSpeech();
          navigate('/play');
        }}
        className="tap-target w-full max-w-xl min-h-tap-xl flex-col gap-4 bg-primary px-10 py-10 text-white shadow-tap animate-soft-pulse"
        aria-label="Play today's game"
      >
        <PlayIcon className="h-24 w-24" />
        <span className="text-5xl font-bold tracking-wide">Play</span>
      </button>

      <Link
        to="/caregiver"
        className="min-h-tap flex items-center px-4 text-base text-ink-soft/70 underline decoration-ink-soft/30"
      >
        For caregivers
      </Link>
    </main>
  );
}
