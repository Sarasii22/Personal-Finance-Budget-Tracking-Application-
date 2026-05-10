import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, budgetRes] = await Promise.all([
          axios.get('http://localhost:5000/api/transactions', config),
          axios.get('http://localhost:5000/api/budgets', config)
        ]);

        setTransactions(transRes.data.slice(0, 5));

        const income = transRes.data.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transRes.data.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

        setSummary({
          totalIncome: income,
          totalExpense: expense,
          balance: income - expense
        });

        setBudgets(budgetRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Chart Data
  const expenseByCategory = {};
  transactions.forEach(t => {
    if (t.type === 'Expense') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{ data: Object.values(expenseByCategory), backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#8b5cf6'] }]
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#22c55e' }}>Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass card-hover" style={{ padding: '25px' }}>
          <h3>Total Income</h3>
          <h2 style={{ color: '#22c55e' }}>${summary.totalIncome.toFixed(2)}</h2>
        </div>
        <div className="glass card-hover" style={{ padding: '25px' }}>
          <h3>Total Expenses</h3>
          <h2 style={{ color: '#ef4444' }}>${summary.totalExpense.toFixed(2)}</h2>
        </div>
        <div className="glass card-hover" style={{ padding: '25px' }}>
          <h3>Current Balance</h3>
          <h2 style={{ color: summary.balance >= 0 ? '#22c55e' : '#ef4444' }}>
            ${summary.balance.toFixed(2)}
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        {/* Expense Distribution */}
        <div className="glass" style={{ padding: '25px' }}>
          <h3>Expense by Category</h3>
          <Pie data={pieData} />
        </div>

        {/* Recent Transactions */}
        <div className="glass" style={{ padding: '25px' }}>
          <h3>Recent Transactions</h3>
          {transactions.map(t => (
            <div key={t._id} style={{ padding: '12px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{t.title}</strong> <span style={{ color: '#888' }}>- {t.category}</span>
              </div>
              <span style={{ color: t.type === 'Income' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                {t.type === 'Income' ? '+' : '-'}${t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;