const express = require('express');
const router = express.Router();
const stockReturnController = require('../controllers/stockReturn.controller');

router.get('/next-no', stockReturnController.getNextReturnNo);
router.post('/', stockReturnController.createStockReturn);
router.get('/', stockReturnController.getAllReturns);
router.get('/report', stockReturnController.getReturnReport);

module.exports = router;
