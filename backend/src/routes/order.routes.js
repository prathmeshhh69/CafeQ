const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware.authenticate, orderController.createOrder);
router.get('/', authMiddleware.authenticate, orderController.getOrders);
router.get('/:id', authMiddleware.authenticate, orderController.getOrderById);
router.patch('/:id/cancel', authMiddleware.authenticate, orderController.cancelOrder);

module.exports = router;
