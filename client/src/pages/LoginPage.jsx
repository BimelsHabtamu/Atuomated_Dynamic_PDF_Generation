import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {Eye, EyeOff} from 'lucide-react';
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');         
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' }); 
  const [loading, setLoading] = useState(false);
  const[showPassword, setShowPassword] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
     if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }    
  };
  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    setFieldErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return; 

    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">PDF Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}      
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            <input
              type="email"
              name="email"
              id="login-email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@gmail.com"
              className={`w-full border rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
            <input
              type={showPassword?"text":"password"}
              name="password"
              id="login-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full border rounded-lg px-3 py-2.5 
                text-sm focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 
            text-white font-medium py-2.5 rounded-lg text-sm 
            transition-colors disabled:opacity-50" >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}