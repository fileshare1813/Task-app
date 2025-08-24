const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

// Update profile route
router.post('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      req.flash('error', 'Name cannot be empty');
      return res.redirect('/profile');
    }

    await User.findByIdAndUpdate(req.user._id, { 
      name: name.trim() 
    });
    
    // Update the session user object
    req.user.name = name.trim();
    
    console.log('✅ Profile updated for:', req.user.email);
    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
    
  } catch (err) {
    console.error('❌ Profile update error:', err);
    req.flash('error', 'Error updating profile. Please try again.');
    res.redirect('/profile');
  }
});

module.exports = router;