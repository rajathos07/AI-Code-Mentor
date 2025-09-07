const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Log activity
router.post('/log', async (req, res) => {
  const { userId, action, details } = req.body;

  console.log("📩 Incoming activity:", { userId, action, details }); // ✅ moved here

  try {
    const newActivity = new Activity({ userId, action, details });
    await newActivity.save();
    res.status(201).json({ message: 'Activity logged', activity: newActivity });
  } catch (error) {
    console.error("❌ Activity log failed:", error);
    res.status(500).json({ message: 'Failed to log activity', error });
  }
});

// Get activity by user
router.get('/:userId', async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity history', error });
  }
});

module.exports = router;
