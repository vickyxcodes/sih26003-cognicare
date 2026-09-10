import { useCallback, useEffect, useMemo, useState } from 'react';
import HomeButton from '../components/HomeButton.jsx';
import { useLanguage } from '../components/LanguageContext.jsx';
import { getStore } from '../lib/db.js';
import { REMEMBER_THIS_DELAYS, DEFAULT_REMEMBER_DELAY_MS } from '../lib/rememberThis.js';

const statusClass = { pending: 'remember-status-pending', due: 'remember-status-due', completed: 'remember-status-completed', dismissed: 'remember-status-dismissed' };

export default function RememberThis() {
  const store = useMemo(() => getStore(), []);
  const { language, t } = useLanguage();
  const [items, setItems] = useState([]);
  const [fact, setFact] = useState('');
  const [delayMs, setDelayMs] = useState(DEFAULT_REMEMBER_DELAY_MS);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => setItems(await store.refreshRememberThis()), [store]);
  useEffect(() => {
    refresh().catch(() => setError(t('remember.formError')));
    const timer = setInterval(() => refresh().catch(() => {}), 1000);
    return () => clearInterval(timer);
  }, [refresh, t]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await store.saveRememberThis({ fact, delayMs });
      setFact('');
      setDelayMs(DEFAULT_REMEMBER_DELAY_MS);
      await refresh();
    } catch {
      setError(t('remember.formError'));
    } finally {
      setSaving(false);
    }
  };

  const date = (stamp) => new Intl.DateTimeFormat(language === 'as' ? 'as-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(stamp));
  const status = (value) => t(`remember.${value}`);
  return (
    <main className="screen remember-screen">
      <header className="flex items-center justify-between gap-4">
        <HomeButton />
        <h1 className="text-3xl font-bold text-ink">{t('remember.title')}</h1>
        <span className="w-20" aria-hidden="true" />
      </header>

      <section className="card mt-8" aria-labelledby="remember-title">
        <p className="home-eyebrow">{t('remember.title')}</p>
        <h2 id="remember-title" className="mt-2 text-3xl font-bold text-ink">{t('remember.question')}</h2>
        <p className="mt-3 text-lg text-ink-soft">{t('remember.intro')}</p>
        <form onSubmit={submit} className="mt-6">
          <textarea value={fact} onChange={(event) => setFact(event.target.value)} placeholder={t('remember.placeholder')} aria-label={t('remember.question')} className="remember-textarea" rows="4" maxLength="120" required />
          <label htmlFor="remember-delay" className="mt-6 block text-xl font-bold text-ink">{t('remember.chooseDelay')}</label>
          <select id="remember-delay" value={delayMs} onChange={(event) => setDelayMs(Number(event.target.value))} className="remember-select mt-3">
            {REMEMBER_THIS_DELAYS.map((option) => <option key={option.id} value={option.ms}>{t(`remember.${option.labelKey}`)}</option>)}
          </select>
          {error ? <p role="alert" className="mt-3 text-lg font-semibold text-warn">{error}</p> : null}
          <button type="submit" className="btn-primary mt-6 w-full" disabled={saving}>{saving ? t('remember.saving') : t('remember.save')}</button>
        </form>
      </section>

      <section className="card mt-6" aria-labelledby="remember-history-title">
        <h2 id="remember-history-title" className="text-2xl font-bold text-ink">{t('remember.history')}</h2>
        {items.length === 0 ? <p className="mt-4 text-lg text-ink-soft">{t('remember.noItems')}</p> : (
          <ul className="remember-list mt-4">
            {items.map((item) => (
              <li key={item.id} className="remember-list-item">
                <div className="min-w-0 flex-1"><p className="text-xl font-bold text-ink break-words">{item.fact}</p><p className="mt-1 text-base text-ink-soft">{date(item.dueAt)}</p></div>
                <span className={`remember-status ${statusClass[item.status] || ''}`}>{status(item.status)}</span>
                {(item.status === 'pending' || item.status === 'due') ? <button type="button" className="btn-quiet remember-small-button" onClick={async () => { await store.dismissRememberThis(item.id); await refresh(); }}>{t('remember.dismiss')}</button> : null}
                <button type="button" className="btn-quiet remember-small-button" aria-label={t('remember.deleteAria')} onClick={async () => { await store.deleteRememberThis(item.id); await refresh(); }}>{t('remember.delete')}</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
