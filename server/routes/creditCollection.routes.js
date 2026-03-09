const express = require('express');
const router = express.Router();
const creditCollectionController = require('../controllers/creditCollection.controller');

router.post('/', creditCollectionController.createCollection);
router.get('/', creditCollectionController.getAllCollections);
router.get('/credit-invoices', creditCollectionController.getCreditInvoices);

module.exports = router;
