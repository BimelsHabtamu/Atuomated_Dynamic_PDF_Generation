import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-sm text-gray-500">
        Welcome back, <span className="font-medium text-gray-800">{user?.full_name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium capitalize">
          {user?.role?.replace('_', ' ')}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium">
          Logout
        </button>
      </div>
    </header>
  );
}
