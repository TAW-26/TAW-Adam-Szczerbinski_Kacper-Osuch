import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail'));

  const login = useCallback((newToken, newRole, email = '') => {
    setToken(newToken);
    setRole(newRole);
    setUserEmail(email);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    if (email) localStorage.setItem('userEmail', email);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUserEmail(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
  }, []);

  const value = useMemo(() => ({
    token,
    role,
    userEmail,
    isAuthenticated: !!token,
    isAdmin: role === 'admin',
    login,
    logout,
  }), [token, role, userEmail, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
