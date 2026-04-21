// ============================================================
// routes/alerts.js — Alert History API
// POST /api/alerts          — create alert record
// GET  /api/alerts          — get alert history
// PUT  /api/alerts/:id      — update alert response
// ============================================================
 
const express  = require('express');
const Alert    = require('../models/Alert');
const { protect } = require('../middleware/auth');
 
const router = express.Router();
router.use(protect);
 
// POST — Create new alert
router.post('/', async (req, res) => {
  try {
    const { message, level, vitalSnapshot } = req.body;
    const alert = await Alert.create({
      userId: req.user._id,
      message,
      level,
      vitalSnapshot,
    });
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create alert' });
  }
});
 
// GET — Fetch all alerts for this user
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});
 
// PUT — Update alert with user response
router.put('/:id', async (req, res) => {
  try {
    const { response, reportedSymptoms } = req.body;
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { response, reportedSymptoms, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update alert' });
  }
});
 
module.exports = router;
 