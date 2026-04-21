// ============================================================
// models/User.js — Patient/User Schema
// Stores auth credentials + medical profile
// Passwords are hashed with bcrypt before saving
// ============================================================
 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  // SECURITY: Password stored as bcrypt hash (cost factor 12)
  // Plain text is NEVER stored in the database
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  age: {
    type: Number,
    min: 1,
    max: 120,
  },
  // Medical history as free text — in production this would be
  // encrypted at rest using AES-256 field-level encryption
  medicalHistory: {
    type: String,
    default: 'None provided',
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  // Monitoring settings
  heartRateUpperThreshold: { type: Number, default: 100 },
  heartRateLowerThreshold: { type: Number, default: 55 },
  inactivityThresholdMinutes: { type: Number, default: 30 },
}, {
  timestamps: true, // Adds createdAt, updatedAt
});
 
// ── Pre-save hook: hash password before storing ──
// Only runs if the password field was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
 
  // Salt rounds = 12 (higher = more secure but slower)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
 
// ── Instance method: compare entered password with hash ──
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
 
module.exports = mongoose.model('User', userSchema);
 