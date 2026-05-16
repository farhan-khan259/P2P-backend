const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { adminDashboard, userDashboard, adminFullDashboard } = require('../controllers/dashboardController');

const router = express.Router();

// Admin metrics
router.get('/admin', protect, authorize('admin'), adminDashboard);

// Full admin stats for legacy admin dashboard UI
router.get('/admin/full', protect, authorize('admin'), adminFullDashboard);

// User metrics
router.get('/user', protect, userDashboard);

module.exports = router;
