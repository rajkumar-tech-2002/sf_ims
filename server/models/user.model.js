const pool = require('../config/db.config');

const User = {
    findByUserId: async (user_id) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [user_id]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        if (!rows[0]) return null;
        return {
            ...rows[0],
            permissions: typeof rows[0].permissions === 'string' ? JSON.parse(rows[0].permissions) : rows[0].permissions
        };
    },

    getAll: async () => {
        const query = `
            SELECT id, user_name, user_role, qualification, department, 
                   user_id, contact, remark, status, permissions, created_at, updated_at,
                   basic_salary, bank_name, bank_account, ifsc_code, other_bank_account, join_date
            FROM users
        `;
        const [rows] = await pool.execute(query);
        return rows.map(r => ({ ...r, permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions }));
    },

    create: async (userData) => {
        const {
            user_name, user_role, qualification, department,
            user_id, password, contact, remark, status, permissions,
            basic_salary, bank_name, bank_account, ifsc_code, other_bank_account, join_date
        } = userData;

        const [result] = await pool.execute(
            `INSERT INTO users 
            (user_name, user_role, qualification, department, user_id, password, contact, remark, status, permissions, basic_salary, bank_name, bank_account, ifsc_code, other_bank_account, join_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_name ?? null,
                user_role ?? null,
                qualification ?? null,
                department ?? null,
                user_id ?? null,
                password ?? null,
                contact ?? null,
                remark ?? null,
                status ?? null,
                permissions ? JSON.stringify(permissions) : null,
                basic_salary || 0.00,
                bank_name ?? null,
                bank_account ?? null,
                ifsc_code ?? null,
                other_bank_account ?? null,
                join_date ?? null
            ]
        );
        return result.insertId;
    },

    updatePermissions: async (id, permissions) => {
        const [result] = await pool.execute(
            'UPDATE users SET permissions = ? WHERE id = ?',
            [JSON.stringify(permissions), id]
        );
        return result.affectedRows > 0;
    },

    getDistinctRoles: async () => {
        const [rows] = await pool.execute('SELECT DISTINCT user_role FROM users');
        return rows.map(row => row.user_role);
    },

    updateProfile: async (id, profileData) => {
        const { user_name, qualification, department, contact, remark } = profileData;
        const [result] = await pool.execute(
            'UPDATE users SET user_name = ?, qualification = ?, department = ?, contact = ?, remark = ? WHERE id = ?',
            [user_name, qualification, department, contact, remark, id]
        );
        return result.affectedRows > 0;
    },

    updatePassword: async (id, newPassword) => {
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = User;
