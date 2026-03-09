const db = require('../config/db.config');

const ScaleUnit = {
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM scale_units ORDER BY unit_name ASC');
        return rows;
    },

    getByName: async (name) => {
        const [rows] = await db.execute('SELECT * FROM scale_units WHERE LOWER(unit_name) = LOWER(?)', [name]);
        return rows[0];
    },

    create: async (name) => {
        const [result] = await db.execute('INSERT INTO scale_units (unit_name) VALUES (?)', [name]);
        return result.insertId;
    }
};

module.exports = ScaleUnit;
