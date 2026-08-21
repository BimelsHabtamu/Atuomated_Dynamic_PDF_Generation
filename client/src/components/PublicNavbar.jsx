import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';

export default function PublicNavbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_LINKS = [
    { label: t('nav.home'),         href: '/',          anchor: null },
    { label: t('nav.features'),     href: '/#features', anchor: 'features' },
    { label: t('nav.howItWorks'),   href: '/#how',      anchor: 'how' },
    { label: t('nav.security'),     href: '/#security', anchor: 'security' },
    { label: t('nav.verification'), href: '/verify',    anchor: null },
    { label: t('nav.about'),        href: '/#about',    anchor: 'about' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleAnchor = (e, link) => {
    if (!link.anchor) return;
    e.preventDefault();
    const scrollTo = (id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollTo(link.anchor), 400);
    } else {
      scrollTo(link.anchor);
    }
  };

  const isActive = (link) => !link.anchor && location.pathname === link.href;

  const toggleLang = () => {
    const next = i18n.language.startsWith('am') ? 'en' : 'am';
    i18n.changeLanguage(next);
  };

  const isDark = theme === 'dark';
  const isAm   = i18n.language.startsWith('am');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[var(--color-surface)] shadow-sm border-b border-[var(--color-border)]'
        : 'bg-[var(--color-surface)]/90 backdrop-blur-sm border-b border-[var(--color-border)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="DocuVault"
              className="h-10 w-auto object-contain flex-shrink-0
                group-hover:scale-105 transition-transform duration-200 drop-shadow-sm"
            />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-black text-[var(--color-text-primary)] tracking-tight
                group-hover:text-[#3b5bdb] transition-colors">
                {t('app.name')}
              </p>
              <p className="text-[10px] font-medium text-[var(--color-text-secondary)] tracking-wide">
                {t('app.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchor(e, link)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive(link)
                    ? 'bg-indigo-50 text-[#3b5bdb] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[#3b5bdb] hover:bg-indigo-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title={t('actions.language')}
              className="h-9 px-3 rounded-lg border border-[var(--color-border)]
                text-xs font-bold text-[var(--color-text-secondary)]
                hover:text-[#3b5bdb] hover:border-indigo-300 hover:bg-indigo-50
                transition-all duration-150 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
              {isAm ? 'EN' : 'አማ'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={t('actions.toggleTheme')}
              className="h-9 w-9 rounded-lg border border-[var(--color-border)]
                flex items-center justify-center
                text-[var(--color-text-secondary)]
                hover:text-[#3b5bdb] hover:border-indigo-300 hover:bg-indigo-50
                transition-all duration-150"
            >
              {isDark
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z"/>
                  </svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
              }
            </button>

            {/* Sign In */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5
                bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white
                text-sm font-bold px-4 py-2 rounded-lg
                shadow-sm shadow-indigo-200 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              {t('actions.signIn')}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)]
                hover:bg-[var(--color-surface-raised)] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-lg">
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { handleAnchor(e, link); setMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors cursor-pointer ${
                  isActive(link)
                    ? 'bg-indigo-50 text-[#3b5bdb] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:bg-indigo-50 hover:text-[#3b5bdb]'
                }`}
              >
                {link.label}
              </a>
            ))}

            {/* Mobile — language + theme row */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-1">
              <button
                onClick={toggleLang}
                className="flex-1 flex items-center justify-center gap-2
                  py-2.5 rounded-lg border border-[var(--color-border)]
                  text-sm font-bold text-[var(--color-text-secondary)]
                  hover:text-[#3b5bdb] hover:border-indigo-300 hover:bg-indigo-50
                  transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                </svg>
                {isAm ? t('actions.english') : t('actions.amharic')}
              </button>
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2
                  py-2.5 rounded-lg border border-[var(--color-border)]
                  text-sm font-bold text-[var(--color-text-secondary)]
                  hover:text-[#3b5bdb] hover:border-indigo-300 hover:bg-indigo-50
                  transition-all"
              >
                {isDark
                  ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z"/>
                      </svg>{t('settings.light')}</>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                      </svg>{t('settings.dark')}</>
                }
              </button>
            </div>

            <div className="pt-1 border-t border-[var(--color-border)] mt-1">
              <Link to="/login"
                className="flex items-center justify-center gap-2 w-full
                  bg-[#3b5bdb] text-white text-sm font-bold px-3 py-2.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                {t('actions.signInToSystem')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
