// ============================================================
// routes/vitals.js — Vital Readings API
// POST /api/vitals         — save a reading (called by WS or client)
// GET  /api/vitals         — get recent readings for charts
// GET  /api/vitals/stats   — get aggregated stats (avg, min, max)
// ============================================================
 
const express       = require('express');
const VitalReading  = require('../models/VitalReading');
const { protect }   = require('../middleware/auth');
 
const router = express.Router();
 
// All routes require authentication
router.use(protect);
 
// ── POST /api/vitals — Save a new vital reading ──
router.post('/', async (req, res) => {
  try {
    const {
      heartRate,
      activityLevel,
      movementStatus,
      secondsSinceLastMovement,
      riskLevel,
    } = req.body;
 
    const reading = await VitalReading.create({
      userId: req.user._id,
      heartRate,
      activityLevel,
      movementStatus: movementStatus || 'active',
      secondsSinceLastMovement: secondsSinceLastMovement || 0,
      riskLevel: riskLevel || 'normal',
    });
 
    res.status(201).json(reading);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save vital reading' });
  }
});
 
// ── GET /api/vitals — Get recent readings for the logged-in user ──
// Query params: ?limit=100&hours=24
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
 
    const readings = await VitalReading.find({
      userId: req.user._id,
      recordedAt: { $gte: since },
    })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();
 
    res.json(readings.reverse()); // Return in chronological order
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vitals' });
  }
});
 
// ── GET /api/vitals/stats — Aggregated stats for the report page ──
router.get('/stats', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
 
    const stats = await VitalReading.aggregate([
      { $match: { userId: req.user._id, recordedAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          avgHeartRate:  { $avg: '$heartRate' },
          minHeartRate:  { $min: '$heartRate' },
          maxHeartRate:  { $max: '$heartRate' },
          avgActivity:   { $avg: '$activityLevel' },
          totalReadings: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$riskLevel', 'critical'] }, 1, 0] },
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ['$riskLevel', 'warning'] }, 1, 0] },
          },
        },
      },
    ]);
 
    res.json(stats[0] || {
      avgHeartRate: 0, minHeartRate: 0, maxHeartRate: 0,
      avgActivity: 0, totalReadings: 0, criticalCount: 0, warningCount: 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});
 
module.exports = router;
 