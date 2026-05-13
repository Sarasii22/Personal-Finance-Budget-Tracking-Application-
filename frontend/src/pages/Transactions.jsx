import { useState, useEffect } from 'react';
import { AddButton, AppButton, DeleteButton, EditButton } from '../components/Buttons';
import TopConfirmPopup from '../components/TopConfirmPopup';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: '', type: 'Expense', date: '', note: '' });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const openDatePicker = (event) => {
    event.currentTarget.showPicker?.();
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/transactions', { params: filters });
      setTransactions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchTransactions(); 
    fetchCategories();
  }, [filters]);

  useEffect(() => {
    
    if (form.category && !categories.find(c => c.name === form.category && c.type === form.type)) {
      setForm({ ...form, category: '' });
    }
  }, [form.type, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/transactions/${editingId}`, form);
      } else {
        await api.post('/api/transactions', form);
      }
      fetchTransactions();
      setShowModal(false);
      setForm({ title: '', amount: '', category: '', type: 'Expense', date: '', note: '' });
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const editTransaction = (t) => {
    setForm(t);
    setEditingId(t._id);
    setShowModal(true);
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/api/transactions/${id}`);
    fetchTransactions();
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

  const expenseCount = transactions.filter(t => t.type === 'Expense').length;
  const incomeCount = transactions.filter(t => t.type === 'Income').length;
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncomes = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '0' }}>Transactions</h1>
          <p style={{ color: '#aaa', fontSize: '13px', marginTop: '6px' }}>
            Incomes: <strong style={{ color: '#22c55e' }}>{incomeCount} (Rs. {totalIncomes.toFixed(2)})</strong> | 
            Expenses: <strong style={{ color: '#ef4444' }}>{expenseCount} (Rs. {totalExpenses.toFixed(2)})</strong>
          </p>
        </div>
        <AddButton className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Transaction</AddButton>
      </div>

      {/* Quick Filters */}
      <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setFilters({ ...filters, type: '' })} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: filters.type === '' ? '#22c55e' : '#333', color: filters.type === '' ? '#000' : '#fff', fontWeight: '500' }}>All</button>
        <button onClick={() => setFilters({ ...filters, type: 'Income' })} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: filters.type === 'Income' ? '#22c55e' : '#333', color: filters.type === 'Income' ? '#000' : '#fff', fontWeight: '500' }}>Incomes</button>
        <button onClick={() => setFilters({ ...filters, type: 'Expense' })} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: filters.type === 'Expense' ? '#22c55e' : '#333', color: filters.type === 'Expense' ? '#000' : '#fff', fontWeight: '500' }}>Expenses</button>
      </div>
      <div className="glass filter-panel" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <select className="form-control" style={{ width: '180px' }} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <select className="form-control" style={{ width: '180px' }} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input type="date" className="form-control" style={{ width: '180px', cursor: 'pointer' }} onClick={openDatePicker} onFocus={openDatePicker} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" className="form-control" style={{ width: '180px', cursor: 'pointer' }} onClick={openDatePicker} onFocus={openDatePicker} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
      </div>

      {/* Transaction List */}
      <div className="glass transaction-list" style={{ padding: '20px' }}>
        {transactions.map(t => (
          <div key={t._id} className="transaction-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #333' }}>
            <div>
              <strong>{t.title}</strong> <span style={{color:'#888'}}>({t.category})</span><br />
              <small>{new Date(t.date).toLocaleDateString()}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: t.type === 'Income' ? '#22c55e' : '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>
                {t.type === 'Income' ? '+' : '-'}Rs. {t.amount}
              </span>
              <div style={{ marginTop: '8px' }}>
                <EditButton onClick={() => openConfirm('Edit Transaction', 'Do you want to edit this transaction?', () => editTransaction(t))} style={{ marginRight: '10px', padding: '5px 12px' }}>Edit</EditButton>
                <DeleteButton onClick={() => openConfirm('Delete Transaction', 'Do you want to delete this transaction?', () => deleteTransaction(t._id))} className="btn btn-danger" style={{ padding: '5px 12px' }}>Delete</DeleteButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TopConfirmPopup
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="glass modal-card" style={{ padding: '30px', width: '420px' }}>
            <h2>{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Title" className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <input type="number" placeholder="Amount" className="form-control" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
              <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="">Select Category</option>
                {categories.filter(c => c.type === form.type).map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input type="date" className="form-control" style={{ cursor: 'pointer' }} value={form.date} onClick={openDatePicker} onFocus={openDatePicker} onChange={e => setForm({...form, date: e.target.value})} />
              <textarea placeholder="Note" className="form-control" value={form.note} onChange={e => setForm({...form, note: e.target.value})}></textarea>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <AppButton type="submit" className="btn btn-primary">Save</AppButton>
                <AppButton type="button" className="btn btn-danger" onClick={() => {setShowModal(false); setEditingId(null);}}>Cancel</AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;