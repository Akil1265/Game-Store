const Order = require('../models/Order');
const razorpayService = require('../services/razorpayService');
const { AppError } = require('../utils/errors');

/**
 * Create Razorpay order (DUMMY)
 * @route POST /api/payments/razorpay/create-order
 * @access Private
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Find the order in database
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized to access this order', 403);
    }

    // Convert amount to paise (smallest unit for INR)
    const amountInPaise = Math.round(order.total * 100);

    // Create dummy Razorpay order
    const razorpayOrder = razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString()
    });

    // Store Razorpay order ID in our order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayService.getKeyId()
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment (DUMMY)
 * @route POST /api/payments/razorpay/verify
 * @access Private
 */
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Find and update order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized to access this order', 403);
    }

    // Update order payment status
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.razorpayPaymentId = razorpay_payment_id;
    order.paidAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: order
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Simulate payment success (DUMMY - for testing only)
 * @route POST /api/payments/razorpay/simulate-success
 * @access Private
 */
exports.simulateRazorpaySuccess = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized to access this order', 403);
    }

    if (!order.razorpayOrderId) {
      throw new AppError('Razorpay order not created yet', 400);
    }

    // Simulate payment success
    const paymentData = razorpayService.simulatePaymentSuccess(order.razorpayOrderId);

    res.status(200).json({
      success: true,
      message: 'Payment simulated successfully',
      data: paymentData
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get Razorpay key for frontend
 * @route GET /api/payments/razorpay/key
 * @access Public
 */
exports.getRazorpayKey = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        keyId: razorpayService.getKeyId()
      }
    });
  } catch (error) {
    next(error);
  }
};
