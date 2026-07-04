/**
 * App.jsx
 * Root router configuration.
 * Routes:
 *   /                  → LandingPage  🔒 (requires admin123)
 *   /game              → GameView     🔒 (requires admin123)
 *   /admin             → AdminPanel   🔒 (requires admin123)
 *   /student           → StudentLogin    (open — no password)
 *   /student/:id       → StudentPortal  (protected by student session)
 *   /student/:id/profile → StudentProfile (protected by student session)
 */

import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import AdminGate      from './components/AdminGate';
import LandingPage    from './pages/LandingPage';
import GameView       from './pages/GameView';
import AdminPanel     from './pages/AdminPanel';
import StudentLogin   from './pages/StudentLogin';
import StudentPortal  from './pages/StudentPortal';
import StudentProfile from './pages/StudentProfile';

function App() {
  const theme = useGameStore((state) => state.settings.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <Routes>
      {/* 🔒 Admin-protected routes — require password admin123 */}
      <Route path="/"     element={<AdminGate><LandingPage /></AdminGate>} />
      <Route path="/game"  element={<AdminGate><GameView /></AdminGate>} />
      <Route path="/admin" element={<AdminGate><AdminPanel /></AdminGate>} />

      {/* 🔓 Student portal — open, protected by student session internally */}
      <Route path="/student"             element={<StudentLogin />} />
      <Route path="/student/:id"         element={<StudentPortal />} />
      <Route path="/student/:id/profile" element={<StudentProfile />} />

      {/* Catch-all → admin-gated landing */}
      <Route path="*" element={<AdminGate><LandingPage /></AdminGate>} />
    </Routes>
  );
}

export default App;
