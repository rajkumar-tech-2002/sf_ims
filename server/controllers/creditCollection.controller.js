const CreditCollection = require('../models/creditCollection.model');

const createCollection = async (req, res) => {
    try {
        const id = await CreditCollection.save(req.body);
        res.status(201).json({ id, message: 'Credit collection saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllCollections = async (req, res) => {
    try {
        const collections = await CreditCollection.findAll();
        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCreditInvoices = async (req, res) => {
    try {
        const invoices = await CreditCollection.getCreditInvoices();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCollection,
    getAllCollections,
    getCreditInvoices
};
