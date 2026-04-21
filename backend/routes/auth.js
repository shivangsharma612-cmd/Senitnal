// ============================================================
// routes/auth.js — Authentication Routes
// POST /api/auth/register  — create new account
// POST /api/auth/login     — login and get JWT
// GET  /api/auth/me        — get current user profile
// PUT  /api/auth/me        — update user profile
// ============================================================

const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate signed JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h', // Token expires after 24 hours
  });
};

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, medicalHistory, emergencyContact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user — password will be hashed by the pre-save hook in User.js
    const user = await User.create({
      name,
      email,
      password,       // Gets hashed automatically
      age,
      medicalHistory,
      emergencyContact,
    });

    // Return user data + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      medicalHistory: user.medicalHistory,
      emergencyContact: user.emergencyContact,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password with stored bcrypt hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      medicalHistory: user.medicalHistory,
      emergencyContact: user.emergencyContact,
      heartRateUpperThreshold: user.heartRateUpperThreshold,
      heartRateLowerThreshold: user.heartRateLowerThreshold,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ── GET /api/auth/me (protected) ──
router.get('/me', protect, async (req, res) => {
  // req.user is attached by the protect middleware
  res.json(req.user);
});

// ── PUT /api/auth/me (protected) — update profile ──
router.put('/me', protect, async (req, res) => {
  try {
    const { name, age, medicalHistory, emergencyContact, heartRateUpperThreshold, heartRateLowerThreshold } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, age, medicalHistory, emergencyContact, heartRateUpperThreshold, heartRateLowerThreshold },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed' });
  }
});

module.exports = router;