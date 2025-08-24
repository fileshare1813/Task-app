const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login Page
router.get('/login', (req, res) => {
  console.log('📝 Rendering login page');
  try {
    res.render('auth/login', { title: 'Login' });
  } catch (err) {
    console.error('❌ Error rendering login page:', err);
    res.status(500).send('Error loading login page');
  }
});

// Register Page
router.get('/register', (req, res) => {
  console.log('📝 Rendering register page');
  try {
    res.render('auth/register', { title: 'Register' });
  } catch (err) {
    console.error('❌ Error rendering register page:', err);
    res.status(500).send('Error loading register page');
  }
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
    console.log('✅ Google auth successful, redirecting to dashboard');
    res.redirect('/dashboard');
  }
);

// Local Login
router.post('/login', (req, res, next) => {
  console.log('🔐 Login attempt for:', req.body.email);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('❌ Login error:', err);
      req.flash('error', 'Login failed');
      return res.redirect('/auth/login');
    }
    
    if (!user) {
      console.log('❌ Login failed:', info?.message || 'Invalid credentials');
      req.flash('error', info?.message || 'Invalid credentials');
      return res.redirect('/auth/login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('❌ Session error:', err);
        req.flash('error', 'Session error');
        return res.redirect('/auth/login');
      }
      
      console.log('✅ Login successful for:', user.email);
      req.flash('success', 'Welcome back!');
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

// Register
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt for:', req.body.email);
  
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();
    console.log('✅ User registered successfully:', email);

    // Auto login
    req.logIn(newUser, (err) => {
      if (err) {
        console.error('❌ Auto login failed:', err);
        req.flash('error', 'Registration successful but auto login failed');
        return res.redirect('/auth/login');
      }
      
      console.log('✅ Auto login successful');
      req.flash('success', 'Registration successful! Welcome!');
      return res.redirect('/dashboard');
    });
    
  } catch (err) {
    console.error('❌ Registration error:', err);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  console.log('👋 Logout request from:', req.user?.email || 'unknown');
  
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      req.flash('error', 'Logout error');
      return res.redirect('/dashboard');
    }
    
    console.log('✅ Logout successful');
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
});

module.exports = router;