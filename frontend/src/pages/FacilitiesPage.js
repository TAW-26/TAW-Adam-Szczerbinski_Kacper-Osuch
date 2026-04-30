import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import FacilityCard from '../components/facilities/FacilityCard';
import EmptyState from '../components/ui/EmptyState';

const SkeletonCard = () => (
  <div className="facility-card">
    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 16 }} />
    <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
    <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
    <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 16 }} />
  </div>
);

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchFacilities = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/facilities');
      setFacilities(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Nie udało się załadować boisk. Sprawdź połączenie.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, []);

  const filtered = facilities.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div className="facilities-header fade-in-up">
          <div>
            <h1 className="section-title">Dostępne boiska</h1>
            <p className="section-subtitle">
              Wybierz obiekt i zarezerwuj termin online
            </p>
          </div>
          <div className="facilities-search-wrap">
            <input
              type="search"
              className="form-input facilities-search"
              placeholder="🔍 Szukaj po nazwie lub adresie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="facilities-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <EmptyState
            icon="⚠️"
            title="Wystąpił błąd"
            description={error}
            action={fetchFacilities}
            actionLabel="Spróbuj ponownie"
          />
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon="🏟️"
            title={search ? 'Brak wyników wyszukiwania' : 'Brak dostępnych boisk'}
            description={search
              ? `Nie znaleziono boisk pasujących do "${search}".`
              : 'Aktualnie brak aktywnych obiektów. Sprawdź ponownie później.'}
            action={search ? () => setSearch('') : undefined}
            actionLabel={search ? 'Wyczyść wyszukiwanie' : undefined}
          />
        )}

        {/* Data state */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="facilities-count">
              Znaleziono <strong>{filtered.length}</strong> obiektów
            </p>
            <div className="facilities-grid">
              {filtered.map(f => <FacilityCard key={f._id} facility={f} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacilitiesPage;
