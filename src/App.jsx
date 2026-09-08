import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PatientHome from './pages/PatientHome.jsx';
import Play from './pages/Play.jsx';
import CaregiverPairing from './pages/CaregiverPairing.jsx';
import CaregiverDashboard from './pages/CaregiverDashboard.jsx';
import ReminderOverlay from './components/ReminderOverlay.jsx';

/**
 * Patient-mode shell.
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
  const [reminderOnScreen, setReminderOnScreen] = useState(false);
  return (
    <div className="min-h-screen bg-paper">
      <Outlet context={{ reminderOnScreen }} />
      <ReminderOverlay onShowing={setReminderOnScreen} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PatientLayout />}>
        <Route path="/" element={<PatientHome />} />
        <Route path="/play" element={<Play />} />
        <Route path="/play/routine" element={<Play />} />
      </Route>
      <Route path="/caregiver" element={<CaregiverPairing />} />
      <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
