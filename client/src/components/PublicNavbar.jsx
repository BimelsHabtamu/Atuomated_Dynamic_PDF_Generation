import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',         href: '/',          anchor: null },
  { label: 'Features',     href: '/#features', anchor: 'features' },
  { label: 'How It Works', href: '/#how',       anchor: 'how' },
  { label: 'Security',     href: '/#security', anchor: 'security' },
  { label: 'Verification', href: '/verify',    anchor: null },
  { label: 'About',        href: '/#about',    anchor: 'about' },
];

export default function PublicNavbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white shadow-sm border-b border-[#e8eaf0]'
        : 'bg-white/90 backdrop-blur-sm border-b border-[#e8eaf0]'
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
              <p className="text-sm font-black text-[#1e2a3a] tracking-tight
                group-hover:text-[#3b5bdb] transition-colors">
                DocuVault
              </p>
              <p className="text-[10px] font-medium text-[#94a3b8] tracking-wide">
                Document Generation Engine
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchor(e, link)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive(link)
                    ? 'bg-indigo-50 text-[#3b5bdb] font-semibold'
                    : 'text-[#475569] hover:text-[#3b5bdb] hover:bg-indigo-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right — Sign In + hamburger */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5
                bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white
                text-sm font-bold px-4 py-2 rounded-lg
                shadow-sm shadow-indigo-200 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Sign In
            </Link>

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden p-2 rounded-lg text-[#475569] hover:bg-[#f0f2fa] transition-colors"
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
        <div className="lg:hidden bg-white border-t border-[#e8eaf0] shadow-lg">
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => { handleAnchor(e, link); setMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors cursor-pointer ${
                  isActive(link)
                    ? 'bg-indigo-50 text-[#3b5bdb] font-semibold'
                    : 'text-[#475569] hover:bg-indigo-50 hover:text-[#3b5bdb]'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[#e8eaf0] mt-2">
              <Link to="/login"
                className="flex items-center justify-center gap-2 w-full
                  bg-[#3b5bdb] text-white text-sm font-bold px-3 py-2.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Sign In to System
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
