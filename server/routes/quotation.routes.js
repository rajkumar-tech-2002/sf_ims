const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotation.controller');

router.get('/next-no', quotationController.getNextQuotationNo);
router.post('/', quotationController.createQuotation);
router.get('/product/:code', quotationController.getProductByCode);
router.get('/no/:no', quotationController.getQuotationByNo);
router.get('/detailed', quotationController.getAllQuotationsDetailed);
router.get('/', quotationController.getAllQuotations);

module.exports = router;
