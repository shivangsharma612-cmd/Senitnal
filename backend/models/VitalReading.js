// ============================================================
// models/VitalReading.js — Sensor Data Schema
// Each document = one snapshot from the simulated sensors
// ============================================================
 
const mongoose = require('mongoose');
 
const vitalReadingSchema = new mongoose.Schema({
  // Reference to which patient this reading belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Heart rate in beats per minute
  heartRate: {
    type: Number,
    required: true,
    min: 0,
    max: 300,
  },
  // Activity level as a percentage 0–100
  activityLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  // Movement status derived from accelerometer simulation
  movementStatus: {
    type: String,
    enum: ['active', 'resting', 'stationary', 'no_movement'],
    default: 'active',
  },
  // Seconds since last detected movement
  secondsSinceLastMovement: {
    type: Number,
    default: 0,
  },
  // AI-determined risk level for this reading
  riskLevel: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal',
  },
  // Timestamp of reading (not createdAt — sensor time)
  recordedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // TTL index — auto-delete readings older than 7 days to save space
  // In production you'd move old data to cold storage / archive
  expireAfterSeconds: 604800, // 7 days
});
 
// Index for efficient time-range queries per user
vitalReadingSchema.index({ userId: 1, recordedAt: -1 });
 
module.exports = mongoose.model('VitalReading', vitalReadingSchema);
 