const Invoice = require('../models/invoice.model');

const getNextInvoiceNo = async (req, res) => {
    try {
        const nextNo = await Invoice.getNextInvoiceNo();
        res.json({ nextNo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createInvoice = async (req, res) => {
    try {
        const id = await Invoice.save(req.body);
        res.status(201).json({ id, message: 'Invoice saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoiceByNo = async (req, res) => {
    try {
        const invoice = await Invoice.getByNo(req.params.invoiceNo);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUniqueProducts = async (req, res) => {
    try {
        const products = await Invoice.getUniqueProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDescriptionsByProduct = async (req, res) => {
    try {
        const descriptions = await Invoice.getDescriptionsByProduct(req.params.productName);
        res.json(descriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFilteredReport = async (req, res) => {
    try {
        const report = await Invoice.getFilteredReport(req.query);
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNextInvoiceNo,
    createInvoice,
    getAllInvoices,
    getInvoiceByNo,
    getUniqueProducts,
    getDescriptionsByProduct,
    getFilteredReport
};
