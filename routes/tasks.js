const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { ensureAuthenticated } = require('../config/auth');

// Add Task
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    
    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      user: req.user._id
    });
    
    await task.save();
    console.log('✅ Task created:', task.title);
    req.flash('success', 'Task added successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Error adding task:', err);
    req.flash('error', 'Error adding task');
    res.redirect('/dashboard');
  }
});

// Get single task (for editing)
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      req.flash('error', 'Task not found');
      return res.redirect('/dashboard');
    }
    
    res.render('edit-task', {
      title: 'Edit Task',
      task: task,
      user: req.user
    });
  } catch (err) {
    console.error('❌ Error loading task:', err);
    req.flash('error', 'Error loading task');
    res.redirect('/dashboard');
  }
});

// Update Task
router.post('/:id/update', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      req.flash('error', 'Task not found');
      return res.redirect('/dashboard');
    }
    
    await Task.findByIdAndUpdate(req.params.id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });
    
    console.log('✅ Task updated:', title);
    req.flash('success', 'Task updated successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Error updating task:', err);
    req.flash('error', 'Error updating task');
    res.redirect('/dashboard');
  }
});

// Complete Task
router.post('/:id/complete', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      req.flash('error', 'Task not found');
      return res.redirect('/dashboard');
    }
    
    await Task.findByIdAndUpdate(req.params.id, { completed: !task.completed });
    
    const message = task.completed ? 'Task marked as incomplete' : 'Task marked as complete';
    console.log('✅', message, ':', task.title);
    req.flash('success', message);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Error updating task:', err);
    req.flash('error', 'Error updating task');
    res.redirect('/dashboard');
  }
});

// Delete Task
router.post('/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      req.flash('error', 'Task not found');
      return res.redirect('/dashboard');
    }
    
    await Task.findByIdAndDelete(req.params.id);
    console.log('✅ Task deleted:', task.title);
    req.flash('success', 'Task deleted successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    req.flash('error', 'Error deleting task');
    res.redirect('/dashboard');
  }
});

module.exports = router;