const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');

router.post('/', protect, createBudget);
router.get('/', protect, getBudgets);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;