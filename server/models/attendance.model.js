const pool = require('../config/db.config');

const Attendance = {
    getAll: async (month, year) => {
        let query = `
            SELECT a.*, e.user_name as employee_name, e.user_id as employee_id_string 
            FROM attendance a
            JOIN users e ON a.employee_id = e.id
        `;
        const params = [];

        if (month && year) {
            query += ' WHERE MONTH(a.date) = ? AND YEAR(a.date) = ?';
            params.push(month, year);
        }
        
        query += ' ORDER BY a.date DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    getByEmployeeAndMonth: async (employee_id, month, year) => {
        const [rows] = await pool.execute(
            'SELECT * FROM attendance WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?',
            [employee_id, month, year]
        );
        return rows;
    },

    markAttendance: async (attendanceData) => {
        const { employee_id, date, status } = attendanceData;
        
        // Use ON DUPLICATE KEY UPDATE to handle both insert and update
        const [result] = await pool.execute(
            `INSERT INTO attendance (employee_id, date, status) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [employee_id, date, status]
        );
        return result.insertId || true; // ON DUPLICATE KEY might return true for update
    },
    
    delete: async (id) => {
         const [result] = await pool.execute('DELETE FROM attendance WHERE id = ?', [id]);
         return result.affectedRows > 0;
    }
};

module.exports = Attendance;
