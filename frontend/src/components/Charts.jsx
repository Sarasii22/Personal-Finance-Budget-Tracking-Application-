import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

const Charts = ({ incomeTrendData, expenseTrendData, transactionCountData, pieData, barOptions }) => {
  return (
    <div className="charts-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
      <div className="glass" style={{ padding: '16px', minHeight: '320px' }}>
        <h4>Income Trend (All Time)</h4>
        <div style={{ height: '220px' }}>
          <Line data={incomeTrendData} options={{ ...barOptions, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="glass" style={{ padding: '16px', minHeight: '320px' }}>
        <h4>Expenses Trend (All Time)</h4>
        <div style={{ height: '220px' }}>
          <Line data={expenseTrendData} options={{ ...barOptions, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="glass" style={{ padding: '16px', minHeight: '320px' }}>
        <h4>Transactions Count by Month</h4>
        <div style={{ height: '220px' }}>
          <Bar data={transactionCountData} options={{ ...barOptions, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="glass" style={{ padding: '16px', minHeight: '320px' }}>
        <h4>Expense by Category (All Time)</h4>
        <div style={{ height: '220px' }}>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
