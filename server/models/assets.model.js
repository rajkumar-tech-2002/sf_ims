const db = require('../config/db.config');

const Assets = {
    create: async (data) => {
        const query = `
            INSERT INTO assets_master 
            (entry_date, asset_name, description, qty, rate, amount)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.entry_date,
            data.asset_name,
            data.description || null,
            data.qty || 0,
            data.rate || 0,
            data.amount || 0
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM assets_master ORDER BY entry_date DESC, created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM assets_master WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE assets_master SET 
            entry_date = ?, asset_name = ?, description = ?, qty = ?, rate = ?, amount = ?
            WHERE id = ?
        `;
        const values = [
            data.entry_date,
            data.asset_name,
            data.description || null,
            data.qty || 0,
            data.rate || 0,
            data.amount || 0,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM assets_master WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    getDistinctNames: async () => {
        const [rows] = await db.execute('SELECT DISTINCT asset_name FROM assets_master WHERE asset_name IS NOT NULL AND asset_name != ""');
        return rows.map(row => row.asset_name);
    }
};

module.exports = Assets;
