const RawMaterialProductUsed = require('../models/rawMaterialProductUsed.model');

const createProductUsed = async (req, res) => {
    try {
        const id = await RawMaterialProductUsed.create(req.body);
        res.status(201).json({ id, message: 'Product usage recorded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductUsedRecords = async (req, res) => {
    try {
        const records = await RawMaterialProductUsed.findAll();
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProductUsed = async (req, res) => {
    try {
        const success = await RawMaterialProductUsed.delete(req.params.id);
        if (success) {
            res.status(200).json({ message: 'Product usage record deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product usage record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProductUsed,
    getProductUsedRecords,
    deleteProductUsed
};
