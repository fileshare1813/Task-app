const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update profile route
router.put('/profile', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { name: req.body.name });
    req.flash('info', 'आपका प्रोफाइल अपडेट हो गया है');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'प्रोफाइल अपडेट करने में त्रुटि');
    res.redirect('/profile/edit');
  }
});

module.exports = router;