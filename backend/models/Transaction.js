const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  date: { type: Date, default: Date.now },
  note: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);