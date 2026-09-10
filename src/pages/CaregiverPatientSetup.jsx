import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import PatientProfile from './PatientProfile.jsx';
import { isFirebaseConfigured } from '../config/env.js';
import { currentCaregiver } from '../lib/auth.js';
import { getStore } from '../lib/db.js';
import { createFirestoreRemote } from '../lib/remote.js';
import { saveCode } from '../lib/caregiverData.js';
import { ensureIdentity } from '../lib/sync.js';
import { APP_ROLE_SETTING, APP_ROLES } from '../lib/appRole.js';

export default function CaregiverPatientSetup() {
  const store = useMemo(() => getStore(), []);
  const remote = useMemo(() => createFirestoreRemote(), []);
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    (isFirebaseConfigured() ? currentCaregiver() : Promise.resolve({ local: true }))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return <main className="screen"><p className="text-ink-soft">Checking caregiver access…</p></main>;
  if (!user) return <Navigate to="/caregiver" replace />;

  async function finishProfile() {
    const { pairingCode } = await ensureIdentity(store);
    if (isFirebaseConfigured()) await remote.linkPairingCode(pairingCode);
    await saveCode(store, pairingCode);
    await store.setSetting(APP_ROLE_SETTING, APP_ROLES.patient);
    navigate('/patient', { replace: true });
  }

  return <PatientProfile onSaved={finishProfile} />;
}
