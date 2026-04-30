import React from 'react';
import { Link } from 'react-router-dom';

const FacilityCard = ({ facility }) => {
  const { _id, name, description, address, price_per_hour } = facility;
  return (
    <div className="facility-card fade-in-up">
      <div className="facility-card-icon">🏟️</div>
      <div className="facility-card-body">
        <h3 className="facility-card-name">{name}</h3>
        <p className="facility-card-address">📍 {address}</p>
        {description && <p className="facility-card-desc">{description}</p>}
      </div>
      <div className="facility-card-footer">
        <span className="facility-card-price">
          <strong>{price_per_hour} zł</strong>
          <span className="facility-card-per"> / godz.</span>
        </span>
        <Link to={`/boiska/${_id}`} className="btn btn-primary btn-sm">
          Zarezerwuj
        </Link>
      </div>
    </div>
  );
};

export default FacilityCard;
