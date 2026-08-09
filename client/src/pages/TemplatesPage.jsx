import { useState, useMemo, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast }  from '../context/ToastContext';
import Modal         from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { SkeletonTableRow } from '../components/ui/Skeleton';

const CATEGORIES    = ['HR', 'Finance', 'Academic', 'Procurement', 'General'];
const WATERMARKS    = ['', 'DRAFT', 'CONFIDENTIAL', 'FINAL'];
const CAT_COLORS    = { HR: 'bg-blue-100 text-blue-700', Finance: 'bg-green-100 text-green-700', Academic: 'bg-purple-100 text-purple-700', Procurement: 'bg-orange-100 text-orange-700', General: 'bg-gray-100 text-gray-600' };
const WM_COLORS     = { DRAFT: 'bg-yellow-100 text-yellow-700', CONFIDENTIAL: 'bg-red-100 text-red-600', FINAL: 'bg-green-100 text-green-700' };
const EMPTY_FORM    = { name: '', category: 'HR', watermark_text: '', header_html: '', body_html: '', footer_html: '' };

function CategoryBadge({ c }) { return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${CAT_COLORS[c] || 'bg-gray-100 text-gray-500'}`}>{c}</span>; }
function StatusBadge({ active }) {
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />{active ? 'Active' : 'Archived'}</span>;
}
function WatermarkBadge({ text }) {
  if (!text) return <span className="text-xs text-gray-300">—</span>;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${WM_COLORS[text] || 'bg-gray-100 text-gray-500'}`}>{text}</span>;
}

function TemplateForm({ form, setForm }) {
  const input = (key, label, required = false) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}{required && ' *'}</label>
      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
    </div>
  );
  const area = (key, label, rows = 4, required = false) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}{required && ' *'}</label>
      <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={rows} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none" />
      <p className="text-[10px] text-gray-400 mt-1">Use {`{{field_name}}`} for dynamic values</p>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {input('name', 'Template Name', true)}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Watermark</label>
        <select value={form.watermark_text} onChange={e => setForm(f => ({ ...f, watermark_text: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          {WATERMARKS.map(w => <option key={w} value={w}>{w || 'None'}</option>)}
        </select>
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">HTML Layout</p>
        {area('header_html', 'Header HTML', 3)}
        {area('body_html',   'Body HTML',   6, true)}
        {area('footer_html', 'Footer HTML', 3)}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [catFilter, setCat]         = useState('All');
  const [statusFilter, setStatus]   = useState('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDelete]   = useState(null);
  const [viewTarget, setView]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    axiosInstance.get('/templates').then(r => setTemplates(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toast  = useToast();
  const notify = (text, type = 'success') => type === 'error' ? toast.error(text) : toast.success(text);

  const filtered = useMemo(() => templates.filter(t => {
    const ms  = t.name.toLowerCase().includes(search.toLowerCase());
    const mc  = catFilter === 'All' || t.category === catFilter;
    const mst = statusFilter === 'all' ? true : statusFilter === 'active' ? t.is_active : !t.is_active;
    return ms && mc && mst;
  }), [templates, search, catFilter, statusFilter]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit   = t  => { setEditTarget(t); setForm({ name: t.name, category: t.category, watermark_text: t.watermark_text || '', header_html: t.header_html || '', body_html: t.body_html || '', footer_html: t.footer_html || '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body_html.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await axiosInstance.put(`/templates/${editTarget.id}`, form);
        notify('Template updated — new version created');
      } else {
        await axiosInstance.post('/templates', form);
        notify('Template created successfully');
      }
      setModalOpen(false);
      load();
    } catch (e) { notify(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/templates/${deleteTarget.id}`);
      notify('Template deleted');
      setDelete(null);
      load();
    } catch (e) { notify(e.response?.data?.message || 'Delete failed', 'error'); setDelete(null); }
  };

  const toggleStatus = async (t) => {
    try {
      await axiosInstance.patch(`/templates/${t.id}/status`, { is_active: t.is_active ? 0 : 1 });
      notify(t.is_active ? 'Template archived' : 'Template activated');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Update failed', 'error'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {templates.length} total · <span className="text-emerald-600 font-medium">{templates.filter(t => t.is_active).length} active</span> · <span className="text-gray-400">{templates.filter(t => !t.is_active).length} archived</span>
          </p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Template
        </button>
      </div>

      {/* removed inline alert — toast handles notifications */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCat(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${catFilter === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>
          ))}
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Template Name','Category','Version','Watermark','Status','Updated','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && [1,2,3,4,5].map(i => <SkeletonTableRow key={i} cols={7} />)}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No templates found</td></tr>}
              {!loading && filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                        <p className="text-[10px] text-gray-400">ID #{t.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><CategoryBadge c={t.category} /></td>
                  <td className="px-5 py-4"><span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">v{t.version}</span></td>
                  <td className="px-5 py-4"><WatermarkBadge text={t.watermark_text} /></td>
                  <td className="px-5 py-4"><StatusBadge active={t.is_active} /></td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(t.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setView(t)} title="View" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => openEdit(t)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => toggleStatus(t)} title={t.is_active ? 'Archive' : 'Activate'} className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 transition-colors ${t.is_active ? 'hover:bg-yellow-50 hover:text-yellow-600' : 'hover:bg-emerald-50 hover:text-emerald-600'}`}>
                        {t.is_active
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        }
                      </button>
                      <button onClick={() => setDelete(t)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {templates.length} templates</p>
          <p className="text-xs text-emerald-600 font-medium">● Live from database</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Template' : 'New Template'} subtitle={editTarget ? `Saving creates version v${(editTarget.version || 0) + 1}` : 'Fill required fields'} size="lg">
        <TemplateForm form={form} setForm={setForm} />
        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name.trim() || !form.body_html.trim() || saving} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setView(null)} title={viewTarget?.name || ''} subtitle={`${viewTarget?.category} · v${viewTarget?.version}`} size="lg">
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap"><CategoryBadge c={viewTarget.category} /><StatusBadge active={viewTarget.is_active} /><WatermarkBadge text={viewTarget.watermark_text} /></div>
            {[['Header HTML', viewTarget.header_html], ['Body HTML', viewTarget.body_html], ['Footer HTML', viewTarget.footer_html]].map(([label, val]) => val ? (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
                <pre className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">{val}</pre>
              </div>
            ) : null)}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => { setView(null); openEdit(viewTarget); }} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Edit Template</button>
              <button onClick={() => setView(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={handleDelete} title="Delete Template" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
