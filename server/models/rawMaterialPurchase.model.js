const db = require('../config/db.config');

const RawMaterialPurchase = {
    create: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Calculate amounts on backend to be safe
            // Quantities and rates should be handled as per user requirement:
            // total_amount = normal_amount + gst_amount
            // gst_amount = GST percentage of normal_amount
            // normal_amount = total_amount - gst_amount (Wait, user said normal_amount = total - gst)
            // Example: Qty=6, Rate=50 -> normal_amount = 300. GST=2% -> gst_amount = 6. total_amount = 306.

            const normal_amount = (data.purchase_qty || 0) * (data.purchase_rate || 0);
            const gst_amount = normal_amount * ((data.gst_percent || 0) / 100);
            const total_amount = normal_amount + gst_amount;

            // 1. Insert into raw_material_purchase_master
            const [result] = await connection.execute(
                `INSERT INTO raw_material_purchase_master 
                (purchase_date, product_code, product_name, vendor_name, bill_no, purchase_qty, purchase_rate, gst_percent, normal_amount, gst_amount, total_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.purchase_date,
                    data.product_code,
                    data.product_name,
                    data.vendor_name,
                    data.bill_no,
                    data.purchase_qty,
                    data.purchase_rate,
                    data.gst_percent,
                    normal_amount,
                    gst_amount,
                    total_amount
                ]
            );

            // 2. Update raw_material_stock_master (Increment)
            await connection.execute(
                `UPDATE raw_material_stock_master SET qty = qty + ? WHERE product_code = ?`,
                [data.purchase_qty, data.product_code]
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
        const [rows] = await db.execute('SELECT * FROM raw_material_purchase_master ORDER BY purchase_date DESC, created_at DESC');
        return rows;
    },

    delete: async (id) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Get current qty to revert
            const [rows] = await connection.execute('SELECT product_code, purchase_qty FROM raw_material_purchase_master WHERE id = ?', [id]);
            if (rows.length > 0) {
                const { product_code, purchase_qty } = rows[0];
                // 2. Decrement stock
                await connection.execute(
                    'UPDATE raw_material_stock_master SET qty = qty - ? WHERE product_code = ?',
                    [purchase_qty, product_code]
                );
            }

            // 3. Delete record
            const [result] = await connection.execute('DELETE FROM raw_material_purchase_master WHERE id = ?', [id]);

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

module.exports = RawMaterialPurchase;
