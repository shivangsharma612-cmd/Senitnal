// ============================================================
// components/MetricCard.jsx — Reusable vital metric card
// ============================================================

import React from 'react'

export function MetricCard({ label, value, unit, status = 'normal', subText, children }) {
  return (
    <div className={`metric-card ${status}`}>
      <div className="metric-label">{label}</div>
      <div>
        <span className={`metric-value ${status}`}>{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {subText && <div className="metric-sub">{subText}</div>}
      {children}
    </div>
  )
}

// ============================================================
// components/StatusBadge.jsx — Inline status pill
// ============================================================

export function StatusBadge({ level, label }) {
  return (
    <div className={`status-pill ${level}`}>
      <div className="dot" />
      <span>{label || level}</span>
    </div>
  )
}

// ============================================================
// components/ECGChart.jsx — Animated SVG ECG waveform
// Updates every render with a new phase offset based on HR
// ============================================================

export function ECGChart({ heartRate = 72, status = 'normal' }) {
  const phase = (Date.now() / 1000 * (heartRate / 60)) % 1
  const W = 400, H = 80, PTS = 200

  // Build ECG path points
  let d = ''
  for (let i = 0; i < PTS; i++) {
    const x = (i / PTS) * W
    const t = ((i / PTS) + phase) % 1
    let y = H / 2
    const seg = (t % 0.2) / 0.2   // 0–1 within each beat cycle

    if      (seg < 0.10) y = H/2 - 4 * Math.sin(seg * Math.PI * 10)    // P wave
    else if (seg < 0.30) y = H/2                                         // PR interval
    else if (seg < 0.35) y = H/2 + 14                                    // Q dip
    else if (seg < 0.40) y = H/2 - 26 * (heartRate / 80)                // R spike
    else if (seg < 0.45) y = H/2 + 10                                    // S dip
    else if (seg < 0.70) y = H/2 + 5 * Math.sin((seg - 0.5) * Math.PI * 3.33) // T wave
    else                 y = H/2                                          // baseline

    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)} `
  }

  const color = status === 'critical' ? '#ef4444'
              : status === 'warning'  ? '#f59e0b'
              : '#10b981'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {/* Grid lines */}
      {[20, 40, 60].map(y => (
        <line key={y} x1="0" y1={y} x2={W} y2={y}
          stroke="rgba(99,179,237,0.06)" strokeWidth="1" />
      ))}
      {/* ECG waveform */}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}