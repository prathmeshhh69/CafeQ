const mongoose = require('mongoose');
const orderModel = require('../models/order.model');
const timeSlotModel = require('../models/timeSlot.model');
const inventoryModel = require('../models/inventory.model');
const orderService = require('../services/order.service');

async function createOrder(req, res) {
    try {
        const userId = req.user._id;
        const { timeSlotId } = req.body;
        const order = await orderService.createOrder({ userId, timeSlotId });
        return res.status(201).json({
            message: "Order created successfully",
            order
        });
    } catch (err) {
        if (err.isOrderCreationError) {
            return res.status(err.status).json({
                message: err.message
            });
        }
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

async function getAllOrders(req, res) {
    try {
        const orders = await orderModel.find()
            .populate('user', 'name email')
            .populate('timeSlot')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            message: "All orders fetched successfully",
            orders
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getOrderByIdAdmin(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await orderModel.findById(id)
            .populate('user', 'name email phone')
            .populate('items.menuItem', 'name category image')
            .populate('timeSlot');

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
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

async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const validTransitions = {
            'PENDING': ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED': ['PREPARING', 'CANCELLED'],
            'PREPARING': ['READY', 'CANCELLED'],
            'READY': ['COMPLETED', 'CANCELLED'],
            'COMPLETED': [],
            'CANCELLED': []
        };

        if (order.orderStatus === status) {
            return res.status(400).json({
                message: `Order is already ${status}`
            });
        }

        if (!validTransitions[order.orderStatus].includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${order.orderStatus} to ${status}`
            });
        }

        order.orderStatus = status;
        await order.save();

        return res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function verifyPickup(req, res) {
    try {
        const { pickupCode } = req.body || {};

        if (typeof pickupCode !== 'string' || pickupCode.trim().length === 0) {
            return res.status(400).json({
                message: "Pickup code is required and must be a string"
            });
        }

        const order = await orderModel.findOne({ pickupCode: pickupCode.trim() })
            .populate('user', 'name customerCode');

        if (!order) {
            return res.status(404).json({
                message: "Order not found for the provided pickup code"
            });
        }

        if (order.orderStatus !== 'READY') {
            const message = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.orderStatus)
                ? `Order is not ready for pickup. Current status is '${order.orderStatus}'`
                : `Order is not valid for pickup. Current status is '${order.orderStatus}'`;
            return res.status(400).json({ message });
        }

        if (order.pickupStatus !== 'NOT_PICKED_UP') {
            return res.status(400).json({
                message: "Order has already been picked up or is not available for pickup"
            });
        }

        return res.status(200).json({
            message: "Pickup code verified successfully",
            order: {
                _id: order._id,
                customerName: order.user?.name,
                customerCode: order.user?.customerCode,
                items: order.items,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                pickupStatus: order.pickupStatus,
                pickupCode: order.pickupCode
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function markPickedUp(req, res) {
    try {
        const { pickupCode } = req.body || {};

        if (typeof pickupCode !== 'string' || pickupCode.trim().length === 0) {
            return res.status(400).json({
                message: "Pickup code is required and must be a non-empty string"
            });
        }

        const normalizedPickupCode = pickupCode.trim();
        const pickedUpAt = new Date();
        const order = await orderModel.findOneAndUpdate(
            {
                pickupCode: normalizedPickupCode,
                orderStatus: 'READY',
                pickupStatus: 'NOT_PICKED_UP'
            },
            {
                $set: {
                    pickupStatus: 'PICKED_UP',
                    pickedUpAt
                }
            },
            { new: true, runValidators: true }
        ).populate('user', 'name customerCode');

        if (!order) {
            const existingOrder = await orderModel.findOne({ pickupCode: normalizedPickupCode });

            if (!existingOrder) {
                return res.status(404).json({
                    message: "Order not found for the provided pickup code"
                });
            }

            if (existingOrder.orderStatus !== 'READY') {
                return res.status(400).json({
                    message: `Order is not ready for pickup. Current status is '${existingOrder.orderStatus}'`
                });
            }

            if (existingOrder.pickupStatus === 'PICKED_UP') {
                return res.status(400).json({
                    message: "Order has already been picked up"
                });
            }

            return res.status(400).json({
                message: "Order is not available for pickup"
            });
        }

        return res.status(200).json({
            message: "Order marked as picked up successfully",
            order: {
                _id: order._id,
                pickupCode: order.pickupCode,
                customerName: order.user?.name,
                customerCode: order.user?.customerCode,
                pickupStatus: order.pickupStatus,
                pickedUpAt: order.pickedUpAt
            }
        });
    } catch (err) {
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
    cancelOrder,
    getAllOrders,
    getOrderByIdAdmin,
    updateOrderStatus,
    verifyPickup,
    markPickedUp
};
