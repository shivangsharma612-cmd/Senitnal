// ============================================================
// pages/Profile.jsx — Patient profile and security info
// ============================================================
import React from 'react'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const { user } = useApp()

  const initials = user?.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const emergencyDisplay = typeof user?.emergencyContact === 'object'
    ? `${user.emergencyContact.name || ''} ${user.emergencyContact.phone || ''}`.trim() || 'Not set'
    : user?.emergencyContact || 'Not set'

  const fields = [
    ['Full Name',         user?.name || '—'],
    ['Age',               user?.age ? `${user.age} years` : '—'],
    ['Email',             user?.email || '—'],
    ['Medical History',   user?.medicalHistory || 'None provided'],
    ['Emergency Contact', emergencyDisplay],
    ['Monitoring Status', 'Active — 24/7'],
  ]

  const securityNotes = [
    'Password hashed with bcrypt (cost factor 12)',
    'Health data encrypted at rest — AES-256 (production)',
    'All API traffic secured via TLS 1.3',
    'JWT session tokens — 24-hour expiry',
    'MongoDB field-level encryption for PHI (production)',
  ]

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h2>Patient Profile</h2><p>Your medical profile and security settings</p></div>
      </div>

      {/* Profile card */}
      <div className="card section">
        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--blue-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 600, color: 'var(--cyan)', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
              Patient ID: SEN-{user?._id?.slice(-6)?.toUpperCase() || '000001'}
            </div>
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '12px 14px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, wordBreak: 'break-word' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Security card */}
      <div className="card">
        <div className="card-title">Security & Encryption Status</div>
        {securityNotes.map(msg => (
          <div key={msg} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '13px', color: 'var(--text2)', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: '1px' }}>✓</span>
            {msg}
          </div>
        ))}
      </div>
    </div>
  )
}