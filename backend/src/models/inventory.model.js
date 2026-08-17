const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menu',
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minimumStock: {
        type: Number,
        required: true,
        min: 0,
        default: 5
    }
}, {
    timestamps: true
})

const inventoryModel = mongoose.model('inventory', inventorySchema)

module.exports = inventoryModel;
