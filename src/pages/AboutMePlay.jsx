import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext.jsx';
import { createAboutMeBank } from '../data/aboutMe.js';
import { getStore } from '../lib/db.js';
import Play from './Play.jsx';

export default function AboutMePlay() {
  const store = useMemo(() => getStore(), []);
  const { language } = useLanguage();
  const [profile, setProfile] = useState(undefined);
  useEffect(() => { store.getPatientProfile().then(setProfile).catch(() => setProfile(null)); }, [store]);
  if (profile === undefined) return <main className="screen"><p className="text-xl text-ink-soft">Loading…</p></main>;
  if (!profile) return <Navigate to="/patient/onboarding" replace />;
  return <Play key={`${profile.updatedAt || ''}-${language}`} bankOverride={createAboutMeBank(profile)} />;
}
