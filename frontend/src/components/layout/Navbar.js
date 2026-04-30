import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/logowanie');
  };

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">⚽</div>
          SportRez
        </Link>

        <ul className="navbar-links">
          <li><Link to="/" className={isActive('/')}>Strona główna</Link></li>
          <li><Link to="/boiska" className={isActive('/boiska')}>Boiska</Link></li>

          {isAuthenticated && (
            <li><Link to="/moj-panel" className={isActive('/moj-panel')}>Mój Panel</Link></li>
          )}
          {isAdmin && (
            <li><Link to="/admin" className={`${isActive('/admin')} admin`}>Panel Admina</Link></li>
          )}

          <li><div className="navbar-divider" /></li>

          {isAuthenticated ? (
            <li>
              <button className="navbar-btn-logout" onClick={handleLogout}>
                Wyloguj
              </button>
            </li>
          ) : (
            <>
              <li><Link to="/logowanie" className={isActive('/logowanie')}>Zaloguj się</Link></li>
              <li>
                <Link to="/rejestracja" className="btn btn-primary btn-sm">
                  Zarejestruj się
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
