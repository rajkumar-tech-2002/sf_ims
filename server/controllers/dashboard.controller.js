const Dashboard = require('../models/dashboard.model');

const getDashboardStats = async (req, res) => {
    try {
        const summary = await Dashboard.getSummary();
        const activities = await Dashboard.getRecentActivities();
        const trend = await Dashboard.getConsumptionTrend();

        res.json({
            summary,
            activities,
            trend
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
};

module.exports = { getDashboardStats };
