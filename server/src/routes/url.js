const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const auth = require('../middleware/auth');
const { urlCreationLimiter } = require('../middleware/rateLimiter');

router.post('/', auth, urlCreationLimiter, urlController.createShortUrl);
router.get('/', auth, urlController.getUserUrls);
router.get('/:id/stats', auth, urlController.getUrlStats);
router.delete('/:id', auth, urlController.deleteUrl);

module.exports = router;
