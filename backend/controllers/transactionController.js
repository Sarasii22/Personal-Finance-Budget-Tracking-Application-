const Transaction = require('../models/Transaction');

exports.addTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.user.id });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    let query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (type) query.type = type;
    if (category) query.category = category;

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    res.json({ msg: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};