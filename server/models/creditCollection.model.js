const db = require('../config/db.config');

const CreditCollection = {
    save: async (data) => {
        const query = `
            INSERT INTO credit_collection 
            (credit_id, credit_date, customer_name, customer_id, description, bill_no, paid_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.credit_id,
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

    getLastCreditId: async () => {
        const [rows] = await db.execute('SELECT credit_id FROM credit_collection ORDER BY id DESC LIMIT 1');
        return rows[0]?.credit_id || null;
    },

    getCreditInvoices: async () => {
        const query = `
            SELECT invoice_no, customer_id, customer_name, grand_total 
            FROM invoice_master 
            WHERE credit = 'yes'
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    getCustomerReport: async (customerId) => {
        // Query to get invoices and their total matched payments, 
        // plus unmatched payments (on-account)
        const query = `
            SELECT 
                im.invoice_date AS date, 
                COALESCE(cc_sum.credit_id, '-') AS credit_id,
                CASE 
                    WHEN cc_sum.description IS NULL THEN CONCAT('Invoice: ', im.invoice_no)
                    ELSE cc_sum.description
                END AS description, 
                im.grand_total AS bill_amount, 
                COALESCE(cc_sum.total_paid, 0) AS paid_amount,
                'invoice' AS type,
                im.created_at
            FROM invoice_master im
            LEFT JOIN (
                SELECT bill_no, 
                       GROUP_CONCAT(DISTINCT credit_id SEPARATOR ', ') AS credit_id,
                       GROUP_CONCAT(DISTINCT description SEPARATOR '; ') AS description,
                       SUM(paid_amount) AS total_paid
                FROM credit_collection
                WHERE customer_id = ? AND bill_no IS NOT NULL AND bill_no != ''
                GROUP BY bill_no
            ) cc_sum ON im.invoice_no = cc_sum.bill_no
            WHERE im.customer_id = ? AND im.credit = 'yes'

            UNION ALL

            SELECT 
                cc.credit_date AS date, 
                cc.credit_id,
                cc.description, 
                0 AS bill_amount, 
                cc.paid_amount,
                'payment' AS type,
                cc.created_at
            FROM credit_collection cc
            WHERE cc.customer_id = ? AND (cc.bill_no IS NULL OR cc.bill_no = '')

            ORDER BY date ASC, created_at ASC
        `;
        const [rows] = await db.execute(query, [customerId, customerId, customerId]);
        return rows;
    }
};

module.exports = CreditCollection;
