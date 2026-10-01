const mongoose = require('mongoose');
const { generateUniqueCode } = require('../utils/code.util');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'menu',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  _id: false
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pickupCode: {
    type: String
  },
  pickupStatus: {
    type: String,
    enum: ['NOT_PICKED_UP', 'PICKED_UP'],
    default: 'NOT_PICKED_UP',
    required: true
  },
  pickedUpAt: {
    type: Date,
    default: null
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
    required: true
  },
  paymentId: {
    type: String,
    default: null
  },
  paymentOrderId: {
    type: String,
    default: null
  }
}, { timestamps: true });

orderSchema.index(
  { pickupCode: 1 },
  { unique: true, partialFilterExpression: { pickupCode: { $type: 'string' } } }
);

orderSchema.pre('validate', async function(){
  if (!this.pickupCode) {
    this.pickupCode = await generateUniqueCode(
      mongoose.model('Order'),
      'pickupCode',
      code => `P${code}`
    );
  }
});

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;
