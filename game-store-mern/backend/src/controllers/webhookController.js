const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Game = require('../models/Game');

// Handle Stripe webhook events
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  if (!orderId) {
    console.error('No orderId found in payment intent metadata');
    return;
  }
  
  const order = await Order.findById(orderId);
  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }
  
  // Update order status
  order.paymentStatus = 'PAID';
  order.orderStatus = 'CONFIRMED';
  await order.save();
  
  // Update game stock
  for (const item of order.items) {
    await Game.findByIdAndUpdate(
      item.game,
      { $inc: { stock: -item.qty } }
    );
  }
  
  console.log(`Order ${orderId} marked as PAID`);
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  const orderId = paymentIntent.metadata.orderId;
  
  if (!orderId) {
    console.error('No orderId found in payment intent metadata');
    return;
  }
  
  const order = await Order.findById(orderId);
  if (!order) {
    console.error(`Order not found: ${orderId}`);
    return;
  }
  
  // Update order status
  order.paymentStatus = 'FAILED';
  await order.save();
  
  console.log(`Order ${orderId} marked as FAILED`);
};

// Test webhook endpoint for development
const testWebhook = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId and status are required' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (status === 'PAID') {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      
      // Update game stock
      for (const item of order.items) {
        await Game.findByIdAndUpdate(
          item.game,
          { $inc: { stock: -item.qty } }
        );
      }
    } else if (status === 'FAILED') {
      order.paymentStatus = 'FAILED';
    }
    
    await order.save();
    
    res.json({
      message: `Order ${orderId} marked as ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Test webhook failed' });
  }
};

module.exports = {
  handleStripeWebhook,
  testWebhook
};
