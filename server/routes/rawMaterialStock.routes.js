const express = require('express');
const router = express.Router();
const stockController = require('../controllers/rawMaterialStock.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', stockController.createStock);
router.get('/', stockController.getStocks);
router.get('/:id', stockController.getStockById);
router.put('/:id', stockController.updateStock);
router.delete('/:id', stockController.deleteStock);

module.exports = router;
