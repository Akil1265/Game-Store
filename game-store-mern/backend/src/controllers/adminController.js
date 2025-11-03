const Order = require('../models/Order');
const Game = require('../models/Game');
const User = require('../models/User');

// Get sales dashboard data
const getSalesDashboard = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    const matchStage = {
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'PAID'
    };

    const [salesTrend, topGames, revenueAgg, totalOrders, newUsers, totalGames] = await Promise.all([
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            totalSales: { $sum: "$total" },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.game",
            totalSold: { $sum: "$items.qty" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
          }
        },
        {
          $lookup: {
            from: "games",
            localField: "_id",
            foreignField: "_id",
            as: "gameDetails"
          }
        },
        { $unwind: "$gameDetails" },
        {
          $project: {
            title: "$gameDetails.title",
            totalSold: 1,
            revenue: 1
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ]),
      Order.countDocuments(matchStage),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Game.estimatedDocumentCount()
    ]);

    res.json({
      salesTrend,
      topGames,
      summary: {
        revenue: revenueAgg[0]?.total || 0,
        orders: totalOrders,
        newUsers,
        totalGames
      }
    });
  } catch (error) {
    console.error('Sales dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

// Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Number(limit), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const baseQuery = User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select('name email role avatarUrl createdAt updatedAt');

    const [users, total] = await Promise.all([
      baseQuery.lean(),
      User.countDocuments(filter)
    ]);
    
    res.json({
      users,
      pagination: {
        current: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total,
        limit: limitNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user role (admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Get category stats
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Game.aggregate([
      {
        $group: {
          _id: "$genre",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
};

module.exports = {
  getSalesDashboard,
  getAllUsers,
  updateUserRole,
  getCategoryStats
};