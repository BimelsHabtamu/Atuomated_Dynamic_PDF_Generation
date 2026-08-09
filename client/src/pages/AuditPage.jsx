import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/ui/Modal';

const ACTION_META = { GENERATE: 'bg-blue-100 text-blue-700', SIGN: 'bg-purple-100 text-purple-700', DELIVER: 'bg-emerald-100 text-emerald-700', VERIFY: 'bg-yellow-100 text-yellow-700', PREVIEW: 'bg-gray-100 text-gray-600' };
const PAGE_SIZES  = [10, 20, 50];

function fmt(d) { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function parseBrowser(ua) {
  if (!ua) return '—';
  if (ua.includes('Chrome'))  return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari'))  return 'Safari';
  if (ua.includes('Edge'))    return 'Edge';
  return 'Browser';
}

export default function AuditPage() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [actionFilter, setAction] = useState('all');
  const [fromDate, setFrom]       = useState('');
  const [toDate, setTo]           = useState('');
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);
  const [viewTarget, setView]     = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (actionFilter !== 'all') params.append('action', actionFilter);
    if (fromDate) params.append('from_date', fromDate);
    if (toDate)   params.append('to_date', toDate);
    axiosInstance.get(`/audit/logs?${params}`)
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [actionFilter, fromDate, toDate]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(r =>
      (r.user_name || '').toLowerCase().includes(q) ||
      (r.doc_uuid  || '').toLowerCase().includes(q) ||
      (r.ip_address || '').includes(q)
    );
  }, [logs, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(() => ({
    total:    logs.length,
    generate: logs.filter(r => r.action === 'GENERATE').length,
    sign:     logs.filter(r => r.action === 'SIGN').length,
    verify:   logs.filter(r => r.action === 'VERIFY').length,
  }), [logs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-400 mt-0.5">Immutable forensic log — read only</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Read Only
        </span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[{l:'Total Events',v:counts.total,c:'border-blue-500 text-blue-600'},{l:'Generations',v:counts.generate,c:'border-indigo-500 text-indigo-600'},{l:'Signatures',v:counts.sign,c:'border-purple-500 text-purple-600'},{l:'Verifications',v:counts.verify,c:'border-yellow-500 text-yellow-600'}].map(c => (
          <div key={c.l} className={`bg-white rounded-2xl border-l-4 ${c.c} shadow-sm p-5`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.l}</p>
            <p className={`text-3xl font-bold mt-1 ${c.c.split(' ')[1]}`}>{c.v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search user, document, IP..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['all','GENERATE','SIGN','DELIVER','VERIFY','PREVIEW'].map(a => (
              <button key={a} onClick={() => { setAction(a); setPage(1); }} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${actionFilter === a ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{a === 'all' ? 'All' : a}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {[['From', fromDate, setFrom], ['To', toDate, setTo]].map(([l, v, s]) => (
            <div key={l} className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{l}</label>
              <input type="date" value={v} onChange={e => { s(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
            </div>
          ))}
          {(search || actionFilter !== 'all' || fromDate || toDate) && (
            <button onClick={() => { setSearch(''); setAction('all'); setFrom(''); setTo(''); setPage(1); }} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Clear</button>
          )}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} records</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['#','User','Action','Document','IP Address','Browser','Timestamp',''].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={8} className="px-5 py-10 text-center"><svg className="animate-spin w-5 h-5 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></td></tr>}
              {!loading && paginated.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">No audit logs found</td></tr>}
              {!loading && paginated.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4 text-xs text-gray-400 font-mono">{(page-1)*pageSize+idx+1}</td>
                  <td className="px-5 py-4">
                    {row.user_name
                      ? <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-bold text-white">{row.user_name.charAt(0)}</span></div><span className="text-xs font-medium text-gray-700">{row.user_name}</span></div>
                      : <span className="text-xs text-gray-400 italic">Public</span>
                    }
                  </td>
                  <td className="px-5 py-4"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ACTION_META[row.action] || 'bg-gray-100 text-gray-600'}`}>{row.action}</span></td>
                  <td className="px-5 py-4"><span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{row.doc_uuid || '—'}</span></td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{row.ip_address || '—'}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{parseBrowser(row.user_agent)}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(row.timestamp)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setView(row)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Rows per page</span>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none">
              {PAGE_SIZES.map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="text-xs text-gray-400">{paginated.length} of {filtered.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({length: Math.min(totalPages,5)}, (_,i) => {
              const p = totalPages <= 5 ? i+1 : page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
              return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${page===p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!viewTarget} onClose={() => setView(null)} title="Audit Log Detail" subtitle={`Event #${viewTarget?.id}`} size="md">
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ACTION_META[viewTarget.action] || 'bg-gray-100 text-gray-600'}`}>{viewTarget.action}</span>
              <p className="text-xs text-gray-500">{fmt(viewTarget.timestamp)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['User', viewTarget.user_name || 'Public'], ['Document', viewTarget.doc_uuid || '—'], ['IP Address', viewTarget.ip_address || '—'], ['Browser', parseBrowser(viewTarget.user_agent)], ['User Agent', viewTarget.user_agent || '—']].map(([l, v]) => (
                <div key={l} className={`bg-gray-50 rounded-xl p-3 ${l === 'User Agent' ? 'col-span-2' : ''}`}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className="text-sm text-gray-800 break-all">{v}</p>
                </div>
              ))}
            </div>
            {viewTarget.action_details && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Action Details</p>
                <pre className="bg-gray-900 text-emerald-400 text-xs rounded-xl px-4 py-3 overflow-x-auto font-mono">{JSON.stringify(typeof viewTarget.action_details === 'string' ? JSON.parse(viewTarget.action_details) : viewTarget.action_details, null, 2)}</pre>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <p className="text-xs text-amber-700">Audit logs are immutable — no edits or deletions permitted (FR-020)</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
