const Quotation = require('../models/quotation.model');

const getNextQuotationNo = async (req, res) => {
    try {
        const nextNo = await Quotation.getNextQuotationNo();
        res.json({ nextNo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createQuotation = async (req, res) => {
    try {
        const id = await Quotation.save(req.body);
        res.status(201).json({ id, message: 'Quotation saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductByCode = async (req, res) => {
    try {
        const product = await Quotation.getProductByCode(req.params.code);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.findAll();
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllQuotationsDetailed = async (req, res) => {
    try {
        const quotations = await Quotation.findAllDetailed();
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuotationByNo = async (req, res) => {
    try {
        const quotation = await Quotation.findByNo(req.params.no);
        if (quotation) {
            res.json(quotation);
        } else {
            res.status(404).json({ message: 'Quotation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNextQuotationNo,
    createQuotation,
    getProductByCode,
    getAllQuotations,
    getAllQuotationsDetailed,
    getQuotationByNo
};
