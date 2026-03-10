const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

router.get('/next-no', invoiceController.getNextInvoiceNo);
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/detailed', invoiceController.getAllInvoicesDetailed);

router.get('/report', invoiceController.getFilteredReport);
router.get('/unique-products', invoiceController.getUniqueProducts);
router.get('/descriptions/:productName', invoiceController.getDescriptionsByProduct);
router.get('/:invoiceNo', invoiceController.getInvoiceByNo);

module.exports = router;
