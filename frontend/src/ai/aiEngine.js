// ============================================================
// utils/aiEngine.js — Client-Side AI Rule Mirror
//
// A lightweight copy of the backend AI rules.
// Used for instant UI feedback (color changes, labels)
// without waiting for a round trip to the server.
// ============================================================

export function getStatusColor(level) {
  switch (level) {
    case 'critical': return 'var(--red)'
    case 'warning':  return 'var(--yellow)'
    default:         return 'var(--green)'
  }
}

export function getStatusLabel(level) {
  switch (level) {
    case 'critical': return 'Critical'
    case 'warning':  return 'Warning'
    default:         return 'Normal'
  }
}

export function getHRStatus(hr, upper = 100, lower = 55) {
  if (hr > 120 || hr < 40) return 'critical'
  if (hr > upper || hr < lower) return 'warning'
  return 'normal'
}

export function getActivityStatus(act) {
  if (act < 10) return 'critical'
  if (act < 25) return 'warning'
  return 'normal'
}

export function getMovementLabel(secondsSince) {
  const min = Math.floor(secondsSince / 60)
  if (secondsSince < 30)   return 'Just now'
  if (secondsSince < 3600) return `${min} min ago`
  return `${Math.floor(min / 60)}h ${min % 60}m ago`
}

export function getMovementStatus(secondsSince) {
  if (secondsSince > 3600) return 'critical'
  if (secondsSince > 1800) return 'warning'
  return 'normal'
}

export function getRiskGrade(score) {
  if (score >= 70) return { grade: 'C', label: 'High Risk',      color: 'var(--red)' }
  if (score >= 35) return { grade: 'B', label: 'Moderate Risk',  color: 'var(--yellow)' }
  return            { grade: 'A', label: 'Low Risk',        color: 'var(--green)' }
}

// Calculate average from array
export function avg(arr) {
  if (!arr || arr.length === 0) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}