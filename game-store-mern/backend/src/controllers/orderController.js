const Order = require('../models/Order');
const Game = require('../models/Game');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create order and Stripe PaymentIntent
const createOrder = async (req, res) => {
  try {
    const { items, currency = 'inr' } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }
    
    // Validate and populate items with current game data
    const orderItems = [];
    let subtotal = 0;
    
    for (const item of items) {
      const game = await Game.findById(item.gameId);
      if (!game) {
        return res.status(400).json({ error: `Game not found: ${item.gameId}` });
      }
      
      if (game.stock < item.qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${game.title}. Available: ${game.stock}` 
        });
      }
      
      const orderItem = {
        game: game._id,
        title: game.title,
        price: game.price,
        qty: item.qty
      };
      
      orderItems.push(orderItem);
      subtotal += game.price * item.qty;
    }
    
    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      total: subtotal // Add tax/shipping logic here if needed
    });
    
    await order.save();
    
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(subtotal * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    // Update order with PaymentIntent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();
    
    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      clientSecret: paymentIntent.client_secret,
      amount: subtotal
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find({ user: userId })
      .populate('items.game', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');
    
    const total = await Order.countDocuments({ user: userId });
    
    res.json({
      orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'ADMIN';
    
    const filter = isAdmin ? { _id: id } : { _id: id, user: userId };
    
    const order = await Order.findOne(filter)
      .populate('items.game', 'title images')
      .populate('user', 'name email')
      .select('-__v');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) {
      filter.paymentStatus = status;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.game', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    const validStatuses = ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    ).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
};
