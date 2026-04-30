import React from 'react';

const EmptyState = ({ icon = '📭', title, description, action, actionLabel }) => (
  <div className="empty-state fade-in-up">
    <div className="empty-state-icon">{icon}</div>
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-desc">{description}</p>}
    {action && actionLabel && (
      <button className="btn btn-primary" onClick={action}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
