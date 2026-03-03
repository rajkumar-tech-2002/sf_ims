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
    const { user_name, user_role, qualification, department, user_id, password, contact, remark, status } = req.body;

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
            status: status || 'Active'
        });

        res.status(201).json({ message: 'User created successfully', id: newUserId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, createUser };
