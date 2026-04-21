// ============================================================
// components/Navbar.jsx — Top Navigation Bar
// Shows logo, nav links, live status pill, user badge, logout
// ============================================================

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const NAV_LINKS = [
  { to: '/',          label: 'Dashboard'  },
  { to: '/monitor',   label: 'Live Monitor' },
  { to: '/alerts',    label: 'Alerts'     },
  { to: '/symptoms',  label: 'Symptoms'   },
  { to: '/report',    label: 'Report'     },
  { to: '/reminders', label: 'Reminders'  },
  { to: '/profile',   label: 'Profile'    },
]

export default function Navbar() {
  const { user, vitals, logout } = useApp()
  const navigate = useNavigate()

  const status = vitals.riskLevel || 'normal'
  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Top bar ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '56px',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M4 14h4l3-8 4 16 3-10 2 4h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            Sentinel<span style={{ color: 'var(--cyan)' }}>+</span>
          </span>
        </div>

        {/* Right side: status + user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Live status pill */}
          <div className={`status-pill ${status}`}>
            <div className="dot" />
            <span style={{ textTransform: 'capitalize' }}>{status}</span>
          </div>

          {/* User badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '4px 12px 4px 6px',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--blue-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600, color: 'var(--blue)',
            }}>
              {initials}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>

          <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Navigation tabs ── */}
      <nav style={{
        display: 'flex',
        gap: '2px',
        padding: '0 1.5rem',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
      }}>
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: isActive ? 'var(--cyan)' : 'var(--text2)',
              borderBottom: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}