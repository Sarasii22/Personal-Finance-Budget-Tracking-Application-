const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

router.post('/', protect, addTransaction);
router.get('/', protect, getTransactions);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;