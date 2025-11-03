const User = require('../models/User');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl, age, upiId } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const updateData = {
      name: name.trim()
    };

    const unsetData = {};

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : '';
    }

    if (age !== undefined) {
      if (age === null || age === '') {
        unsetData.age = '';
      } else {
        const numericAge = Number(age);
        if (
          Number.isNaN(numericAge) ||
          !Number.isInteger(numericAge) ||
          numericAge < 0 ||
          numericAge > 120
        ) {
          return res.status(400).json({ error: 'Please provide a valid age between 0 and 120' });
        }
        updateData.age = numericAge;
      }
    }

    if (upiId !== undefined) {
      const trimmedUpi = String(upiId).trim();
      if (!trimmedUpi) {
        unsetData.upiId = '';
      } else {
        const upiRegex = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;
        if (!upiRegex.test(trimmedUpi)) {
          return res.status(400).json({ error: 'Please enter a valid UPI ID (example: name@bank)' });
        }
        updateData.upiId = trimmedUpi;
      }
    }

    const updatePayload = {};
    if (Object.keys(updateData).length > 0) {
      updatePayload.$set = updateData;
    }
    if (Object.keys(unsetData).length > 0) {
      updatePayload.$unset = unsetData;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
