const RawMaterialPurchase = require('../models/rawMaterialPurchase.model');

const createPurchase = async (req, res) => {
    try {
        const id = await RawMaterialPurchase.create(req.body);
        res.status(201).json({ id, message: 'Purchase entry created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPurchases = async (req, res) => {
    try {
        const purchases = await RawMaterialPurchase.findAll();
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const success = await RawMaterialPurchase.delete(req.params.id);
        if (success) {
            res.status(200).json({ message: 'Purchase entry deleted successfully' });
        } else {
            res.status(404).json({ message: 'Purchase entry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPurchase,
    getPurchases,
    deletePurchase
};
