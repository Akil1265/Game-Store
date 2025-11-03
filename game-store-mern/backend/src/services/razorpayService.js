/**
 * DUMMY RAZORPAY SERVICE - FOR DEMO PURPOSES ONLY
 * This simulates Razorpay payment flow without requiring actual Razorpay SDK
 */

const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key_for_testing';
  }

  /**
   * Create a dummy Razorpay order
   * @param {Object} options - Order options
   * @returns {Object} Dummy order object
   */
  createOrder(options) {
    const { amount, currency = 'INR', receipt } = options;

    // Generate dummy order ID
    const orderId = `order_${crypto.randomBytes(14).toString('hex')}`;

    return {
      id: orderId,
      entity: 'order',
      amount: amount, // Amount in smallest currency unit (paise for INR)
      amount_paid: 0,
      amount_due: amount,
      currency: currency,
      receipt: receipt,
      status: 'created',
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Verify dummy Razorpay payment signature
   * @param {Object} params - Verification params
   * @returns {Boolean} True if signature is valid
   */
  verifyPaymentSignature(params) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    // In dummy mode, we'll generate and verify a signature
    const generated_signature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return generated_signature === razorpay_signature;
  }

  /**
   * Generate dummy payment signature (for testing)
   * @param {String} orderId - Order ID
   * @param {String} paymentId - Payment ID
   * @returns {String} Generated signature
   */
  generateSignature(orderId, paymentId) {
    return crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  /**
   * Simulate payment success (for testing)
   * @param {String} orderId - Razorpay order ID
   * @returns {Object} Dummy payment object
   */
  simulatePaymentSuccess(orderId) {
    const paymentId = `pay_${crypto.randomBytes(14).toString('hex')}`;
    const signature = this.generateSignature(orderId, paymentId);

    return {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      status: 'captured',
      method: 'card',
      amount: 0,
      currency: 'INR',
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Get key ID for frontend
   * @returns {String} Razorpay key ID
   */
  getKeyId() {
    return this.keyId;
  }
}

module.exports = new RazorpayService();
