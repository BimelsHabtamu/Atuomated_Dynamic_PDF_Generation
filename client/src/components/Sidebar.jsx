import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navGroups } from '../config/navConfig.js';

// Soft white internal theme
// Sidebar bg   : #ffffff  (pure white)
// Border       : #f0f0f4  (soft divider)
// Active bg    : #f0f4ff  (soft blue-tinted wash)
// Active text  : #3b5bdb  (neutral indigo)
// Muted text   : #8a8fa8
// Hover bg     : #f5f6fa

const ICONS = {
  home: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  template: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>,
  'plus-doc': <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  doc: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  'check-circle': <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  shield: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  users: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  clipboard: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  mail: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  cog: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  server: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>,
  logout: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
};

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-xl text-[13px] font-medium transition-all duration-150 group
        ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2'}
        ${isActive
          ? 'bg-[#eef2ff] text-[#3b5bdb]'
          : 'text-[#8a8fa8] hover:bg-[#f5f6fa] hover:text-[#374151]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex-shrink-0 transition-colors
            ${isActive ? 'text-[#3b5bdb]' : 'text-[#b0b7c9] group-hover:text-[#6b7280]'}`}>
            {ICONS[item.icon]}
          </span>
          {!collapsed && (
            <span className="truncate leading-tight">{item.label}</span>
          )}
          {!collapsed && isActive && (
            <span className="ml-auto w-1 h-4 rounded-full bg-[#3b5bdb] flex-shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleGroups = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(user?.role)) }))
    .filter(g => g.items.length > 0);

  return (
    <aside
      className={`
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        flex-shrink-0 h-screen
        bg-white border-r border-[#f0f0f4]
        flex flex-col
        transition-[width] duration-300 ease-in-out relative
        shadow-sm
      `}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className={`flex items-center h-16 border-b border-[#f0f0f4] flex-shrink-0
        ${collapsed ? 'justify-center' : 'px-4 gap-3'}`}>
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0
          border border-gray-100 flex items-center justify-center bg-gray-50">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden leading-tight">
            <p className="text-gray-800 font-bold text-[13px] tracking-tight">Document Engine</p>
            <p className="text-[10px] text-gray-400 font-medium">Management System</p>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────────── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[30px] w-6 h-6 rounded-full
          bg-white border border-[#e5e7eb]
          flex items-center justify-center
          text-gray-400 hover:text-gray-600 hover:border-gray-300
          transition-colors z-20 shadow-sm"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Nav — no scroll, flex column ─────────────────── */}
      <nav className="flex-1 flex flex-col justify-between py-3 px-2 min-h-0">
        <div className="space-y-0.5">
          {visibleGroups.map((group, gi) => (
            <div key={group.group} className={gi > 0 ? 'pt-3' : ''}>
              {/* Group label */}
              {!collapsed ? (
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.14em]
                  px-3 pb-1.5 pt-0.5">
                  {group.group}
                </p>
              ) : (
                gi > 0 && (
                  <div className="py-1.5 flex justify-center">
                    <div className="w-5 h-px bg-gray-100" />
                  </div>
                )
              )}
              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div />
      </nav>

      {/* ── User card + Sign Out ──────────────────────────── */}
      <div className="border-t border-[#f0f0f4] px-2 py-3 flex-shrink-0 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
            bg-[#f8f9fc] border border-gray-100 mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500
              flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[11px] font-bold text-white">
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-gray-700 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-gray-400 capitalize truncate">
                {user?.role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center rounded-xl text-[13px] text-gray-400
            hover:bg-red-50 hover:text-red-500 transition-colors w-full
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2'}`}
        >
          {ICONS.logout}
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
