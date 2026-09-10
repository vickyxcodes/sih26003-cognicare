import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import TrendChart from '../components/TrendChart.jsx';
import PerformanceChart from '../components/PerformanceChart.jsx';
import DeclineAlert from '../components/DeclineAlert.jsx';
import { HeartMark } from '../components/icons.jsx';
import { BANKS } from '../data/banks.js';
import LanguageSelector from '../components/LanguageSelector.jsx';
import { useLanguage } from '../components/LanguageContext.jsx';
import { getStore } from '../lib/db.js';
import { currentCaregiver, signOutCaregiver } from '../lib/auth.js';
import { isFirebaseConfigured } from '../config/env.js';
import { createFirestoreRemote } from '../lib/remote.js';
import {
  LOG_LIMIT,
  SOURCE,
  buildReminderLog,
  describeFreshness,
  forgetCode,
  loadCaregiverData,
  readStoredCode,
} from '../lib/caregiverData.js';
import {
  CHART_POINTS,
  buildSeries,
  declineAlerts,
  describeTrend,
} from '../lib/trends.js';
import {
  buildDomainMetrics,
  buildOverallMetric,
  buildRecentActivity,
} from '../lib/caregiverMetrics.js';
import {
  dashboardText,
  localizeBank,
  localizedReading,
  localizedTrendLabel,
} from '../lib/i18n.js';

/**
 * /caregiver/dashboard - the read-only side of the app.
 *
 * This screen reads and never writes: the only thing it can change is the
 * pairing code stored on this device. Where the rows come from, which rows are
 * allowed on screen, and what the words under each chart say are all decided in
 * `caregiverData.js` and `trends.js`, which is why those parts are covered by
 * `node --test` rather than by looking at the page. What is left here is layout,
 * the four states the screen can be in (checking, loading, ready, failed) and
 * the Chart.js component's lifetime.
 *
 * It composes the Firestore remote itself, exactly as `main.jsx` does for the
 * sync manager, so the logic module underneath stays free of Firebase.
 */
const PHASE = { checking: 'checking', unpaired: 'unpaired', loading: 'loading', ready: 'ready', failed: 'failed' };

function Shell({ children }) {
  const { language } = useLanguage();
  const d = (key, values) => dashboardText(language, key, values);
  return (
    <main className="dashboard-shell">
      <LanguageSelector />
      <header className="dashboard-nav">
        <span className="flex items-center gap-3 text-primary">
          <HeartMark className="h-9 w-9" />
          <span className="text-lg font-bold text-ink">CogniCare</span>
        </span>
        <Link
          to="/patient"
          className="min-h-tap flex items-center px-4 text-base text-ink-soft/70 underline decoration-ink-soft/30"
        >
          {d('backHome')}
        </Link>
      </header>
      {children}
    </main>
  );
}

function maskedCode(code) {
  return code ? `••••${code.slice(-2)}` : 'paired device';
}

function scoreWords(value) {
  return value === null ? '—' : `${value}%`;
}

function activityTitle(item, language) {
  if (item.kind === 'session') {
    const bank = BANKS.find((candidate) => candidate.domain === item.source.domain);
    return bank ? localizeBank(bank, language).name : item.title;
  }
  const labels = language === 'as'
    ? { medicine: 'দৰৱৰ সোঁৱৰণী', hydration: 'পানীৰ সোঁৱৰণী', appointment: 'সাক্ষাতৰ সোঁৱৰণী' }
    : { medicine: 'Medicine reminder', hydration: 'Water reminder', appointment: 'Appointment reminder' };
  return labels[item.source.type] || item.title;
}

function activityDetail(item, language) {
  if (item.kind === 'session') {
    return language === 'as' ? `${item.source.score}% স্ক’ৰ` : `${item.source.score}% score`;
  }
  return item.source.status === 'dismissed'
    ? dashboardText(language, 'statusCompleted')
    : dashboardText(language, 'statusMissed');
}

function StatusPill({ label, tone = 'neutral' }) {
  return <span className={`dashboard-status dashboard-status-${tone}`}>{label}</span>;
}

function KpiCard({ title, value, trend, trendDirection, note, detail }) {
  return (
    <article className="dashboard-kpi">
      <p className="dashboard-kpi-title">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="dashboard-kpi-value">{value}</p>
        {trend ? <StatusPill label={trend} tone={trendDirection === 'up' ? 'good' : trendDirection === 'down' ? 'warn' : 'neutral'} /> : null}
      </div>
      <p className="dashboard-kpi-note">{note}</p>
      {detail ? <p className="dashboard-kpi-detail">{detail}</p> : null}
    </article>
  );
}

function EmptyState({ title, children }) {
  return (
    <div className="dashboard-empty-state">
      <p className="font-semibold text-ink">{title}</p>
      {children ? <p className="mt-1 text-ink-soft">{children}</p> : null}
    </div>
  );
}

export default function CaregiverDashboard() {
  const { language } = useLanguage();
  const d = (key, values) => dashboardText(language, key, values);
  const store = useMemo(() => getStore(), []);
  const remote = useMemo(() => createFirestoreRemote(), []);
  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASE.checking);
  const [code, setCode] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  /** Frozen per load, so "Today at 9:15 am" cannot drift while the page sits open. */
  const [loadedAt, setLoadedAt] = useState(null);
  const [failure, setFailure] = useState('');
  const [online, setOnline] = useState(() => (
    typeof navigator === 'undefined' ? true : navigator.onLine !== false
  ));

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const load = useCallback(
    async (pairingCode) => {
      setPhase(PHASE.loading);
      setFailure('');
      try {
        const next = await loadCaregiverData({ store, remote, code: pairingCode });
        setSnapshot(next);
        setLoadedAt(Date.now());
        setPhase(PHASE.ready);
      } catch (error) {
        console.warn('[CogniCare] the dashboard could not read anything', error);
        setFailure(String((error && error.message) || error));
        setPhase(PHASE.failed);
      }
    },
    [store, remote]
  );

  useEffect(() => {
    let live = true;
    Promise.all([
      readStoredCode(store),
      isFirebaseConfigured() ? currentCaregiver() : Promise.resolve(null),
    ])
      .then(([stored, caregiver]) => {
        if (!live) return;
        if (isFirebaseConfigured() && !caregiver) {
          setPhase(PHASE.unpaired);
          return;
        }
        if (!stored) {
          setPhase(PHASE.unpaired);
          return;
        }
        setCode(stored);
        load(stored);
      })
      .catch(() => {
        if (live) setPhase(PHASE.unpaired);
      });
    return () => {
      live = false;
    };
  }, [store, load]);

  async function changeCode() {
    await forgetCode(store);
    setCode(null);
    setPhase(PHASE.unpaired);
  }

  async function signOut() {
    await signOutCaregiver();
    navigate('/caregiver', { replace: true });
  }

  const now = loadedAt || Date.now();

  /** Memoised so the chart is rebuilt when the data changes and not before. */
  const charts = useMemo(
    () => BANKS.map((bank) => {
      const series = buildSeries(snapshot ? snapshot.sessions : [], bank.domain, { now });
      return { bank, series, reading: describeTrend(series, { label: bank.name, now }) };
    }),
    [snapshot, now]
  );

  /* Judged from the very same series the charts draw, so the alert can never
   * disagree with the line above it: same domain filtering, same ordering, same
   * dropped rows. */
  const decline = useMemo(
    () => declineAlerts(charts.map(({ bank, series }) => ({ series, label: bank.name }))),
    [charts]
  );

  const log = useMemo(
    () => buildReminderLog(snapshot ? snapshot.reminderEvents : [], { limit: LOG_LIMIT, now }),
    [snapshot, now]
  );

  const freshness = useMemo(
    () => (snapshot ? describeFreshness(snapshot, now) : null),
    [snapshot, now]
  );

  const metrics = useMemo(
    () => buildDomainMetrics(snapshot ? snapshot.sessions : [], BANKS, { now }),
    [snapshot, now]
  );
  const overall = useMemo(() => buildOverallMetric(metrics), [metrics]);
  const activity = useMemo(
    () => buildRecentActivity({
      sessions: snapshot ? snapshot.sessions : [],
      reminderRows: snapshot ? snapshot.reminderEvents : [],
      banks: BANKS,
      now,
    }),
    [snapshot, now]
  );

  const syncStatus = phase === PHASE.loading
    ? { label: d('syncing'), tone: 'neutral' }
    : phase === PHASE.failed || !online || snapshot?.fromCache || snapshot?.error || snapshot?.source === SOURCE.local
      ? { label: d('offline'), tone: 'warn' }
      : { label: d('online'), tone: 'good' };

  const displayMetrics = useMemo(
    () => metrics.map((metric) => ({
      ...metric,
      bank: localizeBank(metric.bank, language),
      trendLabel: localizedTrendLabel(metric.trend, language),
      reading: localizedReading(metric, language),
    })),
    [metrics, language]
  );

  if (phase === PHASE.unpaired) return <Navigate to="/caregiver" replace />;

  if (phase === PHASE.checking) {
    return (
      <Shell>
        <p className="text-ink-soft">{d('checkingCode')}</p>
      </Shell>
    );
  }

  const controls = (
    <div className="dashboard-controls">
      <button
        type="button"
        className="btn-quiet"
        onClick={() => load(code)}
        disabled={phase === PHASE.loading}
      >
        {phase === PHASE.loading ? d('checking') : d('checkAgain')}
      </button>
      <button type="button" className="btn-quiet" onClick={changeCode}>
        {d('changeCode')}
      </button>
      {isFirebaseConfigured() ? <button type="button" className="btn-quiet" onClick={signOut}>Sign out</button> : null}
    </div>
  );

  if (phase === PHASE.loading && !snapshot) {
    return (
      <Shell>
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">{d('view')}</p>
          <h1>{d('title')}</h1>
          <p>{d('reading')}</p>
          <div className="dashboard-context"><StatusPill label={d('syncing')} /> <span>{d('paired')} {maskedCode(code)}</span></div>
        </section>
        {controls}
      </Shell>
    );
  }

  if (phase === PHASE.failed) {
    return (
      <Shell>
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">{d('view')}</p>
          <h1>{d('title')}</h1>
          <p>{d('refreshFailed')}</p>
          <div className="dashboard-context"><StatusPill label={d('offline')} tone="warn" /> <span>{d('paired')} {maskedCode(code)}</span></div>
        </section>
        {controls}
        <section className="card dashboard-panel mt-6">
          <h2 className="text-xl font-semibold text-ink">{d('noCode')}</h2>
          <p className="mt-2 text-ink-soft">
            {d('noCodeDetail')}
          </p>
          {failure ? <p className="mt-2 text-base text-ink-soft/80">{d('reportedReason')}: {failure}</p> : null}
        </section>
      </Shell>
    );
  }

  const nothingRecorded = snapshot.sessions.length === 0 && snapshot.reminderEvents.length === 0;
  const activeMetrics = displayMetrics.filter((metric) => metric.sessions > 0);

  return (
    <Shell>
      <section className="dashboard-hero">
        <p className="dashboard-eyebrow">{d('view')}</p>
        <h1>{d('title')}</h1>
        <p>{d('summary')}</p>
        <div className="dashboard-context">
          <span>{d('paired')} <strong>{maskedCode(code)}</strong></span>
          <StatusPill label={syncStatus.label} tone={syncStatus.tone} />
          <span>{d('lastSynced')}: <strong>{freshness.syncValue}</strong></span>
        </div>
      </section>
      <div className="dashboard-actions">{controls}</div>

      {freshness.warning ? (
        <p role="status" className="dashboard-notice dashboard-notice-warn">
          {freshness.warning}
        </p>
      ) : null}

      <section className="dashboard-kpis" aria-label={d('summaryLabel')}>
        <KpiCard
          title={d('recentPerformance')}
          value={scoreWords(overall.recent)}
          trend={localizedTrendLabel(overall.trend, language)}
          trendDirection={overall.trend}
          note={overall.sessions ? d('recentAverage') : d('noSessions')}
          detail={overall.sessions ? d('session', { count: overall.sessions, suffix: overall.sessions === 1 ? '' : 's' }) : d('playForTrend')}
        />
        {displayMetrics.map((metric) => (
          <KpiCard
            key={metric.bank.domain}
            title={metric.bank.name}
            value={scoreWords(metric.latest)}
            trend={metric.trendLabel}
            trendDirection={metric.trend}
            note={metric.sessions ? d('average', { value: metric.average }) : d('noActivity')}
            detail={metric.sessions ? `${d('session', { count: metric.sessions, suffix: metric.sessions === 1 ? '' : 's' })} · ${d('best', { value: metric.best })}` : d('afterPlayed')}
          />
        ))}
        <KpiCard
          title={d('recentActivity')}
          value={String(overall.sessions)}
          note={d('sessionsAvailable')}
          detail={freshness.activityValue}
        />
        <KpiCard
          title={d('reminderCompletion')}
          value={log.completionRate === null ? '—' : `${log.completionRate}%`}
          note={log.total ? d('completionNote') : d('noReminder')}
          detail={log.total ? d('completedMissed', { done: log.totalDone, missed: log.totalMissed }) : d('reminderWillAppear')}
        />
      </section>

      {nothingRecorded && snapshot.source !== SOURCE.none ? (
        <section className="dashboard-panel">
          <EmptyState title={d('noCognitive')}>
            {d('trendsPrompt')}
          </EmptyState>
        </section>
      ) : null}

      <DeclineAlert alerts={decline.alerts} />

      <section className="dashboard-panel dashboard-performance">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{d('performanceOverTime')}</p>
            <h2>{d('cognitivePerformance')}</h2>
          </div>
          <p>{d('lineHelp')}</p>
        </div>
        <PerformanceChart readings={displayMetrics} language={language} />
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{d('atAGlance')}</p>
            <h2>{d('comparison')}</h2>
          </div>
          <p>{d('averageByActivity')}</p>
        </div>
        {activeMetrics.length ? (
          <div className="dashboard-comparison">
            {activeMetrics.map((metric) => (
              <div key={metric.bank.domain} className="dashboard-comparison-row">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-ink">{metric.bank.name}</span>
                  <strong>{metric.average}%</strong>
                </div>
                <div className="dashboard-bar-track" aria-hidden="true">
                  <span style={{ width: `${metric.average}%` }} className="dashboard-bar" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={d('noCompare')}>{d('playForActivity')}</EmptyState>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{d('plainReading')}</p>
            <h2>{d('insights')}</h2>
          </div>
          <p>{d('readingsOnly')}</p>
        </div>
        {activeMetrics.length ? (
          <div className="dashboard-insights">
            {activeMetrics.map((metric) => (
              <article key={metric.bank.domain} className="dashboard-insight">
                <div className="flex items-center justify-between gap-3">
                  <h3>{metric.bank.name}</h3>
                  <StatusPill label={metric.trendLabel} tone={metric.trend === 'up' ? 'good' : metric.trend === 'down' ? 'warn' : 'neutral'} />
                </div>
                <p className="mt-2 font-semibold text-ink">{metric.reading.headline}</p>
                <p className="mt-1 text-sm text-ink-soft">{metric.reading.detail}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title={d('noTrend')}>{d('trendNeedHistory')}</EmptyState>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{d('reminderActivity')}</p>
            <h2>{d('reminders')}</h2>
          </div>
          <p>{log.total ? d('events', { count: log.total, suffix: log.total === 1 ? '' : 's' }) : d('noReminder')}</p>
        </div>
        {log.total ? (
          <>
            <div className="dashboard-reminder-stats">
              <div><span>{d('completed')}</span><strong>{log.totalDone}</strong></div>
              <div><span>{d('missed')}</span><strong>{log.totalMissed}</strong></div>
              <div><span>{d('completion')}</span><strong>{log.completionRate}%</strong></div>
            </div>
            <p className="mt-4 text-sm text-ink-soft">{d('completionWarning')}</p>
          </>
        ) : (
          <EmptyState title={d('noReminder')}>{d('noReminderDetail')}</EmptyState>
        )}
        {log.rows.length ? (
          <div className="dashboard-table-wrap mt-5">
            <table className="dashboard-table">
              <thead><tr><th>{d('reminder')}</th><th>{d('status')}</th><th>{d('when')}</th></tr></thead>
              <tbody>
                {log.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.typeLabel}</td>
                    <td><StatusPill label={row.status === 'dismissed' ? d('statusCompleted') : d('statusMissed')} tone={row.tone} /></td>
                    <td>{row.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{d('latestRecords')}</p>
            <h2>{d('recentActivity')}</h2>
          </div>
          <p>{d('knownRecords')}</p>
        </div>
        {activity.length ? (
          <ol className="dashboard-timeline">
          {activity.map((item) => (
              <li key={item.id}>
                <span className={`dashboard-timeline-dot ${item.kind === 'reminder' ? 'dashboard-timeline-dot-reminder' : ''}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{activityTitle(item, language)}</p>
                  <p className="text-sm text-ink-soft">{activityDetail(item, language)}</p>
                </div>
                <time className="text-sm text-ink-soft">{item.when}</time>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState title={d('noRecent')} />
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">{d('explore')}</p>
            <h2>{d('detail')}</h2>
          </div>
          <p>{d('dynamic')}</p>
        </div>
        <div className="dashboard-domain-grid">
          {displayMetrics.map((metric) => (
            <article key={metric.bank.domain} className="dashboard-domain-card">
              <div className="flex items-start justify-between gap-3">
                <div><h3>{metric.bank.name}</h3><p className="mt-1 text-sm text-ink-soft">{metric.bank.benefit}</p></div>
                <StatusPill label={metric.trendLabel} tone={metric.trend === 'up' ? 'good' : metric.trend === 'down' ? 'warn' : 'neutral'} />
              </div>
              <dl className="dashboard-domain-stats">
                <div><dt>{d('latest')}</dt><dd>{scoreWords(metric.latest)}</dd></div>
                <div><dt>{d('averageLabel')}</dt><dd>{scoreWords(metric.average)}</dd></div>
                <div><dt>{d('bestRecent')}</dt><dd>{scoreWords(metric.best)}</dd></div>
                <div><dt>{d('sessionsLabel')}</dt><dd>{metric.sessions}</dd></div>
              </dl>
              <p className="mt-4 text-sm text-ink-soft">{d('lastPlayed')}: {metric.lastPlayed || d('notPlayed')}</p>
              {metric.sessions ? <TrendChart series={metric.series} caption={metric.reading.headline} language={language} height={170} /> : null}
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-disclaimer">{d('disclaimer')} {language === 'as' ? 'প্ৰতিটো কাৰ্যৰ চাৰ্টত শেহতীয়া' : 'Each activity chart shows up to the last'} {CHART_POINTS} {language === 'as' ? 'টা ছেছন দেখা যায়।' : 'sessions.'}</div>
    </Shell>
  );
}
