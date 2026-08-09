import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';

const STATUS_META = { queued: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }, sent: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' }, failed: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' }, opened: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' } };
const STATUSES = ['queued','sent','failed','opened'];
function StatusBadge({ s }) { const m = STATUS_META[s] || STATUS_META.queued; return <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}><span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}/>{s}</span>; }
function ExpiryBadge({ exp }) { const d = Math.ceil((new Date(exp)-Date.now())/(1000*60*60*24)); const ex = d <= 0; return <span className={`text-xs font-medium ${ex ? 'text-red-500' : d <= 1 ? 'text-yellow-600' : 'text-emerald-600'}`}>{ex ? 'Expired' : `${d}d left`}</span>; }
function fmt(d) { return d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

export default function DeliveryLogsPage() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [fromDate, setFrom]       = useState('');
  const [toDate, setTo]           = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.append('recipient_email', search);
    if (statusFilter !== 'all') params.append('email_status', statusFilter);
    if (fromDate)     params.append('from', fromDate);
    if (toDate)       params.append('to', toDate);
    axiosInstance.get(`/delivery/logs?${params}`)
      .then(r => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, fromDate, toDate]);

  const counts = useMemo(() => ({ total: logs.length, sent: logs.filter(l=>l.email_status==='sent').length, opened: logs.filter(l=>l.email_status==='opened').length, failed: logs.filter(l=>l.email_status==='failed').length }), [logs]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Logs</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track document delivery and download access</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[{l:'Total',v:counts.total,c:'border-blue-500 text-blue-600'},{l:'Sent',v:counts.sent,c:'border-indigo-500 text-indigo-600'},{l:'Opened',v:counts.opened,c:'border-emerald-500 text-emerald-600'},{l:'Failed',v:counts.failed,c:'border-red-500 text-red-600'}].map(c => (
          <div key={c.l} className={`bg-white rounded-2xl border-l-4 ${c.c} shadow-sm p-5`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.l}</p>
            <p className={`text-3xl font-bold mt-1 ${c.c.split(' ')[1]}`}>{c.v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search recipient email..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all',...STATUSES].map(s => <button key={s} onClick={() => setStatus(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'all' ? 'All' : s}</button>)}
        </div>
        {[['From', fromDate, setFrom],['To', toDate, setTo]].map(([l,v,s]) => (
          <div key={l} className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-400">{l}</label>
            <input type="date" value={v} onChange={e => s(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
        ))}
        <button onClick={load} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">Search</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Recipient','Document','Status','Sent','Downloaded','IP Address','Expiration'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={7} className="px-5 py-10 text-center"><svg className="animate-spin w-5 h-5 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No delivery logs found</td></tr>}
              {!loading && logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><span className="text-xs font-semibold text-blue-600">{log.recipient_email.charAt(0).toUpperCase()}</span></div>
                      <span className="text-sm text-gray-800">{log.recipient_email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{log.doc_uuid}</span></td>
                  <td className="px-5 py-4"><StatusBadge s={log.email_status} /></td>
                  <td className="px-5 py-4 text-xs text-gray-500">{fmt(log.sent_at)}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{fmt(log.downloaded_at)}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{log.downloaded_ip || '—'}</td>
                  <td className="px-5 py-4"><ExpiryBadge exp={log.token_expiry} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">{logs.length} records</p>
          <p className="text-xs text-emerald-600 font-medium">● Live from database</p>
        </div>
      </div>
    </div>
  );
}
