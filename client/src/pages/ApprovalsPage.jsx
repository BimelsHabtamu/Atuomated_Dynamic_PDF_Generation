import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { SkeletonTableRow } from '../components/ui/Skeleton';

const STATUS_META = {
  pending:  { bg: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-400',  label: 'Pending'  },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Approved' },
  rejected: { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-400',     label: 'Rejected' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}><span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{m.label}</span>;
}

function fmt(d) { return d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

export default function ApprovalsPage() {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatus]     = useState('all');
  const [search, setSearch]           = useState('');
  const [active, setActive]           = useState(null);
  const [otp, setOtp]                 = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [showReject, setShowReject]   = useState(false);
  const [rejectReason, setReason]     = useState('');
  const [working, setWorking]         = useState(false);

  const load = () => {
    setLoading(true);
    axiosInstance.get('/esign/pending')
      .then(r => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toast  = useToast();
  const notify = (text, type = 'success') => type === 'error' ? toast.error(text) : toast.success(text);

  const filtered = useMemo(() => requests.filter(r => {
    const q  = search.toLowerCase();
    const ms = r.doc_uuid?.toLowerCase().includes(q) || r.template_name?.toLowerCase().includes(q) || r.generator_name?.toLowerCase().includes(q);
    const mf = statusFilter === 'all' || r.status === statusFilter;
    return ms && mf;
  }), [requests, search, statusFilter]);

  const sendOtp = async () => {
    setWorking(true);
    try {
      await axiosInstance.post('/esign/otp/send', { request_id: active.id });
      setOtpSent(true);
      notify('OTP sent to approver email');
    } catch (e) { notify(e.response?.data?.message || 'Failed to send OTP', 'error'); }
    finally { setWorking(false); }
  };

  const approveDoc = async () => {
    if (otp.length !== 6) { notify('Enter a 6-digit OTP', 'error'); return; }
    setWorking(true);
    try {
      await axiosInstance.post('/esign/otp/verify', { request_id: active.id, otp });
      await axiosInstance.post('/esign/approve',    { request_id: active.id });
      notify('Document approved and signed successfully');
      setActive(null); setOtp(''); setOtpSent(false);
      load();
    } catch (e) { notify(e.response?.data?.message || 'Approval failed', 'error'); }
    finally { setWorking(false); }
  };

  const rejectDoc = async () => {
    if (!rejectReason.trim()) { notify('Rejection reason is required', 'error'); return; }
    setWorking(true);
    try {
      await axiosInstance.post('/esign/reject', { request_id: active.id, rejection_reason: rejectReason });
      notify('Document rejected and generator notified');
      setActive(null); setShowReject(false); setReason('');
      load();
    } catch (e) { notify(e.response?.data?.message || 'Rejection failed', 'error'); }
    finally { setWorking(false); }
  };

  const counts = useMemo(() => ({
    total:    requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review and sign pending document requests</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total,    color: 'border-blue-500 text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Pending', value: counts.pending, color: 'border-yellow-500 text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved', value: counts.approved, color: 'border-emerald-500 text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: counts.rejected, color: 'border-red-500 text-red-600',       bg: 'bg-red-50' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-2xl border-l-4 ${c.color} shadow-sm p-5`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.color.split(' ')[1]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* toast handles notifications */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doc, template, generator..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
        </div>
        <div className="flex gap-1.5">
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Document','Template','Requested By','Status','Requested','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading && [1,2,3,4].map(i => <SkeletonTableRow key={i} cols={6} />)}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No approval requests found</td></tr>}
              {!loading && filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4"><span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{r.doc_uuid}</span></td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">{r.template_name}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-white">{(r.generator_name || 'U').charAt(0)}</span>
                      </div>
                      <span className="text-xs text-gray-700">{r.generator_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(r.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => { setActive(r); setOtp(''); setOtpSent(false); setShowReject(false); setReason(''); }} title="Approve"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                          <button onClick={() => { setActive(r); setShowReject(true); setOtpSent(false); setReason(''); }} title="Reject"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {requests.length} requests</p>
          <p className="text-xs text-emerald-600 font-medium">● Live from database</p>
        </div>
      </div>

      {/* OTP Approve Modal */}
      {active && !showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-[420px] shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-800">Approve Document</h3>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="font-mono text-xs font-semibold text-blue-700">{active.doc_uuid}</p>
              <p className="text-xs text-blue-500 mt-0.5">{active.template_name}</p>
            </div>
            {msg.type === 'error' && <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl">{msg.text}</div>}
            {msg.type === 'success' && otpSent && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-2.5 rounded-xl">{msg.text}</div>}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Step 1 — Send OTP to approver</label>
              <button onClick={sendOtp} disabled={working} className="w-full border border-blue-200 text-blue-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {working ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Step 2 — Enter 6-digit OTP</label>
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} placeholder="● ● ● ● ● ●"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
              <p className="text-[10px] text-gray-400 text-center mt-1.5">Expires in 5 min · Max 3 attempts (BR-004)</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActive(null)} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={approveDoc} disabled={otp.length !== 6 || working} className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                {working ? 'Verifying...' : 'Verify & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {active && showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setActive(null); setShowReject(false); }} />
          <div className="relative bg-white rounded-2xl p-6 w-[420px] shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-800">Reject Document</h3>
            <p className="text-sm text-gray-500">Document <span className="font-mono font-semibold text-gray-700">{active.doc_uuid}</span> will revert to Draft and the generator will be notified.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rejection Reason *</label>
              <textarea value={rejectReason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Explain why this document is rejected..."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setActive(null); setShowReject(false); }} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={rejectDoc} disabled={!rejectReason.trim() || working} className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 disabled:opacity-40 transition-colors">
                {working ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
