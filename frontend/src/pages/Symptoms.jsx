// ============================================================
// pages/Symptoms.jsx — Log and view symptom history
// ============================================================
import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import api from '../utils/api'

const SYMPTOM_OPTIONS = [
  'dizziness', 'chest pain', 'shortness of breath',
  'headache', 'fatigue', 'nausea',
]

export default function Symptoms() {
  const { symptomLog, addSymptoms } = useApp()
  const [selected, setSelected] = useState([])
  const [notes,    setNotes]    = useState('')
  const [severity, setSeverity] = useState('mild')
  const [saved,    setSaved]    = useState(false)

  const toggle = (sym) =>
    setSelected(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym])

  const handleSubmit = async () => {
    if (selected.length === 0) return
    addSymptoms(selected, 'manual')
    try {
      await api.post('/symptoms', { symptoms: selected, notes, source: 'manual', severity })
    } catch (_) {}
    setSelected([])
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h2>Symptom Tracker</h2><p>Log what you're feeling manually or after an alert</p></div>
      </div>

      {/* Manual log form */}
      <div className="card section">
        <div className="card-title">Log Symptoms Now</div>
        <div className="check-group">
          {SYMPTOM_OPTIONS.map(sym => (
            <label key={sym} className="check-item">
              <input type="checkbox" checked={selected.includes(sym)} onChange={() => toggle(sym)} />
              {sym.charAt(0).toUpperCase() + sym.slice(1)}
            </label>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)}>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Notes (optional)</label>
            <input type="text" placeholder="Any additional details..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={selected.length === 0}
            style={{ maxWidth: '200px', justifyContent: 'center' }}>
            Log Symptoms
          </button>
          {saved && <span style={{ color: 'var(--green)', fontSize: '13px' }}>✓ Symptoms saved</span>}
        </div>
      </div>

      {/* History */}
      <div className="card">
        <div className="card-title">Symptom History ({symptomLog.length} entries)</div>
        {symptomLog.length === 0
          ? <div className="empty-state">No symptoms logged yet.</div>
          : symptomLog.map(entry => (
              <div key={entry.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '12px', marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text3)' }}>
                    {entry.date} {entry.time}
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '8px',
                    background: entry.source === 'alert_response' ? 'var(--red-bg)' : 'var(--blue-bg)',
                    color: entry.source === 'alert_response' ? 'var(--red)' : 'var(--blue)',
                  }}>
                    {entry.source === 'alert_response' ? 'After alert' : 'Manual'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {entry.symptoms.map(sym => (
                    <span key={sym} style={{
                      background: 'rgba(245,158,11,0.12)', color: 'var(--yellow)',
                      borderRadius: '8px', padding: '3px 10px', fontSize: '12px',
                    }}>
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}