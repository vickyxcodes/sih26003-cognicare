import { useCallback, useEffect, useMemo, useState } from 'react';
import HomeButton from '../components/HomeButton.jsx';
import { useLanguage } from '../components/LanguageContext.jsx';
import { getStore } from '../lib/db.js';
import { MANUAL_REMINDER_TYPES } from '../lib/manualReminder.js';

function localInputValue(stamp) {
  const date = new Date(stamp);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ManualReminders() {
  const store = useMemo(() => getStore(), []);
  const { language, t } = useLanguage();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [reminderAt, setReminderAt] = useState(() => localInputValue(Date.now() + 60 * 60 * 1000));
  const [type, setType] = useState('custom');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => setItems(await store.manualReminders()), [store]);
  useEffect(() => {
    refresh().catch(() => setError(t('manual.formError')));
    const timer = setInterval(() => refresh().catch(() => {}), 1000);
    return () => clearInterval(timer);
  }, [refresh, t]);

  const reset = () => {
    setEditingId(null); setTitle(''); setNote(''); setType('custom');
    setReminderAt(localInputValue(Date.now() + 60 * 60 * 1000)); setError('');
  };
  const submit = async (event) => {
    event.preventDefault();
    setError(''); setSaving(true);
    try {
      const input = { title, reminderAt: new Date(reminderAt).getTime(), type, note };
      if (editingId === null) await store.saveManualReminder(input);
      else await store.updateManualReminder(editingId, input);
      reset(); await refresh();
    } catch {
      setError(t('manual.formError'));
    } finally {
      setSaving(false);
    }
  };
  const date = (stamp) => new Intl.DateTimeFormat(language === 'as' ? 'as-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(stamp));
  return (
    <main className="screen manual-screen">
      <header className="flex items-center justify-between gap-4">
        <HomeButton />
        <h1 className="text-3xl font-bold text-ink">{t('manual.title')}</h1>
        <span className="w-20" aria-hidden="true" />
      </header>

      <section className="card mt-8" aria-labelledby="manual-form-title">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="manual-form-title" className="text-2xl font-bold text-ink">{editingId === null ? t('manual.add') : t('manual.edit')}</h2>{editingId !== null ? <button type="button" className="btn-quiet" onClick={reset}>{t('manual.cancel')}</button> : null}</div>
        <p className="mt-3 text-lg text-ink-soft">{t('manual.intro')}</p>
        <form onSubmit={submit} className="mt-6 grid gap-5">
          <label className="form-label" htmlFor="manual-title">{t('manual.titleLabel')}<input id="manual-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('manual.titlePlaceholder')} className="profile-input" maxLength="120" required /></label>
          <label className="form-label" htmlFor="manual-time">{t('manual.timeLabel')}<input id="manual-time" type="datetime-local" value={reminderAt} onChange={(event) => setReminderAt(event.target.value)} className="profile-input" required /></label>
          <label className="form-label" htmlFor="manual-type">{t('manual.typeLabel')}<select id="manual-type" value={type} onChange={(event) => setType(event.target.value)} className="remember-select mt-2">{MANUAL_REMINDER_TYPES.map((value) => <option key={value} value={value}>{t(`manual.type.${value}`)}</option>)}</select></label>
          <label className="form-label" htmlFor="manual-note">{t('manual.noteLabel')}<textarea id="manual-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('manual.notePlaceholder')} className="remember-textarea mt-2" rows="3" maxLength="120" /></label>
          {error ? <p role="alert" className="text-lg font-semibold text-warn">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={saving}>{saving ? t('manual.saving') : t('manual.save')}</button>
        </form>
      </section>

      <section className="card mt-6" aria-labelledby="manual-list-title">
        <h2 id="manual-list-title" className="text-2xl font-bold text-ink">{t('manual.title')}</h2>
        {items.length === 0 ? <p className="mt-4 text-lg text-ink-soft">{t('manual.noItems')}</p> : <ul className="remember-list mt-4">{items.map((item) => (
          <li key={item.id} className="remember-list-item">
            <div className="min-w-0 flex-1"><p className="text-xl font-bold text-ink break-words">{item.title}</p><p className="mt-1 text-base text-ink-soft">{t(`manual.type.${item.type}`)} · {date(item.reminderAt)}{item.note ? ` · ${item.note}` : ''}</p></div>
            <span className={`remember-status ${item.status === 'completed' ? 'remember-status-completed' : item.reminderAt <= Date.now() ? 'remember-status-due' : 'remember-status-pending'}`}>{item.status === 'completed' ? t('manual.completed') : item.reminderAt <= Date.now() ? t('manual.due') : t('manual.scheduled')}</span>
            {item.status !== 'completed' ? <button type="button" className="btn-quiet remember-small-button" onClick={async () => { await store.completeManualReminder(item.id); await refresh(); }}>{t('manual.done')}</button> : null}
            <button type="button" className="btn-quiet remember-small-button" onClick={() => { setEditingId(item.id); setTitle(item.title); setReminderAt(localInputValue(item.reminderAt)); setType(item.type); setNote(item.note || ''); setError(''); }}>{t('manual.edit')}</button>
            <button type="button" className="btn-quiet remember-small-button" onClick={async () => { await store.deleteManualReminder(item.id); await refresh(); }}>{t('manual.delete')}</button>
          </li>
        ))}</ul>}
      </section>
    </main>
  );
}
