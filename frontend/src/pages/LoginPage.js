import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Proszę wypełnić wszystkie pola.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.role, form.email);
      toast.success('Zalogowano pomyślnie!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Błąd logowania. Sprawdź dane i spróbuj ponownie.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">⚽</div>
          <h1 className="auth-title">Witaj z powrotem</h1>
          <p className="auth-subtitle">Zaloguj się do swojego konta</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Adres e-mail</label>
            <input
              id="login-email" name="email" type="email"
              value={form.email} onChange={handleChange}
              className="form-input" placeholder="jan@example.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Hasło</label>
            <input
              id="login-password" name="password" type="password"
              value={form.password} onChange={handleChange}
              className="form-input" placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="auth-footer">
          Nie masz konta?{' '}
          <Link to="/rejestracja" className="auth-link">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
