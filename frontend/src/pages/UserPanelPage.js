import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const formatDate = (iso) => new Date(iso).toLocaleString('pl-PL', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

const UserPanelPage = () => {
  const { userEmail, role } = useAuth();
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reservations/my');
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Nie udało się załadować rezerwacji.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  // Note: cancel = DELETE /api/reservations/:id (admin-only on backend, so this is aspirational)
  // We show the button but handle 403 gracefully
  const handleCancel = async (id) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;
    setCancelling(id);
    try {
      await api.delete(`/reservations/${id}`);
      setReservations(prev => prev.filter(r => r._id !== id));
      toast.success('Rezerwacja anulowana.');
    } catch (err) {
      const msg = err.response?.status === 403
        ? 'Anulowanie możliwe tylko przez administratora. Skontaktuj się z obsługą.'
        : 'Nie udało się anulować rezerwacji.';
      toast.error(msg);
    } finally {
      setCancelling(null);
    }
  };

  const pending = reservations.filter(r => r.status === 'pending').length;
  const confirmed = reservations.filter(r => r.status === 'confirmed').length;

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="section-title fade-in-up">Mój Panel</h1>

        {/* Profile card */}
        <div className="user-profile-card card fade-in-up">
          <div className="user-avatar">
            {userEmail ? userEmail[0].toUpperCase() : '?'}
          </div>
          <div className="user-info">
            <p className="user-email">{userEmail || 'Zalogowany użytkownik'}</p>
            <Badge text={role === 'admin' ? 'Administrator' : 'Użytkownik'} />
          </div>
          <div className="user-stats">
            <div className="user-stat">
              <span className="user-stat-value">{reservations.length}</span>
              <span className="user-stat-label">Wszystkie</span>
            </div>
            <div className="user-stat">
              <span className="user-stat-value" style={{ color: 'var(--color-warning)' }}>{pending}</span>
              <span className="user-stat-label">Oczekujące</span>
            </div>
            <div className="user-stat">
              <span className="user-stat-value" style={{ color: 'var(--color-success)' }}>{confirmed}</span>
              <span className="user-stat-label">Potwierdzone</span>
            </div>
          </div>
        </div>

        {/* Reservations */}
        <h2 className="section-title fade-in-up" style={{ marginTop: 40 }}>Moje rezerwacje</h2>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <EmptyState
            icon="⚠️"
            title="Błąd ładowania"
            description={error}
            action={fetchReservations}
            actionLabel="Spróbuj ponownie"
          />
        )}

        {!loading && !error && reservations.length === 0 && (
          <EmptyState
            icon="📅"
            title="Brak rezerwacji"
            description="Nie masz jeszcze żadnych rezerwacji. Przejdź do listy boisk i zarezerwuj swój pierwszy termin!"
          />
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="table-wrapper fade-in-up">
            <table className="table">
              <thead>
                <tr>
                  <th>Obiekt</th>
                  <th>Adres</th>
                  <th>Rozpoczęcie</th>
                  <th>Zakończenie</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.facility_id?.name || '—'}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.facility_id?.address || '—'}</td>
                    <td>{formatDate(r.start_time)}</td>
                    <td>{formatDate(r.end_time)}</td>
                    <td><Badge status={r.status} /></td>
                    <td>
                      {r.status !== 'cancelled' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(r._id)}
                          disabled={cancelling === r._id}
                        >
                          {cancelling === r._id ? '...' : 'Anuluj'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanelPage;
