const db = require('../config/db.config');

const RawMaterialStock = {
    create: async (data) => {
        const query = `
            INSERT INTO raw_material_stock_master 
            (hsn_code, product_code, product_name, detail, qty, price_rate, scale, gst, reorder_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.hsn_code,
            data.product_code,
            data.product_name,
            data.detail,
            data.qty || 0,
            data.price_rate || 0.00,
            data.scale,
            data.gst || 0.00,
            data.reorder_level || 0
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM raw_material_stock_master ORDER BY created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM raw_material_stock_master WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE raw_material_stock_master SET 
            hsn_code = ?, product_code = ?, product_name = ?, detail = ?, 
            qty = ?, price_rate = ?, scale = ?, gst = ?, 
            reorder_level = ?
            WHERE id = ?
        `;
        const values = [
            data.hsn_code,
            data.product_code,
            data.product_name,
            data.detail,
            data.qty,
            data.price_rate,
            data.scale,
            data.gst,
            data.reorder_level,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM raw_material_stock_master WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = RawMaterialStock;
