import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';   // ← Clean single import
import { Bar, Pie } from 'react-chartjs-2';
import { WhiteButton } from '../components/Buttons';
import Charts from '../components/Charts';
import api from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

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
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, budgetRes] = await Promise.all([
          api.get('/api/transactions'),
          api.get('/api/budgets')
        ]);

        setTransactions(transRes.data);

        const income = transRes.data.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transRes.data.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);

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
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const expenseByCategory = {};
  transactions.forEach(t => {
    if (t.type === 'Expense') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + (Number(t.amount) || 0);
    }
  });

  const monthYearSet = new Set();
  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthYearSet.add(key);
  });

  const monthYearKeys = Array.from(monthYearSet).sort();
  const monthYearLabels = monthYearKeys.map(k => {
    const [y, m] = k.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
  });

  const monthlyIncome = monthYearKeys.map(() => 0);
  const monthlyExpenses = monthYearKeys.map(() => 0);
  const monthlyTransactionCounts = monthYearKeys.map(() => 0);

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (Number.isNaN(transactionDate.getTime())) return;

    const key = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    const idx = monthYearKeys.indexOf(key);
    if (idx === -1) return;

    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'Income') monthlyIncome[idx] += amount;
    if (transaction.type === 'Expense') monthlyExpenses[idx] += amount;
    monthlyTransactionCounts[idx] += 1;
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

  const budgetInsights = budgets.map((budget, index) => {
    const spent = actualSpending[index] || 0;
    const limit = Number(budget.amount) || 0;
    const utilization = limit > 0 ? (spent / limit) * 100 : 0;
    return { category: budget.category, spent, limit, utilization };
  }).sort((a, b) => b.utilization - a.utilization);

  const topExpenseCategory = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  const savingsRate = summary.totalIncome > 0
    ? (summary.balance / summary.totalIncome) * 100
    : 0;

  const averageMonthlyExpense = monthlyExpenses.length > 0
    ? monthlyExpenses.reduce((sum, value) => sum + value, 0) / monthlyExpenses.length
    : 0;

  const nearBudgets = budgetInsights.filter((budget) => budget.utilization >= 80 && budget.utilization < 100);
  const passedBudgets = budgetInsights.filter((budget) => budget.utilization >= 100);
  const watchlistBudgets = nearBudgets.slice(0, 3);

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{ data: Object.values(expenseByCategory), backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#8b5cf6'] }]
  };

  const monthlyComparisonData = {
    labels: monthYearLabels.length ? monthYearLabels : monthLabels,
    datasets: [
      { label: 'Income', data: monthlyIncome, backgroundColor: '#22c55e' },
      { label: 'Expenses', data: monthlyExpenses, backgroundColor: '#ef4444' }
    ]
  };

  const transactionCountData = {
    labels: monthYearLabels.length ? monthYearLabels : monthLabels,
    datasets: [{ label: 'Transactions', data: monthlyTransactionCounts, backgroundColor: '#64748b' }]
  };

  const incomeTrendData = {
    labels: monthYearLabels.length ? monthYearLabels : monthLabels,
    datasets: [{ label: 'Income', data: monthlyIncome, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true }]
  };

  const expenseTrendData = {
    labels: monthYearLabels.length ? monthYearLabels : monthLabels,
    datasets: [{ label: 'Expenses', data: monthlyExpenses, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', fill: true }]
  };

  const budgetVsActualData = {
    labels: budgetLabels,
    datasets: [
      { label: 'Budget', data: budgetAmounts, backgroundColor: '#3b82f6' },
      { label: 'Actual Spending', data: actualSpending, backgroundColor: '#f59e0b' }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e0e0e0' } }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.08)' } }
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h1 style={{ marginBottom: '0', color: '#22c55e' }}>Dashboard</h1>
        <div>
          <WhiteButton onClick={() => setShowMore(true)} style={{ marginRight: '10px' }}>View More Charts</WhiteButton>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass card-hover" style={{ padding: '25px' }}>
          <h3>Total Income</h3>
          <h2 style={{ color: '#22c55e' }}>Rs. {summary.totalIncome.toFixed(2)}</h2>
        </div>
        <div className="glass card-hover" style={{ padding: '25px' }}>
          <h3>Total Expenses</h3>
          <h2 style={{ color: '#ef4444' }}>Rs. {summary.totalExpense.toFixed(2)}</h2>
        </div>
        <div className="glass card-hover" style={{ padding: '25px' }}>
          <h3>Current Balance</h3>
          <h2 style={{ color: summary.balance >= 0 ? '#22c55e' : '#ef4444' }}>
            Rs. {summary.balance.toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="glass insights-panel" style={{ padding: '25px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0 }}>Financial Insights</h3>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px' }}>Quick signals from your current transactions and budgets.</p>
          </div>
          <Link to="/budgets" style={{ color: '#22c55e', fontWeight: 600 }}>Review budgets</Link>
        </div>

        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '18px', background: '#071029', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Savings Rate</p>
            <h3 style={{ margin: '10px 0 0', color: savingsRate >= 0 ? '#22c55e' : '#ef4444' }}>{savingsRate.toFixed(1)}%</h3>
          </div>
          <div style={{ padding: '18px', background: '#071029', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Top Spending Category</p>
            <h3 style={{ margin: '10px 0 0' }}>
              {topExpenseCategory ? `${topExpenseCategory[0]} • Rs. ${Number(topExpenseCategory[1]).toFixed(2)}` : 'No expenses yet'}
            </h3>
          </div>
          <div style={{ padding: '18px', background: '#071029', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Average Monthly Spend</p>
            <h3 style={{ margin: '10px 0 0' }}>Rs. {averageMonthlyExpense.toFixed(2)}</h3>
          </div>
          <div style={{ padding: '18px', background: '#071029', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Budgets to Watch</p>
            <h3 style={{ margin: '10px 0 0', color: (passedBudgets.length > 0 ? '#ef4444' : (nearBudgets.length > 0 ? '#f59e0b' : '#22c55e')) }}>
              {nearBudgets.length} near • {passedBudgets.length} passed
            </h3>
          </div>
        </div>

        {watchlistBudgets.length > 0 && (
          <div style={{ marginTop: '18px', padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <p style={{ margin: '0 0 12px', color: '#fbbf24', fontWeight: 600 }}>Budget watchlist</p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {watchlistBudgets.map((budget) => (
                <div key={budget.category} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <span>{budget.category}</span>
                  <span>
                    {budget.utilization.toFixed(1)}% used • Rs. {budget.spent.toFixed(2)} / Rs. {budget.limit.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '25px' }}>
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

        <div className="glass" style={{ padding: '25px', minHeight: '360px' }}>
          <h3>Expense by Category</h3>
          <div style={{ height: '280px' }}>
            <Pie data={pieData} />
          </div>
        </div>

        <div className="glass" style={{ padding: '25px', minHeight: '360px' }}>
          <h3>Recent Transactions</h3>
          {recentTransactions.slice(0, 8).map((transaction) => (
            <div key={transaction._id} className="transaction-row" style={{ padding: '12px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{transaction.title}</strong> <span style={{ color: '#888' }}>- {transaction.category}</span>
                <div style={{ color: '#666', fontSize: '12px' }}>{new Date(transaction.date).toLocaleString()}</div>
              </div>
              <span style={{ color: transaction.type === 'Income' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                {transaction.type === 'Income' ? '+' : '-'}Rs. {transaction.amount}
              </span>
            </div>
          ))}
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <WhiteButton onClick={() => navigate('/transactions')}>View All Transactions</WhiteButton>
          </div>
        </div>
      </div>

      {showMore && (
        <div className="more-charts-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="more-charts-card" style={{ width: '90%', maxWidth: '1100px', background: '#0b1220', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>More Charts</h3>
              <div>
                <WhiteButton onClick={() => setShowMore(false)}>Close</WhiteButton>
              </div>
            </div>
            <Charts
              incomeTrendData={incomeTrendData}
              expenseTrendData={expenseTrendData}
              transactionCountData={transactionCountData}
              pieData={pieData}
              barOptions={barOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;