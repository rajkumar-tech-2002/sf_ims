const db = require('../config/db.config');

const CreditCollection = {
    save: async (data) => {
        const query = `
            INSERT INTO credit_collection 
            (credit_date, customer_name, customer_id, description, bill_no, paid_amount)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.credit_date,
            data.customer_name,
            data.customer_id,
            data.description,
            data.bill_no,
            data.paid_amount
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM credit_collection ORDER BY credit_date DESC, id DESC');
        return rows;
    },

    getCreditInvoices: async () => {
        const query = `
            SELECT invoice_no, customer_id, customer_name, grand_total 
            FROM invoice_master 
            WHERE credit = 'yes'
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};

module.exports = CreditCollection;
