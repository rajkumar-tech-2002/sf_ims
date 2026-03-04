const express = require('express');
const router = express.Router();
const productUsedController = require('../controllers/productUsed.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', productUsedController.createProductUsed);
router.get('/', productUsedController.getAllProductUsed);
router.delete('/:id', productUsedController.deleteProductUsed);

module.exports = router;
