import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const QUICK_LINKS = [
    { href: '/',          label: t('footer.linkHome') },
    { href: '/#features', label: t('footer.linkFeatures') },
    { href: '/#how',      label: t('footer.linkHow') },
    { href: '/#security', label: t('footer.linkSecurity') },
    { href: '/verify',    label: t('footer.linkVerification') },
    { href: '/#about',    label: t('footer.linkAbout') },
    { href: '/login',     label: t('footer.linkSignIn') },
  ];

  const DOC_TYPES = [
    t('footer.doc1'), t('footer.doc2'), t('footer.doc3'),
    t('footer.doc4'), t('footer.doc5'),
  ];

  const BADGES = [
    { d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: t('footer.badge1') },
    { d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: t('footer.badge2') },
    { d: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: t('footer.badge3') },
    { d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: t('footer.badge4') },
  ];

  return (
    <footer className="bg-[#1e2a3a] text-gray-300">

      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#3b5bdb] via-[#60a5fa] to-[#3b5bdb]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DocuVault"
                className="h-14 w-auto object-contain flex-shrink-0
                  drop-shadow-lg bg-white rounded-xl p-1.5"
              />
              <div>
                <p className="text-white font-black text-base leading-tight">
                  {t('app.name')}
                </p>
                <p className="text-[#3b5bdb] text-xs font-semibold tracking-wide mt-0.5">
                  {t('footer.tagline')}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-[#60a5fa] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {t('footer.location')}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">
              {t('footer.quickLinks')}
              <span className="block w-8 h-0.5 bg-[#60a5fa] mt-1" />
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a href={href}
                    className="flex items-center gap-2 text-sm text-gray-400
                      hover:text-[#60a5fa] transition-colors group">
                    <span className="w-1 h-1 bg-[#3b5bdb] rounded-full
                      group-hover:bg-[#60a5fa] transition-colors flex-shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Document Types */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">
              {t('footer.documentTypes')}
              <span className="block w-8 h-0.5 bg-[#60a5fa] mt-1" />
            </h3>
            <ul className="space-y-2.5">
              {DOC_TYPES.map(label => (
                <li key={label} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1 h-1 bg-gray-600 rounded-full flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#3b5bdb]/20 mt-10 pt-8 space-y-4">

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {BADGES.map(({ d, label }) => (
              <span key={label}
                className="inline-flex items-center gap-1.5 text-[10px] text-gray-500
                  border border-[#3b5bdb]/30 rounded-full px-2.5 py-1">
                <svg className="w-3 h-3 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d}/>
                </svg>
                {label}
              </span>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600">
            &copy; {year} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
