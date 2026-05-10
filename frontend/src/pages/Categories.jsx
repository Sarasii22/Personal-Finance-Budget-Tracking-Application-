import { useState, useEffect } from 'react';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'Expense' });
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Category</button>
      </div>

      <div className="glass" style={{ padding: '25px' }}>
        {categories.map(c => (
          <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #333' }}>
            <div>
              <strong>{c.name}</strong> <span style={{color: '#888'}}>({c.type})</span>
            </div>
            <button onClick={() => deleteCategory(c._id)} className="btn btn-danger">Delete</button>
          </div>
        ))}
      </div>

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
              <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'20px'}}>Add Category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;