import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import Modal         from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { SkeletonTableRow } from '../components/ui/Skeleton';

const ROLES     = ['admin','generator','approver','recipient'];
const ROLE_META = { admin: 'bg-purple-100 text-purple-700', generator: 'bg-blue-100 text-blue-700', approver: 'bg-yellow-100 text-yellow-700', recipient: 'bg-gray-100 text-gray-600' };
const EMPTY     = { full_name: '', email: '', phone: '', role: 'generator', password: '', is_active: true };

function fmt(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }

export default function UsersPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatus]   = useState('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDelete]   = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  const load = () => { setLoading(true); axiosInstance.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const toast  = useToast();
  const notify = (text, type = 'success') => type === 'error' ? toast.error(text) : toast.success(text);

  const filtered = useMemo(() => users.filter(u => {
    const q  = search.toLowerCase();
    const ms = u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || '').includes(q);
    const mr = roleFilter === 'all' || u.role === roleFilter;
    const mst = statusFilter === 'all' ? true : statusFilter === 'active' ? u.is_active : !u.is_active;
    return ms && mr && mst;
  }), [users, search, roleFilter, statusFilter]);

  const counts = useMemo(() => ({ total: users.length, active: users.filter(u => u.is_active).length, inactive: users.filter(u => !u.is_active).length, admins: users.filter(u => u.role === 'admin').length }), [users]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = u  => { setEditTarget(u); setForm({ full_name: u.full_name, email: u.email, phone: u.phone || '', role: u.role, password: '', is_active: u.is_active }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editTarget) { await axiosInstance.put(`/users/${editTarget.id}`, { full_name: form.full_name, department: form.phone, is_active: form.is_active ? 1 : 0 }); notify('User updated'); }
      else            { await axiosInstance.post('/users', form); notify('User created'); }
      setModalOpen(false); load();
    } catch (e) { notify(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete   = async () => { try { await axiosInstance.delete(`/users/${deleteTarget.id}`); notify('User deleted'); setDelete(null); load(); } catch (e) { notify(e.response?.data?.message || 'Delete failed', 'error'); setDelete(null); } };
  const toggleActive   = async u  => { try { await axiosInstance.put(`/users/${u.id}`, { full_name: u.full_name, is_active: u.is_active ? 0 : 1 }); load(); } catch (e) { notify('Update failed', 'error'); } };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage system users, roles and access</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New User
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[{l:'Total',v:counts.total,c:'border-blue-500 text-blue-600'},{l:'Active',v:counts.active,c:'border-emerald-500 text-emerald-600'},{l:'Inactive',v:counts.inactive,c:'border-gray-400 text-gray-500'},{l:'Admins',v:counts.admins,c:'border-purple-500 text-purple-600'}].map(card => (
          <div key={card.l} className={`bg-white rounded-2xl border-l-4 ${card.c} shadow-sm p-5`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.l}</p>
            <p className={`text-3xl font-bold mt-1 ${card.c.split(' ')[1]}`}>{card.v}</p>
          </div>
        ))}
      </div>

      {/* toast handles notifications */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all',...ROLES].map(r => <button key={r} onClick={() => setRoleFilter(r)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r === 'all' ? 'All Roles' : r}</button>)}
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['User','Email','Phone','Role','Status','Created','Actions'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && [1,2,3,4,5].map(i => <SkeletonTableRow key={i} cols={7} />)}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No users found</td></tr>}
              {!loading && filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{u.full_name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}</span>
                      </div>
                      <div><p className="text-sm font-semibold text-gray-800">{u.full_name}</p><p className="text-[10px] text-gray-400">ID #{u.id}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u.phone || '—'}</td>
                  <td className="px-5 py-4"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_META[u.role] || 'bg-gray-100 text-gray-500'}`}>{u.role}</span></td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}/>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(u.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => toggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'} className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 transition-colors ${u.is_active ? 'hover:bg-yellow-50 hover:text-yellow-600' : 'hover:bg-emerald-50 hover:text-emerald-600'}`}>
                        {u.is_active ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      </button>
                      <button onClick={() => setDelete(u)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {users.length} users</p>
          <p className="text-xs text-emerald-600 font-medium">● Live from database</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit User' : 'New User'} subtitle={editTarget ? `Editing ${editTarget.full_name}` : 'Create a new system user'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['full_name','Full Name',true],['email','Email',!editTarget]].map(([k,l,req]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{l}{req && ' *'}</label>
                <input type={k === 'email' ? 'email' : 'text'} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} disabled={k === 'email' && !!editTarget} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-400 transition" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f,phone:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role *</label>
              <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white capitalize">
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {!editTarget && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f,password:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
            <div className="flex gap-4">{[true,false].map(v => <label key={String(v)} className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={form.is_active === v} onChange={() => setForm(f => ({...f,is_active:v}))} className="accent-blue-600"/><span className="text-sm text-gray-700">{v ? 'Active' : 'Inactive'}</span></label>)}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.full_name.trim() || !form.email.trim() || saving} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">{saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create User'}</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={handleDelete} title="Delete User" message={`Delete "${deleteTarget?.full_name}"? This cannot be undone.`} confirmLabel="Delete User" />
    </div>
  );
}
