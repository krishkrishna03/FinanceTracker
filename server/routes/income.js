const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
// @route   GET api/income
// @desc    Get all income records for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    console.error('Error fetching income records:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/income
// @desc    Create a new income record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, source, date } = req.body;

    const newIncome = new Income({
      user: req.user.id,
      amount,
      description,
      source,
      date: date || Date.now()
    });

    const income = await newIncome.save();
    res.json(income);
  } catch (err) {
    console.error('Error creating income record:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/income/:id
// @desc    Get income record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    // Check if income record exists
    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    // Check if user owns the income record
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(income);
  } catch (err) {
    console.error('Error fetching income record:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Income record not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT api/income/:id
// @desc    Update an income record
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, description, source, date } = req.body;

    // Find income record by ID
    let income = await Income.findById(req.params.id);

    // Check if income record exists
    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    // Check if user owns the income record
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update income record
    income.amount = amount || income.amount;
    income.description = description || income.description;
    income.source = source || income.source;
    if (date) income.date = date;

    // Save updated income record
    income = await income.save();
    res.json(income);
  } catch (err) {
    console.error('Error updating income record:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Income record not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/income/:id
// @desc    Delete an income record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income record deleted' });
  } catch (err) {
    console.error('Error deleting income record:', err.message);
    console.error(err.stack);

    res.status(500).send('Server error');
  }
});

module.exports = router;