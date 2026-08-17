const mongoose = require('mongoose');
const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');
const menuModel = require('../models/menu.model');
const timeSlotModel = require('../models/timeSlot.model');
const inventoryModel = require('../models/inventory.model');

async function createOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.user._id;

        // 1. Get the user's cart
        const cart = await cartModel.findOne({ user: userId }).session(session);
        if (!cart || !cart.items || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Cart is empty or does not exist"
            });
        }

        // 2. Validate timeSlotId from req.body
        const { timeSlotId } = req.body;
        if (!timeSlotId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Time slot ID is required"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(timeSlotId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Invalid time slot ID"
            });
        }

        // 3. Verify the TimeSlot exists and is active
        const timeSlot = await timeSlotModel.findById(timeSlotId).session(session);
        if (!timeSlot) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                message: "Time slot not found"
            });
        }
        if (!timeSlot.isActive) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Time slot is inactive"
            });
        }
        if (timeSlot.currentOrders >= timeSlot.maxOrders) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Time slot has reached maximum capacity"
            });
        }

        // 4. Validate cart items object IDs and quantities
        for (const item of cart.items) {
            if (!item.menuItem || !mongoose.Types.ObjectId.isValid(item.menuItem)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: "Cart contains an invalid menu item ID"
                });
            }
            if (item.quantity === undefined || !Number.isInteger(item.quantity) || item.quantity < 1) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: "Cart contains an invalid quantity"
                });
            }
        }

        // 5. Fetch current MenuItems from MongoDB for every cart item
        const menuItemIds = cart.items.map(item => item.menuItem);
        const menuItems = await menuModel.find({ _id: { $in: menuItemIds } }).session(session);

        const menuMap = {};
        for (const item of menuItems) {
            menuMap[item._id.toString()] = item;
        }

        const inventoryRecords = await inventoryModel.find({ menuItem: { $in: menuItemIds } }).session(session);
        const inventoryMap = {};
        for (const record of inventoryRecords) {
            inventoryMap[record.menuItem.toString()] = record;
        }

        // 6. Verify every item exists, is available, check inventory, and calculate total amount
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of cart.items) {
            const dbItem = menuMap[cartItem.menuItem.toString()];
            if (!dbItem) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: `Menu item with ID ${cartItem.menuItem} no longer exists`
                });
            }
            if (!dbItem.isAvailable) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: `Menu item '${dbItem.name}' is currently unavailable`
                });
            }

            const invRecord = inventoryMap[cartItem.menuItem.toString()];
            if (!invRecord) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: `Inventory record for menu item '${dbItem.name}' does not exist`
                });
            }
            if (invRecord.quantity < cartItem.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: `Insufficient inventory for menu item '${dbItem.name}'`
                });
            }

            const itemPrice = dbItem.price;
            const itemTotal = itemPrice * cartItem.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                menuItem: dbItem._id,
                name: dbItem.name,
                price: itemPrice,
                quantity: cartItem.quantity
            });
        }

        // 7. Increment TimeSlot currentOrders atomically to prevent race conditions
        const updatedTimeSlot = await timeSlotModel.findOneAndUpdate(
            {
                _id: timeSlotId,
                isActive: true,
                currentOrders: { $lt: timeSlot.maxOrders }
            },
            { $inc: { currentOrders: 1 } },
            { session, returnDocument: 'after' }
        );

        if (!updatedTimeSlot) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Failed to book time slot. It may have reached capacity or become inactive."
            });
        }

        // 8. Create Order in the database
        const order = new orderModel({
            user: userId,
            items: orderItems,
            timeSlot: timeSlotId,
            totalAmount,
            orderStatus: 'PENDING',
            paymentStatus: 'PENDING'
        });
        await order.save({ session });

        // 9. Decrement Inventory atomically
        const inventoryOps = cart.items.map(cartItem => ({
            updateOne: {
                filter: { menuItem: cartItem.menuItem, quantity: { $gte: cartItem.quantity } },
                update: { $inc: { quantity: -cartItem.quantity } }
            }
        }));
        
        const bulkWriteResult = await inventoryModel.bulkWrite(inventoryOps, { session });
        
        if (bulkWriteResult.modifiedCount !== cart.items.length) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Failed to update inventory. Insufficient stock."
            });
        }

        // 10. Clear the user's cart after successful order creation
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        // 11. Return the created order
        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


async function getOrders(req, res) {
    try {
        const userId = req.user._id;
        const orders = await orderModel.find({ user: userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Forbidden: You cannot access another customer's order"
            });
        }

        return res.status(200).json({
            message: "Order fetched successfully",
            order
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function cancelOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await orderModel.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                message: "Forbidden: You cannot cancel another customer's order"
            });
        }

        if (order.orderStatus !== 'PENDING') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: `Cannot cancel order. Order status is '${order.orderStatus}' (only PENDING orders can be cancelled)`
            });
        }

        if (order.timeSlot) {
            await timeSlotModel.updateOne(
                { _id: order.timeSlot, currentOrders: { $gt: 0 } },
                { $inc: { currentOrders: -1 } },
                { session }
            );
        }

        order.orderStatus = 'CANCELLED';
        await order.save({ session });

        if (order.items && order.items.length > 0) {
            const inventoryOps = order.items.map(item => ({
                updateOne: {
                    filter: { menuItem: item.menuItem },
                    update: { $inc: { quantity: item.quantity } }
                }
            }));
            await inventoryModel.bulkWrite(inventoryOps, { session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Order cancelled successfully",
            order
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder
};

