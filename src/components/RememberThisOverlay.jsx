import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStore } from '../lib/db.js';
import { cancelSpeech, speak } from '../lib/voice.js';
import { useLanguage } from './LanguageContext.jsx';
import { t as translate } from '../lib/i18n.js';

const CHECK_EVERY_MS = 1000;

/** Watches persisted delayed-recall records. The clock only checks; dueAt is the source of truth. */
export default function RememberThisOverlay({ onShowing, blocked = false }) {
  const store = useMemo(() => getStore(), []);
  const { language, t } = useLanguage();
  const [dueItems, setDueItems] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  const refresh = useCallback(async () => {
    const rows = await store.refreshRememberThis();
    const due = rows.filter((row) => row.status === 'due' || (row.status === 'pending' && row.dueAt <= Date.now()));
    setDueItems(due);
    if (!blocked) {
      setCurrentId((id) => id && due.some((row) => row.id === id) ? id : due[0]?.id || null);
    }
  }, [blocked, store]);

  useEffect(() => {
    let live = true;
    refresh().catch((error) => console.warn('[CogniCare] could not check Remember This items', error));
    const timer = setInterval(() => {
      if (live) refresh().catch(() => {});
    }, CHECK_EVERY_MS);
    return () => { live = false; clearInterval(timer); };
  }, [refresh]);

  const current = dueItems.find((row) => row.id === currentId) || null;
  useEffect(() => {
    if (blocked) setCurrentId(null);
  }, [blocked]);
  useEffect(() => {
    if (onShowing) onShowing(Boolean(current));
  }, [current, onShowing]);

  const finish = async (outcome, recallText) => {
    if (!current) return;
    await store.completeRememberThis(current.id, { outcome, recallText, now: Date.now() });
    setCurrentId(null);
    await refresh();
  };

  useEffect(() => {
    if (!current) return undefined;
    const line = t('remember.duePrompt');
    speak(line, translate('en', 'remember.duePrompt'));
    return () => cancelSpeech();
  }, [current?.id, language, t]);

  if (blocked || !current) return null;
  return (
    <RememberCard
      item={current}
      t={t}
      onFinish={finish}
    />
  );
}

function RememberCard({ item, t, onFinish }) {
  const [recallText, setRecallText] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (outcome) => {
    setSaving(true);
    try { await onFinish(outcome, recallText); } finally { setSaving(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={t('remember.title')} className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 px-5 py-8">
      <section className="card remember-overlay-card w-full max-w-3xl" aria-live="assertive">
        <p className="home-eyebrow">{t('remember.title')}</p>
        <h2 className="mt-3 text-3xl font-bold leading-snug text-ink">{t('remember.duePrompt')}</h2>
        <textarea
          value={recallText}
          onChange={(event) => setRecallText(event.target.value)}
          placeholder={t('remember.recallPlaceholder')}
          aria-label={t('remember.recallPlaceholder')}
          className="remember-textarea mt-6"
          rows="3"
          maxLength="120"
          autoFocus
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" className="btn-primary" disabled={saving} onClick={() => submit('remembered')}>{t('remember.remembered')}</button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => submit('needed_help')}>{t('remember.neededHelp')}</button>
        </div>
      </section>
    </div>
  );
}
