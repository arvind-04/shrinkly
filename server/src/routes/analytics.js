const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, analyticsController.getDashboardStats);
router.get('/clicks', auth, analyticsController.getClicksOverTime);
router.get('/countries', auth, analyticsController.getTopCountries);
router.get('/devices', auth, analyticsController.getTopDevices);
router.get('/browsers', auth, analyticsController.getTopBrowsers);
router.get('/referrers', auth, analyticsController.getTopReferrers);

module.exports = router;
