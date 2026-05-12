import { AppButton } from './Buttons';

const BudgetExpensesPopup = ({ open, budget, expenses, onClose }) => {
  if (!open || !budget) return null;

  const anchorDate = new Date(budget.updatedAt || budget.createdAt || Date.now());
  const getRange = () => {
    if (budget.period === 'Weekly') {
      const startDate = new Date(anchorDate);
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    }

    if (budget.period === 'Yearly') {
      return {
        startDate: new Date(anchorDate.getFullYear(), 0, 1),
        endDate: new Date(anchorDate.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    }

    return {
      startDate: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1),
      endDate: new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();
  const range = getRange();

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="budget-expenses-popup glass" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start', marginBottom: '18px' }}>
          <div>
            <h3 style={{ marginBottom: '6px' }}>{budget.category} Expenses</h3>
            <p style={{ color: '#aaa' }}>Period: {budget.period}</p>
            <p style={{ color: '#888', fontSize: '13px' }}>From {formatDate(range.startDate)} to {formatDate(range.endDate)}</p>
          </div>
          <AppButton className="btn btn-danger" onClick={onClose}>Close</AppButton>
        </div>

        <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '6px' }}>
          {expenses.length === 0 ? (
            <p style={{ color: '#aaa' }}>No expenses found for this budget period.</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense._id} style={{ padding: '12px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <strong>{expense.title}</strong>
                  <div style={{ color: '#888', fontSize: '13px' }}>{new Date(expense.date).toLocaleDateString()}</div>
                </div>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>-Rs. {expense.amount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetExpensesPopup;
