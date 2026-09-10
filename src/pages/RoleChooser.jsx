import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector.jsx';
import { getStore } from '../lib/db.js';
import { APP_ROLE_SETTING, APP_ROLES } from '../lib/appRole.js';
import { useLanguage } from '../components/LanguageContext.jsx';

export default function RoleChooser() {
  const store = useMemo(() => getStore(), []);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const as = language === 'as';
  const choose = async (role, path) => {
    await store.setSetting(APP_ROLE_SETTING, role);
    navigate(path, { replace: true });
  };
  return <main className="role-screen">
    <LanguageSelector />
    <section className="role-card card" aria-labelledby="role-title">
      <div className="home-mark mx-auto"><span className="text-4xl" aria-hidden="true">♥</span></div>
      <p className="home-eyebrow mt-6 text-center">{as ? 'CogniCare লৈ স্বাগতম' : 'Welcome to CogniCare'}</p>
      <h1 id="role-title" className="mt-3 text-center text-4xl font-bold text-ink">{as ? 'আপুনি কোন ভূমিকা ব্যৱহাৰ কৰিছে?' : 'How will you use CogniCare?'}</h1>
      <p className="mt-3 text-center text-lg text-ink-soft">{as ? 'আৰম্ভ কৰিবলৈ এটা বাছনি কৰক।' : 'Choose an option to get started.'}</p>
      <div className="mt-8 grid gap-5">
        <button type="button" className="role-choice btn-primary" onClick={() => choose(APP_ROLES.patient, '/patient/onboarding')}>
          <span className="text-3xl">{as ? 'মই ৰোগী' : 'I am a patient'}</span>
          <span className="mt-2 text-base font-normal text-white/80">{as ? 'মোৰ বিষয়ে অলপ কওক' : 'Tell us about me'}</span>
        </button>
        <button type="button" className="role-choice btn-secondary" onClick={() => choose(APP_ROLES.caregiver, '/caregiver')}>
          <span className="text-3xl">{as ? 'মই এজন অভিভাৱক' : 'I am a caregiver'}</span>
          <span className="mt-2 text-base font-normal text-ink-soft">{as ? 'এটা একাউণ্ট আৰু ৰোগীৰ তথ্য যোগ কৰক' : 'Sign in and add a patient'}</span>
        </button>
      </div>
    </section>
  </main>;
}
