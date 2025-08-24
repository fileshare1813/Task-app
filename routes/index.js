const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Task = require('../models/Task');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  console.log('🏠 Rendering welcome page');
  try {
    res.render('welcome', { title: 'Welcome' });
  } catch (err) {
    console.error('❌ Error rendering welcome page:', err);
    res.status(500).send('Error loading welcome page');
  }
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  console.log('📊 Dashboard request from user:', req.user?.email || 'unknown');
  
  try {
    // Check if user is properly authenticated
    if (!req.user || !req.user._id) {
      console.error('❌ User not properly authenticated');
      req.flash('error', 'Authentication error');
      return res.redirect('/auth/login');
    }
    
    console.log('👤 Loading tasks for user ID:', req.user._id);
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    console.log('📝 Found tasks:', tasks.length);
    
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      tasks: tasks
    });
    
  } catch (err) {
    console.error('❌ Dashboard error:', err);
    req.flash('error', 'Error loading dashboard: ' + err.message);
    res.redirect('/');
  }
});

// Profile Page
router.get('/profile', ensureAuthenticated, (req, res) => {
  console.log('👤 Profile request from user:', req.user?.email || 'unknown');
  
  try {
    res.render('profile', {
      title: 'Profile',
      user: req.user
    });
  } catch (err) {
    console.error('❌ Error rendering profile page:', err);
    req.flash('error', 'Error loading profile');
    res.redirect('/dashboard');
  }
});

// About Page
router.get('/about', (req, res) => {
  console.log('ℹ️ About page request');
  try {
    res.render('about', { title: 'About Us' });
  } catch (err) {
    console.error('❌ Error rendering about page:', err);
    res.status(500).send('Error loading about page');
  }
});

module.exports = router;