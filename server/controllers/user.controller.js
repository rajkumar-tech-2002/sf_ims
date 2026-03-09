const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    const { user_name, user_role, qualification, department, user_id, password, contact, remark, status, permissions } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findByUserId(user_id);
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        // Create new user (should hash password if needed)
        const newUserId = await User.create({
            user_name,
            user_role,
            qualification,
            department,
            user_id,
            password, // Save as plain text for now or hash
            contact,
            remark,
            status: status || 'Active',
            permissions: permissions || {}
        });

        res.status(201).json({ message: 'User created successfully', id: newUserId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const success = await User.delete(req.params.id);
        if (success) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePermissions = async (req, res) => {
    try {
        const success = await User.updatePermissions(req.params.id, req.body.permissions);
        if (success) {
            res.json({ message: 'Permissions updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await User.getDistinctRoles();
        res.json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, createUser, deleteUser, updatePermissions, getRoles };
