const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// @route   GET api/dashboard/summary
// @desc    Get summary data (total income and expenses)
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    // Get total expenses
    const expenses = await Expense.find({ user: req.user.id });
    const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);

    // Get total income
    const incomes = await Income.find({ user: req.user.id });
    const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/dashboard/recent-transactions
// @desc    Get recent transactions (combined expenses and income)
// @access  Private
router.get('/recent-transactions', auth, async (req, res) => {
  try {
    // Get recent expenses
    const expenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Format expenses with type field
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      type: 'expense'
    }));

    // Get recent income
    const incomes = await Income.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Format income with type field
    const formattedIncomes = incomes.map(income => ({
      ...income,
      type: 'income',
      category: income.source
    }));

    // Combine and sort by date
    const recentTransactions = [...formattedExpenses, ...formattedIncomes]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json(recentTransactions);
  } catch (err) {
    console.error('Error fetching recent transactions:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/dashboard/expense-categories
// @desc    Get expense breakdown by category
// @access  Private
router.get('/expense-categories', auth, async (req, res) => {
  try {
    // Get all expenses
    const expenses = await Expense.find({ user: req.user.id });

    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });

    // Format data for chart
    const formattedData = Object.keys(categories).map(category => ({
      category,
      total: categories[category]
    }));

    // Sort by total amount descending
    formattedData.sort((a, b) => b.total - a.total);

    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching expense categories:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;