const db = require('../config/db.config');

const Dashboard = {
    getSummary: async () => {
        const [productCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master');
        const [lowStockCount] = await db.execute('SELECT COUNT(*) as count FROM stock_master WHERE qty <= reorder_level');
        const [categoryCount] = await db.execute('SELECT COUNT(DISTINCT detail) as count FROM stock_master');

        return {
            totalProducts: productCount[0].count,
            lowStockItems: lowStockCount[0].count,
            totalCategories: categoryCount[0].count,
            totalSales: 0
        };
    },

    getRecentActivities: async () => {
        const [rows] = await db.execute('SELECT * FROM log_details ORDER BY login_date DESC LIMIT 5');
        return rows;
    },

    getConsumptionTrend: async () => {
        return [];
    }
};

module.exports = Dashboard;
