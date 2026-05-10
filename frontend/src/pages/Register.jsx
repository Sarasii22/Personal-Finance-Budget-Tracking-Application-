import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div className="glass" style={{ padding: '40px', width: '380px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#22c55e' }}>Create Account</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" className="form-control" style={{ marginBottom: '15px' }}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          
          <input type="email" placeholder="Email" className="form-control" style={{ marginBottom: '15px' }}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          
          <input type="password" placeholder="Password" className="form-control" style={{ marginBottom: '20px' }}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '15px' }}>
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center' }}>
          Already have an account? <a href="/login" style={{ color: '#22c55e' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;