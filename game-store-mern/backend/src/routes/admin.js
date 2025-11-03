const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { createGame, updateGame, deleteGame } = require('../controllers/gameController');
const { getSalesDashboard, getAllUsers, updateUserRole, getCategoryStats } = require('../controllers/adminController');

const router = express.Router();

// Admin Dashboard
router.get('/dashboard/sales', authenticate, authorizeAdmin, getSalesDashboard);
router.get('/dashboard/categories', authenticate, authorizeAdmin, getCategoryStats);

// Admin Orders
router.get('/orders', authenticate, authorizeAdmin, getAllOrders);
router.put('/orders/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

// Admin Games
router.post('/games', authenticate, authorizeAdmin, createGame);
router.put('/games/:id', authenticate, authorizeAdmin, updateGame);
router.delete('/games/:id', authenticate, authorizeAdmin, deleteGame);

// Admin Users
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.put('/users/:id/role', authenticate, authorizeAdmin, updateUserRole);

module.exports = router;
