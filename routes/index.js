const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Task = require('../models/Task');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('welcome', { title: 'Welcome' });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      tasks: tasks
    });
  } catch (err) {
    req.flash('error', 'Error loading tasks');
    res.redirect('/');
  }
});

// Profile Page
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', {
    title: 'Profile',
    user: req.user
  });
});

// About Page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

// 404 Not Found Page - Should be the LAST route
router.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user || null  // Pass user data if available
  });
});

module.exports = router;