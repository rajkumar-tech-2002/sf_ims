const pool = require('../config/db.config');

const SalarySlip = {
    getAll: async (month, year) => {
        let query = `
            SELECT s.*, e.user_name as employee_name, e.user_id as employee_id_string 
            FROM salary_slips s
            JOIN users e ON s.employee_id = e.id
        `;
        const params = [];

        if (month && year) {
            query += ' WHERE s.month = ? AND s.year = ?';
            params.push(month, year);
        }
        
        query += ' ORDER BY s.year DESC, s.month DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    generate: async (salaryData) => {
        const {
            employee_id, month, year, basic_salary, 
            allowances, deductions, net_salary, payment_status
        } = salaryData;

        const [result] = await pool.execute(
            `INSERT INTO salary_slips 
            (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            basic_salary = VALUES(basic_salary),
            allowances = VALUES(allowances),
            deductions = VALUES(deductions),
            net_salary = VALUES(net_salary),
            payment_status = IF(payment_status = 'Paid', payment_status, VALUES(payment_status))`,
            [employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status || 'Pending']
        );
        return result.insertId || true;
    },

    updatePaymentStatus: async (id, status, date) => {
        const [result] = await pool.execute(
            'UPDATE salary_slips SET payment_status = ?, payment_date = ? WHERE id = ?',
            [status, date, id]
        );
        return result.affectedRows > 0;
    },
    
    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM salary_slips WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = SalarySlip;
