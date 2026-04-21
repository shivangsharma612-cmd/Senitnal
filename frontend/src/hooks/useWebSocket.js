// ============================================================
// hooks/useWebSocket.js — WebSocket Connection Hook
//
// Connects to ws://localhost:5000 after login,
// authenticates with JWT, then streams vitals into AppContext.
// Also triggers the AI alert modal when risk is detected.
// ============================================================

import { useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import api from '../utils/api'

// How many seconds to suppress repeated alerts after one fires
const ALERT_COOLDOWN_SEC = 60

export default function useWebSocket() {
  const { token, updateVitals, openAlert, vitals } = useApp()
  const wsRef            = useRef(null)
  const lastAlertTimeRef = useRef(0)   // Timestamp of last triggered alert
  const reconnectRef     = useRef(null)

  const connect = useCallback(() => {
    if (!token) return

    // Connect to backend WebSocket
    const ws = new WebSocket('ws://localhost:5000')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('✅ WebSocket connected')
      // First message must be the auth token
      ws.send(JSON.stringify({ token }))
    }

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data)

        if (msg.type === 'connected') {
          console.log('✅ WebSocket authenticated:', msg.message)
          return
        }

        if (msg.type === 'vitals') {
          const data = msg.data
          updateVitals(data)

          // ── AI Alert Trigger Logic ──
          // Only fire an alert if:
          // 1. Risk is warning or critical
          // 2. There are actual issues detected
          // 3. Enough time has passed since last alert (cooldown)
          const now = Date.now()
          const cooldownPassed = (now - lastAlertTimeRef.current) > ALERT_COOLDOWN_SEC * 1000

          if (
            (data.riskLevel === 'critical' || data.riskLevel === 'warning') &&
            data.issues.length > 0 &&
            cooldownPassed
          ) {
            lastAlertTimeRef.current = now
            const primaryIssue = data.issues[0]

            // Save alert to DB and get its ID
            let alertId = null
            try {
              const res = await api.post('/alerts', {
                message: primaryIssue.msg,
                level: data.riskLevel,
                vitalSnapshot: {
                  heartRate: data.heartRate,
                  activityLevel: data.activityLevel,
                  movementStatus: data.movementStatus,
                },
              })
              alertId = res.data._id
            } catch (err) {
              console.warn('Could not save alert to DB:', err.message)
            }

            // Open the alert modal
            openAlert(primaryIssue.msg, data.riskLevel, alertId)
          }
        }

        if (msg.type === 'error') {
          console.error('WebSocket error from server:', msg.message)
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected — reconnecting in 3s...')
      // Auto-reconnect after 3 seconds
      reconnectRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }
  }, [token, updateVitals, openAlert])

  // ── Send a simulate command to the backend ──
  const simulate = useCallback((mode) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'simulate', mode }))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect])

  return { simulate }
}