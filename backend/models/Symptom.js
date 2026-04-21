// ============================================================
// models/Symptom.js — Symptom Log Schema
// Stores user-reported symptoms (from alert response or manual)
// ============================================================
 
const mongoose = require('mongoose');
 
const symptomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // List of symptoms checked by the user
  symptoms: [{
    type: String,
    enum: [
      'dizziness',
      'chest pain',
      'shortness of breath',
      'headache',
      'fatigue',
      'nausea',
      'palpitations',
      'blurred vision',
      'weakness',
      'other',
    ],
  }],
  // free-text notes
  notes: {
    type: String,
    default: '',
  },
  // Was this logged after an alert or manually by the user?
  source: {
    type: String,
    enum: ['alert_response', 'manual'],
    default: 'manual',
  },
  // Link to the alert that triggered this (optional)
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    default: null,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'mild',
  },
}, {
  timestamps: true,
});
 
symptomSchema.index({ userId: 1, createdAt: -1 });
 
module.exports = mongoose.model('Symptom', symptomSchema);
 