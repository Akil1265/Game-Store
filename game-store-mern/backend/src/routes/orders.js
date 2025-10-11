const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrder,
  
} = require('../controllers/orderController');

const router = express.Router();

// POST /api/orders - Create order (authenticated users)
router.post('/', authenticate, createOrder);

// GET /api/orders/me - Get user's orders
router.get('/me', authenticate, getUserOrders);

// GET /api/orders/:id - Get single order (owner or admin)
router.get('/:id', authenticate, getOrder);

module.exports = router;