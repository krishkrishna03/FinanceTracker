const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// Helper function to get date range based on time range
const getDateRange = (timeRange) => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 3);
  }
  
  return { startDate, endDate };
};

// Helper function to get formatted month names
const getMonthName = (date) => {
  return date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
};

// @route   GET api/analysis
// @desc    Get analysis data with different time ranges
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let startDate, endDate;
    
    // Handle custom date range or predefined time range
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      const dateRange = getDateRange(req.query.timeRange || '3m');
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    // Date filters
    const dateFilter = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Get expenses in date range
    const expenses = await Expense.find({
      user: req.user.id,
      ...dateFilter
    }).sort({ date: 1 });
    
    // Get income in date range
    const incomes = await Income.find({
      user: req.user.id,
      ...dateFilter
    }).sort({ date: 1 });
    
    // Calculate expense by category
    const expenseByCategory = {};
    expenses.forEach(expense => {
      if (!expenseByCategory[expense.category]) {
        expenseByCategory[expense.category] = 0;
      }
      expenseByCategory[expense.category] += expense.amount;
    });
    
    // Format expense by category data
    const expenseByCategoryData = Object.keys(expenseByCategory).map(category => ({
      category,
      total: expenseByCategory[category]
    })).sort((a, b) => b.total - a.total);
    
    // Calculate income by source
    const incomeBySource = {};
    incomes.forEach(income => {
      if (!incomeBySource[income.source]) {
        incomeBySource[income.source] = 0;
      }
      incomeBySource[income.source] += income.amount;
    });
    
    // Format income by source data
    const incomeBySourceData = Object.keys(incomeBySource).map(source => ({
      category: source,
      total: incomeBySource[source]
    })).sort((a, b) => b.total - a.total);
    
    // Generate monthly data
    const monthlyData = [];
    const months = {};
    
    // Function to ensure all months in range are included
    const generateMonthsInRange = (start, end) => {
      const result = [];
      const current = new Date(start);
      
      while (current <= end) {
        const monthYear = getMonthName(current);
        result.push({
          month: monthYear,
          income: 0,
          expense: 0
        });
        months[monthYear] = result.length - 1;
        current.setMonth(current.getMonth() + 1);
      }
      
      return result;
    };
    
    // Generate all months in the range
    const monthsData = generateMonthsInRange(startDate, endDate);
    
    // Add expense data by month
    expenses.forEach(expense => {
      const monthYear = getMonthName(new Date(expense.date));
      if (months[monthYear] !== undefined) {
        monthsData[months[monthYear]].expense += expense.amount;
      }
    });
    
    // Add income data by month
    incomes.forEach(income => {
      const monthYear = getMonthName(new Date(income.date));
      if (months[monthYear] !== undefined) {
        monthsData[months[monthYear]].income += income.amount;
      }
    });
    
    // Calculate total income and expenses
    const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
    const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Calculate savings rate
    const savingsRate = totalIncome > 0 
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) 
      : 0;
    
    res.json({
      expenseByCategory: expenseByCategoryData,
      incomeBySource: incomeBySourceData,
      monthlyData: monthsData,
      savingsRate
    });
  } catch (err) {
    console.error('Error fetching analysis data:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;