require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1); // 🔥 Render ke liye must

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none' // 🔥 Google OAuth fix
  }
}));

// Passport configuration
try {
  require('./config/passport')(passport);
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('✅ Passport configured successfully');
} catch (err) {
  console.error('❌ Passport configuration error:', err);
}

app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };
  res.locals.user = req.user || null;
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

// Routes with error handling
try {
  const authRouter = require('./routes/auth');
  const tasksRouter = require('./routes/tasks');
  const usersRouter = require('./routes/users');
  const indexRouter = require('./routes/index');

  app.use('/auth', authRouter);
  app.use('/tasks', tasksRouter);
  app.use('/users', usersRouter);
  app.use('/', indexRouter);
  
  console.log('✅ All routes loaded successfully');
} catch (err) {
  console.error('❌ Error loading routes:', err);
  process.exit(1);
}

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.url);
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user || null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    user: req.user || null
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Views directory: ${path.join(__dirname, 'views')}`);
  console.log(`📁 Static files: ${path.join(__dirname, 'public')}`);
});
