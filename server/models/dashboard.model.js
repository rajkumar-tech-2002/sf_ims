const db = require('../config/db.config');

const Dashboard = {
    getSummary: async () => {
        const [productCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master');
        const [lowStockCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master WHERE qty <= reorder_level');
        const [categoryCount] = await db.execute('SELECT COUNT(DISTINCT detail) as count FROM stock_master');

        // Total "Sales" value based on product usage
        const [salesValue] = await db.execute(`
            SELECT SUM(pu.qty * sm.sale_price) as total 
            FROM product_used pu
            JOIN stock_master sm ON pu.product_code = sm.product_code
        `);

        return {
            totalProducts: productCount[0].count,
            lowStockItems: lowStockCount[0].count,
            totalCategories: categoryCount[0].count,
            totalSales: salesValue[0].total || 0
        };
    },

    getRecentActivities: async () => {
        const [rows] = await db.execute('SELECT * FROM log_details ORDER BY login_date DESC LIMIT 5');
        return rows;
    },

    getConsumptionTrend: async () => {
        const query = `
            SELECT 
                DATE_FORMAT(used_date, '%Y-%m-%d') as date,
                SUM(qty) as volume
            FROM product_used
            WHERE used_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY used_date
            ORDER BY used_date ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
};

module.exports = Dashboard;
