const db = require('../config/db.config');

const StockReturn = {
    getNextReturnNo: async () => {
        const [rows] = await db.execute('SELECT return_no FROM stock_return_master ORDER BY id DESC LIMIT 1');
        if (rows.length === 0) return 'SR-0001';

        const lastNo = rows[0].return_no;
        const match = lastNo.match(/SR-(\d+)/);
        const nextNum = match ? parseInt(match[1]) + 1 : 1;
        return `SR-${String(nextNum).padStart(4, '0')}`;
    },

    save: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert into stock_return_master
            const masterQuery = `
                INSERT INTO stock_return_master 
                (return_no, return_date, bill_no, customer_id, customer_name, mobile_no, total_amount, is_credit)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const masterValues = [
                data.return_no,
                data.return_date,
                data.bill_no,
                data.customer_id,
                data.customer_name,
                data.mobile_no,
                data.total_amount,
                data.is_credit ? 1 : 0
            ];
            const [masterResult] = await connection.execute(masterQuery, masterValues);
            const returnId = masterResult.insertId;

            // 2. Insert items and update stock
            const itemQuery = `
                INSERT INTO stock_return_items 
                (return_id, product_code, product_name, bill_date, discount_percent, return_qty, amount, stock_at_return)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            for (const item of data.items) {
                const itemValues = [
                    returnId,
                    item.product_code,
                    item.product_name,
                    item.bill_date,
                    item.discount_percent,
                    item.return_qty,
                    item.amount,
                    item.stock_at_return
                ];
                await connection.execute(itemQuery, itemValues);

                // 3. Update stock_master (Restock)
                const stockUpdateQuery = `
                    UPDATE stock_master 
                    SET qty = qty + ? 
                    WHERE product_code = ?
                `;
                await connection.execute(stockUpdateQuery, [item.return_qty, item.product_code]);
            }

            await connection.commit();
            return returnId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM stock_return_master ORDER BY created_at DESC');
        return rows;
    }
};

module.exports = StockReturn;
