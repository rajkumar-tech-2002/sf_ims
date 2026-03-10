const express = require('express');
const router = express.Router();
const creditCollectionController = require('../controllers/creditCollection.controller');

router.post('/', creditCollectionController.createCollection);
router.get('/', creditCollectionController.getAllCollections);
router.get('/credit-invoices', creditCollectionController.getCreditInvoices);
router.get('/last-id', creditCollectionController.getLastCreditId);
router.get('/report/:customerId', creditCollectionController.getCustomerReport);

module.exports = router;
