import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

// Helper: format datetime-local min value (now)
const getNowLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const FacilityDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [facilityError, setFacilityError] = useState('');

  const [form, setForm] = useState({ start_time: '', end_time: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch all facilities and find by ID (no single-facility GET endpoint on backend)
  useEffect(() => {
    const fetchFacility = async () => {
      setLoadingFacility(true);
      setFacilityError('');
      try {
        const { data } = await api.get('/facilities');
        const found = data.find(f => f._id === id);
        if (!found) { setFacilityError('Nie znaleziono obiektu.'); }
        else { setFacility(found); }
      } catch (err) {
        setFacilityError('Nie udało się załadować danych obiektu.');
      } finally {
        setLoadingFacility(false);
      }
    };
    fetchFacility();
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!form.start_time || !form.end_time) return 'Wybierz datę i godzinę rozpoczęcia oraz zakończenia.';
    if (new Date(form.start_time) >= new Date(form.end_time)) return 'Godzina zakończenia musi być późniejsza niż rozpoczęcia.';
    if (new Date(form.start_time) < new Date()) return 'Nie można rezerwować w przeszłości.';
    return null;
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/logowanie'); return; }
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }

    setSubmitting(true);
    try {
      await api.post('/reservations', {
        facility_id: id,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });
      setSuccess(true);
      setForm({ start_time: '', end_time: '' });
      toast.success('Rezerwacja złożona pomyślnie!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Błąd podczas składania rezerwacji.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFacility) return (
    <div className="page-content">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spinner size="lg" />
      </div>
    </div>
  );

  if (facilityError) return (
    <div className="page-content">
      <div className="container">
        <EmptyState
          icon="⚠️"
          title="Błąd"
          description={facilityError}
          action={() => navigate('/boiska')}
          actionLabel="Wróć do listy"
        />
      </div>
    </div>
  );

  const duration = form.start_time && form.end_time
    ? Math.max(0, (new Date(form.end_time) - new Date(form.start_time)) / 3600000)
    : 0;
  const totalCost = duration > 0 ? (duration * facility.price_per_hour).toFixed(2) : null;

  return (
    <div className="page-content">
      <div className="container">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/boiska')} style={{ marginBottom: 24 }}>
          ← Powrót do listy
        </button>

        <div className="detail-grid">
          {/* Facility info */}
          <div className="fade-in-up">
            <div className="card detail-info-card">
              <div className="detail-icon">🏟️</div>
              <h1 className="detail-title">{facility.name}</h1>
              <p className="detail-address">📍 {facility.address}</p>
              {facility.description && (
                <p className="detail-description">{facility.description}</p>
              )}
              <div className="detail-price-tag">
                <span className="detail-price-value">{facility.price_per_hour} zł</span>
                <span className="detail-price-label">za godzinę</span>
              </div>
            </div>
          </div>

          {/* Reservation form */}
          <div className="fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="card reservation-form-card">
              <h2 className="reservation-form-title">📅 Zarezerwuj termin</h2>

              {success && (
                <div className="reservation-success">
                  ✅ Rezerwacja złożona! Sprawdź{' '}
                  <span className="auth-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/moj-panel')}>
                    swój panel
                  </span>.
                </div>
              )}

              {!isAuthenticated && (
                <div className="reservation-info-box">
                  🔒 Zaloguj się, aby dokonać rezerwacji.{' '}
                  <span className="auth-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/logowanie')}>
                    Zaloguj się
                  </span>
                </div>
              )}

              <form onSubmit={handleReserve} className="reservation-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="start_time">Data i godzina rozpoczęcia</label>
                  <input
                    id="start_time" name="start_time" type="datetime-local"
                    value={form.start_time} onChange={handleChange}
                    className="form-input" min={getNowLocal()}
                    disabled={!isAuthenticated}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="end_time">Data i godzina zakończenia</label>
                  <input
                    id="end_time" name="end_time" type="datetime-local"
                    value={form.end_time} onChange={handleChange}
                    className="form-input" min={form.start_time || getNowLocal()}
                    disabled={!isAuthenticated}
                  />
                </div>

                {totalCost && (
                  <div className="reservation-cost-preview">
                    <span>Szacowany koszt ({duration.toFixed(1)} godz.)</span>
                    <strong>{totalCost} zł</strong>
                  </div>
                )}

                {formError && <div className="auth-error">{formError}</div>}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={!isAuthenticated || submitting}
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Składanie rezerwacji...' : '✓ Potwierdź rezerwację'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetailPage;
