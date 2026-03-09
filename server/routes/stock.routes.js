const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', stockController.createStock);
router.get('/', stockController.getAllStocks);
router.get('/notifications', stockController.getLowStock);
router.put('/:id', stockController.updateStock);
router.delete('/:id', stockController.deleteStock);

module.exports = router;
