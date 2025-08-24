require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users'); // Uncommented this line

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Ensure this points to your static files directory

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
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

// Route mounting - IMPORTANT: Order matters!
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter); // Added this line

// 404 handler (should be after all other routes)
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user || null
  });
});

// Error handler
app.use((err, req, res, next) => {
  // console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: err.message,
    user: req.user || null
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});