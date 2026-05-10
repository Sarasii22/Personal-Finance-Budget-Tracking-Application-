import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {isAuthenticated && <Sidebar setIsAuthenticated={setIsAuthenticated} />}
        
        <div className={isAuthenticated ? "main-content" : ""} style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
            
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />} />
            <Route path="/budgets" element={isAuthenticated ? <Budgets /> : <Navigate to="/login" />} />
            <Route path="/categories" element={isAuthenticated ? <Categories /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;