import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../api/axiosInstance';

function PasswordField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type="password" name={name} value={value} onChange={onChange}
        className="w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', language: 'en', theme: 'system', notification_email: true, session_timeout_minutes: 60 });
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    axiosInstance.get('/users/me/settings').then(({ data }) => setForm(data)).catch(() => toast.error('Could not load your settings')).finally(() => setLoading(false));
  }, []);

  const change = e => setForm(current => ({ ...current, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const saveProfile = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosInstance.put('/users/me/settings', { ...form, session_timeout_minutes: Number(form.session_timeout_minutes) });
      updateUser(data);
      toast.success('My settings saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not save your settings'); }
    finally { setSaving(false); }
  };
  const uploadAvatar = async e => {
    e.preventDefault();
    if (!avatar) return;
    const body = new FormData();
    body.append('avatar', avatar);
    try {
      const { data } = await axiosInstance.post('/users/me/avatar', body);
      setForm(current => ({ ...current, avatar_url: data.avatar_url }));
      updateUser({ ...user, avatar_url: data.avatar_url });
      toast.success('Profile photo updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not upload profile photo'); }
  };
  const changePassword = async e => {
    e.preventDefault();
    if (password.new_password !== password.confirm_password) return toast.error('Passwords do not match');
    setPasswordSaving(true);
    try {
      await axiosInstance.post('/users/change-password', { current_password: password.current_password, new_password: password.new_password });
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed successfully');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not change password'); }
    finally { setPasswordSaving(false); }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading your settings...</div>;
  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Settings</h1><p className="text-sm text-gray-400 mt-0.5">Manage your account, preferences, and personal security.</p></div>
      <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div><h2 className="text-sm font-bold text-gray-800">Profile</h2><p className="text-xs text-gray-400 mt-1">These details belong to your account only.</p></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 overflow-hidden flex items-center justify-center flex-shrink-0">
            {form.avatar_url ? <img src={form.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-white">{(form.full_name || user?.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>}
          </div>
          <div><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setAvatar(e.target.files?.[0] || null)} className="text-xs text-gray-500" /><button type="button" onClick={uploadAvatar} className="block mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">Upload profile photo</button></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">Name<input name="full_name" value={form.full_name} onChange={change} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300" /></label>
          <label className="text-sm font-medium text-gray-700">Email<input type="email" name="email" value={form.email} onChange={change} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300" /></label>
          <label className="text-sm font-medium text-gray-700">Phone<input name="phone" value={form.phone || ''} onChange={change} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300" /></label>
          <label className="text-sm font-medium text-gray-700">Language<select name="language" value={form.language} onChange={change} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300"><option value="en">English</option><option value="am">Amharic</option></select></label>
          <label className="text-sm font-medium text-gray-700">Theme<select name="theme" value={form.theme} onChange={change} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300"><option value="system">System default</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label className="text-sm font-medium text-gray-700">Session timeout (minutes)<input type="number" min="5" max="1440" name="session_timeout_minutes" value={form.session_timeout_minutes} onChange={change} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300" /></label>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="notification_email" checked={!!form.notification_email} onChange={change} /> Receive account notifications by email</label>
        <button disabled={saving} className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save My Settings'}</button>
      </form>
      <form onSubmit={changePassword} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div><h2 className="text-sm font-bold text-gray-800">Change Password</h2><p className="text-xs text-gray-400 mt-1">Update the password for your account.</p></div>
        <div className="grid sm:grid-cols-3 gap-4"><PasswordField label="Current password" name="current_password" value={password.current_password} onChange={e => setPassword({ ...password, [e.target.name]: e.target.value })} /><PasswordField label="New password" name="new_password" value={password.new_password} onChange={e => setPassword({ ...password, [e.target.name]: e.target.value })} /><PasswordField label="Confirm password" name="confirm_password" value={password.confirm_password} onChange={e => setPassword({ ...password, [e.target.name]: e.target.value })} /></div>
        <button disabled={passwordSaving} className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50">{passwordSaving ? 'Saving...' : 'Update Password'}</button>
      </form>
    </div>
  );
}
