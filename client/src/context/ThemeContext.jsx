import { createContext, useContext, useEffect, useState } from 'react';

// ── Context + hook ────────────────────────────────────────
export const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

// ── Helpers ───────────────────────────────────────────────
/** Resolve 'light' | 'dark' | 'system' → actual display value */
function resolveTheme(value) {
  if (value === 'dark')  return 'dark';
  if (value === 'light') return 'light';
  // 'system' or missing → follow OS
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply a theme preference directly to the DOM + localStorage.
 * Used by AuthContext to sync the user's server-side theme on login
 * without needing access to React state.
 */
export function resolveAndApplyPreferences(themeValue) {
  const resolved = resolveTheme(themeValue);
  localStorage.setItem('docuvault-theme', themeValue); // keep 'system' as-is
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

function initialTheme() {
  return resolveTheme(localStorage.getItem('docuvault-theme'));
}

// ── Provider ──────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(initialTheme);

  // Apply to DOM and persist the resolved value
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Only overwrite localStorage when we have a concrete value
    // (if the stored value is 'system' we leave it intact)
    const stored = localStorage.getItem('docuvault-theme');
    if (stored !== 'system') {
      localStorage.setItem('docuvault-theme', theme);
    }
  }, [theme]);

  // Follow OS changes when user preference is 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const stored = localStorage.getItem('docuvault-theme');
      if (!stored || stored === 'system') {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /**
   * Set theme explicitly.
   * Accepts 'light', 'dark', or 'system'.
   */
  const setTheme = (value) => {
    localStorage.setItem('docuvault-theme', value);
    setThemeState(resolveTheme(value));
  };
  /** Toggle between light ↔ dark (always saves a concrete value). */
  const toggleTheme = () =>
    setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
