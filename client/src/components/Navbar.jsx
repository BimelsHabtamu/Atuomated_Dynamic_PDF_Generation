import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = e => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function SearchBar() {
  const [value, setValue]   = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-200 ${focused ? 'w-80' : 'w-64'}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search documents, templates..."
        className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
      />
      {value && (
        <button onClick={() => setValue('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function NotificationBell() {
  const navigate               = useNavigate();
  const [open, setOpen]        = useState(false);
  const [items, setItems]      = useState([]);
  const [loading, setLoading]  = useState(false);
  const ref                    = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const unreadCount = items.filter(n => n.unread).length;

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    axiosInstance.get('/notifications')
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const TYPE_ICON = {
    approval: (
      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    activity: (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
    ),
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${open ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            <div className="flex items-center gap-2">
              {loading && <svg className="animate-spin w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-xs text-gray-400">No notifications yet</p>
              </div>
            )}
            {items.map(n => (
              <button
                key={n.id}
                onClick={() => { setOpen(false); navigate(n.link || '/dashboard'); }}
                className={`flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${n.unread ? 'bg-blue-50/30' : ''}`}
              >
                {TYPE_ICON[n.type] || TYPE_ICON.activity}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{n.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.time)}</p>
                </div>
                {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <button onClick={() => { setOpen(false); navigate('/audit'); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center">
              View full audit log →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);
  const ref              = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial      = user?.full_name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors ${open ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white flex-shrink-0">
          <span className="text-xs font-bold text-white">{initial}</span>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[13px] font-semibold text-gray-800 leading-tight">{user?.full_name || '—'}</p>
          <p className="text-[11px] text-gray-400 capitalize leading-tight">{user?.role}</p>
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-1.5 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[13px] font-semibold text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1.5 text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>

          {[
            { label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', onClick: () => {} },
            { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', onClick: () => navigate('/settings') },
          ].map(item => (
            <button key={item.label} onClick={() => { setOpen(false); item.onClick(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button onClick={onMenuClick} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <SearchBar />
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <div className="w-px h-6 bg-gray-200 mx-1.5" />
        <UserMenu />
      </div>
    </header>
  );
}
