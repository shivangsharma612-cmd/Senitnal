// ============================================================
// server.js — Sentinel+ Main Backend Entry Point
// Starts Express HTTP server + WebSocket server together
// ============================================================

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
// const connectDB = require('./config/db');
const connectDB = require('./config/db');
// ── Route imports ──
const authRoutes     = require('./routes/auth');
const vitalsRoutes   = require('./routes/vitals');
const alertsRoutes   = require('./routes/alerts');
const symptomsRoutes = require('./routes/symptoms');

const app = express();

// connectDB();
connectDB();

// ── Middleware ──
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

// ── Routes ──
app.use('/api/auth',     authRoutes);
app.use('/api/vitals',   vitalsRoutes);
app.use('/api/alerts',   alertsRoutes);
app.use('/api/symptoms', symptomsRoutes);

// ── Health check endpoint ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sentinel+ server running', timestamp: new Date() });
});

// ── Create HTTP server (shared by Express + WebSocket) ──
const server = http.createServer(app);

// ── Attach WebSocket server to the same HTTP server ──
// WebSocket runs on the same port at ws://localhost:5000

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Sentinel+ server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
});