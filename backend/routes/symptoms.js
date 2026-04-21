// ============================================================
// routes/symptoms.js — Symptom Tracking API
// POST /api/symptoms  — log symptoms
// GET  /api/symptoms  — get symptom history
// ============================================================
 
const express   = require('express');
const Symptom   = require('../models/Symptom');
const { protect } = require('../middleware/auth');
 
const router = express.Router();
router.use(protect);
 
// POST — Log a new symptom entry
router.post('/', async (req, res) => {
  try {
    const { symptoms, notes, source, alertId, severity } = req.body;
 
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'At least one symptom required' });
    }
 
    const entry = await Symptom.create({
      userId: req.user._id,
      symptoms,
      notes: notes || '',
      source: source || 'manual',
      alertId: alertId || null,
      severity: severity || 'mild',
    });
 
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log symptoms' });
  }
});
 
// GET — Fetch symptom history
router.get('/', async (req, res) => {
  try {
    const entries = await Symptom.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch symptoms' });
  }
});
 
module.exports = router;