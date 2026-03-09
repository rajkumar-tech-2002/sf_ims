const db = require('../config/db.config');

const Dashboard = {
    getSummary: async () => {
        const [productCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master');
        const [lowStockCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master WHERE qty <= reorder_level');
        const [categoryCount] = await db.execute('SELECT COUNT(DISTINCT detail) as count FROM stock_master');
        const [salesSum] = await db.execute('SELECT SUM(grand_total) as total FROM invoice_master');
        const [stockValueSum] = await db.execute('SELECT SUM(qty * sale_price) as total FROM stock_master');

        return {
            totalProducts: productCount[0].count,
            lowStockItems: lowStockCount[0].count,
            totalCategories: categoryCount[0].count,
            totalSales: salesSum[0].total || 0,
            stockValue: stockValueSum[0].total || 0
        };
    },

    getRecentActivities: async () => {
        // Fetch both system logs and actual business transactions for a richer feed
        const [logs] = await db.execute('SELECT username, action, login_date as date, role, "log" as type FROM log_details ORDER BY login_date DESC LIMIT 5');
        const [invoices] = await db.execute('SELECT customer_name as username, CONCAT("Created Invoice ", invoice_no) as action, created_at as date, "Customer" as role, "transaction" as type FROM invoice_master ORDER BY created_at DESC LIMIT 5');

        const combined = [...logs, ...invoices]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        return combined;
    },

    getConsumptionTrend: async () => {
        // Sales trend for the last 15 days
        const query = `
            SELECT DATE(invoice_date) as date, SUM(grand_total) as volume 
            FROM invoice_master 
            WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)
            GROUP BY DATE(invoice_date)
            ORDER BY date ASC
        `;
        const [rows] = await db.execute(query);
        return rows.map(row => ({
            date: new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            volume: parseFloat(row.volume) || 0
        }));
    },

    getTopProducts: async () => {
        const query = `
            SELECT product_name, SUM(qty) as total_qty 
            FROM invoice_items 
            GROUP BY product_name 
            ORDER BY total_qty DESC 
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
