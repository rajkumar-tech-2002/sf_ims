const StockReturn = require('../models/stockReturn.model');

const getNextReturnNo = async (req, res) => {
    try {
        const nextNo = await StockReturn.getNextReturnNo();
        res.json({ nextNo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createStockReturn = async (req, res) => {
    try {
        const id = await StockReturn.save(req.body);
        res.status(201).json({ id, message: 'Stock return saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllReturns = async (req, res) => {
    try {
        const returns = await StockReturn.findAll();
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReturnReport = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'From Date and To Date are required' });
        }
        const reportData = await StockReturn.getReport(fromDate, toDate);
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNextReturnNo,
    createStockReturn,
    getAllReturns,
    getReturnReport
};
