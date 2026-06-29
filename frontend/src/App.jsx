import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './Components/Navbar';
import LandingPage from './Components/LandingPage';
import Onboarding from './Components/Onboarding';
import DashboardPage from './Components/DashboardPage';
import MoodTrackerPage from './Components/MoodTrackerPage';
import JournalPage from './Components/JournalPage';
import AIChatPage from './Components/AIChatPage';
import AssessmentPage from './Components/AssessmentPage';
import ResourcesPage from './Components/ResourcesPage';
import Settings from './Components/Settings';
import AuthPage from './Components/AuthPage';

function App() {
  const [openSettings, setOpenSettings] = useState(false);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/" replace />;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">

      {/* Navbar */}
      <Navbar
        onSettingsOpen={() => setOpenSettings(true)}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main>
        <Routes>

          {/* Public Route */}
          <Route
            path="/"
            element={
              <LandingPage
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          />

          {/* Optional Auth Route */}
          <Route
            path="/auth"
            element={
              <AuthPage
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mood"
            element={
              <ProtectedRoute>
                <MoodTrackerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AIChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

      {/* Global Settings Popup */}
      <Settings
        isOpen={openSettings}
        onClose={() => setOpenSettings(false)}
      />

    </div>
  );
}

export default App;