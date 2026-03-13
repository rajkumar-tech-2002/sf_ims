const express = require('express');
const router = express.Router();
const { login, logout, getMe, getRoles, updateProfile, changePassword } = require('../controllers/auth.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', optionalAuthMiddleware, getMe);
router.get('/roles', getRoles);
router.put('/update-profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
