const express = require('express');
const router = express.Router();
const IncomeExpenseController = require('../controllers/incomeExpense.controller');

router.post('/', IncomeExpenseController.createEntry);
router.get('/', IncomeExpenseController.getEntries);
router.get('/distinct', IncomeExpenseController.getDistinctFields);
router.put('/:id', IncomeExpenseController.updateEntry);
router.delete('/:id', IncomeExpenseController.deleteEntry);

module.exports = router;
