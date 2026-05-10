import { useState, useEffect } from 'react';
import axios from 'axios';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: '', amount: '' });
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

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
    setForm({ category: '', amount: '' });
  };

  const deleteBudget = async (id) => {
    await axios.delete(`http://localhost:5000/api/budgets/${id}`, config);
    fetchData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>Budgets</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Budget</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {budgets.map(b => {
          const spent = transactions
            .filter(t => t.category === b.category && t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);
          const percentage = Math.min((spent / b.amount) * 100, 100);

          return (
            <div key={b._id} className="glass" style={{ padding: '25px' }}>
              <h3>{b.category}</h3>
              <h2>${b.amount}</h2>
              <div style={{ height: '10px', background: '#333', borderRadius: '10px', margin: '15px 0' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: percentage > 90 ? '#ef4444' : '#22c55e', borderRadius: '10px' }}></div>
              </div>
              <p>Spent: ${spent} ({percentage.toFixed(1)}%)</p>
              <button onClick={() => deleteBudget(b._id)} className="btn btn-danger" style={{ marginTop: '10px' }}>Delete</button>
            </div>
          );
        })}
      </div>

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
              <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'20px'}}>Create Budget</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;