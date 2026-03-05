const db = require('../config/db.config');

const Stock = {
    create: async (data) => {
        const query = `
            INSERT INTO stock_master 
            (hsn_code, product_code, product_name, detail, qty, sale_price, scale, gst, discount_percent, reorder_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.hsn_code,
            data.product_code,
            data.product_name,
            data.detail,
            data.qty,
            data.sale_price,
            data.scale,
            data.gst,
            data.discount_percent,
            data.reorder_level
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM stock_master ORDER BY created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM stock_master WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE stock_master SET 
            hsn_code = ?, product_code = ?, product_name = ?, detail = ?, 
            qty = ?, sale_price = ?, scale = ?, gst = ?, 
            discount_percent = ?, reorder_level = ?
            WHERE id = ?
        `;
        const values = [
            data.hsn_code,
            data.product_code,
            data.product_name,
            data.detail,
            data.qty,
            data.sale_price,
            data.scale,
            data.gst,
            data.discount_percent,
            data.reorder_level,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM stock_master WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    findLowStock: async () => {
        const query = `
            SELECT id, product_name, product_code, qty, reorder_level, scale 
            FROM stock_master 
            WHERE qty <= reorder_level 
            ORDER BY qty ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};

module.exports = Stock;
