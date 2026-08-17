const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// ADMIN-only endpoints for inventory CRUD operations
router.post('/', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.createInventory);
router.get('/', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.getInventory);
router.patch('/:id', authMiddleware.authenticate, authMiddleware.authorize, inventoryController.updateInventory);

module.exports = router;
