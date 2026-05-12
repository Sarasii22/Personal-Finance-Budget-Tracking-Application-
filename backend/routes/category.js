const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/', protect, addCategory);
router.get('/', protect, getCategories);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;