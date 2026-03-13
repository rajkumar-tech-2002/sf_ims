const db = require('../config/db.config');

const Dashboard = {
    getSummary: async (startDate, endDate) => {
        let invoiceDateFilter = '';
        let returnDateFilter = '';
        const invoiceParams = [];
        const returnParams = [];

        if (startDate && endDate) {
            invoiceDateFilter = ' WHERE DATE(invoice_date) BETWEEN ? AND ?';
            returnDateFilter = ' WHERE DATE(return_date) BETWEEN ? AND ?';
            invoiceParams.push(startDate, endDate);
            returnParams.push(startDate, endDate);
        }

        const [productCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master');
        const [lowStockCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master WHERE qty <= reorder_level');
        const [categoryCount] = await db.execute('SELECT COUNT(DISTINCT detail) as count FROM stock_master');

        // Sales and Returns
        const [salesSum] = await db.execute(`SELECT SUM(subtotal) as total FROM invoice_master${invoiceDateFilter}`, invoiceParams);
        const [returnSum] = await db.execute(`SELECT SUM(total_amount) as total FROM stock_return_master${returnDateFilter}`, returnParams);

        // Sold Qty and Return Qty
        const [soldQty] = await db.execute(`
            SELECT SUM(ii.qty) as total 
            FROM invoice_items ii 
            JOIN invoice_master im ON ii.invoice_id = im.id
            ${startDate && endDate ? ' WHERE DATE(im.invoice_date) BETWEEN ? AND ?' : ''}
        `, invoiceParams);

        const [returnedQty] = await db.execute(`
            SELECT SUM(sri.return_qty) as total 
            FROM stock_return_items sri 
            JOIN stock_return_master srm ON sri.return_id = srm.id
            ${startDate && endDate ? ' WHERE DATE(srm.return_date) BETWEEN ? AND ?' : ''}
        `, returnParams);

        const [stockValueSum] = await db.execute('SELECT SUM(qty * sale_price) as total FROM stock_master');

        const totalSoldCount = (soldQty[0].total || 0) - (returnedQty[0].total || 0);
        const netSales = (salesSum[0].total || 0) - (returnSum[0].total || 0);

        return {
            totalProducts: productCount[0].count,
            lowStockItems: lowStockCount[0].count,
            totalCategories: categoryCount[0].count,
            totalSales: netSales,
            stockValue: stockValueSum[0].total || 0,
            netSoldCount: totalSoldCount,
            returnCount: returnedQty[0].total || 0,
            returnValue: returnSum[0].total || 0
        };
    },

    getRecentActivities: async () => {
        const [logs] = await db.execute('SELECT username, action, login_date as date, role, "log" as type FROM log_details ORDER BY login_date DESC LIMIT 5');
        const [invoices] = await db.execute('SELECT customer_name as username, CONCAT("Invoice ", invoice_no) as action, created_at as date, "Customer" as role, "transaction" as type FROM invoice_master ORDER BY created_at DESC LIMIT 5');
        const [returns] = await db.execute('SELECT customer_name as username, CONCAT("Return ", return_no) as action, created_at as date, "Customer" as role, "transaction" as type FROM stock_return_master ORDER BY created_at DESC LIMIT 5');

        const combined = [...logs, ...invoices, ...returns]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        return combined;
    },

    getConsumptionTrend: async () => {
        // Default to last 6 months for monthly trend
        const query = `
            SELECT 
                DATE_FORMAT(month_start, '%Y-%m-01') as month_raw,
                SUM(volume) as net_volume
            FROM (
                SELECT 
                    DATE_FORMAT(invoice_date, '%Y-%m-01') as month_start, 
                    SUM(subtotal) as volume 
                FROM invoice_master 
                WHERE invoice_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
                GROUP BY month_start
                
                UNION ALL
                
                SELECT 
                    DATE_FORMAT(return_date, '%Y-%m-01') as month_start, 
                    SUM(-total_amount) as volume 
                FROM stock_return_master 
                WHERE return_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
                GROUP BY month_start
            ) combined
            GROUP BY month_raw
            ORDER BY month_raw ASC
        `;
        const [rows] = await db.execute(query);

        return rows.map(row => ({
            date: new Date(row.month_raw).toLocaleDateString([], { month: 'short', year: 'numeric' }),
            volume: parseFloat(row.net_volume) || 0
        }));
    },

    getTopProducts: async () => {
        const query = `
            SELECT product_name, qty as total_qty 
            FROM stock_master 
            ORDER BY qty DESC 
            LIMIT 5
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    getCategoryDistribution: async () => {
        const query = `
            SELECT detail as name, COUNT(*) as value 
            FROM stock_master 
            WHERE detail IS NOT NULL AND detail != ""
            GROUP BY detail
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    getStockStatus: async () => {
        const [rows] = await db.execute(`
            SELECT 
                SUM(CASE WHEN qty <= reorder_level THEN 1 ELSE 0 END) as low_stock,
                SUM(CASE WHEN qty > reorder_level THEN 1 ELSE 0 END) as normal_stock
            FROM stock_master
        `);
        return [
            { name: 'Low Stock', value: rows[0].low_stock || 0 },
            { name: 'Healthy', value: rows[0].normal_stock || 0 }
        ];
    }
};

module.exports = Dashboard;
