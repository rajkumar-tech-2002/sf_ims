const RawMaterialStock = require('../models/rawMaterialStock.model');

const createStock = async (req, res) => {
    try {
        const id = await RawMaterialStock.create(req.body);
        res.status(201).json({ id, message: 'Stock created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStocks = async (req, res) => {
    try {
        const stocks = await RawMaterialStock.findAll();
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStockById = async (req, res) => {
    try {
        const stock = await RawMaterialStock.findById(req.params.id);
        if (stock) {
            res.status(200).json(stock);
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStock = async (req, res) => {
    try {
        const success = await RawMaterialStock.update(req.params.id, req.body);
        if (success) {
            res.status(200).json({ message: 'Stock updated successfully' });
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteStock = async (req, res) => {
    try {
        const success = await RawMaterialStock.delete(req.params.id);
        if (success) {
            res.status(200).json({ message: 'Stock deleted successfully' });
        } else {
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStock,
    getStocks,
    getStockById,
    updateStock,
    deleteStock
};
