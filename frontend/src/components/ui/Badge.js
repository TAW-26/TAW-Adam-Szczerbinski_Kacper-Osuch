import React from 'react';

const STATUS_MAP = {
  pending:   { label: 'Oczekująca', cls: 'badge-warning' },
  confirmed: { label: 'Potwierdzona', cls: 'badge-success' },
  cancelled: { label: 'Anulowana', cls: 'badge-danger' },
};

const Badge = ({ status, text }) => {
  if (text) {
    return <span className="badge badge-info">{text}</span>;
  }
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'badge-info' };
  return <span className={`badge ${cls}`}>{label}</span>;
};

export default Badge;
