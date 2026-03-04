const pool = require('../config/db.config');

const LogDetail = {
    getAll: async () => {
        const [rows] = await pool.execute('SELECT * FROM log_details ORDER BY login_date DESC');
        return rows;
    },

    create: async (logData) => {
        const { username, role, action } = logData;
        const [result] = await pool.execute(
            'INSERT INTO log_details (username, role, action) VALUES (?, ?, ?)',
            [username, role, action]
        );
        return result.insertId;
    }
};

module.exports = LogDetail;
