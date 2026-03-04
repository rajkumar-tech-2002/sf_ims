const ProductUsed = require('../models/productUsed.model');

const createProductUsed = async (req, res) => {
    try {
        const usedId = await ProductUsed.create(req.body);
        res.status(201).json({ message: 'Product usage recorded successfully', id: usedId });
    } catch (err) {
        console.error('Error recording product usage:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllProductUsed = async (req, res) => {
    try {
        const usages = await ProductUsed.getAll();
        res.json(usages);
    } catch (err) {
        console.error('Error fetching product usage:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteProductUsed = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await ProductUsed.delete(id);
        if (success) {
            res.json({ message: 'Product usage record deleted and stock reverted' });
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (err) {
        console.error('Error deleting product usage:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createProductUsed,
    getAllProductUsed,
    deleteProductUsed
};
