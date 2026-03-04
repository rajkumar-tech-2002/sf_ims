const db = require('../config/db.config');

const Purchase = {
    create: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert into purchase_master
            const [result] = await connection.execute(
                `INSERT INTO purchase_master 
                (purchase_date, product_code, product_name, vendor_name, qty, purchase_rate, sale_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [data.purchase_date, data.product_code, data.product_name, data.vendor_name, data.qty, data.purchase_rate, data.sale_rate]
            );

            // 2. Update stock_master (Increment)
            await connection.execute(
                `UPDATE stock_master SET qty = qty + ? WHERE product_code = ?`,
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

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM purchase_master ORDER BY purchase_date DESC, created_at DESC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM purchase_master WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE purchase_master SET 
            purchase_date = ?, product_code = ?, product_name = ?, vendor_name = ?, 
            qty = ?, purchase_rate = ?, sale_rate = ?
            WHERE id = ?
        `;
        const values = [
            data.purchase_date,
            data.product_code,
            data.product_name,
            data.vendor_name,
            data.qty,
            data.purchase_rate,
            data.sale_rate,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Get current qty to revert
            const [rows] = await connection.execute('SELECT product_code, qty FROM purchase_master WHERE id = ?', [id]);
            if (rows.length > 0) {
                const { product_code, qty } = rows[0];
                // 2. Decrement stock
                await connection.execute(
                    'UPDATE stock_master SET qty = qty - ? WHERE product_code = ?',
                    [qty, product_code]
                );
            }

            // 3. Delete record
            const [result] = await connection.execute('DELETE FROM purchase_master WHERE id = ?', [id]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = Purchase;
