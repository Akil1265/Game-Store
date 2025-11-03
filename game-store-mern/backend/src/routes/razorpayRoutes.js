const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const razorpayController = require('../controllers/razorpayController');

// Get Razorpay key (public)
router.get('/key', razorpayController.getRazorpayKey);

// Create Razorpay order (protected)
router.post('/create-order', authenticate, razorpayController.createRazorpayOrder);

// Verify Razorpay payment (protected)
router.post('/verify', authenticate, razorpayController.verifyRazorpayPayment);

// Simulate payment success - DUMMY (for testing only)
router.post('/simulate-success', authenticate, razorpayController.simulateRazorpaySuccess);

module.exports = router;
