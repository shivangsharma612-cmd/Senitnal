// ============================================================
// pages/Monitor.jsx — Live monitoring with full charts
// ============================================================

import React, { useRef, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { useApp } from '../context/AppContext'
import useWebSocket from '../hooks/useWebSocket'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

const lineOpts = (min, max) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 200 },
  plugins: { legend: { display: false } },
  scales: {
    x: { display: false },
    y: { min, max, ticks: { color: '#8fa3c8', font: { size: 11 } }, grid: { color: 'rgba(99,179,237,0.07)' } },
  },
  elements: { point: { radius: 0 } },
})

export default function Monitor() {
  const { vitals, hrHistory, actHistory } = useApp()
  const { simulate } = useWebSocket()
  const logRef = useRef([])
  const [logHtml, setLogHtml] = React.useState('')

  // Accumulate detection log
  useEffect(() => {
    if (vitals.issues && vitals.issues.length > 0) {
      const time = new Date().toLocaleTimeString()
      const issue = vitals.issues[0]
      const entry = `<div style="display:flex;gap:8px;margin-bottom:4px;">
        <span style="color:#4a6080;min-width:68px;font-family:monospace;font-size:11px;">${time}</span>
        <span style="color:${issue.level === 'critical' ? '#ef4444' : '#f59e0b'};font-size:12px;">${issue.msg}</span>
      </div>`
      logRef.current = [entry, ...logRef.current].slice(0, 40)
      setLogHtml(logRef.current.join(''))
    }
  }, [vitals.issues])

  const hrData = {
    labels: hrHistory.map((_, i) => i % 10 === 0 ? `${i * 1.5}s` : ''),
    datasets: [
      { label: 'Heart Rate', data: hrHistory, borderColor: '#10b981', borderWidth: 2, fill: false, tension: 0.3 },
      { label: 'Upper (100)', data: hrHistory.map(() => 100), borderColor: 'rgba(239,68,68,0.4)', borderWidth: 1, borderDash: [5, 5] },
      { label: 'Lower (55)',  data: hrHistory.map(() => 55),  borderColor: 'rgba(245,158,11,0.4)', borderWidth: 1, borderDash: [5, 5] },
    ],
  }
  const actData = {
    labels: actHistory.map(() => ''),
    datasets: [{ label: 'Activity', data: actHistory, backgroundColor: 'rgba(59,130,246,0.5)', borderRadius: 2 }],
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2>Live Monitoring Feed</h2>
          <p>Sensor data updating every 1.5 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-warning" onClick={() => simulate('warning')} style={{ fontSize: '12px', padding: '7px 14px' }}>
            Simulate Warning
          </button>
          <button className="btn btn-danger" onClick={() => simulate('critical')} style={{ fontSize: '12px', padding: '7px 14px' }}>
            Simulate Critical
          </button>
        </div>
      </div>

      {/* Live values bar */}
      <div className="card section" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Heart Rate', value: `${vitals.heartRate} bpm`, color: '#10b981' },
            { label: 'Activity',   value: `${vitals.activityLevel}%`, color: '#3b82f6' },
            { label: 'Risk Level', value: vitals.riskLevel, color: vitals.riskLevel === 'critical' ? '#ef4444' : vitals.riskLevel === 'warning' ? '#f59e0b' : '#10b981' },
            { label: 'Risk Score', value: vitals.riskScore, color: '#06b6d4' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 700, color: item.color, textTransform: 'capitalize' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HR chart */}
      <div className="card section">
        <div className="card-title">Heart Rate — Last 60 Readings</div>
        <div style={{ position: 'relative', height: '220px' }}>
          <Line data={hrData} options={lineOpts(40, 140)} />
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--text2)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 12, height: 2, background: '#10b981', display: 'inline-block' }}></span> HR</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 12, height: 2, background: 'rgba(239,68,68,0.6)', display: 'inline-block' }}></span> Upper limit</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 12, height: 2, background: 'rgba(245,158,11,0.6)', display: 'inline-block' }}></span> Lower limit</span>
        </div>
      </div>

      <div className="grid-2 section">
        {/* Activity chart */}
        <div className="card">
          <div className="card-title">Activity Level — 60 Readings</div>
          <div style={{ position: 'relative', height: '160px' }}>
            <Bar data={actData} options={{
              responsive: true, maintainAspectRatio: false, animation: { duration: 200 },
              plugins: { legend: { display: false } },
              scales: { x: { display: false }, y: { min: 0, max: 100, ticks: { color: '#8fa3c8', font: { size: 11 } }, grid: { color: 'rgba(99,179,237,0.07)' } } },
            }} />
          </div>
        </div>

        {/* Detection log */}
        <div className="card">
          <div className="card-title">AI Detection Log</div>
          {logHtml
            ? <div style={{ height: '160px', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: logHtml }} />
            : <div className="empty-state" style={{ padding: '2rem 0' }}>No anomalies detected yet</div>
          }
        </div>
      </div>
    </div>
  )
}