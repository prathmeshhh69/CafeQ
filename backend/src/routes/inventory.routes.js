const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// ADMIN-only endpoints for inventory CRUD operations
router.post('/', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.createInventory);
router.get('/', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.getInventory);
router.patch('/:id', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.updateInventory);

// New endpoints for Admin Inventory Management
router.get('/all', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.getAllInventory);
router.post('/add-stock', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.addStock);
router.put('/update-stock', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.updateStock);
router.get('/low-stock', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.getLowStockItems);

module.exports = router;
