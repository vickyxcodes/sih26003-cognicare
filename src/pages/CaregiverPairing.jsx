import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getStore, isStorageEphemeral } from '../lib/db.js';
import { normaliseCode, readStoredCode, saveCode, validateCode } from '../lib/caregiverData.js';
import { ensureIdentity, SETTINGS } from '../lib/sync.js';
import { PAIRING_CODE_LENGTH } from '../lib/privacy.js';
import { HeartMark } from '../components/icons.jsx';

/**
 * /caregiver - pairing, which is the whole of "signing in" in this app.
 *
 * There is no account, no password and no e-mail: a caregiver types the six
 * characters the patient's device generated and that is the entire relationship.
 * The code is kept in the same IndexedDB the rest of the app uses, under its own
 * settings key, so a returning caregiver goes straight to the dashboard - which
 * is what the first `<Navigate>` below does.
 *
 * The device's own code is offered as a shortcut because the common case in a
 * demo (and on a shared family tablet) is that the patient's device IS this
 * device. That code never leaves the device by being shown here; it is the same
 * code the sync layer already attaches to every uploaded row.
 */
export default function CaregiverPairing() {
  const store = useMemo(() => getStore(), []);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [stored, setStored] = useState(null);
  const [deviceCode, setDeviceCode] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    ensureIdentity(store)
      .then(() => Promise.all([readStoredCode(store), store.getSetting(SETTINGS.pairingCode, null)]))
      .then(([code, own]) => {
        if (!live) return;
        setStored(code);
        setDeviceCode(own || null);
      })
      .catch((err) => {
        console.warn('[CogniCare] could not read the stored pairing code', err);
      })
      .finally(() => {
        if (live) setChecking(false);
      });
    return () => {
      live = false;
    };
  }, [store]);

  async function remember(raw) {
    const check = validateCode(raw);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveCode(store, check.code);
      navigate('/caregiver/dashboard', { replace: true });
    } catch (err) {
      console.warn('[CogniCare] could not store the pairing code', err);
      setError('This browser would not let the app remember the code. The dashboard still opens.');
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className="screen">
        <p className="text-ink-soft">Checking whether this device is already paired…</p>
      </main>
    );
  }

  if (stored) return <Navigate to="/caregiver/dashboard" replace />;

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

      <h1 className="text-3xl font-bold">Caregiver access</h1>
      <p className="mt-3 text-ink-soft">
        Enter the pairing code from the patient’s device to see how their sessions have been going.
        There is no username and no password - the code is the only thing needed.
      </p>

      <form
        className="card mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          remember(value);
        }}
      >
        <label className="block text-lg font-semibold" htmlFor="pairing-code">
          Pairing code
        </label>
        <input
          id="pairing-code"
          name="pairing-code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck="false"
          maxLength={PAIRING_CODE_LENGTH}
          value={value}
          aria-describedby="pairing-hint"
          aria-invalid={error ? 'true' : 'false'}
          onChange={(event) => {
            setValue(normaliseCode(event.target.value));
            setError('');
          }}
          className="mt-3 min-h-tap w-full rounded-xl2 border-4 border-primary/40 bg-white px-5 text-center text-4xl font-bold uppercase tracking-widest"
        />
        <p id="pairing-hint" className="mt-2 text-base text-ink-soft">
          {PAIRING_CODE_LENGTH} characters, letters and numbers. Upper or lower case both work.
        </p>

        {error ? (
          <p role="alert" className="mt-4 rounded-xl2 bg-bad-light px-4 py-3 text-bad">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-primary mt-6 w-full" disabled={saving}>
          {saving ? 'Opening…' : 'Show the dashboard'}
        </button>
      </form>

      {deviceCode ? (
        <section className="card mt-5">
          <h2 className="text-xl font-semibold">Using the patient’s own device?</h2>
          <p className="mt-2 text-ink-soft">
            This device’s code is{' '}
            <span className="font-bold tracking-widest text-ink">{deviceCode}</span>. Its sessions are
            the ones stored here.
          </p>
          <button type="button" className="btn-secondary mt-4 w-full" onClick={() => remember(deviceCode)}>
            Use this device’s code
          </button>
        </section>
      ) : null}

      <p className="mt-6 text-base text-ink-soft">
        No name, address, contact detail or medical information is asked for, stored or shown anywhere
        in CogniCare. The pairing code is the only thing that identifies a device.
      </p>

      {isStorageEphemeral() ? (
        <p className="mt-3 text-base text-warn">
          This browser will not let the app store anything, so the code will have to be entered again
          after a reload.
        </p>
      ) : null}
    </main>
  );
}
