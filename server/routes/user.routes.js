const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser } = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Protect all user routes for admin only
router.get('/', authMiddleware, roleMiddleware(['Admin']), getAllUsers);
router.post('/add', authMiddleware, roleMiddleware(['Admin']), createUser);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteUser);

module.exports = router;
