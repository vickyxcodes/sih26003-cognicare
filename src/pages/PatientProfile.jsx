import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext.jsx';
import { getStore } from '../lib/db.js';
import { cleanProfile, PROFILE_FIELDS, validateProfileField } from '../lib/patientProfile.js';
import { APP_ROLE_SETTING } from '../lib/appRole.js';

const copy = (language) => language === 'as' ? {
  title: 'আপোনাৰ বিষয়ে অলপ কওক', intro: 'এই তথ্য কেৱল এই ডিভাইচত থাকে আৰু “মোৰ বিষয়ে” খেলখনৰ বাবে ব্যৱহাৰ হয়।', back: 'পিছলৈ', next: 'পৰৱৰ্তী', save: 'সংৰক্ষণ কৰক', edit: 'আপোনাৰ প্ৰ’ফাইল সম্পাদনা কৰক', saved: 'আপোনাৰ প্ৰ’ফাইল সংৰক্ষিত হ’ল।', saveError: 'সংৰক্ষণ কৰিব পৰা নগ’ল। অনুগ্ৰহ কৰি আকৌ চেষ্টা কৰক।', step: 'পদক্ষেপ {current} / {total}', placeholder: 'ইয়াত লিখক', phone: 'উদাহৰণ: 98765 43210',
} : {
  title: 'Tell us a little about you', intro: 'This information stays only on this device and is used for the About Me game.', back: 'Back', next: 'Next', save: 'Save profile', edit: 'Edit your profile', saved: 'Your profile is saved.', saveError: 'The profile could not be saved. Please try again.', step: 'Step {current} of {total}', placeholder: 'Type here', phone: 'Example: 98765 43210',
};

export default function PatientProfile({ edit = false, onSaved = null }) {
  const store = useMemo(() => getStore(), []);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const words = copy(language);
  const [phase, setPhase] = useState('loading');
  const [values, setValues] = useState({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([store.getPatientProfile(), store.getPatientProfileDraft()]).then(([profile, draft]) => {
      if (!live) return;
      if (profile && !edit) { setPhase('redirect'); return; }
      setValues(cleanProfile(edit && profile ? profile : draft || {}));
      setPhase('ready');
    }).catch(() => { if (live) setPhase('ready'); });
    return () => { live = false; };
  }, [store, edit]);

  if (phase === 'redirect') return <Navigate to="/patient" replace />;
  if (phase !== 'ready') return <main className="screen"><p className="text-xl text-ink-soft">Loading…</p></main>;
  const field = PROFILE_FIELDS[step];
  const fieldLabel = language === 'as' ? field.assameseLabel : field.label;
  const setValue = (value) => {
    const next = { ...values, [field.key]: value };
    setValues(next); setError(''); store.savePatientProfileDraft(next).catch(() => {});
  };
  const next = async () => {
    const message = validateProfileField(field.key, values[field.key]);
    if (message) { setError(message); return; }
    if (step < PROFILE_FIELDS.length - 1) { setStep(step + 1); return; }
    setSaving(true);
    try {
      const profile = cleanProfile(values);
      await store.savePatientProfile(profile);
      await store.clearPatientProfileDraft();
      if (onSaved) await onSaved(profile);
      else navigate('/patient', { replace: true });
    } catch (saveFailure) {
      console.warn('[CogniCare] could not finish patient profile', saveFailure);
      setError(words.saveError);
    } finally {
      setSaving(false);
    }
  };
  const goBack = async () => {
    if (step) { setStep(step - 1); return; }
    if (edit) { navigate('/patient'); return; }
    if (onSaved) { navigate('/caregiver'); return; }
    await store.setSetting(APP_ROLE_SETTING, null);
    navigate('/', { replace: true });
  };
  return <main className="screen profile-screen">
    <section className="card profile-card" aria-labelledby="profile-title">
      <p className="home-eyebrow">{words.step.replace('{current}', step + 1).replace('{total}', PROFILE_FIELDS.length)}</p>
      <div className="profile-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / PROFILE_FIELDS.length) * 100}%` }} /></div>
      <h1 id="profile-title" className="mt-6 text-4xl font-bold text-ink">{edit ? words.edit : words.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">{words.intro}</p>
      <label className="mt-10 block text-3xl font-semibold text-ink" htmlFor={field.key}>{fieldLabel}</label>
      <input id={field.key} type={field.type} inputMode={field.type === 'tel' ? 'tel' : undefined} value={values[field.key] || ''} onChange={(event) => setValue(event.target.value)} placeholder={field.type === 'tel' ? words.phone : words.placeholder} className="profile-input" autoFocus />
      {error && <p className="mt-3 text-lg font-semibold text-warn" role="alert">{error}</p>}
      <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
        <button type="button" className="btn-quiet" onClick={goBack}>{words.back}</button>
        <button type="button" className="btn-primary" onClick={next} disabled={saving}>{saving ? '…' : step === PROFILE_FIELDS.length - 1 ? words.save : words.next}</button>
      </div>
    </section>
  </main>;
}
