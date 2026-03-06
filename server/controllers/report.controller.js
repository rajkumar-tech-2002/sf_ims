const Stock = require('../models/stock.model');

const getDailyReport = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'From Date and To Date are required' });
        }
        const reportData = await Stock.getDailyReport(fromDate, toDate);
        res.json(reportData);
    } catch (err) {
        console.error('Error fetching daily report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDailyReport
};
