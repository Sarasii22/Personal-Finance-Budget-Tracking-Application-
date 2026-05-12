import { useState, useEffect } from 'react';
import axios from 'axios';
import { AddButton, AppButton, DeleteButton, EditButton } from '../components/Buttons';
import TopConfirmPopup from '../components/TopConfirmPopup';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: '', type: 'Expense', date: '', note: '' });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions', { ...config, params: filters });
      setTransactions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories', config);
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchTransactions(); 
    fetchCategories();
  }, [filters]);

  useEffect(() => {
    // Clear category if it's not valid for the selected type
    if (form.category && !categories.find(c => c.name === form.category && c.type === form.type)) {
      setForm({ ...form, category: '' });
    }
  }, [form.type, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, form, config);
      } else {
        await axios.post('http://localhost:5000/api/transactions', form, config);
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
    await axios.delete(`http://localhost:5000/api/transactions/${id}`, config);
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Transactions</h1>
        <AddButton className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Transaction</AddButton>
      </div>

      {/* Filters */}
      <div className="glass" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
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
        <input type="date" className="form-control" style={{ width: '180px' }} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" className="form-control" style={{ width: '180px' }} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
      </div>

      {/* Transaction List */}
      <div className="glass" style={{ padding: '20px' }}>
        {transactions.map(t => (
          <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #333' }}>
            <div>
              <strong>{t.title}</strong> <span style={{color:'#888'}}>({t.category})</span><br />
              <small>{new Date(t.date).toLocaleDateString()}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: t.type === 'Income' ? '#22c55e' : '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>
                {t.type === 'Income' ? '+' : '-'}${t.amount}
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
          <div className="glass" style={{ padding: '30px', width: '420px' }}>
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
              <input type="date" className="form-control" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
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