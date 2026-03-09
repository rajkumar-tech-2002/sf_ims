const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
// const { auth } = require('../middleware/auth.middleware'); // Assuming you have auth middleware

router.get('/', logController.getAllLogs);

module.exports = router;
