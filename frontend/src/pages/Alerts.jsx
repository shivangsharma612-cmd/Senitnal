// ============================================================
// pages/Alerts.jsx
// ============================================================
import React from 'react'
import { useApp } from '../context/AppContext'

export default function Alerts() {
  const { alertHistory } = useApp()
  return (
    <div className="page-content">
      <div className="page-header">
        <div><h2>Alert History</h2><p>{alertHistory.length} alerts this session</p></div>
      </div>
      {alertHistory.length === 0
        ? <div className="empty-state">No alerts triggered yet. Your vitals are normal.</div>
        : alertHistory.map(a => (
            <div key={a.id} className={`alert-row ${a.level}`}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text3)', minWidth: '75px' }}>{a.time}</div>
              <div style={{ flex: 1, fontSize: '13px', color: 'var(--text2)' }}>{a.message}</div>
              <div style={{
                fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '8px',
                background: a.level === 'critical' ? 'var(--red-bg)' : 'var(--yellow-bg)',
                color: a.level === 'critical' ? 'var(--red)' : 'var(--yellow)',
              }}>{a.level}</div>
            </div>
          ))
      }
    </div>
  )
}