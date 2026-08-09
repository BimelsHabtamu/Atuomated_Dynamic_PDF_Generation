import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useForm, required, email as emailRule } from '../hooks/useForm';
import axiosInstance from '../api/axiosInstance';

const RULES = {
  email:    [required('Email is required'), emailRule('Enter a valid email address')],
  password: [required('Password is required')],
};

function FieldError({ error, touched }) {
  if (!touched || !error) return null;
  return <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>;
}

export default function LoginPage() {
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const toast          = useToast();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { email: '', password: '' },
    RULES
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', values);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.full_name}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-white/[0.05] border text-white placeholder-gray-600 text-sm rounded-xl py-3 focus:outline-none focus:bg-white/[0.07] focus:ring-1 transition-all
    ${touched[field] && errors[field]
      ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
      : 'border-white/[0.08] focus:border-blue-500/50 focus:ring-blue-500/30'
    }`;

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-blue-600 opacity-10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-500 opacity-10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex justify-center mb-6">
            
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PDF Engine</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in to your workspace</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-7" />

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-4 h-4 transition-colors ${touched.email && errors.email ? 'text-red-500' : 'text-gray-500 group-focus-within:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email" name="email" value={values.email}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="admin@company.com"
                  className={inputClass('email') + ' pl-11 pr-4'}
                />
              </div>
              <FieldError error={errors.email} touched={touched.email} />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`w-4 h-4 transition-colors ${touched.password && errors.password ? 'text-red-500' : 'text-gray-500 group-focus-within:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={values.password}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="••••••••••••"
                  className={inputClass('password') + ' pl-11 pr-12'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              <FieldError error={errors.password} touched={touched.password} />
            </div>

            <button type="submit" disabled={loading}
              className="relative w-full mt-2 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300" />
              <div className="absolute inset-0 rounded-xl shadow-lg shadow-blue-600/30" />
              <span className="relative flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Authenticating...</>
                  : <>Sign In <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                }
              </span>
            </button>
          </form>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
          
        </div>
        
      </div>
    </div>
  );
}
