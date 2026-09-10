import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PatientHome from './pages/PatientHome.jsx';
import Play from './pages/Play.jsx';
import CaregiverPairing from './pages/CaregiverPairing.jsx';
import CaregiverDashboard from './pages/CaregiverDashboard.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import { LanguageProvider } from './components/LanguageContext.jsx';
import ReminderOverlay from './components/ReminderOverlay.jsx';

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
  const [reminderOnScreen, setReminderOnScreen] = useState(false);
  return (
    <div className="app-shell min-h-screen">
      <LanguageSelector />
      <Outlet context={{ reminderOnScreen }} />
      <ReminderOverlay onShowing={setReminderOnScreen} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route element={<PatientLayout />}>
          <Route path="/" element={<PatientHome />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/routine" element={<Play />} />
          <Route path="/play/words" element={<Play />} />
          <Route path="/play/numbers" element={<Play />} />
          <Route path="/play/patterns" element={<Play />} />
        </Route>
        <Route path="/caregiver" element={<CaregiverPairing />} />
        <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  );
}
