const db = require('../config/db.config');

const Vendor = {
    create: async (data) => {
        const query = `
            INSERT INTO vendor_master 
            (company_name, vendor_name, vendor_gmail, vendor_phone, vendor_address)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            data.company_name || null,
            data.vendor_name,
            data.vendor_gmail || null,
            data.vendor_phone,
            data.vendor_address || null
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM vendor_master ORDER BY created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM vendor_master WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE vendor_master SET 
            company_name = ?, vendor_name = ?, vendor_gmail = ?, vendor_phone = ?, vendor_address = ?
            WHERE id = ?
        `;
        const values = [
            data.company_name || null,
            data.vendor_name,
            data.vendor_gmail || null,
            data.vendor_phone,
            data.vendor_address || null,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM vendor_master WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Vendor;
