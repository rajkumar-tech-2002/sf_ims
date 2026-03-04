const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiry.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', enquiryController.createEnquiry);
router.get('/', enquiryController.getAllEnquiries);
router.put('/:id', enquiryController.updateEnquiry);
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;
