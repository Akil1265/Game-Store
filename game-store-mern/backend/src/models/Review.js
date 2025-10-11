const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews by same user for same game
ReviewSchema.index({ game: 1, user: 1 }, { unique: true });

// Index for game reviews
ReviewSchema.index({ game: 1, createdAt: -1 });

// Post-save middleware to update game rating
ReviewSchema.post('save', async function() {
  const Game = mongoose.model('Game');
  const game = await Game.findById(this.game);
  if (game) {
    await game.updateRating();
  }
});

// Post-remove middleware to update game rating
ReviewSchema.post('remove', async function() {
  const Game = mongoose.model('Game');
  const game = await Game.findById(this.game);
  if (game) {
    await game.updateRating();
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
