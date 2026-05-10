const Category = require('../models/Category');

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

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};