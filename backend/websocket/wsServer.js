// ============================================================
// wsServer.js — WebSocket Server
//
// Streams simulated sensor readings to connected frontend clients.
// Each connected client gets its own sensor simulation loop.
// The frontend connects once after login and receives live data.
//
// Protocol: JSON messages over WebSocket
// ============================================================
 
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { analyzeVitals, simulateSensorReading } = require('./aiEngine');
 
// Store per-client simulation state
const clientSessions = new Map();
 
/**
 * Initialize and attach WebSocket server to existing HTTP server.
 * @param {http.Server} server - The Express HTTP server
 */
function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
 
  console.log('✅ WebSocket server initialized');
 
  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection');
 
    // ── Expect first message to be auth token ──
    ws.once('message', (data) => {
      try {
        const { token } = JSON.parse(data);
 
        if (!token) {
          ws.send(JSON.stringify({ type: 'error', message: 'No token provided' }));
          ws.close();
          return;
        }
 
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
 
        console.log(`✅ WebSocket authenticated for user: ${userId}`);
 
        // Send confirmation to client
        ws.send(JSON.stringify({ type: 'connected', message: 'Sensor stream active' }));
 
        // Initialize per-client simulation state
        const state = {
          userId,
          heartRate: 72,
          activityLevel: 65,
          lastMovementTime: Date.now(),
          hrHistory: [],    // Rolling window of last 20 HR values
          intervalId: null,
        };
        clientSessions.set(ws, state);
 
        // ── Start sensor simulation loop (every 1.5 seconds) ──
        state.intervalId = setInterval(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            clearInterval(state.intervalId);
            return;
          }
 
          // Generate new sensor reading
          const { heartRate, activityLevel } = simulateSensorReading(
            state.heartRate,
            state.activityLevel,
            'normal' // 'normal' | 'warning' | 'critical' — can be overridden by client message
          );
 
          state.heartRate    = heartRate;
          state.activityLevel = activityLevel;
 
          // Update movement tracking
          if (activityLevel > 30) {
            state.lastMovementTime = Date.now();
          }
          const secondsSinceLastMovement = Math.round((Date.now() - state.lastMovementTime) / 1000);
 
          // Determine movement status label
          let movementStatus = 'active';
          if (secondsSinceLastMovement > 3600) movementStatus = 'no_movement';
          else if (secondsSinceLastMovement > 1800) movementStatus = 'stationary';
          else if (secondsSinceLastMovement > 300) movementStatus = 'resting';
 
          // Maintain rolling HR history window
          state.hrHistory.push(heartRate);
          if (state.hrHistory.length > 20) state.hrHistory.shift();
 
          // Run AI analysis
          const analysis = analyzeVitals(
            { heartRate, activityLevel, secondsSinceLastMovement },
            state.hrHistory,
            {} // Default thresholds — could load from DB per user
          );
 
          // Build payload to send to frontend
          const payload = {
            type: 'vitals',
            data: {
              heartRate,
              activityLevel,
              movementStatus,
              secondsSinceLastMovement,
              riskLevel: analysis.status,
              issues: analysis.issues,
              riskScore: analysis.riskScore,
              timestamp: new Date().toISOString(),
            },
          };
 
          ws.send(JSON.stringify(payload));
 
        }, 1500); // Every 1.5 seconds
 
        // ── Handle messages from client (e.g. simulate critical) ──
        ws.on('message', (msg) => {
          try {
            const { type, mode } = JSON.parse(msg);
            if (type === 'simulate' && mode) {
              const s = clientSessions.get(ws);
              if (s) {
                // Force one abnormal reading on next tick
                const { heartRate, activityLevel } = simulateSensorReading(s.heartRate, s.activityLevel, mode);
                s.heartRate = heartRate;
                s.activityLevel = activityLevel;
                if (mode === 'critical' || mode === 'warning') {
                  s.lastMovementTime = Date.now() - (31 * 60 * 1000); // Fake 31 min inactivity
                }
              }
            }
          } catch (_) { /* ignore malformed messages */ }
        });
 
      } catch (err) {
        console.error('❌ WebSocket auth failed:', err.message);
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
        ws.close();
      }
    });
 
    // ── Cleanup on disconnect ──
    ws.on('close', () => {
      const state = clientSessions.get(ws);
      if (state) {
        clearInterval(state.intervalId);
        clientSessions.delete(ws);
        console.log(`🔌 WebSocket disconnected for user: ${state.userId}`);
      }
    });
 
    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  });
 
  return wss;
}
 
module.exports = { initWebSocketServer };
 