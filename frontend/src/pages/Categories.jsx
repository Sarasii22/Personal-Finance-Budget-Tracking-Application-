import { useState, useEffect } from 'react';
import { AddButton, DeleteButton, EditButton, AppButton } from '../components/Buttons';
import TopConfirmPopup from '../components/TopConfirmPopup';
import api from '../services/api';

const defaultExpenseCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Travel', 'Rent', 'Insurance'];
const defaultIncomeCategories = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gift', 'Business'];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'Expense' });
  const [showModal, setShowModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: '', type: 'Expense' });
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [filterType, setFilterType] = useState('All');

  const fetchCategories = async () => {
    const res = await api.get('/api/categories');
    setCategories(res.data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/api/categories', form);
    fetchCategories();
    setShowModal(false);
    setForm({ name: '', type: 'Expense' });
  };

  const deleteCategory = async (id) => {
    await api.delete(`/api/categories/${id}`);
    fetchCategories();
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setEditingForm({ name: category.name, type: category.type });
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

  const updateCategory = async (id) => {
    try {
      if (!editingForm.name.trim()) return;
      await api.put(`/api/categories/${id}`, editingForm);
      setEditingCategoryId(null);
      setEditingForm({ name: '', type: 'Expense' });
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to update category');
    }
  };

  const addDefaultCategory = async (name, type) => {
    await api.post('/api/categories', { name, type });
    fetchCategories();
  };

  const expenseCount = categories.filter(c => c.type === 'Expense').length;
  const incomeCount = categories.filter(c => c.type === 'Income').length;
  const filteredCategories = filterType === 'All' ? categories : categories.filter(c => c.type === filterType);
  const categoryNames = new Set(categories.map(c => c.name));
  const availableExpenses = defaultExpenseCategories.filter(c => !categoryNames.has(c));
  const availableIncomes = defaultIncomeCategories.filter(c => !categoryNames.has(c));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '0' }}>Categories</h1>
          <p style={{ color: '#aaa', fontSize: '13px', marginTop: '6px' }}>Expenses: <strong style={{ color: '#ef4444' }}>{expenseCount}</strong> | Incomes: <strong style={{ color: '#22c55e' }}>{incomeCount}</strong></p>
        </div>
        <AddButton className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Category</AddButton>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['All', 'Expense', 'Income'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: filterType === type ? '#22c55e' : '#333',
              color: filterType === type ? '#000' : '#fff',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredCategories.length > 0 && (
      <div className="glass" style={{ padding: '25px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Your Categories</h3>
        {filteredCategories.map(c => (
          <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #333' }}>
            {editingCategoryId === c._id ? (
              <>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '180px' }}
                    value={editingForm.name}
                    onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                    required
                  />
                  <select
                    className="form-control"
                    style={{ width: '150px' }}
                    value={editingForm.type}
                    onChange={(e) => setEditingForm({ ...editingForm, type: e.target.value })}
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <AppButton className="btn btn-primary" onClick={() => updateCategory(c._id)}>Update</AppButton>
                  <AppButton className="btn btn-danger" onClick={() => { setEditingCategoryId(null); setEditingForm({ name: '', type: 'Expense' }); }}>Cancel</AppButton>
                </div>
              </>
            ) : (
              <>
                <div>
                  <strong>{c.name}</strong> <span style={{color: '#888'}}>({c.type})</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <EditButton onClick={() => openConfirm('Edit Category', 'Do you want to edit this category?', () => startEditCategory(c))}>Edit</EditButton>
                  <DeleteButton onClick={() => openConfirm('Delete Category', 'Do you want to delete this category?', () => deleteCategory(c._id))} className="btn btn-danger">Delete</DeleteButton>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      )}

      {(filterType === 'Expense' || filterType === 'All') && availableExpenses.length > 0 && (
        <div className="glass" style={{ padding: '25px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Available Expense Categories</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {availableExpenses.map(name => (
              <div key={name} style={{ padding: '12px', background: '#071029', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{name}</strong> <span style={{ color: '#888' }}>(Expense)</span>
                </div>
                <AddButton onClick={() => addDefaultCategory(name, 'Expense')} className="btn btn-primary" style={{ padding: '6px 12px' }}>Add</AddButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {(filterType === 'Income' || filterType === 'All') && availableIncomes.length > 0 && (
        <div className="glass" style={{ padding: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Available Income Categories</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {availableIncomes.map(name => (
              <div key={name} style={{ padding: '12px', background: '#071029', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{name}</strong> <span style={{ color: '#888' }}>(Income)</span>
                </div>
                <AddButton onClick={() => addDefaultCategory(name, 'Income')} className="btn btn-primary" style={{ padding: '6px 12px' }}>Add</AddButton>
              </div>
            ))}
          </div>
        </div>
      )}

      <TopConfirmPopup
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      {showModal && (
        <div className="modal">
          <div className="glass" style={{ padding: '30px', width: '400px' }}>
            <h2>Add New Category</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Category Name" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <AddButton type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Category</AddButton>
                <AppButton
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setShowModal(false);
                    setForm({ name: '', type: 'Expense' });
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

export default Categories;