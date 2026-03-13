const Dashboard = require('../models/dashboard.model');

const getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const summary = await Dashboard.getSummary(startDate, endDate);
        const activities = await Dashboard.getRecentActivities(); // Keep these recent
        const trend = await Dashboard.getConsumptionTrend();
        const topProducts = await Dashboard.getTopProducts();
        const categories = await Dashboard.getCategoryDistribution();
        const stockStatus = await Dashboard.getStockStatus();

        res.json({
            summary,
            activities,
            trend,
            topProducts,
            categories,
            stockStatus
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
};

module.exports = { getDashboardStats };
