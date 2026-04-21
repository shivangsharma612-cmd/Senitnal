// ============================================================
// pages/Reminders.jsx
// ============================================================
import React, { useState } from 'react'

const INITIAL = [
  { id: 1, type: 'med', icon: '💊', name: 'Amlodipine 5mg',       time: '8:00 AM',  freq: 'Daily',   next: 'Tomorrow 8:00 AM'   },
  { id: 2, type: 'med', icon: '💊', name: 'Vitamin D3 1000 IU',   time: '12:00 PM', freq: 'Daily',   next: 'Today 12:00 PM'     },
  { id: 3, type: 'doc', icon: '🏥', name: 'Cardiology Check-up',   time: '10:30 AM', freq: 'Monthly', next: 'May 5, 2026'        },
  { id: 4, type: 'doc', icon: '🩸', name: 'Blood Pressure Test',   time: '9:00 AM',  freq: 'Weekly',  next: 'April 27, 2026'     },
  { id: 5, type: 'med', icon: '💉', name: 'Insulin Injection',     time: '7:00 AM',  freq: 'Daily',   next: 'Tomorrow 7:00 AM'   },
]

export default function Reminders() {
  const [items, setItems] = useState(INITIAL)
  const [form, setForm]   = useState({ name: '', time: '', freq: 'Daily', type: 'med' })
  const [adding, setAdding] = useState(false)

  const addItem = () => {
    if (!form.name || !form.time) return
    setItems(prev => [...prev, { ...form, id: Date.now(), icon: form.type === 'med' ? '💊' : '🏥', next: `Tomorrow ${form.time}` }])
    setForm({ name: '', time: '', freq: 'Daily', type: 'med' })
    setAdding(false)
  }

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h2>Reminders</h2><p>{items.length} active reminders</p></div>
        <button className="btn" onClick={() => setAdding(a => !a)}>
          {adding ? '✕ Cancel' : '+ Add Reminder'}
        </button>
      </div>

      {adding && (
        <div className="card section">
          <div className="card-title">New Reminder</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Name</label>
              <input type="text" placeholder="Medication name..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Time</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Frequency</label>
              <select value={form.freq} onChange={e => setForm(p => ({ ...p, freq: e.target.value }))}>
                <option>Daily</option><option>Weekly</option><option>Monthly</option>
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="med">Medication</option>
                <option value="doc">Appointment</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ maxWidth: '160px', justifyContent: 'center' }} onClick={addItem}>
            Save Reminder
          </button>
        </div>
      )}

      {items.map(item => (
        <div key={item.id} className="reminder-item">
          <div className="reminder-icon"
            style={{ background: item.type === 'med' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)' }}>
            {item.icon}
          </div>
          <div className="reminder-text">
            <strong>{item.name}</strong>
            <span>{item.time} · {item.freq}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '3px' }}>Next due</div>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{item.next}</div>
          </div>
          <span className={`reminder-badge ${item.type}`}>
            {item.type === 'med' ? 'Medication' : 'Appointment'}
          </span>
          <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
        </div>
      ))}
    </div>
  )
}


// ============================================================
// pages/Profile.jsx
// ============================================================
export function Profile() {
  const { user } = require('../context/AppContext').useApp()
  const fields = [
    ['Full Name',           user?.name || '—'],
    ['Age',                 user?.age ? `${user.age} years` : '—'],
    ['Email',               user?.email || '—'],
    ['Medical History',     user?.medicalHistory || 'None provided'],
    ['Emergency Contact',   typeof user?.emergencyContact === 'object'
                              ? `${user.emergencyContact.name || ''} ${user.emergencyContact.phone || ''}`
                              : user?.emergencyContact || 'Not set'],
    ['Monitoring Status',   'Active — 24/7'],
  ]
  const initials = user?.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U'
  return (
    <div className="page-content">
      <div className="page-header"><div><h2>Patient Profile</h2></div></div>
      <div className="card section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: 'var(--cyan)', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Patient ID: SEN-{user?._id?.slice(-6)?.toUpperCase() || '000001'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">Security & Encryption</div>
        {[
          'Password hashed with bcrypt (cost factor 12)',
          'Health data encrypted at rest — AES-256 (production)',
          'All API traffic secured via TLS 1.3',
          'JWT session tokens with 24-hour expiry',
          'MongoDB field-level encryption for PHI (production)',
        ].map(msg => (
          <div key={msg} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px', color: 'var(--text2)' }}>
            <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {msg}
          </div>
        ))}
      </div>
    </div>
  )
}