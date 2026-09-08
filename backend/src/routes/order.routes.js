const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware.authenticate, orderController.createOrder);
router.get('/', authMiddleware.authenticate, orderController.getOrders);

// Admin routes
router.get('/admin/all', authMiddleware.authenticate, authMiddleware.authorize, orderController.getAllOrders);
router.get('/admin/:id', authMiddleware.authenticate, authMiddleware.authorize, orderController.getOrderByIdAdmin);
router.patch('/admin/:id/status', authMiddleware.authenticate, authMiddleware.authorize, orderController.updateOrderStatus);

// Customer routes with :id
router.get('/:id', authMiddleware.authenticate, orderController.getOrderById);
router.patch('/:id/cancel', authMiddleware.authenticate, orderController.cancelOrder);

module.exports = router;
