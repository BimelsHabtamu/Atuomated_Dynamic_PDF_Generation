import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navGroups } from '../config/navConfig.js';

const ICONS = {
  home: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  template: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
  'plus-doc': <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  doc: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  'check-circle': <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  shield: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  users: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  clipboard: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  mail: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  cog: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  logout: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-xl text-[13px] font-medium transition-all duration-150 group
        ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'}
        ${isActive
          ? 'bg-blue-600/20 text-blue-400'
          : 'text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
            {ICONS[item.icon]}
          </span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-[240px]'} flex-shrink-0 h-screen bg-[#0f1724] flex flex-col transition-[width] duration-300 ease-in-out relative`}>

      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-white/[0.06] flex-shrink-0 ${collapsed ? 'justify-center' : 'px-5 gap-3'}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-[13px] leading-tight">DocuVault</p>
            <p className="text-[10px] text-gray-500 leading-tight">Document System</p>
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-[30px] w-6 h-6 rounded-full bg-[#1e2d3d] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-20 shadow"
      >
        <svg className={`w-3 h-3 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-none">
        {navGroups.map(group => {
          const visible = group.items.filter(i => i.roles.includes(user?.role));
          if (!visible.length) return null;
          return (
            <div key={group.group}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 pt-4 pb-1">
                  {group.group}
                </p>
              )}
              {collapsed && <div className="pt-3 pb-1 flex justify-center"><div className="w-5 h-px bg-white/10" /></div>}
              <div className="space-y-0.5">
                {visible.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/[0.06] p-3 space-y-1 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">{user?.full_name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-gray-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-gray-500 capitalize truncate">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center rounded-xl text-[13px] text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'}`}
        >
          {ICONS.logout}
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
