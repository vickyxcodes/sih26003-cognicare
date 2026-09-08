import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import TrendChart from '../components/TrendChart.jsx';
import DeclineAlert from '../components/DeclineAlert.jsx';
import { HeartMark } from '../components/icons.jsx';
import { BANKS } from '../data/banks.js';
import { getStore } from '../lib/db.js';
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
  NOT_A_DIAGNOSIS,
  buildSeries,
  declineAlerts,
  describeTrend,
} from '../lib/trends.js';

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
function Row({ label, value, note }) {
  return (
    <div className="border-t border-ink-soft/15 pt-3 first:border-0 first:pt-0">
      <p className="text-base font-semibold uppercase tracking-wide text-ink-soft/80">{label}</p>
      <p className="text-lg text-ink">{value}</p>
      {note ? <p className="mt-1 text-base text-ink-soft">{note}</p> : null}
    </div>
  );
}

function Reading({ reading }) {
  return (
    <div className="mt-4">
      <p className="text-xl font-semibold text-ink">{reading.headline}</p>
      <p className="mt-2 text-ink-soft">{reading.detail}</p>
      {reading.difficulty ? <p className="mt-1 text-ink-soft">{reading.difficulty}</p> : null}
    </div>
  );
}

const PHASE = { checking: 'checking', unpaired: 'unpaired', loading: 'loading', ready: 'ready', failed: 'failed' };

function Shell({ children }) {
  return (
    <main className="screen">
      <header className="mb-6 flex items-center justify-between gap-4">
        <span className="flex items-center gap-3 text-primary">
          <HeartMark className="h-9 w-9" />
          <span className="text-lg font-semibold text-ink-soft">CogniCare</span>
        </span>
        <Link
          to="/"
          className="min-h-tap flex items-center px-4 text-base text-ink-soft/70 underline decoration-ink-soft/30"
        >
          Back to patient home
        </Link>
      </header>
      {children}
    </main>
  );
}

function countWords(series) {
  if (series.count === 0) return 'No sessions yet';
  if (series.total > series.count) return `The last ${series.count} of ${series.total} sessions`;
  return series.count === 1 ? 'One session' : `${series.count} sessions`;
}

export default function CaregiverDashboard() {
  const store = useMemo(() => getStore(), []);
  const remote = useMemo(() => createFirestoreRemote(), []);
  const [phase, setPhase] = useState(PHASE.checking);
  const [code, setCode] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  /** Frozen per load, so "Today at 9:15 am" cannot drift while the page sits open. */
  const [loadedAt, setLoadedAt] = useState(null);
  const [failure, setFailure] = useState('');

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
    readStoredCode(store)
      .then((stored) => {
        if (!live) return;
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

  if (phase === PHASE.unpaired) return <Navigate to="/caregiver" replace />;

  if (phase === PHASE.checking) {
    return (
      <Shell>
        <p className="text-ink-soft">Looking for a stored pairing code…</p>
      </Shell>
    );
  }

  const controls = (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <p className="text-lg text-ink-soft">
        Paired with code <span className="font-bold tracking-widest text-ink">{code}</span>
      </p>
      <span className="grow" />
      <button
        type="button"
        className="btn-quiet"
        onClick={() => load(code)}
        disabled={phase === PHASE.loading}
      >
        {phase === PHASE.loading ? 'Checking…' : 'Check again'}
      </button>
      <button type="button" className="btn-quiet" onClick={changeCode}>
        Change code
      </button>
    </div>
  );

  if (phase === PHASE.loading && !snapshot) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold">Caregiver dashboard</h1>
        {controls}
        <p className="mt-6 text-ink-soft">Reading the recorded sessions…</p>
      </Shell>
    );
  }

  if (phase === PHASE.failed) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold">Caregiver dashboard</h1>
        {controls}
        <section className="card mt-6">
          <h2 className="text-xl font-semibold text-bad">Nothing could be read for this code.</h2>
          <p className="mt-2 text-ink-soft">
            The dashboard shows nothing rather than guessing. Try again, and if it keeps failing,
            check that the code matches the one on the patient’s device.
          </p>
          {failure ? <p className="mt-2 text-base text-ink-soft/80">Reported reason: {failure}</p> : null}
        </section>
      </Shell>
    );
  }

  const nothingRecorded = snapshot.sessions.length === 0 && snapshot.reminderEvents.length === 0;

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Caregiver dashboard</h1>
      {controls}

      {freshness.warning ? (
        <p role="status" className="mt-5 rounded-xl2 bg-warn-light px-5 py-4 text-ink">
          {freshness.warning}
        </p>
      ) : null}

      <section className="card mt-5 space-y-3">
        <Row label="Last synced" value={freshness.syncValue} note={freshness.syncNote} />
        <Row label="Latest activity" value={freshness.activityValue} note={freshness.activityNote} />
        <Row
          label="Reading from"
          value={freshness.sourceWords || 'Nothing could be read for this code.'}
          note={
            snapshot.pending && snapshot.pending.sessions + snapshot.pending.reminderEvents > 0
              ? `${snapshot.pending.sessions} sessions and ${snapshot.pending.reminderEvents} reminders on `
                + 'this device have not reached the server yet. They are included above because they are '
                + 'this device’s own records.'
              : ''
          }
        />
      </section>

      {nothingRecorded && snapshot.source !== SOURCE.none ? (
        <section className="card mt-5">
          <h2 className="text-xl font-semibold">Nothing has been recorded for this code yet.</h2>
          <p className="mt-2 text-ink-soft">
            The charts below fill in on their own. Play a session on the patient’s device, and once that
            device has been online the sessions appear here.
          </p>
        </section>
      ) : null}

      <DeclineAlert alerts={decline.alerts} />

      {charts.map(({ bank, series, reading }) => (
        <section key={bank.domain} className="card mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold">{bank.name}</h2>
            <p className="text-base text-ink-soft">{countWords(series)}</p>
          </div>
          <div className="mt-4">
            <TrendChart series={series} caption={reading.headline} />
          </div>
          <Reading reading={reading} />
          {decline.all.find((one) => one.domain === bank.domain && one.alert) ? (
            <p className="mt-3 text-base font-semibold text-warn">
              This is the game the note at the top of the page is about.
            </p>
          ) : null}
        </section>
      ))}

      <p className="mt-5 rounded-xl2 bg-primary-light px-5 py-4 text-base text-ink-soft">
        {NOT_A_DIAGNOSIS} Each chart shows up to the last {CHART_POINTS} sessions of that game.
      </p>

      <section className="card mt-5">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <p className="mt-2 text-ink-soft">{log.summary}</p>
        {log.rows.length ? (
          <ul className="mt-4 space-y-2">
            {log.rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 border-t border-ink-soft/15 pt-2 first:border-0 first:pt-0"
              >
                <span className="text-lg font-semibold">{row.typeLabel}</span>
                <span
                  className={
                    row.tone === 'good'
                      ? 'rounded-full bg-good-light px-3 py-1 text-base text-good'
                      : 'rounded-full bg-warn-light px-3 py-1 text-base text-warn'
                  }
                >
                  {row.statusLabel}
                </span>
                <span className="grow" />
                <span className="text-base text-ink-soft">{row.when}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </Shell>
  );
}
