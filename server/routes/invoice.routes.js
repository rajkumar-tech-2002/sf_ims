const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

router.get('/next-no', invoiceController.getNextInvoiceNo);
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:invoiceNo', invoiceController.getInvoiceByNo);

module.exports = router;
