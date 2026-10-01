const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/admin.controller');
const { verifyPickup, markPickedUp } = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/dashboard', authenticate, authorize, getDashboardData);
router.post('/orders/verify-pickup', authenticate, authorize, verifyPickup);
router.post('/orders/mark-picked-up', authenticate, authorize, markPickedUp);

module.exports = router;
