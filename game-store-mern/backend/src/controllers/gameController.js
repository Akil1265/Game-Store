const Game = require('../models/Game');
const Review = require('../models/Review');

// Get all games with filtering, search, and pagination
const getGames = async (req, res) => {
  try {
    const {
      q,
      genre,
      platform,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = 'createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Text search
    if (q) {
      filter.$text = { $search: q };
    }
    
    // Genre filter
    if (genre) {
      filter.genre = genre;
    }
    
    // Platform filter
    if (platform) {
      filter.platform = platform;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions['rating.avg'] = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Add text score sorting if text search is used
    if (q) {
      sortOptions.score = { $meta: 'textScore' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const games = await Game.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');
    
    const total = await Game.countDocuments(filter);
    
    res.json({
      games,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};

// Get single game by slug
const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const game = await Game.findOne({ slug }).select('-__v');
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
};

// Create game (Admin only)
const createGame = async (req, res) => {
  try {
    const gameData = req.body;
    
    // Generate slug if not provided
    if (!gameData.slug && gameData.title) {
      gameData.slug = gameData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const game = new Game(gameData);
    await game.save();
    
    res.status(201).json({
      message: 'Game created successfully',
      game
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Game with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// Update game (Admin only)
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const game = await Game.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({
      message: 'Game updated successfully',
      game
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Game with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update game' });
  }
};

// Delete game (Admin only)
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Also delete all reviews for this game
    await Review.deleteMany({ game: id });
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
};

// Get game reviews
const getGameReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const reviews = await Review.find({ game: id })
      .populate('user', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');
    
    const total = await Review.countDocuments({ game: id });
    
    res.json({
      reviews,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Add review to game
const addGameReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user already reviewed this game
    const existingReview = await Review.findOne({ game: id, user: userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this game' });
    }
    
    // Create review
    const review = new Review({
      game: id,
      user: userId,
      rating,
      comment
    });
    
    await review.save();
    await review.populate('user', 'name avatarUrl');

    // Update game's aggregate rating after adding a review
    try {
      await game.updateRating();
    } catch (aggErr) {
      // Don't fail the request due to rating aggregation issues
      console.warn('Failed to update game rating:', aggErr.message);
    }
    
    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
};

module.exports = {
  getGames,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  getGameReviews,
  addGameReview
};
