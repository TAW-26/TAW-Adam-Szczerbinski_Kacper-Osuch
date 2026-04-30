import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.first_name.trim()) return 'Imię jest wymagane.';
    if (!form.last_name.trim()) return 'Nazwisko jest wymagane.';
    if (!form.email.trim()) return 'Adres e-mail jest wymagany.';
    if (form.password.length < 6) return 'Hasło musi mieć co najmniej 6 znaków.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Konto zostało utworzone! Zaloguj się.');
      navigate('/logowanie');
    } catch (err) {
      const msg = err.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie.';
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
          <h1 className="auth-title">Utwórz konto</h1>
          <p className="auth-subtitle">Dołącz i zarezerwuj swoje boisko</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-first-name">Imię</label>
              <input
                id="reg-first-name" name="first_name" value={form.first_name}
                onChange={handleChange} className="form-input" placeholder="Jan"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-last-name">Nazwisko</label>
              <input
                id="reg-last-name" name="last_name" value={form.last_name}
                onChange={handleChange} className="form-input" placeholder="Kowalski"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Adres e-mail</label>
            <input
              id="reg-email" name="email" type="email" value={form.email}
              onChange={handleChange} className="form-input" placeholder="jan@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Hasło (min. 6 znaków)</label>
            <input
              id="reg-password" name="password" type="password" value={form.password}
              onChange={handleChange} className="form-input" placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="auth-footer">
          Masz już konto?{' '}
          <Link to="/logowanie" className="auth-link">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
