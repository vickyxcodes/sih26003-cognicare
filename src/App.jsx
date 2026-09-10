import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PatientHome from './pages/PatientHome.jsx';
import Play from './pages/Play.jsx';
import CaregiverPairing from './pages/CaregiverPairing.jsx';
import CaregiverDashboard from './pages/CaregiverDashboard.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import { LanguageProvider } from './components/LanguageContext.jsx';
import ReminderOverlay from './components/ReminderOverlay.jsx';
import RememberThisOverlay from './components/RememberThisOverlay.jsx';
import ManualReminderOverlay from './components/ManualReminderOverlay.jsx';
import PatientProfile from './pages/PatientProfile.jsx';
import AboutMePlay from './pages/AboutMePlay.jsx';
import { getStore } from './lib/db.js';
import RoleChooser from './pages/RoleChooser.jsx';
import CaregiverPatientSetup from './pages/CaregiverPatientSetup.jsx';
import RememberThis from './pages/RememberThis.jsx';
import ManualReminders from './pages/ManualReminders.jsx';
import { APP_ROLE_SETTING, APP_ROLES } from './lib/appRole.js';

/**
 * Patient-mode shell.
 *
 * One `<Play />` serves every game domain; the route it was reached by is what
 * tells it which bank to open (see `path` on each bank in `src/data/banks.js`).
 * A patient never has to use these routes - "Play again" rotates through the
 * domains by itself - but a caregiver setting up a session can open one directly.
 *
 * The reminder overlay is mounted here rather than on a screen, for two reasons:
 * a reminder must be able to appear whether the patient is on the home screen or
 * mid-game, and it must never appear over the caregiver screens - which sit
 * outside this layout.
 *
 * While a reminder is on screen the game underneath is told to hold its timers
 * (`reminderOnScreen`). Without that, a study picture could be hidden behind the
 * card, advance on its own, and the patient would be asked about a picture they
 * never saw - a wrong answer the caregiver's chart would then have to explain.
 */
function PatientLayout() {
  return <PatientLayoutContent />;
}

function PatientLayoutContent() {
  const [systemReminderOnScreen, setReminderOnScreen] = useState(false);
  const [rememberOnScreen, setRememberOnScreen] = useState(false);
  const [manualReminderOnScreen, setManualReminderOnScreen] = useState(false);
  const reminderOnScreen = systemReminderOnScreen || rememberOnScreen || manualReminderOnScreen;
  return (
    <div className="app-shell min-h-screen">
      <LanguageSelector />
      <Outlet context={{ reminderOnScreen }} />
      <ReminderOverlay onShowing={setReminderOnScreen} />
      <RememberThisOverlay onShowing={setRememberOnScreen} blocked={systemReminderOnScreen} />
      <ManualReminderOverlay onShowing={setManualReminderOnScreen} blocked={systemReminderOnScreen || rememberOnScreen} />
    </div>
  );
}

/** Patient pages need a completed local profile; caregiver pages remain independent. */
function RequirePatientProfile() {
  const store = useMemo(() => getStore(), []);
  const [profile, setProfile] = useState(undefined);
  useEffect(() => { store.getPatientProfile().then(setProfile).catch(() => setProfile(null)); }, [store]);
  if (profile === undefined) return <main className="screen"><p className="text-xl text-ink-soft">Loading…</p></main>;
  return profile ? <Outlet /> : <Navigate to="/patient/onboarding" replace />;
}

function RoleEntry() {
  const store = useMemo(() => getStore(), []);
  const [destination, setDestination] = useState(null);
  useEffect(() => {
    Promise.all([store.getSetting(APP_ROLE_SETTING, null), store.getPatientProfile()]).then(([role, profile]) => {
      if (role === APP_ROLES.caregiver) setDestination('/caregiver');
      else if (role === APP_ROLES.patient || profile) setDestination(profile ? '/patient' : '/patient/onboarding');
      else setDestination('choose');
    }).catch(() => setDestination('choose'));
  }, [store]);
  if (destination === null) return <main className="screen"><p className="text-xl text-ink-soft">Loading…</p></main>;
  return destination === 'choose' ? <RoleChooser /> : <Navigate to={destination} replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<RoleEntry />} />
        <Route element={<PatientLayout />}>
          <Route path="/patient/onboarding" element={<PatientProfile />} />
          <Route element={<RequirePatientProfile />}>
            <Route path="/patient" element={<PatientHome />} />
            <Route path="/patient/profile" element={<PatientProfile edit />} />
            <Route path="/remember" element={<RememberThis />} />
            <Route path="/reminders" element={<ManualReminders />} />
            <Route path="/play" element={<Play />} />
            <Route path="/play/routine" element={<Play />} />
            <Route path="/play/words" element={<Play />} />
            <Route path="/play/numbers" element={<Play />} />
            <Route path="/play/patterns" element={<Play />} />
            <Route path="/play/about-me" element={<AboutMePlay />} />
          </Route>
        </Route>
        <Route path="/caregiver" element={<CaregiverPairing />} />
        <Route path="/caregiver/patient" element={<CaregiverPatientSetup />} />
        <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
