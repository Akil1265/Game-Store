const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { createGame, updateGame, deleteGame } = require('../controllers/gameController');

const router = express.Router();

// Admin Orders
router.get('/orders', authenticate, authorizeAdmin, getAllOrders);
router.put('/orders/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

// Admin Games
router.post('/games', authenticate, authorizeAdmin, createGame);
router.put('/games/:id', authenticate, authorizeAdmin, updateGame);
router.delete('/games/:id', authenticate, authorizeAdmin, deleteGame);

module.exports = router;
