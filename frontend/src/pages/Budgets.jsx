import { useState, useEffect } from 'react';
import axios from 'axios';
import { AddButton, DeleteButton, EditButton, AppButton } from '../components/Buttons';
import TopConfirmPopup from '../components/TopConfirmPopup';
import BudgetExpensesPopup from '../components/BudgetExpensesPopup';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: '', amount: '', period: 'Monthly' });
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [viewBudget, setViewBudget] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    const [budgetRes, transRes, catRes] = await Promise.all([
      axios.get('http://localhost:5000/api/budgets', config),
      axios.get('http://localhost:5000/api/transactions', config),
      axios.get('http://localhost:5000/api/categories', config)
    ]);
    setBudgets(budgetRes.data);
    setTransactions(transRes.data);
    setCategories(catRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/budgets', form, config);
    fetchData();
    setShowModal(false);
    setForm({ category: '', amount: '', period: 'Monthly' });
  };

  const deleteBudget = async (id) => {
    await axios.delete(`http://localhost:5000/api/budgets/${id}`, config);
    fetchData();
  };

  const startEditBudget = (budget) => {
    setEditingBudgetId(budget._id);
    setEditingAmount(budget.amount);
  };

  const openConfirm = (title, message, onConfirm) => {
    setConfirmState({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirm = () => {
    const action = confirmState.onConfirm;
    closeConfirm();
    if (action) action();
  };

  const updateBudget = async (id, category) => {
    await axios.put(`http://localhost:5000/api/budgets/${id}`, { category, amount: editingAmount }, config);
    setEditingBudgetId(null);
    setEditingAmount('');
    fetchData();
  };

  const getBudgetAnchorDate = (budget) => new Date(budget.updatedAt || budget.createdAt || Date.now());

  const getBudgetPeriodRange = (budget) => {
    const anchorDate = getBudgetAnchorDate(budget);

    if (budget.period === 'Weekly') {
      const date = new Date(anchorDate);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { startDate: date, endDate: weekEnd };
    }

    if (budget.period === 'Yearly') {
      const startDate = new Date(anchorDate.getFullYear(), 0, 1);
      const endDate = new Date(anchorDate.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    }

    const startDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const endDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const getBudgetExpenses = (budget) => {
    const { startDate, endDate } = getBudgetPeriodRange(budget);
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transaction.type === 'Expense' &&
        transaction.category === budget.category &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      );
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Budgets</h1>
        <AddButton className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Budget</AddButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {budgets.map(b => {
          const budgetExpenses = getBudgetExpenses(b);
          const spent = budgetExpenses.reduce((sum, t) => sum + t.amount, 0);
          const percentage = Math.min((spent / b.amount) * 100, 100);
          const budgetPeriodRange = getBudgetPeriodRange(b);

          return (
            <div key={b._id} className="glass" style={{ padding: '25px' }}>
              <h3>{b.category}</h3>
              <h2>${b.amount}</h2>
              <p style={{ color: '#aaa', marginBottom: '6px' }}>Period: {b.period}</p>
              <p style={{ color: '#888', marginBottom: '10px', fontSize: '13px' }}>
                From {formatDate(budgetPeriodRange.startDate)} to {formatDate(budgetPeriodRange.endDate)}
              </p>
              <div style={{ height: '10px', background: '#333', borderRadius: '10px', margin: '15px 0' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: percentage > 90 ? '#ef4444' : '#22c55e', borderRadius: '10px' }}></div>
              </div>
              <p>Spent: ${spent} ({percentage.toFixed(1)}%)</p>
              {editingBudgetId === b._id ? (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '170px' }}
                    value={editingAmount}
                    onChange={(e) => setEditingAmount(e.target.value)}
                  />
                  <AppButton className="btn btn-primary" onClick={() => updateBudget(b._id, b.category)}>Update</AppButton>
                  <AppButton className="btn btn-danger" onClick={() => { setEditingBudgetId(null); setEditingAmount(''); }}>Cancel</AppButton>
                </div>
              ) : (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'nowrap', alignItems: 'center' }}>
                  <EditButton className="btn budget-action-btn" onClick={() => openConfirm('Edit Budget', 'Do you want to edit this budget?', () => startEditBudget(b))}>Edit</EditButton>
                  <AppButton className="btn budget-action-btn budget-view-btn" onClick={() => setViewBudget(b)}>View Expenses</AppButton>
                  <AppButton className="btn budget-action-btn budget-delete-btn" onClick={() => openConfirm('Delete Budget', 'Do you want to delete this budget?', () => deleteBudget(b._id))}>Delete</AppButton>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TopConfirmPopup
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      <BudgetExpensesPopup
        open={!!viewBudget}
        budget={viewBudget}
        expenses={viewBudget ? getBudgetExpenses(viewBudget) : []}
        onClose={() => setViewBudget(null)}
      />

      {showModal && (
        <div className="modal">
          <div className="glass" style={{ padding: '30px', width: '400px' }}>
            <h2>New Budget</h2>
            <form onSubmit={handleSubmit}>
              <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="">Select Category</option>
                {categories.filter(c => c.type === 'Expense').map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input type="number" placeholder="Budget Amount" className="form-control" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              <select className="form-control" value={form.period || 'Monthly'} onChange={e => setForm({...form, period: e.target.value})} style={{ marginTop: '12px' }}>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <p style={{ marginTop: '10px', color: '#aaa', fontSize: '13px' }}>
                {(() => {
                  const previewBudget = { period: form.period || 'Monthly', createdAt: new Date(), updatedAt: new Date() };
                  const range = getBudgetPeriodRange(previewBudget);
                  return `From ${formatDate(range.startDate)} to ${formatDate(range.endDate)}`;
                })()}
              </p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <AddButton type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Budget</AddButton>
                <AppButton
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setShowModal(false);
                    setForm({ category: '', amount: '', period: 'Monthly' });
                  }}
                >
                  Cancel
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;