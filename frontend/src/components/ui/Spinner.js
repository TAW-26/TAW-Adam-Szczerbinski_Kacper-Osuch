import React from 'react';

const Spinner = ({ size = 'md', label = 'Ładowanie...' }) => {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || sizes.md;
  return (
    <div className="spinner-wrap" role="status" aria-label={label}>
      <span
        className="spinner"
        style={{ width: px, height: px, borderWidth: size === 'lg' ? 4 : 3 }}
      />
    </div>
  );
};

export default Spinner;
