const reviewModel = require('../models/review.model');
const orderModel = require('../models/order.model');
const mongoose = require('mongoose');

async function createReview(req, res) {
    try {
        const { orderId, menuItemId, rating, comment } = req.body;
        const userId = req.user._id;

        if (!orderId || !menuItemId || rating === undefined) {
            return res.status(400).json({ message: "orderId, menuItemId, and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only review your own orders" });
        }

        if (order.paymentStatus !== "PAID") {
            return res.status(400).json({ message: "You can only review paid orders" });
        }

        // Check if menuItem exists in the order
        const itemExists = order.items.some(item => item.menuItem.toString() === menuItemId);
        if (!itemExists) {
            return res.status(400).json({ message: "Menu item not found in this order" });
        }

        // Prevent duplicate review
        const existingReview = await reviewModel.findOne({
            user: userId,
            order: orderId,
            menuItem: menuItemId
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this item for this order" });
        }

        const newReview = await reviewModel.create({
            user: userId,
            menuItem: menuItemId,
            order: orderId,
            rating,
            comment
        });

        return res.status(201).json({ message: "Review created successfully", review: newReview });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getReviewsByMenuItem(req, res) {
    try {
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ message: "Invalid menuItemId" });
        }

        const reviews = await reviewModel.find({ menuItem: menuItemId })
            .populate('user', 'name')
            .populate('menuItem', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only update your own review" });
        }

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        return res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own review" });
        }

        await reviewModel.findByIdAndDelete(reviewId);

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getAverageRating(req, res) {
    try {
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ message: "Invalid menuItemId" });
        }

        const result = await reviewModel.aggregate([
            { $match: { menuItem: new mongoose.Types.ObjectId(menuItemId) } },
            { 
                $group: { 
                    _id: null, 
                    averageRating: { $avg: "$rating" }, 
                    totalReviews: { $sum: 1 } 
                } 
            }
        ]);

        if (result.length === 0) {
            return res.status(200).json({ averageRating: 0, totalReviews: 0 });
        }

        return res.status(200).json({
            averageRating: parseFloat(result[0].averageRating.toFixed(1)),
            totalReviews: result[0].totalReviews
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { createReview, getReviewsByMenuItem, updateReview, deleteReview, getAverageRating };
