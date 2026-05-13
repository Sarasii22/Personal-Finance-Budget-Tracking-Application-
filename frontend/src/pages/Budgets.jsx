import { useState, useEffect } from 'react';
import { AddButton, DeleteButton, EditButton, ViewExpensesButton, AppButton } from '../components/Buttons';
import TopConfirmPopup from '../components/TopConfirmPopup';
import BudgetExpensesPopup from '../components/BudgetExpensesPopup';
import api from '../services/api';

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
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    const [budgetRes, transRes, catRes] = await Promise.all([
      api.get('/api/budgets'),
      api.get('/api/transactions'),
      api.get('/api/categories')
    ]);
    setBudgets(budgetRes.data);
    setTransactions(transRes.data);
    setCategories(catRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  // Calculate total income from all transactions
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newAmount = Number(form.amount) || 0;
    const budgetWithoutCurrentCategory = budgets.filter(b => b.category !== form.category);
    const newTotalBudget = budgetWithoutCurrentCategory.reduce((sum, b) => sum + Number(b.amount), 0) + newAmount;

    if (newTotalBudget > totalIncome) {
      setFormError(`Total budget (Rs. ${newTotalBudget.toFixed(2)}) cannot exceed total income (Rs. ${totalIncome.toFixed(2)})`);
      return;
    }

    await api.post('/api/budgets', form);
    fetchData();
    setShowModal(false);
    setForm({ category: '', amount: '', period: 'Monthly' });
  };

  const deleteBudget = async (id) => {
    await api.delete(`/api/budgets/${id}`);
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
    const newAmount = Number(editingAmount) || 0;
    const budgetWithoutCurrent = budgets.filter(b => b._id !== id);
    const newTotalBudget = budgetWithoutCurrent.reduce((sum, b) => sum + Number(b.amount), 0) + newAmount;

    if (newTotalBudget > totalIncome) {
      openConfirm('Budget Exceeds Income', `Total budget (Rs. ${newTotalBudget.toFixed(2)}) cannot exceed total income (Rs. ${totalIncome.toFixed(2)})`, null);
      return;
    }

    await api.put(`/api/budgets/${id}`, { category, amount: editingAmount });
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

  // Total budget and distribution across all expense categories (include categories without budgets)
  const categoryBudgetMap = {};
  budgets.forEach(b => { categoryBudgetMap[b.category] = Number(b.amount) || 0; });
  const expenseCategories = categories.filter(c => c.type === 'Expense');
  const totalBudget = expenseCategories.reduce((sum, c) => sum + (categoryBudgetMap[c.name] || 0), 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Budgets</h1>
        <AddButton className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Budget</AddButton>
      </div>

      <div className="budget-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass" style={{ padding: '20px', gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0 }}>Total Budget: Rs. {totalBudget.toFixed(2)}</h3>
          <div className="budget-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {expenseCategories.map(cat => {
              const amt = categoryBudgetMap[cat.name] || 0;
              const pct = totalBudget > 0 ? (amt / totalBudget) * 100 : 0;
              return (
                <div key={cat._id} style={{ padding: '10px', background: '#071029', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{cat.name}</strong>
                    <span>Rs. {amt.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '8px', background: '#222', borderRadius: '6px', marginTop: '8px' }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: '#22c55e', borderRadius: '6px' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>{pct.toFixed(1)}% of total</div>
                </div>
              );
            })}
          </div>
        </div>
        {budgets.map(b => {
          const budgetExpenses = getBudgetExpenses(b);
          const spent = budgetExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
          const percentage = b.amount ? (spent / Number(b.amount)) * 100 : 0;
          const budgetPeriodRange = getBudgetPeriodRange(b);

          return (
            <div key={b._id} className="glass" style={{ padding: '25px' }}>
              <h3>{b.category}</h3>
              <h2>Rs. {b.amount}</h2>
              <p style={{ color: '#aaa', marginBottom: '6px' }}>Period: {b.period}</p>
              <p style={{ color: '#888', marginBottom: '10px', fontSize: '13px' }}>
                From {formatDate(budgetPeriodRange.startDate)} to {formatDate(budgetPeriodRange.endDate)}
              </p>
              <div style={{ height: '10px', background: '#333', borderRadius: '10px', margin: '15px 0' }}>
                <div
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: '100%',
                    background: percentage > 100 ? '#991b1b' : (percentage > 90 ? '#ef4444' : '#22c55e'),
                    borderRadius: '10px'
                  }}
                ></div>
              </div>
              <p>Spent: Rs. {spent} ({percentage.toFixed(1)}%)</p>
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
                <div className="budget-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'nowrap', alignItems: 'center' }}>
                  <EditButton onClick={() => openConfirm('Edit Budget', 'Do you want to edit this budget?', () => startEditBudget(b))}>Edit</EditButton>
                  <ViewExpensesButton onClick={() => setViewBudget(b)}>View Expenses</ViewExpensesButton>
                  <DeleteButton onClick={() => openConfirm('Delete Budget', 'Do you want to delete this budget?', () => deleteBudget(b._id))}>Delete</DeleteButton>
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
          <div className="glass modal-card" style={{ padding: '30px', width: '400px' }}>
            <h2>New Budget</h2>
            {formError && <div style={{ background: '#ef4444', color: '#fff', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>{formError}</div>}
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '15px' }}>Total Income: <strong style={{ color: '#22c55e' }}>Rs. {totalIncome.toFixed(2)}</strong></p>
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
                    setFormError('');
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