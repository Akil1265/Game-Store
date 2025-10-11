const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/i.test(v) || v.startsWith('/uploads/');
      },
      message: 'Invalid image URL format'
    }
  }],
  platform: [{
    type: String,
    enum: ['PC', 'PS5', 'Xbox', 'Nintendo Switch', 'Mobile', 'VR']
  }],
  genre: [{
    type: String,
    enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Puzzle', 'Fighting', 'Horror', 'Indie', 'MMO', 'Battle Royale', 'FPS', 'Platformer', 'Runner', 'VR']
  }],
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  releaseDate: {
    type: Date
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  rating: {
    avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Create text index for search functionality
GameSchema.index({ title: 'text', description: 'text' });

// Create indexes for filtering
GameSchema.index({ genre: 1 });
GameSchema.index({ platform: 1 });
GameSchema.index({ price: 1 });
GameSchema.index({ 'rating.avg': -1 });
GameSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug from title
GameSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to update rating
GameSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { game: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.avg = Math.round(stats[0].avgRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.avg = 0;
    this.rating.count = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Game', GameSchema);
