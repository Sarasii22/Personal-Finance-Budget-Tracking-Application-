import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppButton } from '../components/Buttons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="glass auth-card" style={{ padding: '40px', width: '380px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#22c55e' }}>Welcome Back</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="form-control" style={{ marginBottom: '15px' }}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          
          <input type="password" placeholder="Password" className="form-control" style={{ marginBottom: '20px' }}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

          <AppButton type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '15px' }}>
            Login
          </AppButton>
        </form>

        <p style={{ textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: '#22c55e' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;