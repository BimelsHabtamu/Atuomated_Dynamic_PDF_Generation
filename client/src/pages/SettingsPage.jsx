import { useState } from 'react';
import { useAuth }   from '../context/AuthContext';
import { useToast }  from '../context/ToastContext';
import axiosInstance from '../api/axiosInstance';

function PasswordField({ label, name, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all
            ${error ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-300 focus:ring-blue-100 focus:border-blue-400'}`}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
          {show
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          }
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { user }  = useAuth();
  const toast     = useToast();
  const [form, setForm]     = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.current_password) errs.current_password = 'Current password is required';
    if (!form.new_password)     errs.new_password     = 'New password is required';
    else if (form.new_password.length < 6) errs.new_password = 'At least 6 characters';
    if (!form.confirm_password) errs.confirm_password = 'Please confirm your new password';
    else if (form.new_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    if (form.current_password && form.new_password && form.current_password === form.new_password)
      errs.new_password = 'New password must be different from current password';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await axiosInstance.post('/users/change-password', {
        current_password: form.current_password,
        new_password:     form.new_password,
      });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const ROLE_LABELS = {
    super_admin:  'Super Admin',
    system_admin: 'System Admin',
    generator:    'Document Generator',
    approver:     'Approver',
    recipient:    'Recipient',
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile info — read only */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">
              {user?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{user?.full_name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            <span className="inline-block mt-1.5 text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-1">Change Password</h2>
        <p className="text-xs text-gray-400 mb-5">Use a strong password of at least 6 characters.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Current Password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            error={errors.current_password}
          />
          <PasswordField
            label="New Password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            error={errors.new_password}
          />
          <PasswordField
            label="Confirm New Password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
          />

          <div className="pt-1">
            <button type="submit" disabled={saving}
              className="h-10 px-6 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {saving
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
                : 'Update Password'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
