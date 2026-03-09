const pool = require('../config/db.config');

const User = {
    findByUserId: async (user_id) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [user_id]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    getAll: async () => {
        const [rows] = await pool.execute('SELECT id, user_name, user_role, qualification, department, user_id, contact, remark, status, created_at, updated_at FROM users');
        return rows;
    },

    create: async (userData) => {
        const {
            user_name, user_role, qualification, department,
            user_id, password, contact, remark, status
        } = userData;

        const [result] = await pool.execute(
            'INSERT INTO users (user_name, user_role, qualification, department, user_id, password, contact, remark, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                user_name ?? null,
                user_role ?? null,
                qualification ?? null,
                department ?? null,
                user_id ?? null,
                password ?? null,
                contact ?? null,
                remark ?? null,
                status ?? null
            ]
        );
        return result.insertId;
    },

    getDistinctRoles: async () => {
        const [rows] = await pool.execute('SELECT DISTINCT user_role FROM users');
        return rows.map(row => row.user_role);
    },

    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = User;
