const Purchase = require('../models/purchase.model');

const createPurchase = async (req, res) => {
    try {
        const purchaseId = await Purchase.create(req.body);
        res.status(201).json({ message: 'Purchase record added successfully', id: purchaseId });
    } catch (err) {
        console.error('Error creating purchase:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll();
        res.json(purchases);
    } catch (err) {
        console.error('Error fetching purchases:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Purchase.update(id, req.body);
        if (success) {
            res.json({ message: 'Purchase record updated successfully' });
        } else {
            res.status(404).json({ message: 'Purchase record not found' });
        }
    } catch (err) {
        console.error('Error updating purchase:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Purchase.delete(id);
        if (success) {
            res.json({ message: 'Purchase record deleted successfully' });
        } else {
            res.status(404).json({ message: 'Purchase record not found' });
        }
    } catch (err) {
        console.error('Error deleting purchase:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPurchaseReport = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'From Date and To Date are required' });
        }
        const reportData = await Purchase.findByDateRange(fromDate, toDate);
        res.json(reportData);
    } catch (err) {
        console.error('Error fetching purchase report:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPurchase,
    getAllPurchases,
    updatePurchase,
    deletePurchase,
    getPurchaseReport
};
