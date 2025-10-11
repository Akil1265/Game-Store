const express = require('express');
const {
  handleStripeWebhook,
  testWebhook
} = require('../controllers/webhookController');

const router = express.Router();

// POST /api/webhooks/stripe - Stripe webhook endpoint
// Note: This needs raw body, so we handle it before express.json() middleware
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// POST /api/webhooks/test - Test webhook for development
router.post('/test', testWebhook);

module.exports = router;