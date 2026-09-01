const mongoose = require('mongoose');
const orderModel = require('../models/order.model')
const razorpay = require('../config/razorpay')
const crypto=require('crypto')

async function createPaymentOrder(req, res) {
    try {
        const { orderId } = req.body;

        // 1. Check if orderId is provided
        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        // 2. Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: "Invalid Order ID"
            });
        }

        // 3. Find the CafeQ order
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // 4. Ensure the logged-in user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot pay for another user's order"
            });
        }

        // 5. Prevent payment for an already paid order
        if (order.paymentStatus === "PAID") {
            return res.status(400).json({
                message: "Order is already paid"
            });
        }

        // 6. Convert rupees to paise
        // Example: ₹620 -> 62000 paise
        const amountInPaise = Math.round(order.totalAmount * 100);

        // 7. Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: order._id.toString()
        });

        // 8. Save Razorpay order ID in our CafeQ order
        order.paymentOrderId = razorpayOrder.id;

        await order.save();

        // 9. Send Razorpay order details to frontend
        return res.status(200).json({
            message: "Payment order created successfully",
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function verifyPayment(req,res){
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // 1. Check if all required fields are provided
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "All payment details are required"
            });
        }
     // 2. Find the CafeQ order using Razorpay order ID
        const order = await orderModel.findOne({ paymentOrderId:razorpay_order_id});

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        // 3. Ensure the logged-in user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot verify payment for another user's order"
            });
        }
        // 4. Verify the Razorpay signature
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }
        // 5. Update the order's payment status to PAID
        order.paymentStatus = "PAID";
        order.paymentId = razorpay_payment_id;
        await order.save();
        // 6. Respond with success
        return res.status(200).json({
            message: "Payment verified and order marked as PAID"
        });
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:"Failed to verify Payment"
        })
    }
}

module.exports = { createPaymentOrder,verifyPayment};