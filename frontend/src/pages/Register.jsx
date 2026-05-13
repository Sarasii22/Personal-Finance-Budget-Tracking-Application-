import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppButton } from '../components/Buttons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="glass auth-card" style={{ padding: '40px', width: '380px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#22c55e' }}>Create Account</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" className="form-control" style={{ marginBottom: '15px' }}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          
          <input type="email" placeholder="Email" className="form-control" style={{ marginBottom: '15px' }}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          
          <input type="password" placeholder="Password" className="form-control" style={{ marginBottom: '20px' }}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

          <AppButton type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '15px' }}>
            Register
          </AppButton>
        </form>

        <p style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#22c55e' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;