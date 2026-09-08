const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menu',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
