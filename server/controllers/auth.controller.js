const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const LogDetail = require('../models/log.model');

const login = async (req, res) => {
    const { user_id, password, user_role } = req.body;

    try {
        const user = await User.findByUserId(user_id);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid user ID, password, or role' });
        }

        // Strictly verify password and role
        if (password !== user.password || user_role !== user.user_role) {
            console.log('Password or role mismatch');
            return res.status(401).json({ message: 'Invalid user ID, password, or role' });
        }

        // Record log detail
        await LogDetail.create({
            username: user.user_name,
            role: user.user_role,
            action: `User ${user.user_name} logged in successfully`
        });

        const payload = {
            id: user.id,
            user_id: user.user_id,
            user_role: user.user_role,
            user_name: user.user_name,
            permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || {})
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                user_name: user.user_name,
                user_role: user.user_role,
                user_id: user.user_id,
                permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || {})
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            user: {
                id: user.id,
                user_name: user.user_name,
                user_role: user.user_role,
                user_id: user.user_id,
                permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || {})
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await User.getDistinctRoles();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, logout, getMe, getRoles };
