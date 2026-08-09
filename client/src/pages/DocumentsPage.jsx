import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { SkeletonTableRow } from '../components/ui/Skeleton';

const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-600',
  pending:   'bg-yellow-100 text-yellow-700',
  signed:    'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  rejected:  'bg-red-100 text-red-600',
};

function fmt(d) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DocumentsPage() {
  const [docs, setDocs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [approvers, setApprovers]     = useState([]);
  const [signModal, setSignModal]     = useState(null);
  const [selectedApprover, setApprover] = useState('');
  const [deliverModal, setDeliverModal] = useState(null);
  const [recipientEmail, setEmail]    = useState('');
  const [actionMsg, setActionMsg]     = useState({ text: '', type: '' });
  const [working, setWorking]         = useState(false);

  const load = () => {
    setLoading(true);
    axiosInstance.get('/documents')
      .then(r => setDocs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    axiosInstance.get('/users').then(r => setApprovers(r.data.filter(u => u.role === 'approver'))).catch(() => {});
  }, []);

  const notify = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg({ text: '', type: '' }), 4000);
  };

  const filtered = useMemo(() => docs.filter(d => {
    const q  = search.toLowerCase();
    const ms = d.doc_uuid.toLowerCase().includes(q) || (d.template_name || '').toLowerCase().includes(q);
    const mf = statusFilter === 'all' || d.status === statusFilter;
    return ms && mf;
  }), [docs, search, statusFilter]);

  const counts = useMemo(() => ({
    total: docs.length,
    draft: docs.filter(d => d.status === 'draft').length,
    pending: docs.filter(d => d.status === 'pending').length,
    signed: docs.filter(d => d.status === 'signed').length,
    delivered: docs.filter(d => d.status === 'delivered').length,
  }), [docs]);

  const requestSignature = async () => {
    if (!selectedApprover) return;
    setWorking(true);
    try {
      await axiosInstance.post('/esign/request', { doc_id: signModal, approver_id: Number(selectedApprover) });
      notify('Signature request sent to approver');
      setSignModal(null); setApprover('');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Request failed', 'error'); }
    finally { setWorking(false); }
  };

  const deliverDocument = async () => {
    if (!recipientEmail) return;
    setWorking(true);
    try {
      await axiosInstance.post('/delivery/deliver', { doc_id: deliverModal, recipient_email: recipientEmail });
      notify('Document delivered successfully');
      setDeliverModal(null); setEmail('');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Delivery failed', 'error'); }
    finally { setWorking(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-400 mt-0.5">All generated PDF documents — live from database</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',     value: counts.total,     color: 'border-blue-500 text-blue-600' },
          { label: 'Draft',     value: counts.draft,     color: 'border-gray-400 text-gray-600' },
          { label: 'Pending',   value: counts.pending,   color: 'border-yellow-500 text-yellow-600' },
          { label: 'Signed',    value: counts.signed,    color: 'border-blue-500 text-blue-600' },
          { label: 'Delivered', value: counts.delivered, color: 'border-emerald-500 text-emerald-600' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl border-l-4 shadow-sm p-4 ${c.color}`}>
            <p className="text-xs font-semibold text-gray-400 uppercase">{c.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${c.color.split(' ')[1]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {actionMsg.text && (
        <div className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${actionMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {actionMsg.text}
          <button onClick={() => setActionMsg({ text: '', type: '' })} className="ml-auto text-current opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doc ID or template..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
        </div>
        <div className="flex gap-1.5">
          {['all','draft','pending','signed','delivered','rejected'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Document ID','Template','Record ID','Status','Generated By','Date','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center">
                  <svg className="animate-spin w-5 h-5 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-14 text-center">
                  <p className="text-sm text-gray-400">No documents found</p>
                  <a href="/generate" className="text-xs text-blue-600 hover:underline mt-1 block">Generate your first document →</a>
                </td></tr>
              )}
              {!loading && filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4"><span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{doc.doc_uuid}</span></td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{doc.template_name}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{doc.record_identifier || '—'}</td>
                  <td className="px-5 py-4"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[doc.status] || 'bg-gray-100 text-gray-500'}`}>{doc.status}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-600">{doc.generated_by_name}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(doc.generated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Download */}
                      <a href={`http://localhost:5000/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer" title="Download PDF"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </a>
                      {doc.status === 'draft' && (
                        <button onClick={() => { setSignModal(doc.id); setApprover(''); }} title="Request Signature"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                      {doc.status === 'signed' && (
                        <button onClick={() => { setDeliverModal(doc.id); setEmail(''); }} title="Deliver"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {docs.length} documents</p>
          <p className="text-xs text-emerald-600 font-medium">● Live from database</p>
        </div>
      </div>

      {/* Request Signature Modal */}
      {signModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSignModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-4">Request E-Signature</h3>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Select Approver</label>
            <select value={selectedApprover} onChange={e => setApprover(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white mb-4">
              <option value="">— Choose approver —</option>
              {approvers.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={requestSignature} disabled={!selectedApprover || working}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {working ? 'Sending...' : 'Send Request'}
              </button>
              <button onClick={() => setSignModal(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Modal */}
      {deliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeliverModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-4">Deliver Document</h3>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recipient Email</label>
            <input type="email" value={recipientEmail} onChange={e => setEmail(e.target.value)} placeholder="recipient@email.com"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-4" />
            <div className="flex gap-2">
              <button onClick={deliverDocument} disabled={!recipientEmail || working}
                className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {working ? 'Delivering...' : 'Send & Deliver'}
              </button>
              <button onClick={() => setDeliverModal(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
