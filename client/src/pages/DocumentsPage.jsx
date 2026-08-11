import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { useAuth }  from '../context/AuthContext';

const STATUS_META = {
  draft:     { bg:'bg-gray-100',    text:'text-gray-600',    dot:'bg-gray-400',    label:'Draft'     },
  pending:   { bg:'bg-yellow-100',  text:'text-yellow-700',  dot:'bg-yellow-400',  label:'Pending'   },
  signed:    { bg:'bg-blue-100',    text:'text-blue-700',    dot:'bg-blue-500',    label:'Signed'    },
  delivered: { bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-500', label:'Delivered' },
  rejected:  { bg:'bg-red-100',     text:'text-red-600',     dot:'bg-red-400',     label:'Rejected'  },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}/>
      {m.label}
    </span>
  );
}

function fmt(d) { return d ? new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'; }

export default function DocumentsPage() {
  const { user }  = useAuth();
  const toast     = useToast();
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [approvers, setApprovers] = useState([]);
  const [signModal, setSignModal] = useState(null);
  const [deliverModal, setDeliverModal] = useState(null);
  const [selectedApprover, setApprover] = useState('');
  const [recipientEmail, setEmail] = useState('');
  const [working, setWorking] = useState(false);
  const [detailDoc, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    axiosInstance.get('/documents').then(r => setDocs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    axiosInstance.get('/users').then(r => setApprovers(r.data.filter(u => u.role === 'approver' || u.role === 'system_admin' || u.role === 'super_admin'))).catch(() => {});
  }, []);

  const counts = useMemo(() => ({
    total:    docs.length,
    draft:    docs.filter(d=>d.status==='draft').length,
    pending:  docs.filter(d=>d.status==='pending').length,
    signed:   docs.filter(d=>d.status==='signed').length,
    delivered:docs.filter(d=>d.status==='delivered').length,
    rejected: docs.filter(d=>d.status==='rejected').length,
  }), [docs]);

  const filtered = useMemo(() => docs.filter(d => {
    const q  = search.toLowerCase();
    const ms = d.doc_uuid.toLowerCase().includes(q) || (d.template_name||'').toLowerCase().includes(q) || (d.record_identifier||'').toLowerCase().includes(q);
    const mf = statusFilter === 'all' || d.status === statusFilter;
    return ms && mf;
  }), [docs, search, statusFilter]);

  const requestSign = async () => {
    if (!selectedApprover) return;
    setWorking(true);
    try {
      await axiosInstance.post('/esign/request', { doc_id: signModal, approver_id: Number(selectedApprover) });
      toast.success('Signature request sent to approver');
      setSignModal(null); setApprover('');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Request failed'); }
    finally { setWorking(false); }
  };

  const deliver = async () => {
    if (!recipientEmail) return;
    setWorking(true);
    try {
      await axiosInstance.post('/delivery/deliver', { doc_id: deliverModal, recipient_email: recipientEmail });
      toast.success('Document delivered successfully');
      setDeliverModal(null); setEmail('');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Delivery failed'); }
    finally { setWorking(false); }
  };

  const canSign    = (user?.role === 'super_admin' || user?.role === 'system_admin' || user?.role === 'generator');
  const canDeliver = (user?.role === 'super_admin' || user?.role === 'system_admin' || user?.role === 'generator');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-400 mt-0.5">All generated PDF documents — live from database</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          {l:'Total',     v:counts.total,     c:'text-gray-700',   b:'border-gray-300'},
          {l:'Draft',     v:counts.draft,     c:'text-gray-600',   b:'border-gray-300'},
          {l:'Pending',   v:counts.pending,   c:'text-yellow-700', b:'border-yellow-400'},
          {l:'Signed',    v:counts.signed,    c:'text-blue-700',   b:'border-blue-500'},
          {l:'Delivered', v:counts.delivered, c:'text-emerald-700',b:'border-emerald-500'},
          {l:'Rejected',  v:counts.rejected,  c:'text-red-600',    b:'border-red-400'},
        ].map(s => (
          <button key={s.l} onClick={() => setStatus(s.l === 'Total' ? 'all' : s.l.toLowerCase())}
            className={`bg-white rounded-xl border-l-4 ${s.b} shadow-sm p-4 text-left hover:shadow-md transition-shadow ${statusFilter === s.l.toLowerCase() || (statusFilter==='all' && s.l==='Total') ? 'ring-2 ring-blue-300' : ''}`}>
            <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">{s.l}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.c}`}>{s.v}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doc ID, template, record..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all','draft','pending','signed','delivered','rejected'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${statusFilter===s?'bg-gray-900 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s==='all'?'All':s}</button>
          ))}
        </div>
        <a href="/generate" className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors ml-auto">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Generate New
        </a>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Document ID','Template','Record ID','Status','Generated By','Date','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={7} className="px-5 py-12 text-center">
                  <svg className="animate-spin w-5 h-5 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-14 text-center">
                  <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <p className="text-sm text-gray-400">No documents found</p>
                  <a href="/generate" className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">Generate your first document →</a>
                </td></tr>
              )}
              {!loading && filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <button onClick={() => setDetail(doc)} className="font-mono text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 px-2.5 py-1 rounded-lg transition-colors">
                      {doc.doc_uuid}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{doc.template_name}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{doc.record_identifier || '—'}</td>
                  <td className="px-5 py-4"><StatusBadge status={doc.status}/></td>
                  <td className="px-5 py-4 text-xs text-gray-600">{doc.generated_by_name}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(doc.generated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Download */}
                      <a href={`http://localhost:5000/api/documents/${doc.id}/download?_auth=${localStorage.getItem('token')}`}
                        target="_blank" rel="noreferrer" title="Download PDF"
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const res = await axiosInstance.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
                            const url = URL.createObjectURL(res.data);
                            const a = document.createElement('a'); a.href = url; a.download = `${doc.doc_uuid}.pdf`; a.click();
                            URL.revokeObjectURL(url);
                          } catch { toast.error('Download failed'); }
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      </a>
                      {/* Request signature */}
                      {canSign && doc.status === 'draft' && (
                        <button onClick={() => { setSignModal(doc.id); setApprover(''); }} title="Request Signature"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                      )}
                      {/* Deliver */}
                      {canDeliver && doc.status === 'signed' && (
                        <button onClick={() => { setDeliverModal(doc.id); setEmail(''); }} title="Deliver to recipient"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </button>
                      )}
                      {/* Verify */}
                      <a href={`/verify?id=${doc.doc_uuid}`} title="Verify document"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      </a>
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

      {/* Document detail modal */}
      {detailDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Document Details</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-2.5">
              {[
                {l:'Document ID',  v:<span className="font-mono text-xs">{detailDoc.doc_uuid}</span>},
                {l:'Template',     v:detailDoc.template_name},
                {l:'Record ID',    v:detailDoc.record_identifier||'—'},
                {l:'Status',       v:<StatusBadge status={detailDoc.status}/>},
                {l:'Generated By', v:detailDoc.generated_by_name},
                {l:'Generated At', v:fmt(detailDoc.generated_at)},
                {l:'SHA-256 Hash', v:<span className="font-mono text-[10px] text-gray-500 break-all">{detailDoc.file_hash||'—'}</span>},
              ].map(r => (
                <div key={r.l} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0 w-28">{r.l}</span>
                  <div className="text-sm text-gray-800 text-right">{r.v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              {canSign && detailDoc.status === 'draft' && (
                <button onClick={() => { setDetail(null); setSignModal(detailDoc.id); setApprover(''); }}
                  className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                  Request Signature
                </button>
              )}
              {canDeliver && detailDoc.status === 'signed' && (
                <button onClick={() => { setDetail(null); setDeliverModal(detailDoc.id); setEmail(''); }}
                  className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                  Deliver
                </button>
              )}
              <button onClick={() => setDetail(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Request signature modal */}
      {signModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSignModal(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800">Request E-Signature</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Select Approver</label>
              <select value={selectedApprover} onChange={e => setApprover(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">— Choose approver —</option>
                {approvers.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.role})</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={requestSign} disabled={!selectedApprover || working}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {working ? 'Sending...' : 'Send Request'}
              </button>
              <button onClick={() => setSignModal(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver modal */}
      {deliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeliverModal(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800">Deliver Document</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recipient Email</label>
              <input type="email" value={recipientEmail} onChange={e => setEmail(e.target.value)} placeholder="recipient@email.com"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
            </div>
            <div className="flex gap-2">
              <button onClick={deliver} disabled={!recipientEmail || working}
                className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {working ? 'Delivering...' : 'Send & Deliver'}
              </button>
              <button onClick={() => setDeliverModal(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
