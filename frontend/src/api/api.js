// ============================================================
// utils/api.js — Axios API Client
//
// Pre-configured Axios instance that:
// - Points to http://localhost:5000/api
// - Automatically injects the JWT Bearer token from localStorage
// - Handles 401 errors by clearing session
// ============================================================

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach token to every request ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login on token expiry
      localStorage.removeItem('sp_token')
      localStorage.removeItem('sp_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api