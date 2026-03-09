const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/daily', reportController.getDailyReport);
router.get('/cashbook', reportController.getCashBookReport);

module.exports = router;
