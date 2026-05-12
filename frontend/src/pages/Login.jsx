import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../components/Buttons';

const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div className="glass" style={{ padding: '40px', width: '380px' }}>
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
          Don't have an account? <a href="/register" style={{ color: '#22c55e' }}>Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;