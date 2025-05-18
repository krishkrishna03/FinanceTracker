const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// @route   GET api/expenses
// @desc    Get all expenses for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    const newExpense = new Expense({
      user: req.user.id,
      amount,
      description,
      category,
      date: date || Date.now()
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error('Error creating expense:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Error fetching expense:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    // Find expense by ID
    let expense = await Expense.findById(req.params.id);

    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update expense
    expense.amount = amount || expense.amount;
    expense.description = description || expense.description;
    expense.category = category || expense.category;
    if (date) expense.date = date;

    // Save updated expense
    expense = await expense.save();
    res.json(expense);
  } catch (err) {
    console.error('Error updating expense:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find expense by ID
    const expense = await Expense.findById(req.params.id);

    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user owns the expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete expense
    await expense.remove();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;