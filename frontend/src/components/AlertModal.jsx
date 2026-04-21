// ============================================================
// components/AlertModal.jsx — Alert Popup Component
//
// Shows when AI detects abnormal vitals.
// Flow:
//   1. Countdown (30s) — "Are you okay?"
//   2a. User clicks YES → show symptom form
//   2b. Countdown expires → show Emergency Sent screen
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import api from '../utils/api'

const SYMPTOM_OPTIONS = [
  'dizziness', 'chest pain', 'shortness of breath',
  'headache', 'fatigue', 'nausea',
]

const COUNTDOWN_SECONDS = 30

export default function AlertModal() {
  const { alertModal, closeAlert, addSymptoms, user, vitals } = useApp()

  const [phase, setPhase]           = useState('countdown') // 'countdown' | 'symptoms' | 'emergency'
  const [seconds, setSeconds]       = useState(COUNTDOWN_SECONDS)
  const [selected, setSelected]     = useState([])
  const [loading, setLoading]       = useState(false)
  const intervalRef                 = useRef(null)

  // Reset and start countdown whenever modal opens
  useEffect(() => {
    if (!alertModal.open) return

    setPhase('countdown')
    setSeconds(COUNTDOWN_SECONDS)
    setSelected([])

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setPhase('emergency')
          sendEmergencyAlert()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Play alert sound (Web Audio API — no external file needed)
    playAlertBeep(alertModal.level)

    return () => clearInterval(intervalRef.current)
  }, [alertModal.open, alertModal.message])

  // Simulate alert beep using Web Audio API
  function playAlertBeep(level) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = level === 'critical' ? 880 : 660
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
    } catch (_) { /* Audio not supported */ }
  }

  // User clicked "I'm Okay" — show symptom form
  const handleImOkay = () => {
    clearInterval(intervalRef.current)
    setPhase('symptoms')
  }

  // Submit symptom form
  const handleSubmitSymptoms = async () => {
    setLoading(true)
    try {
      // Save to context (works without DB too)
      addSymptoms(selected, 'alert_response')

      // Try to save to DB
      if (selected.length > 0) {
        await api.post('/symptoms', {
          symptoms: selected,
          source: 'alert_response',
          alertId: alertModal.alertId,
        }).catch(() => {}) // silently fail if DB is not connected
      }

      // Update alert response in DB
      if (alertModal.alertId) {
        await api.put(`/alerts/${alertModal.alertId}`, {
          response: 'acknowledged',
          reportedSymptoms: selected,
        }).catch(() => {})
      }
    } finally {
      setLoading(false)
      closeAlert()
    }
  }

  // Countdown expired — send emergency alert
  const sendEmergencyAlert = async () => {
    if (alertModal.alertId) {
      await api.put(`/alerts/${alertModal.alertId}`, {
        response: 'emergency_sent',
      }).catch(() => {})
    }
  }

  // Manual emergency button
  const handleSendNow = () => {
    clearInterval(intervalRef.current)
    setPhase('emergency')
    sendEmergencyAlert()
  }

  const toggleSymptom = (sym) => {
    setSelected(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    )
  }

  if (!alertModal.open) return null

  const isCritical = alertModal.level === 'critical'

  return (
    // Full-screen overlay
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.82)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--card)',
        border: `1px solid ${isCritical ? 'rgba(239,68,68,0.45)' : 'rgba(245,158,11,0.35)'}`,
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        animation: 'slideUp 0.3s ease',
      }}>

        {/* ── PHASE: COUNTDOWN ── */}
        {phase === 'countdown' && (
          <>
            <div style={{ fontSize: '52px', marginBottom: '1rem' }}>
              {isCritical ? '🚨' : '⚠️'}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: isCritical ? 'var(--red)' : 'var(--yellow)' }}>
              {isCritical ? 'Critical Alert!' : 'Abnormal Reading'}
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: '1.25rem', fontSize: '14px', lineHeight: 1.6 }}>
              {alertModal.message}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
              Emergency contact will be notified in
            </p>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '56px',
              fontWeight: 700,
              color: isCritical ? 'var(--red)' : 'var(--yellow)',
              lineHeight: 1,
              marginBottom: '1.5rem',
              animation: seconds <= 10 ? 'blink 0.8s infinite' : 'none',
            }}>
              {seconds}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-success" onClick={handleImOkay}>
                I'm Okay
              </button>
              <button className="btn btn-danger" onClick={handleSendNow}>
                Send Alert Now
              </button>
            </div>
          </>
        )}

        {/* ── PHASE: SYMPTOMS ── */}
        {phase === 'symptoms' && (
          <>
            <div style={{ fontSize: '36px', marginBottom: '0.75rem' }}>📋</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Glad you're okay!
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '1rem', textAlign: 'left' }}>
              Please indicate any symptoms you're experiencing:
            </p>
            <div className="check-group" style={{ textAlign: 'left' }}>
              {SYMPTOM_OPTIONS.map(sym => (
                <label key={sym} className="check-item">
                  <input
                    type="checkbox"
                    checked={selected.includes(sym)}
                    onChange={() => toggleSymptom(sym)}
                  />
                  {sym.charAt(0).toUpperCase() + sym.slice(1)}
                </label>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
              onClick={handleSubmitSymptoms}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Submit & Close'}
            </button>
          </>
        )}

        {/* ── PHASE: EMERGENCY ── */}
        {phase === 'emergency' && (
          <>
            <div style={{ fontSize: '52px', marginBottom: '1rem' }}>🆘</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'var(--red)' }}>
              Emergency Alert Sent!
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '13px', marginBottom: '1.25rem' }}>
              Notifying <strong style={{ color: 'var(--text)' }}>
                {user?.emergencyContact?.name || user?.emergencyContact || 'Emergency Contact'}
              </strong>
            </p>
            {/* Simulated SMS preview */}
            <div style={{
              background: 'var(--red-bg)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: 'var(--red)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontFamily: 'var(--mono)',
            }}>
              📱 SMS: "Sentinel+ ALERT — {user?.name || 'Patient'} may need help.<br/>
              HR: {vitals.heartRate} bpm | Activity: {vitals.activityLevel}%<br/>
              Time: {new Date().toLocaleTimeString()}"
            </div>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={closeAlert}>
              Dismiss
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}