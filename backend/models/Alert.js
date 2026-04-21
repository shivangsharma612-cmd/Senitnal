// ============================================================
// models/Alert.js — Alert History Schema
// Records every alert triggered by the AI detection engine
// ============================================================
 
const mongoose = require('mongoose');
 
const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // What triggered the alert
  message: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['warning', 'critical'],
    required: true,
  },
  // The vital values at the time of the alert
  vitalSnapshot: {
    heartRate: Number,
    activityLevel: Number,
    movementStatus: String,
  },
  // How the alert was resolved
  response: {
    type: String,
    enum: ['acknowledged', 'emergency_sent', 'timeout', 'pending'],
    default: 'pending',
  },
  // Symptoms reported by user after acknowledging the alert
  reportedSymptoms: [{
    type: String,
  }],
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});
 
alertSchema.index({ userId: 1, createdAt: -1 });
 
module.exports = mongoose.model('Alert', alertSchema);
 