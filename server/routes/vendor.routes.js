const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, vendorController.getAllVendors);
router.post('/', authMiddleware, vendorController.createVendor);
router.put('/:id', authMiddleware, vendorController.updateVendor);
router.delete('/:id', authMiddleware, vendorController.deleteVendor);

module.exports = router;
