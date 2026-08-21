import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { resolveAndApplyPreferences } from './ThemeContext.jsx';

const AuthContext = createContext(null);

/**
 * Apply a user's stored language + theme preferences immediately.
 * Called both on initial load (from localStorage) and after login.
 */
function applyUserPreferences(userData) {
  if (!userData) return;
  // Language
  if (userData.language) {
    i18n.changeLanguage(userData.language);
  }
  // Theme — delegate to ThemeContext helper so the DOM is updated consistently
  if (userData.theme) {
    resolveAndApplyPreferences(userData.theme);
  }
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Restore session on first load and apply preferences
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      const parsed = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsed);
      applyUserPreferences(parsed);
    }
  }, []);

  const login = (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    // Sync language + theme from the server-side user record
    applyUserPreferences(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    const nextUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
