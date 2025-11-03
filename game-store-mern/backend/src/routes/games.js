const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
  getGames,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  getGameReviews,
  addGameReview
} = require('../controllers/gameController');

const router = express.Router();

// GET /api/games - Public route with filtering and search
router.get('/', getGames);

// POST /api/games - Admin only
router.post('/', authenticate, authorizeAdmin, createGame);

// PUT /api/games/:id - Admin only
router.put('/:id', authenticate, authorizeAdmin, updateGame);

// DELETE /api/games/:id - Admin only
router.delete('/:id', authenticate, authorizeAdmin, deleteGame);

// GET /api/games/:id/reviews - Public route
router.get('/:id/reviews', getGameReviews);

// POST /api/games/:id/reviews - Authenticated users only
router.post('/:id/reviews', authenticate, addGameReview);

// GET /api/games/:slug - Public route
router.get('/:slug', getGameBySlug);

module.exports = router;