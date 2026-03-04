const db = require('../config/db.config');

const ProductUsed = {
    create: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert into product_used
            const [result] = await connection.execute(
                `INSERT INTO product_used (used_date, product_code, product_name, description, qty) 
                 VALUES (?, ?, ?, ?, ?)`,
                [data.used_date, data.product_code, data.product_name, data.description, data.qty]
            );

            // 2. Update stock_master (Decrement)
            await connection.execute(
                `UPDATE stock_master SET qty = qty - ? WHERE product_code = ?`,
                [data.qty, data.product_code]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM product_used ORDER BY used_date DESC, created_at DESC');
        return rows;
    },

    delete: async (id) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Get the record to know how much to add back to stock
            const [rows] = await connection.execute('SELECT product_code, qty FROM product_used WHERE id = ?', [id]);
            if (rows.length > 0) {
                const { product_code, qty } = rows[0];
                // 2. Revert stock
                await connection.execute(
                    'UPDATE stock_master SET qty = qty + ? WHERE product_code = ?',
                    [qty, product_code]
                );
            }

            // 3. Delete record
            await connection.execute('DELETE FROM product_used WHERE id = ?', [id]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = ProductUsed;
