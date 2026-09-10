import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { HeartMark } from '../components/icons.jsx';
import { isFirebaseConfigured } from '../config/env.js';
import { currentCaregiver, createCaregiverAccount, signInCaregiver, signOutCaregiver } from '../lib/auth.js';
import { getStore, isStorageEphemeral } from '../lib/db.js';
import { createFirestoreRemote } from '../lib/remote.js';
import { normaliseCode, readStoredCode, saveCode, validateCode } from '../lib/caregiverData.js';
import { ensureIdentity, SETTINGS } from '../lib/sync.js';
import { PAIRING_CODE_LENGTH } from '../lib/privacy.js';
import { APP_ROLE_SETTING, APP_ROLES } from '../lib/appRole.js';

function authMessage(error) {
  const code = error?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'That email or password is not correct.';
  if (code.includes('email-already-in-use')) return 'An account already uses that email. Try signing in.';
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  return String(error?.message || error || 'Could not complete account access.');
}

export default function CaregiverPairing() {
  const store = useMemo(() => getStore(), []);
  const remote = useMemo(() => createFirestoreRemote(), []);
  const navigate = useNavigate();
  const configured = isFirebaseConfigured();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [stored, setStored] = useState(null);
  const [deviceCode, setDeviceCode] = useState(null);
  const [value, setValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([
      configured ? currentCaregiver() : Promise.resolve(null),
      ensureIdentity(store).then(() => Promise.all([readStoredCode(store), store.getSetting(SETTINGS.pairingCode, null)])),
    ]).then(async ([signedIn, [code, own]]) => {
      if (!live) return;
      setUser(signedIn);
      setStored(code);
      setDeviceCode(own || null);
      if (signedIn && code) {
        try {
          await remote.linkPairingCode(code);
          if (live) navigate('/caregiver/dashboard', { replace: true });
        } catch (linkError) {
          console.warn('[CogniCare] saved pairing code needs to be linked again', linkError);
        }
      } else if (signedIn && live) {
        navigate('/caregiver/patient', { replace: true });
      }
    }).catch((loadError) => {
      console.warn('[CogniCare] could not prepare caregiver access', loadError);
    }).finally(() => {
      if (live) setChecking(false);
    });
    return () => { live = false; };
  }, [configured, navigate, remote, store]);

  async function authenticate(event) {
    event.preventDefault();
    setAuthError('');
    if (!email.trim() || password.length < 6) {
      setAuthError('Enter an email and a password with at least 6 characters.');
      return;
    }
    setAuthBusy(true);
    try {
      const nextUser = authMode === 'signup'
        ? await createCaregiverAccount(email.trim(), password)
        : await signInCaregiver(email.trim(), password);
      setUser(nextUser);
      setPassword('');
      await store.setSetting(APP_ROLE_SETTING, APP_ROLES.caregiver);
      navigate('/caregiver/patient', { replace: true });
    } catch (authFailure) {
      setAuthError(authMessage(authFailure));
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    await signOutCaregiver();
    setUser(null);
  }

  async function remember(raw) {
    const check = validateCode(raw);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    if (configured && !user) {
      setError('Sign in or create a caregiver account before linking a device.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (configured) await remote.linkPairingCode(check.code);
      await saveCode(store, check.code);
      setStored(check.code);
      navigate('/caregiver/dashboard', { replace: true });
    } catch (linkError) {
      console.warn('[CogniCare] could not link the pairing code', linkError);
      setError(String(linkError?.message || 'This pairing code could not be linked. Check it and try again.'));
    } finally {
      setSaving(false);
    }
  }

  if (checking) return <main className="screen"><p className="text-ink-soft">Checking caregiver access…</p></main>;
  if (stored && !configured) return <Navigate to="/caregiver/dashboard" replace />;
  return (
    <main className="screen">
      <header className="mb-6 flex items-center justify-between gap-4">
        <span className="flex items-center gap-3 text-primary"><HeartMark className="h-9 w-9" /><span className="text-lg font-semibold text-ink-soft">CogniCare</span></span>
        <Link to="/patient" className="min-h-tap flex items-center px-4 text-base text-ink-soft/70 underline decoration-ink-soft/30">Back to patient home</Link>
      </header>

      <h1 className="text-3xl font-bold">Caregiver access</h1>
      <p className="mt-3 text-ink-soft">Create an account or sign in, then link the pairing code shown on the patient’s device.</p>

      {configured ? (
        user ? (
          <section className="card mt-6"><p className="text-lg text-ink-soft">Signed in as <strong className="text-ink">{user.email}</strong></p><button type="button" className="btn-quiet mt-4" onClick={signOut}>Sign out</button></section>
        ) : (
          <form className="card mt-6" onSubmit={authenticate}>
            <h2 className="text-xl font-semibold">{authMode === 'signup' ? 'Create caregiver account' : 'Sign in to caregiver account'}</h2>
            <label className="mt-4 block text-lg font-semibold" htmlFor="caregiver-email">Email</label>
            <input id="caregiver-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="profile-input" />
            <label className="mt-4 block text-lg font-semibold" htmlFor="caregiver-password">Password</label>
            <input id="caregiver-password" type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="profile-input" />
            {authError ? <p role="alert" className="mt-3 text-warn">{authError}</p> : null}
            <button type="submit" className="btn-primary mt-5 w-full" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
            <button type="button" className="btn-quiet mt-3 w-full" onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}>{authMode === 'signup' ? 'I already have an account' : 'Create a new account'}</button>
          </form>
        )
      ) : (
        <section className="card mt-6">
          <p className="text-ink-soft">Firebase is not configured, so caregiver accounts are unavailable. You can still add the patient information locally on this device.</p>
          <Link to="/caregiver/patient" className="btn-secondary mt-4 w-full">Add patient information</Link>
        </section>
      )}

      <form className="card mt-5" onSubmit={(event) => { event.preventDefault(); remember(value); }}>
        <label className="block text-lg font-semibold" htmlFor="pairing-code">Pairing code</label>
        <input id="pairing-code" name="pairing-code" type="text" inputMode="text" autoComplete="off" autoCapitalize="characters" spellCheck="false" maxLength={PAIRING_CODE_LENGTH} value={value} onChange={(event) => { setValue(normaliseCode(event.target.value)); setError(''); }} className="mt-3 min-h-tap w-full rounded-xl2 border-4 border-primary/40 bg-white px-5 text-center text-4xl font-bold uppercase tracking-widest" />
        <p className="mt-2 text-base text-ink-soft">{PAIRING_CODE_LENGTH} characters, letters and numbers.</p>
        {error ? <p role="alert" className="mt-4 rounded-xl2 bg-bad-light px-4 py-3 text-bad">{error}</p> : null}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={saving || (configured && !user)}>{saving ? 'Linking…' : 'Link device and show dashboard'}</button>
      </form>

      {stored && user ? <button type="button" className="btn-secondary mt-5 w-full" onClick={() => remember(stored)} disabled={saving}>Use the saved pairing code {stored}</button> : null}

      {deviceCode ? <section className="card mt-5"><h2 className="text-xl font-semibold">Using the patient’s own device?</h2><p className="mt-2 text-ink-soft">This device’s code is <span className="font-bold tracking-widest text-ink">{deviceCode}</span>.</p><button type="button" className="btn-secondary mt-4 w-full" onClick={() => remember(deviceCode)} disabled={saving || (configured && !user)}>Use this device’s code</button></section> : null}
      <p className="mt-6 text-base text-ink-soft">The caregiver account protects dashboard access. Patient profile and emergency contact details remain local to the patient’s device and are not uploaded.</p>
      {isStorageEphemeral() ? <p className="mt-3 text-base text-warn">This browser cannot keep local settings, so the pairing code will have to be entered again after a reload.</p> : null}
    </main>
  );
}
