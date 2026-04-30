import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import FacilityForm from '../components/facilities/FacilityForm';

const formatDate = (iso) => new Date(iso).toLocaleString('pl-PL', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

const TABS = [
  { key: 'facilities', label: '🏟️ Obiekty' },
  { key: 'reservations', label: '📅 Rezerwacje' },
];

const AdminPage = () => {
  const toast = useToast();
  const [tab, setTab] = useState('facilities');

  // Facilities state
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [facilitiesError, setFacilitiesError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [savingFacility, setSavingFacility] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Reservations state
  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [resError, setResError] = useState('');

  const fetchFacilities = useCallback(async () => {
    setLoadingFacilities(true);
    setFacilitiesError('');
    try {
      const { data } = await api.get('/facilities');
      setFacilities(data);
    } catch (err) {
      setFacilitiesError(err.response?.data?.message || 'Błąd ładowania obiektów.');
    } finally {
      setLoadingFacilities(false);
    }
  }, []);

  const fetchReservations = useCallback(async () => {
    setLoadingRes(true);
    setResError('');
    try {
      const { data } = await api.get('/reservations');
      setReservations(data);
    } catch (err) {
      setResError(err.response?.data?.message || 'Błąd ładowania rezerwacji.');
    } finally {
      setLoadingRes(false);
    }
  }, []);

  useEffect(() => { fetchFacilities(); }, [fetchFacilities]);
  useEffect(() => { if (tab === 'reservations') fetchReservations(); }, [tab, fetchReservations]);

  const openCreateModal = () => { setEditTarget(null); setModalOpen(true); };
  const openEditModal = (f) => { setEditTarget(f); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSaveFacility = async (formData) => {
    setSavingFacility(true);
    try {
      if (editTarget) {
        const { data } = await api.put(`/facilities/${editTarget._id}`, formData);
        setFacilities(prev => prev.map(f => f._id === editTarget._id ? data : f));
        toast.success('Obiekt zaktualizowany.');
      } else {
        const { data } = await api.post('/facilities', formData);
        setFacilities(prev => [...prev, data]);
        toast.success('Obiekt dodany.');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Błąd zapisu obiektu.');
    } finally {
      setSavingFacility(false);
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten obiekt? Operacja jest nieodwracalna.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/facilities/${id}`);
      setFacilities(prev => prev.filter(f => f._id !== id));
      toast.success('Obiekt usunięty.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Błąd usuwania obiektu.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="admin-header fade-in-up">
          <div>
            <h1 className="section-title">Panel Administratora</h1>
            <p className="section-subtitle">Zarządzaj obiektami i rezerwacjami</p>
          </div>
          <span className="admin-badge">👑 Admin</span>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`admin-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* === FACILITIES TAB === */}
        {tab === 'facilities' && (
          <div className="fade-in-up">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Obiekty sportowe ({facilities.length})</h2>
              <button className="btn btn-primary" onClick={openCreateModal}>
                + Dodaj obiekt
              </button>
            </div>

            {loadingFacilities && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spinner size="lg" />
              </div>
            )}
            {!loadingFacilities && facilitiesError && (
              <EmptyState icon="⚠️" title="Błąd" description={facilitiesError}
                action={fetchFacilities} actionLabel="Odśwież" />
            )}
            {!loadingFacilities && !facilitiesError && facilities.length === 0 && (
              <EmptyState icon="🏟️" title="Brak obiektów"
                description="Brak obiektów w systemie. Dodaj pierwszy."
                action={openCreateModal} actionLabel="+ Dodaj obiekt" />
            )}
            {!loadingFacilities && !facilitiesError && facilities.length > 0 && (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nazwa</th>
                      <th>Adres</th>
                      <th>Cena / godz.</th>
                      <th>Status</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map(f => (
                      <tr key={f._id}>
                        <td><strong>{f.name}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{f.address}</td>
                        <td>{f.price_per_hour} zł</td>
                        <td>
                          <span className={`badge ${f.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {f.is_active ? 'Aktywny' : 'Nieaktywny'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditModal(f)}
                            >
                              Edytuj
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteFacility(f._id)}
                              disabled={deletingId === f._id}
                            >
                              {deletingId === f._id ? '...' : 'Usuń'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* === RESERVATIONS TAB === */}
        {tab === 'reservations' && (
          <div className="fade-in-up">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Wszystkie rezerwacje ({reservations.length})</h2>
              <button className="btn btn-secondary btn-sm" onClick={fetchReservations}>
                ↻ Odśwież
              </button>
            </div>

            {loadingRes && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spinner size="lg" />
              </div>
            )}
            {!loadingRes && resError && (
              <EmptyState icon="⚠️" title="Błąd" description={resError}
                action={fetchReservations} actionLabel="Odśwież" />
            )}
            {!loadingRes && !resError && reservations.length === 0 && (
              <EmptyState icon="📅" title="Brak rezerwacji" description="Brak rezerwacji w systemie." />
            )}
            {!loadingRes && !resError && reservations.length > 0 && (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Użytkownik</th>
                      <th>E-mail</th>
                      <th>Obiekt</th>
                      <th>Rozpoczęcie</th>
                      <th>Zakończenie</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r._id}>
                        <td>
                          <strong>
                            {r.user_id?.first_name} {r.user_id?.last_name}
                          </strong>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.user_id?.email}</td>
                        <td>{r.facility_id?.name || '—'}</td>
                        <td>{formatDate(r.start_time)}</td>
                        <td>{formatDate(r.end_time)}</td>
                        <td><Badge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Facility create/edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Edytuj obiekt' : 'Dodaj nowy obiekt'}
        maxWidth={560}
      >
        <FacilityForm
          initialData={editTarget}
          onSubmit={handleSaveFacility}
          onCancel={closeModal}
          loading={savingFacility}
        />
      </Modal>
    </div>
  );
};

export default AdminPage;
