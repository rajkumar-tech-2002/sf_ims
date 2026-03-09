const db = require('../config/db.config');

const Transaction = {
    create: async (data) => {
        const query = `
            INSERT INTO transaction_master 
            (transaction_date, vendor_name, description, cash_type, bill_no, buy, paid)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.transaction_date,
            data.vendor_name,
            data.description || '',
            data.cash_type,
            data.bill_no || '',
            data.buy || 0,
            data.paid || 0
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM transaction_master ORDER BY transaction_date DESC, id DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM transaction_master WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE transaction_master SET 
            transaction_date = ?, vendor_name = ?, description = ?, 
            cash_type = ?, bill_no = ?, buy = ?, paid = ?
            WHERE id = ?
        `;
        const values = [
            data.transaction_date,
            data.vendor_name,
            data.description || '',
            data.cash_type,
            data.bill_no || '',
            data.buy || 0,
            data.paid || 0,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM transaction_master WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Transaction;
