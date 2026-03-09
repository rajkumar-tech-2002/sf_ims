const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, updatePermissions, getRoles } = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Protect all user routes for admin only
router.get('/', authMiddleware, roleMiddleware(['Admin']), getAllUsers);
router.get('/roles', authMiddleware, roleMiddleware(['Admin']), getRoles);
router.post('/add', authMiddleware, roleMiddleware(['Admin']), createUser);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteUser);
router.put('/:id/permissions', authMiddleware, roleMiddleware(['Admin']), updatePermissions);

module.exports = router;
