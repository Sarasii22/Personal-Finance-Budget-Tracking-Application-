import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppButton } from './Buttons';

const Sidebar = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h2 style={{ color: '#22c55e' }}>💰 FinTrack</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Smart Finance Manager</p>
      </div>

      <nav style={{ marginTop: '30px' }}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>🏠 Dashboard</Link>
        <Link to="/transactions" className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>💸 Transactions</Link>
        <Link to="/budgets" className={`nav-link ${location.pathname === '/budgets' ? 'active' : ''}`}>📊 Budgets</Link>
        <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>🏷️ Categories</Link>
      </nav>

      <div style={{ position: 'absolute', bottom: '40px', width: '85%', padding: '0 20px' }}>
        <AppButton onClick={logout} className="btn btn-danger" style={{ width: '100%' }}>Logout</AppButton>
      </div>
    </div>
  );
};

export default Sidebar;