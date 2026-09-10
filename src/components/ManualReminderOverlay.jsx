import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStore } from '../lib/db.js';
import { cancelSpeech, speak } from '../lib/voice.js';
import { useLanguage } from './LanguageContext.jsx';
import { t as translate } from '../lib/i18n.js';

const CHECK_EVERY_MS = 1000;

/** One-time manual reminders use the same patient-shell interruption pattern as system reminders. */
export default function ManualReminderOverlay({ onShowing, blocked = false }) {
  const store = useMemo(() => getStore(), []);
  const { language, t } = useLanguage();
  const [dueItems, setDueItems] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  const refresh = useCallback(async () => {
    const due = await store.dueManualReminders(Date.now());
    setDueItems(due);
    if (!blocked) setCurrentId((id) => id && due.some((row) => row.id === id) ? id : due[0]?.id || null);
  }, [blocked, store]);

  useEffect(() => {
    let live = true;
    refresh().catch((error) => console.warn('[CogniCare] could not check manual reminders', error));
    const timer = setInterval(() => { if (live) refresh().catch(() => {}); }, CHECK_EVERY_MS);
    return () => { live = false; clearInterval(timer); };
  }, [refresh]);

  const current = dueItems.find((row) => row.id === currentId) || null;
  useEffect(() => {
    if (blocked) setCurrentId(null);
  }, [blocked]);
  useEffect(() => {
    if (onShowing) onShowing(Boolean(current));
  }, [current, onShowing]);

  useEffect(() => {
    if (!current) return undefined;
    const line = t('manual.overlay', { title: current.title });
    speak(line, translate('en', 'manual.overlay', { title: current.title }));
    return () => cancelSpeech();
  }, [current?.id, current?.title, language, t]);

  if (blocked || !current) return null;
  const typeLabel = t(`manual.type.${current.type}`);
  return (
    <div role="dialog" aria-modal="true" aria-label={t('manual.title')} className="fixed inset-0 z-40 flex items-center justify-center bg-warn-light/95 px-5 py-8">
      <section className="card w-full max-w-2xl" aria-live="assertive">
        <p className="home-eyebrow">{typeLabel}</p>
        <h2 className="mt-3 text-4xl font-bold leading-snug text-ink">{current.title}</h2>
        {current.note ? <p className="mt-4 text-xl text-ink-soft">{current.note}</p> : null}
        <button
          type="button"
          className="btn-primary mt-8 w-full"
          aria-label={t('manual.doneAria')}
          onClick={async () => {
            await store.completeManualReminder(current.id, Date.now());
            setCurrentId(null);
            await refresh();
          }}
        >
          {t('manual.done')}
        </button>
      </section>
    </div>
  );
}
