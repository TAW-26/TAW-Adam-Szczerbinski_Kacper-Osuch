import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Provide a complete CJS mock for react-router-dom without importing the real
// package (react-router-dom v7 uses ESM-only exports that CRA/Jest 5 can't resolve).
jest.mock('react-router-dom', () => {
  const React = require('react');
  const navigateMock = jest.fn();
  return {
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: {}, pathname: '/', search: '', hash: '' }),
    useParams: () => ({}),
    Link: ({ children, to, ...rest }) => React.createElement('a', { href: to, ...rest }, children),
    MemoryRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => React.createElement(React.Fragment, null, children),
    Route: () => null,
    Navigate: () => null,
  };
});

jest.mock('./api/axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    token: null,
    role: 'user',
    userEmail: 'test@example.com',
    isAuthenticated: false,
    isAdmin: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('./context/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}));

import api from './api/axios';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserPanelPage from './pages/UserPanelPage';

// ─── Test 1: LoginPage renders correctly ────────────────────────────────────

test('Test 1: LoginPage renderuje pola email, hasło i przycisk logowania', () => {
  render(<LoginPage />);

  expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument();
});

// ─── Test 2: LoginPage shows error when submitted empty ──────────────────────

test('Test 2: LoginPage pokazuje błąd gdy formularz wysłany jest bez danych', async () => {
  render(<LoginPage />);

  fireEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));

  await waitFor(() => {
    expect(screen.getByText(/proszę wypełnić wszystkie pola/i)).toBeInTheDocument();
  });
});

// ─── Test 3: RegisterPage renders all 4 fields ──────────────────────────────

test('Test 3: RegisterPage renderuje pola: imię, nazwisko, email i hasło', () => {
  render(<RegisterPage />);

  expect(screen.getByLabelText(/imię/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/nazwisko/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
});

// ─── Test 4: RegisterPage shows error when password is too short ─────────────

test('Test 4: RegisterPage pokazuje błąd gdy hasło ma mniej niż 6 znaków', async () => {
  render(<RegisterPage />);

  fireEvent.change(screen.getByLabelText(/imię/i), { target: { value: 'Jan' } });
  fireEvent.change(screen.getByLabelText(/nazwisko/i), { target: { value: 'Kowalski' } });
  fireEvent.change(screen.getByLabelText(/adres e-mail/i), { target: { value: 'jan@example.com' } });
  fireEvent.change(screen.getByLabelText(/hasło/i), { target: { value: '123' } });

  fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));

  await waitFor(() => {
    expect(screen.getByText(/hasło musi mieć co najmniej 6 znaków/i)).toBeInTheDocument();
  });
});

// ─── Test 5: UserPanelPage shows empty state when no reservations ─────────────

test('Test 5: UserPanelPage wyświetla komunikat o braku rezerwacji gdy API zwraca pustą tablicę', async () => {
  api.get.mockResolvedValueOnce({ data: [] });

  render(<UserPanelPage />);

  await waitFor(() => {
    expect(screen.getByText(/brak rezerwacji/i)).toBeInTheDocument();
  });
});
