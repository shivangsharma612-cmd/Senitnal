// ============================================================
// pages/Dashboard.jsx — Main Overview Page
// Shows live vitals, ECG, AI status, and today's summary
// ============================================================

import React, { useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js'
import { useApp } from '../context/AppContext'
import { MetricCard, ECGChart } from '../components/MetricCard'
import useWebSocket from '../hooks/useWebSocket'
import {
  getHRStatus, getActivityStatus, getMovementStatus,
  getMovementLabel, avg
} from '../utils/aiEngine'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

// Mini sparkline chart options (no axes, no labels)
const sparkOptions = (color) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  elements: { point: { radius: 0 } },
})

export default function Dashboard() {
  const { user, vitals, hrHistory, actHistory, alertsToday } = useApp()
  const { simulate } = useWebSocket()      // Starts WS connection

  // Re-render ECG every 100ms for animation
  const [tick, setTick] = React.useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 100)
    return () => clearInterval(id)
  }, [])

  const hrStatus  = getHRStatus(vitals.heartRate)
  const actStatus = getActivityStatus(vitals.activityLevel)
  const movStatus = getMovementStatus(vitals.secondsSinceLastMovement)

  const avgHR     = avg(hrHistory)
  const gradeColor = avgHR >= 60 && avgHR <= 90 ? 'var(--green)'
                   : avgHR >= 55 && avgHR <= 100 ? 'var(--yellow)' : 'var(--red)'
  const grade      = avgHR >= 60 && avgHR <= 90 ? 'A'
                   : avgHR >= 55 && avgHR <= 100 ? 'B' : 'C'

  const miniHrData = {
    labels: hrHistory.slice(-20).map(() => ''),
    datasets: [{ data: hrHistory.slice(-20), borderColor: '#10b981', borderWidth: 1.5, fill: true, backgroundColor: 'rgba(16,185,129,0.07)', tension: 0.4 }],
  }
  const miniActData = {
    labels: actHistory.slice(-20).map(() => ''),
    datasets: [{ data: actHistory.slice(-20), borderColor: '#3b82f6', borderWidth: 1.5, fill: true, backgroundColor: 'rgba(59,130,246,0.07)', tension: 0.4 }],
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Good morning, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Real-time health monitoring active</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--green)' }}>
          <div className="dot blink" style={{ background: 'var(--green)' }} />
          Sensors Active
        </div>
      </div>

      {/* Vital metric cards */}
      <div className="grid-3 section">
        <MetricCard label="Heart Rate" value={vitals.heartRate} unit="bpm"
          status={hrStatus} subText={`Normal: 60–100 bpm`}>
          <div style={{ height: 40, marginTop: 8 }}>
            <Line data={miniHrData} options={sparkOptions('#10b981')} />
          </div>
        </MetricCard>

        <MetricCard label="Activity Level" value={vitals.activityLevel} unit="%"
          status={actStatus}
          subText={vitals.activityLevel > 70 ? 'High activity' : vitals.activityLevel > 40 ? 'Moderate' : 'Low activity'}>
          <div style={{ height: 40, marginTop: 8 }}>
            <Line data={miniActData} options={sparkOptions('#3b82f6')} />
          </div>
        </MetricCard>

        <MetricCard label="Movement Status"
          value={vitals.movementStatus?.replace('_', ' ')}
          status={movStatus}
          subText={`Last moved: ${getMovementLabel(vitals.secondsSinceLastMovement)}`}>
          {/* Activity bars */}
          <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
            {[1,2,3,4,5].map(i => {
              const active = i <= Math.ceil(vitals.activityLevel / 20)
              const col = movStatus === 'critical' ? 'var(--red)'
                        : movStatus === 'warning'  ? 'var(--yellow)' : 'var(--green)'
              return <div key={i} style={{
                flex: 1, height: '6px', borderRadius: '3px',
                background: active ? col : 'var(--border)',
                opacity: active ? (1 - (i - 1) * 0.15) : 1,
                transition: 'background 0.3s',
              }} />
            })}
          </div>
        </MetricCard>
      </div>

      {/* ECG + AI panel */}
      <div className="grid-2 section">
        <div className="card">
          <div className="card-title">ECG Waveform — Live</div>
          <ECGChart heartRate={vitals.heartRate} status={hrStatus} key={tick} />
        </div>

        <div className="card">
          <div className="card-title">AI Risk Assessment</div>
          {vitals.issues && vitals.issues.length > 0
            ? vitals.issues.map((issue, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: issue.level === 'critical' ? 'var(--red)' : 'var(--yellow)' }} />
                  <span style={{ fontSize: '13px', color: issue.level === 'critical' ? 'var(--red)' : 'var(--yellow)' }}>
                    {issue.msg}
                  </span>
                </div>
              ))
            : (
              <>
                {[
                  'Heart rate within normal bounds',
                  'No prolonged inactivity detected',
                  'No sudden vital changes',
                ].map(msg => (
                  <div key={msg} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{msg}</span>
                  </div>
                ))}
              </>
            )
          }
        </div>
      </div>

      {/* Today's summary */}
      <div className="card section">
        <div className="card-title">Today's Summary</div>
        <div className="stat-row">
          <div className="stat-box">
            <div className="num" style={{ color: 'var(--red)' }}>{alertsToday}</div>
            <div className="lbl">Alerts Today</div>
          </div>
          <div className="stat-box">
            <div className="num" style={{ color: 'var(--cyan)' }}>{avgHR}</div>
            <div className="lbl">Avg Heart Rate</div>
          </div>
          <div className="stat-box">
            <div className="num" style={{ color: 'var(--green)' }}>100%</div>
            <div className="lbl">Uptime</div>
          </div>
          <div className="stat-box">
            <div className="num" style={{ color: gradeColor }}>{grade}</div>
            <div className="lbl">Health Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}