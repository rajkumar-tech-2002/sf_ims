const LogDetail = require('../models/log.model');

const getAllLogs = async (req, res) => {
    try {
        const logs = await LogDetail.getAll();
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllLogs };
