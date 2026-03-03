const express = require('express');
const router = express.Router();
const { login, logout, getMe, getRoles } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.get('/roles', getRoles);

module.exports = router;
