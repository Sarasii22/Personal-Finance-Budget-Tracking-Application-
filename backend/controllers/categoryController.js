const Category = require('../models/Category');
const Budget = require('../models/Budget');

exports.addCategory = async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, user: req.user.id });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    
    // Delete associated budgets
    await Budget.deleteMany({ user: req.user.id, category: category.name });
    
    // Delete the category
    await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Category and associated budgets deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};