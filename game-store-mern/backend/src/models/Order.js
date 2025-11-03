const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  items: [{
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  paymentIntentId: {
    type: String,
    trim: true
  },
  orderStatus: {
    type: String,
    enum: ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PROCESSING'
  }
}, {
  timestamps: true
});

// Index for user orders
// Indexes tuned for common dashboard and lookup patterns
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ paymentIntentId: 1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'items.game': 1 });

// Calculate totals before saving
OrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    this.total = this.subtotal; // Add tax/shipping logic here if needed
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
