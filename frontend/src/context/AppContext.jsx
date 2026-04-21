// ============================================================
// context/AppContext.jsx — Global Application State
//
// Manages: auth user, live vitals, alert modal, history
// Consumed by all pages and components via useApp() hook
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ── Auth state ──
  const [user, setUser]   = useState(() => {
    // Restore user from localStorage on page refresh
    try { return JSON.parse(localStorage.getItem('sp_user')) || null }
    catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('sp_token') || null)

  // ── Live vitals (updated by WebSocket hook) ──
  const [vitals, setVitals] = useState({
    heartRate: 72,
    activityLevel: 65,
    movementStatus: 'active',
    secondsSinceLastMovement: 0,
    riskLevel: 'normal',
    issues: [],
    riskScore: 0,
    timestamp: null,
  })

  // ── Rolling history for charts (last 60 readings) ──
  const [hrHistory,  setHrHistory]  = useState(Array(60).fill(72))
  const [actHistory, setActHistory] = useState(Array(60).fill(65))

  // ── Alert modal state ──
  const [alertModal, setAlertModal] = useState({
    open: false,
    message: '',
    level: 'warning',
    alertId: null,  // DB ID of created alert for linking symptoms
  })

  // ── Session data ──
  const [alertHistory,  setAlertHistory]  = useState([])
  const [symptomLog,    setSymptomLog]    = useState([])
  const [alertsToday,   setAlertsToday]   = useState(0)

  // ── Login ──
  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('sp_user', JSON.stringify(userData))
    localStorage.setItem('sp_token', authToken)
  }, [])

  // ── Logout ──
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sp_user')
    localStorage.removeItem('sp_token')
    // Reset all session data
    setVitals({ heartRate: 72, activityLevel: 65, movementStatus: 'active', secondsSinceLastMovement: 0, riskLevel: 'normal', issues: [], riskScore: 0, timestamp: null })
    setHrHistory(Array(60).fill(72))
    setActHistory(Array(60).fill(65))
    setAlertHistory([])
    setSymptomLog([])
    setAlertsToday(0)
  }, [])

  // ── Update vitals from WebSocket feed ──
  const updateVitals = useCallback((newVitals) => {
    setVitals(newVitals)
    setHrHistory(prev => {
      const next = [...prev, newVitals.heartRate]
      return next.length > 60 ? next.slice(-60) : next
    })
    setActHistory(prev => {
      const next = [...prev, newVitals.activityLevel]
      return next.length > 60 ? next.slice(-60) : next
    })
  }, [])

  // ── Open alert modal ──
  const openAlert = useCallback((message, level, alertId = null) => {
    setAlertModal({ open: true, message, level, alertId })
    setAlertsToday(prev => prev + 1)
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      message,
      level,
    }
    setAlertHistory(prev => [entry, ...prev])
  }, [])

  // ── Close alert modal ──
  const closeAlert = useCallback(() => {
    setAlertModal({ open: false, message: '', level: 'warning', alertId: null })
  }, [])

  // ── Add to symptom log ──
  const addSymptoms = useCallback((symptoms, source = 'manual') => {
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      symptoms,
      source,
    }
    setSymptomLog(prev => [entry, ...prev])
  }, [])

  const value = {
    user, token, login, logout,
    vitals, updateVitals,
    hrHistory, actHistory,
    alertModal, openAlert, closeAlert,
    alertHistory, symptomLog, addSymptoms,
    alertsToday,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook for easy consumption
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}