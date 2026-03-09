const db = require('../config/db.config');

const Enquiry = {
    create: async (data) => {
        const query = `
            INSERT INTO enquiry_details 
            (enquiry_date, regarding, description, person, contact, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.enquiry_date,
            data.regarding,
            data.description,
            data.person,
            data.contact,
            data.remarks
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM enquiry_details ORDER BY enquiry_date DESC, created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM enquiry_details WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE enquiry_details SET 
            enquiry_date = ?, regarding = ?, description = ?, 
            person = ?, contact = ?, remarks = ?
            WHERE id = ?
        `;
        const values = [
            data.enquiry_date,
            data.regarding,
            data.description,
            data.person,
            data.contact,
            data.remarks,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM enquiry_details WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Enquiry;
