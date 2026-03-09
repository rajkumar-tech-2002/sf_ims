const pool = require('../config/db.config');

const Customer = {
    getAll: async () => {
        const [rows] = await pool.execute('SELECT * FROM customer_details ORDER BY created_at DESC');
        return rows;
    },

    getNextCustomerId: async () => {
        const [rows] = await pool.execute('SELECT customer_id FROM customer_details ORDER BY id DESC LIMIT 1');
        if (rows.length === 0) return 'CUST-001';

        const lastId = rows[0].customer_id;
        const match = lastId.match(/CUST-(\d+)/);
        if (!match) return 'CUST-001';

        const lastNumber = parseInt(match[1]);
        const nextNumber = lastNumber + 1;
        return `CUST-${String(nextNumber).padStart(3, '0')}`;
    },

    findById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM customer_details WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const query = `
            INSERT INTO customer_details 
            (customer_id, customer_name, customer_address, customer_contact, customer_mobile, gst_no, state, state_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.customer_id,
            data.customer_name,
            data.customer_address,
            data.customer_contact,
            data.customer_mobile,
            data.gst_no,
            data.state,
            data.state_code
        ];
        const [result] = await pool.execute(query, values);
        return result.insertId;
    },

    update: async (id, data) => {
        const query = `
            UPDATE customer_details SET 
            customer_id = ?, customer_name = ?, customer_address = ?, 
            customer_contact = ?, customer_mobile = ?, gst_no = ?, 
            state = ?, state_code = ?
            WHERE id = ?
        `;
        const values = [
            data.customer_id,
            data.customer_name,
            data.customer_address,
            data.customer_contact,
            data.customer_mobile,
            data.gst_no,
            data.state,
            data.state_code,
            id
        ];
        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM customer_details WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Customer;
