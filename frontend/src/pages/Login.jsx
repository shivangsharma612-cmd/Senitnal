// ============================================================
// pages/Login.jsx — Authentication Page
// Handles both Sign In and Create Account flows
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'

export default function Login() {
  const { login } = useApp()
  const navigate  = useNavigate()

  const [tab,     setTab]     = useState('login')  // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // ── Sign In form state ──
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  // ── Sign Up form state ──
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', age: '',
    medicalHistory: '', emergencyName: '', emergencyPhone: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', loginData)
      login(res.data, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (signupData.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const payload = {
        name:  signupData.name,
        email: signupData.email,
        password: signupData.password,
        age:   parseInt(signupData.age) || undefined,
        medicalHistory: signupData.medicalHistory,
        emergencyContact: {
          name:  signupData.emergencyName,
          phone: signupData.emergencyPhone,
        },
      }
      const res = await api.post('/auth/register', payload)
      login(res.data, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%), var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            borderRadius: '14px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <path d="M4 14h4l3-8 4 16 3-10 2 4h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Sentinel<span style={{ color: 'var(--cyan)' }}>+</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>
            AI-Powered Smart Healthcare Monitoring
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--card)',
          border: '1px solid var(--border)', borderRadius: 'var(--r)',
          overflow: 'hidden', marginBottom: '1.25rem',
        }}>
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--sans)',
              background: tab === t ? 'var(--blue-bg)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text2)',
              transition: 'all 0.2s',
            }}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--r-sm)', padding: '10px 12px',
            color: 'var(--red)', fontSize: '13px', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {/* Form card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--r)', padding: '1.5rem',
        }}>
          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" required
                  value={loginData.email}
                  onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required
                  value={loginData.password}
                  onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}>
                {loading ? 'Signing in...' : 'Access Dashboard'}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup}>
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Jane Doe" required
                  value={signupData.name}
                  onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Age</label>
                  <input type="number" placeholder="35" min="1" max="120"
                    value={signupData.age}
                    onChange={e => setSignupData(p => ({ ...p, age: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" required
                    value={signupData.email}
                    onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" placeholder="At least 6 characters" required
                  value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="field">
                <label>Medical History (optional)</label>
                <textarea placeholder="Hypertension, Diabetes Type 2..."
                  value={signupData.medicalHistory}
                  onChange={e => setSignupData(p => ({ ...p, medicalHistory: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Emergency Contact Name</label>
                  <input type="text" placeholder="John Doe"
                    value={signupData.emergencyName}
                    onChange={e => setSignupData(p => ({ ...p, emergencyName: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Emergency Phone</label>
                  <input type="tel" placeholder="+1 555 000 0000"
                    value={signupData.emergencyPhone}
                    onChange={e => setSignupData(p => ({ ...p, emergencyPhone: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account & Start Monitoring'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}