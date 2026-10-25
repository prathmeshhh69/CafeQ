const mongoose = require('mongoose');
const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');
const menuModel = require('../models/menu.model');
const timeSlotModel = require('../models/timeSlot.model');
const inventoryModel = require('../models/inventory.model');
const omnidimensionRequestModel = require('../models/omnidimensionRequest.model');

class OrderCreationError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.isOrderCreationError = true;
    }
}

async function createOrderInSession({ userId, timeSlotId, items, session }) {
    const timeSlot = await timeSlotModel.findById(timeSlotId).session(session);
    if (!timeSlot) throw new OrderCreationError(404, "Time slot not found");
    if (!timeSlot.isActive) throw new OrderCreationError(400, "Time slot is inactive");
    if (timeSlot.currentOrders >= timeSlot.maxOrders) {
        throw new OrderCreationError(400, "Time slot has reached maximum capacity");
    }

    for (const item of items) {
        if (!item.menuItem || !mongoose.Types.ObjectId.isValid(item.menuItem)) {
            throw new OrderCreationError(400, "Cart contains an invalid menu item ID");
        }
        if (item.quantity === undefined || !Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new OrderCreationError(400, "Cart contains an invalid quantity");
        }
    }

    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await menuModel.find({ _id: { $in: menuItemIds } }).session(session);
    const menuMap = {};
    for (const item of menuItems) menuMap[item._id.toString()] = item;

    const inventoryRecords = await inventoryModel.find({ menuItem: { $in: menuItemIds } }).session(session);
    const inventoryMap = {};
    for (const record of inventoryRecords) inventoryMap[record.menuItem.toString()] = record;

    const orderItems = [];
    let totalAmount = 0;
    for (const cartItem of items) {
        const dbItem = menuMap[cartItem.menuItem.toString()];
        if (!dbItem) {
            throw new OrderCreationError(400, `Menu item with ID ${cartItem.menuItem} no longer exists`);
        }
        if (!dbItem.isAvailable) {
            throw new OrderCreationError(400, `Menu item '${dbItem.name}' is currently unavailable`);
        }

        const invRecord = inventoryMap[cartItem.menuItem.toString()];
        if (!invRecord) {
            throw new OrderCreationError(400, `Inventory record for menu item '${dbItem.name}' does not exist`);
        }
        if (invRecord.quantity < cartItem.quantity) {
            throw new OrderCreationError(400, `Insufficient inventory for menu item '${dbItem.name}'`);
        }

        totalAmount += dbItem.price * cartItem.quantity;
        orderItems.push({
            menuItem: dbItem._id,
            name: dbItem.name,
            price: dbItem.price,
            quantity: cartItem.quantity
        });
    }

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
        throw new OrderCreationError(400, "Failed to book time slot. It may have reached capacity or become inactive.");
    }

    const order = new orderModel({
        user: userId,
        items: orderItems,
        timeSlot: timeSlotId,
        totalAmount,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING'
    });
    await order.save({ session });

    const inventoryOps = items.map(cartItem => ({
        updateOne: {
            filter: { menuItem: cartItem.menuItem, quantity: { $gte: cartItem.quantity } },
            update: { $inc: { quantity: -cartItem.quantity } }
        }
    }));
    const bulkWriteResult = await inventoryModel.bulkWrite(inventoryOps, { session });
    if (bulkWriteResult.modifiedCount !== items.length) {
        throw new OrderCreationError(400, "Failed to update inventory. Insufficient stock.");
    }

    return order;
}

async function createOrder({ userId, timeSlotId }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cart = await cartModel.findOne({ user: userId }).session(session);
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new OrderCreationError(400, "Cart is empty or does not exist");
        }

        const order = await createOrderInSession({
            userId,
            timeSlotId,
            items: cart.items,
            session
        });

        cart.items = [];
        await cart.save({ session });
        await session.commitTransaction();
        session.endSession();
        return order;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

async function createOrderWithItems({ userId, timeSlotId, items, idempotency }) {
    await omnidimensionRequestModel.init();
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const existingRequest = await omnidimensionRequestModel.findOne({
            idempotencyKey: idempotency.key
        }).session(session);
        if (existingRequest) {
            if (existingRequest.requestFingerprint !== idempotency.fingerprint) {
                throw new OrderCreationError(409, "Idempotency key was already used for a different request");
            }
            throw new OrderCreationError(409, "Idempotency key is already being processed");
        }

        const order = await createOrderInSession({ userId, timeSlotId, items, session });
        await omnidimensionRequestModel.create([{
            idempotencyKey: idempotency.key,
            requestFingerprint: idempotency.fingerprint,
            customer: userId,
            order: order._id
        }], { session });

        await session.commitTransaction();
        session.endSession();
        return order;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

module.exports = { createOrder, createOrderWithItems, OrderCreationError };
