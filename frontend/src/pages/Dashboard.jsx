import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getBudgetPeriodRange = (budget) => {
  const anchorDate = new Date(budget.updatedAt || budget.createdAt || Date.now());

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

        setTransactions(transRes.data);

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

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const expenseByCategory = {};
  transactions.forEach(t => {
    if (t.type === 'Expense') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (Number.isNaN(transactionDate.getTime())) return;

    const monthIndex = transactionDate.getMonth();
    const amount = Number(transaction.amount) || 0;

    if (transaction.type === 'Income') {
      monthlyIncome[monthIndex] += amount;
    }

    if (transaction.type === 'Expense') {
      monthlyExpenses[monthIndex] += amount;
    }
  });

  const budgetLabels = budgets.map((budget) => budget.category);
  const budgetAmounts = budgets.map((budget) => Number(budget.amount) || 0);
  const actualSpending = budgets.map((budget) => {
    const { startDate, endDate } = getBudgetPeriodRange(budget);

    return transactions.reduce((total, transaction) => {
      const transactionDate = new Date(transaction.date);
      if (
        transaction.type !== 'Expense' ||
        transaction.category !== budget.category ||
        Number.isNaN(transactionDate.getTime()) ||
        transactionDate < startDate ||
        transactionDate > endDate
      ) {
        return total;
      }

      return total + (Number(transaction.amount) || 0);
    }, 0);
  });

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{ data: Object.values(expenseByCategory), backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#8b5cf6'] }]
  };

  const monthlyComparisonData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncome,
        backgroundColor: '#22c55e',
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: '#ef4444',
      }
    ]
  };

  const budgetVsActualData = {
    labels: budgetLabels,
    datasets: [
      {
        label: 'Budget',
        data: budgetAmounts,
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Actual Spending',
        data: actualSpending,
        backgroundColor: '#f59e0b',
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e0e0e0' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255,255,255,0.08)' }
      },
      y: {
        ticks: { color: '#aaa' },
        grid: { color: 'rgba(255,255,255,0.08)' }
      }
    }
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '25px' }}>
        <div className="glass" style={{ padding: '25px', minHeight: '360px' }}>
          <h3 style={{ marginBottom: '16px' }}>Monthly Income vs Expenses</h3>
          <div style={{ height: '280px' }}>
            <Bar data={monthlyComparisonData} options={barOptions} />
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', minHeight: '360px' }}>
          <h3 style={{ marginBottom: '16px' }}>Budget vs Actual Spending</h3>
          <div style={{ height: '280px' }}>
            <Bar data={budgetVsActualData} options={{ ...barOptions, indexAxis: 'y' }} />
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="glass" style={{ padding: '25px', minHeight: '360px' }}>
          <h3>Expense by Category</h3>
          <div style={{ height: '280px' }}>
            <Pie data={pieData} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass" style={{ padding: '25px', minHeight: '360px' }}>
          <h3>Recent Transactions</h3>
          {recentTransactions.map(t => (
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