// ============================================================
// App.jsx — Root Application Component
// Handles routing between pages and wraps with global context
// ============================================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

// Pages
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Monitor    from './pages/Monitor'
import Alerts     from './pages/Alerts'
import Symptoms   from './pages/Symptoms'
import Report     from './pages/Report'
import Reminders  from './pages/Reminders'
import Profile    from './pages/Profile'

// Layout
import Navbar     from './components/Navbar'
import AlertModal from './components/AlertModal'

// ── Protected route wrapper ──
function PrivateRoute({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

// ── App shell with navbar ──
function AppShell() {
  const { user } = useApp()
  return (
    <>
      {user && <Navbar />}
      <AlertModal />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/monitor" element={<PrivateRoute><Monitor /></PrivateRoute>} />
        <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
        <Route path="/symptoms" element={<PrivateRoute><Symptoms /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/reminders" element={<PrivateRoute><Reminders /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}