import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppButton } from './Buttons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h2 style={{ color: '#22c55e' }}>💰 FinTrack</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Smart Finance Manager</p>
        {user?.name && <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>Signed in as {user.name}</p>}
      </div>

      <nav style={{ marginTop: '30px' }}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>🏠 Dashboard</Link>
        <Link to="/transactions" className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>💸 Transactions</Link>
        <Link to="/budgets" className={`nav-link ${location.pathname === '/budgets' ? 'active' : ''}`}>📊 Budgets</Link>
        <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>🏷️ Categories</Link>
      </nav>

      <div style={{ position: 'absolute', bottom: '40px', width: '85%', padding: '0 20px' }}>
        <AppButton onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>Logout</AppButton>
      </div>
    </div>
  );
};

export default Sidebar;