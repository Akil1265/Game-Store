const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getProfile,
  updateProfile
} = require('../controllers/userController');

const router = express.Router();

// GET /api/users/me
router.get('/me', authenticate, getProfile);

// PUT /api/users/me
router.put('/me', authenticate, updateProfile);

module.exports = router;