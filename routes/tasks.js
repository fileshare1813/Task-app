const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { ensureAuthenticated } = require('../config/auth');

// Add Task
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      user: req.user._id
    });
    await task.save();
    req.flash('success', 'Task added successfully');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Error adding task');
    res.redirect('/dashboard');
  }
});

// Complete Task
router.post('/:id/complete', ensureAuthenticated, async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, { completed: true });
    req.flash('success', 'Task marked complete');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Error completing task');
    res.redirect('/dashboard');
  }
});

// Delete Task
router.post('/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    req.flash('success', 'Task deleted');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Error deleting task');
    res.redirect('/dashboard');
  }
});

module.exports = router;