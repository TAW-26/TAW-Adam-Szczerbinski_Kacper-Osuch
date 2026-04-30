import React, { useState, useEffect } from 'react';

const EMPTY = { name: '', description: '', address: '', price_per_hour: '' };

const FacilityForm = ({ initialData = null, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initialData || EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData || EMPTY);
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nazwa jest wymagana';
    if (!form.address.trim()) e.address = 'Adres jest wymagany';
    if (!form.price_per_hour || Number(form.price_per_hour) <= 0)
      e.price_per_hour = 'Podaj prawidłową cenę';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit({ ...form, price_per_hour: Number(form.price_per_hour) });
  };

  return (
    <form onSubmit={handleSubmit} className="facility-form">
      <div className="form-group">
        <label className="form-label">Nazwa obiektu *</label>
        <input
          name="name" value={form.name} onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="np. Orlik Centrum"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Adres *</label>
        <input
          name="address" value={form.address} onChange={handleChange}
          className={`form-input ${errors.address ? 'error' : ''}`}
          placeholder="ul. Sportowa 1, Warszawa"
        />
        {errors.address && <span className="form-error">{errors.address}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Cena za godzinę (zł) *</label>
        <input
          name="price_per_hour" type="number" min="0" step="0.01"
          value={form.price_per_hour} onChange={handleChange}
          className={`form-input ${errors.price_per_hour ? 'error' : ''}`}
          placeholder="150"
        />
        {errors.price_per_hour && <span className="form-error">{errors.price_per_hour}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Opis</label>
        <textarea
          name="description" value={form.description} onChange={handleChange}
          className="form-input" rows={3}
          placeholder="Krótki opis obiektu..."
          style={{ resize: 'vertical' }}
        />
      </div>
      <div className="facility-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Anuluj
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Zapisywanie...' : initialData ? 'Zapisz zmiany' : 'Dodaj obiekt'}
        </button>
      </div>
    </form>
  );
};

export default FacilityForm;
