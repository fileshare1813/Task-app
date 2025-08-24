const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login Page
router.get('/login', (_, res) => {
  res.render('auth/login', { title: 'Login' });
});

// Register Page
router.get('/register', (_, res) => {
  res.render('auth/register', { title: 'Register' });
});

// Google Auth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Local Login
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })
);

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    req.login(newUser, (err) => {
      if (err) {
        req.flash('error', 'Auto login failed');
        return res.redirect('/auth/login');
      }
      res.redirect('/dashboard');
    });
  } catch (err) {
    req.flash('error', 'Registration error');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash('error', 'Logout error');
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

module.exports = router;