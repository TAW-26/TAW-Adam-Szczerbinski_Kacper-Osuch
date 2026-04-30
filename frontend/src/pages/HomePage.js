import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🏟️', title: 'Przeglądaj boiska', desc: 'Znajdź idealne boisko sportowe w swojej okolicy — orliki, hale, korty i więcej.' },
  { icon: '📅', title: 'Zarezerwuj termin', desc: 'Wybierz datę i godzinę, potwierdź rezerwację w kilka sekund.' },
  { icon: '📋', title: 'Zarządzaj rezerwacjami', desc: 'Śledź swoje rezerwacje i historię w czytelnym panelu użytkownika.' },
];

const STATS = [
  { value: '50+', label: 'Obiektów sportowych' },
  { value: '1000+', label: 'Rezerwacji miesięcznie' },
  { value: '24/7', label: 'Dostępność systemu' },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="container hero-content fade-in-up">
          <div className="hero-badge">🏆 System Rezerwacji Boisk</div>
          <h1 className="hero-title">
            Zarezerwuj swoje<br />
            <span className="hero-title-accent">wymarzone boisko</span>
          </h1>
          <p className="hero-subtitle">
            Przeglądaj dostępne obiekty sportowe, sprawdzaj ceny i rezerwuj terminy
            w kilku kliknięciach. Szybko, wygodnie, online.
          </p>
          <div className="hero-actions">
            <Link to="/boiska" className="btn btn-primary btn-lg">
              🏟️ Przeglądaj boiska
            </Link>
            {!isAuthenticated && (
              <Link to="/rejestracja" className="btn btn-secondary btn-lg">
                Zarejestruj się za darmo
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/moj-panel" className="btn btn-secondary btn-lg">
                Mój panel
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card fade-in-up">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Jak to działa?</h2>
          <p className="section-subtitle text-center">Trzy proste kroki do rezerwacji</p>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container cta-inner fade-in-up">
            <h2 className="cta-title">Gotowy na grę?</h2>
            <p className="cta-subtitle">Dołącz do tysięcy użytkowników i zarezerwuj boisko już dziś.</p>
            <div className="hero-actions">
              <Link to="/rejestracja" className="btn btn-primary btn-lg">Rozpocznij teraz</Link>
              <Link to="/logowanie" className="btn btn-secondary btn-lg">Zaloguj się</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
