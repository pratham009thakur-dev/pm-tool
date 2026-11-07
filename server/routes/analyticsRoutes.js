const express = require('express');
const router = express.Router();
const { getDashboardStats, getProjectAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/project/:projectId', getProjectAnalytics);

module.exports = router;