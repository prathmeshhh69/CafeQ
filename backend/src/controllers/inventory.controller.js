const mongoose = require('mongoose');
const inventoryModel = require('../models/inventory.model');
const menuModel = require('../models/menu.model');

async function createInventory(req, res) {
    try {
        const { menuItem, quantity, minimumStock } = req.body;

        // 1. Validate menuItem is a valid ObjectId
        if (!menuItem) {
            return res.status(400).json({
                message: "Menu item ID is required"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(menuItem)) {
            return res.status(400).json({
                message: "Invalid menu item ID"
            });
        }

        // 2. Validate quantity and minimumStock are non-negative numbers
        if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
            return res.status(400).json({
                message: "Quantity must be a non-negative number"
            });
        }
        if (minimumStock !== undefined && (typeof minimumStock !== 'number' || minimumStock < 0)) {
            return res.status(400).json({
                message: "Minimum stock must be a non-negative number"
            });
        }

        // 3. Verify menuItem exists
        const menuExists = await menuModel.findById(menuItem);
        if (!menuExists) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        // 4. Prevent duplicate inventory for the same menuItem
        const existingInventory = await inventoryModel.findOne({ menuItem });
        if (existingInventory) {
            return res.status(400).json({
                message: "Inventory for this menu item already exists"
            });
        }

        // 5. Create inventory record
        const inventory = await inventoryModel.create({
            menuItem,
            quantity: quantity !== undefined ? quantity : 0,
            minimumStock: minimumStock !== undefined ? minimumStock : 5
        });

        return res.status(201).json({
            message: "Inventory created successfully",
            inventory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getInventory(req, res) {
    try {
        // Return inventory with menuItem populated, newest first
        const inventories = await inventoryModel.find()
            .populate('menuItem')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Inventory fetched successfully",
            inventories
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function updateInventory(req, res) {
    try {
        const { id } = req.params;
        const { quantity, minimumStock } = req.body;

        // 1. Validate ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid inventory ID"
            });
        }

        // 2. Validate quantity and minimumStock if provided
        if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
            return res.status(400).json({
                message: "Quantity must be a non-negative number"
            });
        }
        if (minimumStock !== undefined && (typeof minimumStock !== 'number' || minimumStock < 0)) {
            return res.status(400).json({
                message: "Minimum stock must be a non-negative number"
            });
        }

        // 3. Prepare update payload
        const updateData = {};
        if (quantity !== undefined) updateData.quantity = quantity;
        if (minimumStock !== undefined) updateData.minimumStock = minimumStock;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "At least one field (quantity or minimumStock) must be provided for update"
            });
        }

        // 4. Update and populate
        const inventory = await inventoryModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('menuItem');

        if (!inventory) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        return res.status(200).json({
            message: "Inventory updated successfully",
            inventory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createInventory,
    getInventory,
    updateInventory
};
