import { useState, useEffect } from 'react';
import axios from 'axios';
import { AddButton, DeleteButton, EditButton, AppButton } from '../components/Buttons';
import TopConfirmPopup from '../components/TopConfirmPopup';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'Expense' });
  const [showModal, setShowModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: '', type: 'Expense' });
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:5000/api/categories', config);
    setCategories(res.data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/categories', form, config);
    fetchCategories();
    setShowModal(false);
    setForm({ name: '', type: 'Expense' });
  };

  const deleteCategory = async (id) => {
    await axios.delete(`http://localhost:5000/api/categories/${id}`, config);
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
      await axios.put(`http://localhost:5000/api/categories/${id}`, editingForm, config);
      setEditingCategoryId(null);
      setEditingForm({ name: '', type: 'Expense' });
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.msg || 'Unable to update category');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Categories</h1>
        <AddButton className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Category</AddButton>
      </div>

      <div className="glass" style={{ padding: '25px' }}>
        {categories.map(c => (
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