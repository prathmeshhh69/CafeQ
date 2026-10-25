const express = require('express');
const omnidimensionController = require('../controllers/omnidimension.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/delegation-token', authMiddleware.authenticate, omnidimensionController.issueDelegationToken);
router.post('/confirmation-token', authMiddleware.authenticate, omnidimensionController.issueConfirmationToken);
router.post('/orders', omnidimensionController.createOrder);

module.exports = router;
