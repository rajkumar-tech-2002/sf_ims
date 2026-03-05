const Stock = require('../models/stock.model');

const createStock = async (req, res) => {
    try {
        const stockId = await Stock.create(req.body);
        res.status(201).json({ message: 'Stock added successfully', id: stockId });
    } catch (err) {
        console.error('Error creating stock:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllStocks = async (req, res) => {
    try {
        const stocks = await Stock.findAll();
        res.json(stocks);
    } catch (err) {
        console.error('Error fetching stocks:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Stock.update(id, req.body);
        if (success) {
            res.json({ message: 'Stock updated successfully' });
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteStock = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Stock.delete(id);
        if (success) {
            res.json({ message: 'Stock deleted successfully' });
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (err) {
        console.error('Error deleting stock:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLowStock = async (req, res) => {
    try {
        const stocks = await Stock.findLowStock();
        res.json(stocks);
    } catch (err) {
        console.error('Error fetching low stock:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createStock,
    getAllStocks,
    updateStock,
    deleteStock,
    getLowStock
};
