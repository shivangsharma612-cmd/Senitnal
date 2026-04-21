// ============================================================
// pages/Report.jsx — Health Report with trend charts
// ============================================================
import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js'
import { useApp } from '../context/AppContext'
import { avg, getRiskGrade } from '../utils/aiEngine'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export default function Report() {
  const { hrHistory, actHistory, alertHistory, symptomLog, alertsToday, user } = useApp()
  const [generated, setGenerated] = useState(false)

  const avgHR  = avg(hrHistory)
  const minHR  = hrHistory.length ? Math.min(...hrHistory) : 0
  const maxHR  = hrHistory.length ? Math.max(...hrHistory) : 0
  const score  = alertsToday === 0 ? 10 : Math.min(85, alertsToday * 20 + 8)
  const { grade, label: riskLabel, color: riskColor } = getRiskGrade(score)

  const hrChartData = {
    labels: hrHistory.map((_, i) => i % 10 === 0 ? `${(i * 1.5).toFixed(0)}s` : ''),
    datasets: [
      {
        label: 'Heart Rate',
        data: hrHistory,
        borderColor: '#10b981', borderWidth: 2,
        fill: true, backgroundColor: 'rgba(16,185,129,0.05)',
        tension: 0.3, pointRadius: 0,
      },
      { label: 'Upper', data: hrHistory.map(() => 100), borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1, borderDash: [4, 4], pointRadius: 0 },
      { label: 'Lower', data: hrHistory.map(() => 55),  borderColor: 'rgba(245,158,11,0.3)', borderWidth: 1, borderDash: [4, 4], pointRadius: 0 },
    ],
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: { legend: { display: false } },
    elements: { point: { radius: 0 } },
    scales: {
      x: { ticks: { color: '#8fa3c8', font: { size: 10 }, autoSkip: true, maxTicksLimit: 10 }, grid: { color: 'rgba(99,179,237,0.07)' } },
      y: { min: 40, max: 140, ticks: { color: '#8fa3c8', font: { size: 11 } }, grid: { color: 'rgba(99,179,237,0.07)' } },
    },
  }

  const uniqueSymptoms = [...new Set(symptomLog.flatMap(s => s.symptoms))]

  if (!generated) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div><h2>Health Report</h2><p>Compile your session data into a full report</p></div>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '52px', marginBottom: '1rem' }}>📊</div>
          <p style={{ color: 'var(--text2)', marginBottom: '1.5rem', fontSize: '14px' }}>
            Click below to generate a comprehensive health report for this session.
          </p>
          <button className="btn btn-primary" style={{ padding: '12px 32px', justifyContent: 'center' }}
            onClick={() => setGenerated(true)}>
            Generate Health Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h2>Health Report</h2><p>Generated {new Date().toLocaleString()}</p></div>
        <button className="btn" onClick={() => window.print()}>🖨️ Print</button>
      </div>

      {/* Report header card */}
      <div className="card section" style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.04))',
        borderColor: 'var(--border2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
              Overall Risk Score
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '64px', fontWeight: 700, color: riskColor, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: riskColor, marginTop: '6px' }}>{riskLabel}</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)', textAlign: 'right', lineHeight: 1.8 }}>
            <div>Patient: <strong style={{ color: 'var(--text)' }}>{user?.name}</strong></div>
            <div>Age: {user?.age || '—'}</div>
            <div>Session: {Math.round(hrHistory.length * 1.5 / 60)} min</div>
            <div>Readings: {hrHistory.length}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-row section">
        {[
          { num: avgHR,           label: 'Avg HR (bpm)',  color: 'var(--cyan)'  },
          { num: minHR,           label: 'Min HR',        color: 'var(--green)' },
          { num: maxHR,           label: 'Max HR',        color: 'var(--red)'   },
          { num: alertsToday,     label: 'Alerts',        color: 'var(--yellow)'},
          { num: symptomLog.length, label: 'Symptom Logs', color: 'var(--blue)' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="num" style={{ color: s.color }}>{s.num}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* HR trend chart */}
      <div className="card section">
        <div className="card-title">Heart Rate Trend — Full Session</div>
        <div style={{ position: 'relative', height: '200px' }}>
          <Line data={hrChartData} options={chartOptions} />
        </div>
      </div>

      {/* Alert + symptom summaries */}
      <div className="grid-2 section">
        <div className="card">
          <div className="card-title">Alerts ({alertHistory.length})</div>
          {alertHistory.length === 0
            ? <div style={{ color: 'var(--green)', fontSize: '13px' }}>✓ No alerts triggered</div>
            : alertHistory.slice(0, 6).map(a => (
                <div key={a.id} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text3)', minWidth: '64px', fontFamily: 'monospace' }}>{a.time}</span>
                  <span style={{ color: a.level === 'critical' ? 'var(--red)' : 'var(--yellow)' }}>{a.message}</span>
                </div>
              ))
          }
        </div>
        <div className="card">
          <div className="card-title">Symptoms ({symptomLog.length} entries)</div>
          {symptomLog.length === 0
            ? <div style={{ color: 'var(--green)', fontSize: '13px' }}>✓ No symptoms reported</div>
            : uniqueSymptoms.map(sym => {
                const count = symptomLog.filter(s => s.symptoms.includes(sym)).length
                return (
                  <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)', textTransform: 'capitalize' }}>{sym}</span>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--yellow)' }}>{count}×</span>
                  </div>
                )
              })
          }
        </div>
      </div>

      {/* AI notes */}
      <div className="card section">
        <div className="card-title">AI Assessment Notes</div>
        <div style={{ fontSize: '13px', lineHeight: 1.9 }}>
          <div style={{ color: avgHR >= 60 && avgHR <= 90 ? 'var(--green)' : 'var(--yellow)', marginBottom: '4px' }}>
            {avgHR >= 60 && avgHR <= 90 ? '✓' : '⚠'} Average heart rate ({avgHR} bpm) is
            {avgHR >= 60 && avgHR <= 90 ? ' within' : ' outside'} the normal range.
          </div>
          <div style={{ color: alertsToday === 0 ? 'var(--green)' : 'var(--red)', marginBottom: '4px' }}>
            {alertsToday === 0 ? '✓ No critical events during session.' : `⚠ ${alertsToday} alert(s) triggered — physician review recommended.`}
          </div>
          <div style={{ color: symptomLog.length > 0 ? 'var(--yellow)' : 'var(--green)', marginBottom: '4px' }}>
            {symptomLog.length > 0
              ? `⚠ Reported symptoms: ${uniqueSymptoms.join(', ')}. Please consult a licensed physician.`
              : '✓ No symptoms reported this session.'}
          </div>
          <div style={{ color: 'var(--text3)', fontSize: '12px', marginTop: '8px' }}>
            ⚕ This report is generated by a simulated AI system for demonstration purposes only.
            It is not a substitute for professional medical advice, diagnosis, or treatment.
          </div>
        </div>
      </div>
    </div>
  )
}