const express = require('express');
const router = express.Router();
const scaleUnitController = require('../controllers/scaleUnit.controller');

router.get('/', scaleUnitController.getAllUnits);
router.post('/', scaleUnitController.createUnit);

module.exports = router;
