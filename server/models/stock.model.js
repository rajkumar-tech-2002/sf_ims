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
    },

    getDailyReport: async (fromDate, toDate) => {
        const query = `
            SELECT 
                sm.product_code, 
                sm.product_name, 
                sm.detail as description,
                sm.qty as current_stock,
                COALESCE(p.purchase_qty, 0) as purchase_qty,
                COALESCE(s.sold_qty, 0) as sold_qty
            FROM stock_master sm
            LEFT JOIN (
                SELECT product_code, SUM(qty) as purchase_qty 
                FROM purchase_master 
                WHERE DATE(purchase_date) BETWEEN ? AND ?
                GROUP BY product_code
            ) p ON sm.product_code = p.product_code
            LEFT JOIN (
                SELECT product_code, SUM(qty) as sold_qty 
                FROM invoice_items ii
                JOIN invoice_master im ON ii.invoice_id = im.id
                WHERE DATE(im.invoice_date) BETWEEN ? AND ?
                GROUP BY product_code
            ) s ON sm.product_code = s.product_code
            WHERE COALESCE(p.purchase_qty, 0) > 0 OR COALESCE(s.sold_qty, 0) > 0 OR sm.qty > 0
            ORDER BY sm.product_name ASC
        `;
        const [rows] = await db.execute(query, [fromDate, toDate, fromDate, toDate]);
        return rows;
    },

    getCashBookReport: async (fromDate, toDate, type) => {
        let query = '';
        let params = [];

        if (type === 'Cash') {
            query = `
                (
                    SELECT 
                        invoice_date as trans_date, 
                        customer_name as type_name, 
                        'INVOICE' as source,
                        subtotal as income, 
                        0 as expense
                    FROM invoice_master
                    WHERE DATE(invoice_date) BETWEEN ? AND ?
                )
                UNION ALL
                (
                    SELECT 
                        income_expense_date as trans_date, 
                        details as type_name, 
                        'IE' as source,
                        income, 
                        expense
                    FROM income_expense
                    WHERE (DATE(income_expense_date) BETWEEN ? AND ?)
                    AND income_expense_type = 'Cash'
                )
                ORDER BY trans_date ASC
            `;
            params = [fromDate, toDate, fromDate, toDate];
        } else {
            // Cheque only from income_expense
            query = `
                SELECT 
                    income_expense_date as trans_date, 
                    details as type_name, 
                    'IE' as source,
                    income, 
                    expense
                FROM income_expense
                WHERE (DATE(income_expense_date) BETWEEN ? AND ?)
                AND income_expense_type = 'Cheque'
                ORDER BY trans_date ASC
            `;
            params = [fromDate, toDate];
        }

        const [rows] = await db.execute(query, params);
        return rows;
    }
};

module.exports = Stock;
