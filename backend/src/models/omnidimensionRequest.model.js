const mongoose = require('mongoose');

const omnidimensionRequestSchema = new mongoose.Schema({
    idempotencyKey: {
        type: String,
        required: true,
        unique: true
    },
    requestFingerprint: {
        type: String,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('OmniDimensionRequest', omnidimensionRequestSchema);
