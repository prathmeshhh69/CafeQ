const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const orderModel = require('../models/order.model');
const timeSlotModel = require('../models/timeSlot.model');
const omnidimensionRequestModel = require('../models/omnidimensionRequest.model');
const orderService = require('../services/order.service');

const OMNIDIMENSION_AGENT_ID = 273728;
const DELEGATION_OPERATION = 'omnidimension:orders:create';
const CONFIRMATION_OPERATION = 'omnidimension:orders:confirm';
const DELEGATION_TTL_SECONDS = 300;

function reject(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

function authenticateIntegration(req) {
    const configuredSecret = process.env.OMNIDIMENSION_INTEGRATION_SECRET;
    const authorization = req.get('authorization') || '';
    const providedSecret = authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : '';

    if (!configuredSecret || !providedSecret) {
        return false;
    }

    const expected = crypto.createHash('sha256').update(configuredSecret).digest();
    const provided = crypto.createHash('sha256').update(providedSecret).digest();
    return crypto.timingSafeEqual(expected, provided);
}

function issueDelegationToken(req, res) {
    if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({ message: "Customer account required" });
    }
    if (!process.env.OMNIDIMENSION_DELEGATION_SECRET) {
        return res.status(503).json({ message: "OmniDimension delegation is not configured" });
    }

    const expiresAt = new Date(Date.now() + DELEGATION_TTL_SECONDS * 1000);
    const token = jwt.sign(
        {
            sub: req.user._id.toString(),
            operation: DELEGATION_OPERATION,
            agentId: OMNIDIMENSION_AGENT_ID
        },
        process.env.OMNIDIMENSION_DELEGATION_SECRET,
        {
            expiresIn: DELEGATION_TTL_SECONDS,
            issuer: 'cafeq',
            audience: 'omnidimension'
        }
    );

    return res.status(200).json({
        token,
        expiresAt: expiresAt.toISOString(),
        agentId: OMNIDIMENSION_AGENT_ID,
        operation: DELEGATION_OPERATION
    });
}

function authenticateDelegation(req, customerId) {
    const secret = process.env.OMNIDIMENSION_DELEGATION_SECRET;
    const token = req.get('x-omnidimension-delegation-token');
    if (!secret || !token) return false;

    try {
        const payload = jwt.verify(token, secret, {
            issuer: 'cafeq',
            audience: 'omnidimension'
        });
        return payload
            && payload.sub === customerId
            && payload.operation === DELEGATION_OPERATION
            && payload.agentId === OMNIDIMENSION_AGENT_ID;
    } catch {
        return false;
    }
}

function issueConfirmationToken(req, res) {
    if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({ message: "Customer account required" });
    }
    if (!process.env.OMNIDIMENSION_CONFIRMATION_SECRET) {
        return res.status(503).json({ message: "OmniDimension confirmation is not configured" });
    }

    try {
        const request = validateConfirmationBody(req.body);
        const requestFingerprint = fingerprint({
            customerId: req.user._id.toString(),
            timeSlotId: request.timeSlotId,
            items: request.items
        });
        const expiresAt = new Date(Date.now() + DELEGATION_TTL_SECONDS * 1000);
        const token = jwt.sign(
            {
                sub: req.user._id.toString(),
                operation: CONFIRMATION_OPERATION,
                agentId: OMNIDIMENSION_AGENT_ID,
                fingerprint: requestFingerprint
            },
            process.env.OMNIDIMENSION_CONFIRMATION_SECRET,
            {
                expiresIn: DELEGATION_TTL_SECONDS,
                issuer: 'cafeq',
                audience: 'omnidimension'
            }
        );
        return res.status(200).json({ token, expiresAt: expiresAt.toISOString() });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

function authenticateConfirmation(req, request) {
    const secret = process.env.OMNIDIMENSION_CONFIRMATION_SECRET;
    const token = req.get('x-omnidimension-confirmation-token');
    if (!secret || !token) return false;

    try {
        const payload = jwt.verify(token, secret, {
            issuer: 'cafeq',
            audience: 'omnidimension'
        });
        const expectedFingerprint = fingerprint(request);
        return payload
            && payload.sub === request.customerId
            && payload.operation === CONFIRMATION_OPERATION
            && payload.agentId === OMNIDIMENSION_AGENT_ID
            && payload.fingerprint === expectedFingerprint;
    } catch {
        return false;
    }
}

function validateConfirmationBody(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw reject("Invalid request body");
    const allowedKeys = ['timeSlotId', 'items'];
    if (Object.keys(body).some(key => !allowedKeys.includes(key))) throw reject("Invalid request fields");
    if (typeof body.timeSlotId !== 'string' || !mongoose.Types.ObjectId.isValid(body.timeSlotId)) {
        throw reject("Invalid time slot ID");
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
        throw reject("Items must contain between 1 and 50 entries");
    }

    const menuItemIds = new Set();
    const items = body.items.map(item => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) throw reject("Invalid item");
        if (Object.keys(item).some(key => !['menuItemId', 'quantity'].includes(key))) throw reject("Invalid item fields");
        if (typeof item.menuItemId !== 'string' || !mongoose.Types.ObjectId.isValid(item.menuItemId)) throw reject("Invalid menu item ID");
        if (menuItemIds.has(item.menuItemId)) throw reject("Duplicate menu item");
        menuItemIds.add(item.menuItemId);
        if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
            throw reject("Quantity must be a positive integer");
        }
        return { menuItemId: item.menuItemId, quantity: item.quantity };
    });
    return { timeSlotId: body.timeSlotId, items };
}

function validateBody(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw reject("Invalid request body");
    const allowedKeys = ['customerId', 'timeSlotId', 'items', 'idempotencyKey', 'confirmed'];
    if (Object.keys(body).some(key => !allowedKeys.includes(key))) throw reject("Invalid request fields");
    if (body.confirmed !== true) {
        throw reject("Explicit customer confirmation is required");
    }
    if (typeof body.customerId !== 'string' || !mongoose.Types.ObjectId.isValid(body.customerId)) {
        throw reject("Invalid customer ID");
    }
    if (typeof body.timeSlotId !== 'string' || !mongoose.Types.ObjectId.isValid(body.timeSlotId)) {
        throw reject("Invalid time slot ID");
    }
    if (typeof body.idempotencyKey !== 'string' || !/^[A-Za-z0-9._:-]{1,128}$/.test(body.idempotencyKey)) {
        throw reject("Invalid idempotency key");
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
        throw reject("Items must contain between 1 and 50 entries");
    }

    const menuItemIds = new Set();
    const items = body.items.map(item => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) throw reject("Invalid item");
        if (Object.keys(item).some(key => !['menuItemId', 'quantity'].includes(key))) throw reject("Invalid item fields");
        if (typeof item.menuItemId !== 'string' || !mongoose.Types.ObjectId.isValid(item.menuItemId)) throw reject("Invalid menu item ID");
        if (menuItemIds.has(item.menuItemId)) throw reject("Duplicate menu item");
        menuItemIds.add(item.menuItemId);
        if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
            throw reject("Quantity must be a positive integer");
        }
        return { menuItemId: item.menuItemId, quantity: item.quantity };
    });

    return {
        customerId: body.customerId,
        timeSlotId: body.timeSlotId,
        idempotencyKey: body.idempotencyKey,
        confirmed: true,
        items
    };
}

function fingerprint(request) {
    return crypto.createHash('sha256').update(JSON.stringify({
        customerId: request.customerId,
        timeSlotId: request.timeSlotId,
        items: request.items
    })).digest('hex');
}

function responseFor(order, timeSlot) {
    return {
        orderId: order._id,
        pickupCode: order.pickupCode,
        items: order.items,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        timeSlot: {
            _id: timeSlot._id,
            date: timeSlot.date,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
        }
    };
}

async function createOrder(req, res) {
    if (!authenticateIntegration(req)) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (process.env.OMNIDIMENSION_DIRECT_ORDERING_ENABLED !== 'true') {
        return res.status(503).json({ message: "Direct OmniDimension ordering is not enabled" });
    }

    try {
        const request = validateBody(req.body);
        if (!authenticateDelegation(req, request.customerId)) {
            return res.status(401).json({ message: "Valid customer delegation is required" });
        }
        if (!authenticateConfirmation(req, request)) {
            return res.status(401).json({ message: "Valid customer confirmation is required" });
        }
        const requestFingerprint = fingerprint(request);
        const existingRequest = await omnidimensionRequestModel.findOne({ idempotencyKey: request.idempotencyKey });

        if (existingRequest) {
            if (existingRequest.requestFingerprint !== requestFingerprint) {
                return res.status(409).json({ message: "Idempotency key was already used for a different request" });
            }
            const existingOrder = await orderModel.findById(existingRequest.order);
            const existingTimeSlot = existingOrder
                ? await timeSlotModel.findById(existingOrder.timeSlot)
                : null;
            if (existingOrder && existingTimeSlot) {
                return res.status(200).json({ message: "Order already created", order: responseFor(existingOrder, existingTimeSlot) });
            }
            return res.status(409).json({ message: "Idempotency key is already being processed" });
        }

        // customerId identifies an account but does not delegate authority to order for it.
        const customer = await userModel.findById(request.customerId).select('_id role');
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        if (customer.role !== 'CUSTOMER') return res.status(403).json({ message: "Customer account required" });

        const order = await orderService.createOrderWithItems({
            userId: customer._id,
            timeSlotId: request.timeSlotId,
            items: request.items.map(item => ({ menuItem: item.menuItemId, quantity: item.quantity })),
            idempotency: { key: request.idempotencyKey, fingerprint: requestFingerprint }
        });
        const timeSlot = await timeSlotModel.findById(order.timeSlot);
        return res.status(201).json({ message: "Order created successfully", order: responseFor(order, timeSlot) });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Idempotency key is already being processed" });
        }
        if (err.status) return res.status(err.status).json({ message: err.message });
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { createOrder, issueDelegationToken, issueConfirmationToken };
