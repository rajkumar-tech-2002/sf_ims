const express = require('express');
const router = express.Router();
const AssetsController = require('../controllers/assets.controller');

router.post('/', AssetsController.create);
router.get('/', AssetsController.findAll);
router.get('/distinct-names', AssetsController.getDistinctNames);
router.get('/:id', AssetsController.findById);
router.put('/:id', AssetsController.update);
router.delete('/:id', AssetsController.delete);

module.exports = router;
