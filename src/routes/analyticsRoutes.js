const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/pages
router.get('/pages', analyticsController.getAllPages);

// GET /api/analytics/page/:path
router.get('/page/:path', analyticsController.getPageByPath);

module.exports = router;
