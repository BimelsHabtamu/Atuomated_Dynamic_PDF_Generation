import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const allLinks = [
  { to: '/dashboard',  label: 'Dashboard',   roles: ['super_admin','system_admin','document_generator','approver','recipient'] },
  { to: '/templates',  label: 'Templates',   roles: ['super_admin','system_admin'] },
  { to: '/generate',   label: 'Generate Doc', roles: ['super_admin','system_admin','document_generator'] },
  { to: '/documents',  label: 'Documents',   roles: ['super_admin','system_admin','document_generator'] },
  { to: '/approvals',  label: 'Approvals',   roles: ['super_admin','system_admin','approver'] },
  { to: '/users',      label: 'Users',       roles: ['super_admin','system_admin'] },
  { to: '/audit',      label: 'Audit',       roles: ['super_admin','system_admin'] },
  { to: '/verify',     label: 'Verify Doc',  roles: ['super_admin','system_admin','document_generator','approver','recipient'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const visibleLinks = allLinks.filter(link =>
    link.roles.includes(user?.role)
  );
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">     
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">PDF Engine</h1>
        <p className="text-xs text-gray-400 mt-0.5">Report Generation System</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
        <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>
    </aside>
  );
}
