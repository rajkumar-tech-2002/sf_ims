const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');

router.post('/', TransactionController.create);
router.get('/', TransactionController.findAll);
router.get('/:id', TransactionController.findById);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

module.exports = router;
