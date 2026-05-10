const Budget = require('../models/Budget');

exports.createBudget = async (req, res) => {
  try {
    const budget = await Budget.create({ ...req.body, user: req.user.id });
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ msg: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};