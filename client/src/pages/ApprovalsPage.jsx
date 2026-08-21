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
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}/>
      {m.label}
    </span>
  );
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

// OTP input — 6 individual boxes
function OtpInput({ value, onChange }) {
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);
  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = value.slice(0, i) + e.key + value.slice(i + 1);
      onChange(next.slice(0, 6));
      if (i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={e => handleKey(e, i)}
          onFocus={e => e.target.select()}
          className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl
            focus:outline-none focus:border-[#3b5bdb] transition-all
            bg-[var(--color-bg)] text-[var(--color-text-primary)]
            ${d ? 'border-[#3b5bdb] bg-indigo-50/50' : 'border-[var(--color-border)]'}`}
        />
      ))}
    </div>
  );
}

export default function ApprovalsPage() {
  const toast = useToast();

  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatus]   = useState('all');
  const [search, setSearch]         = useState('');

  // Active modal state
  const [active, setActive]         = useState(null);  // the request object
  const [mode, setMode]             = useState(null);  // 'approve' | 'reject'

  // OTP flow state (per the SRS: send → verify → approve)
  const [otpSent, setOtpSent]       = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp]               = useState('');
  const [otpError, setOtpError]     = useState('');

  // Reject state
  const [rejectReason, setReason]   = useState('');

  const [working, setWorking]       = useState(false);

  const load = () => {
    setLoading(true);
    axiosInstance.get('/esign/pending')
      .then(r => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openApprove = (r) => {
    setActive(r);
    setMode('approve');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError('');
  };

  const openReject = (r) => {
    setActive(r);
    setMode('reject');
    setReason('');
  };

  const closeModal = () => {
    setActive(null);
    setMode(null);
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError('');
    setReason('');
  };

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setWorking(true);
    setOtpError('');
    try {
      await axiosInstance.post('/esign/otp/send', { request_id: active.id });
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      toast.success('OTP sent to approver email');
    } catch (e) {
      setOtpError(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setWorking(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const verifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter all 6 digits'); return; }
    setWorking(true);
    setOtpError('');
    try {
      await axiosInstance.post('/esign/otp/verify', { request_id: active.id, otp });
      setOtpVerified(true);
      setOtpError('');
      toast.success('OTP verified — you can now approve');
    } catch (e) {
      setOtpError(e.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setWorking(false);
    }
  };

  // ── Step 3: Approve (only after OTP verified) ───────────────────────────────
  const approveDoc = async () => {
    setWorking(true);
    setOtpError('');
    try {
      await axiosInstance.post('/esign/approve', { request_id: active.id });
      toast.success('Document approved and digitally signed');
      closeModal();
      load();
    } catch (e) {
      setOtpError(e.response?.data?.message || 'Approval failed');
    } finally {
      setWorking(false);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const rejectDoc = async () => {
    if (!rejectReason.trim()) { toast.error('Rejection reason is required'); return; }
    setWorking(true);
    try {
      await axiosInstance.post('/esign/reject', { request_id: active.id, rejection_reason: rejectReason });
      toast.success('Document rejected — generator has been notified');
      closeModal();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Rejection failed');
    } finally {
      setWorking(false);
    }
  };

  const filtered = useMemo(() => requests.filter(r => {
    const q  = search.toLowerCase();
    const ms = (r.doc_uuid || '').toLowerCase().includes(q) ||
               (r.template_name || '').toLowerCase().includes(q) ||
               (r.generator_name || '').toLowerCase().includes(q);
    const mf = statusFilter === 'all' || r.status === statusFilter;
    return ms && mf;
  }), [requests, search, statusFilter]);

  const counts = useMemo(() => ({
    total:    requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests]);

  // Current OTP step label
  const otpStep = !otpSent ? 1 : !otpVerified ? 2 : 3;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Approvals</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Review and digitally sign pending document requests
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: counts.total,    border: 'border-[#3b5bdb]', color: 'text-[#3b5bdb]' },
          { label: 'Pending',  value: counts.pending,  border: 'border-yellow-500', color: 'text-yellow-600' },
          { label: 'Approved', value: counts.approved, border: 'border-emerald-500', color: 'text-emerald-600' },
          { label: 'Rejected', value: counts.rejected, border: 'border-red-500',    color: 'text-red-600' },
        ].map(c => (
          <div key={c.label} className={`bg-[var(--color-surface)] rounded-2xl border-l-4 ${c.border} shadow-sm p-5`}>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search doc, template, generator..."
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)]
              rounded-xl text-sm bg-[var(--color-bg)] text-[var(--color-text-primary)]
              placeholder-[var(--color-text-secondary)]
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors
                ${statusFilter === s
                  ? 'bg-[#3b5bdb] text-white'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                {['Document','Template','Requested By','Status','Requested','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold
                    text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading && [1,2,3,4].map(i => <SkeletonTableRow key={i} cols={6}/>)}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <svg className="w-10 h-10 text-[var(--color-border)] mx-auto mb-3"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">No approval requests found</p>
                  </td>
                </tr>
              )}
              {!loading && filtered.map(r => (
                <tr key={r.id} className="hover:bg-[var(--color-surface-raised)] transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-[var(--color-surface-raised)]
                      text-[var(--color-text-primary)] px-2.5 py-1 rounded-lg">
                      {r.doc_uuid}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]">
                    {r.template_name}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500
                        flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-white">
                          {(r.generator_name || 'U').charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">{r.generator_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={r.status}/></td>
                  <td className="px-5 py-4 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                    {fmt(r.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openApprove(r)} title="Approve with OTP"
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            text-[var(--color-text-secondary)] hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                        <button onClick={() => openReject(r)} title="Reject"
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Showing {filtered.length} of {requests.length} requests
          </p>
          <p className="text-xs text-emerald-600 font-medium">● Live from database</p>
        </div>
      </div>

      {/* ── Approve Modal (3-step OTP flow) ───────────────────────────────── */}
      {active && mode === 'approve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}/>
          <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in">

            {/* Title */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] text-base">
                  Approve Document
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  3-step identity verification required
                </p>
              </div>
              <button onClick={closeModal}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Doc info */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <p className="font-mono text-xs font-semibold text-[#3b5bdb]">{active.doc_uuid}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{active.template_name}</p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: 'Send OTP',   done: otpSent },
                { n: 2, label: 'Verify OTP', done: otpVerified },
                { n: 3, label: 'Approve',    done: false },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${s.done
                      ? 'bg-emerald-500 text-white'
                      : otpStep === s.n
                      ? 'bg-[#3b5bdb] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}>
                    {s.done
                      ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      : s.n
                    }
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:block
                    ${otpStep === s.n
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]'
                    }`}>
                    {s.label}
                  </span>
                  {i < 2 && <div className={`flex-1 h-px ${s.done ? 'bg-emerald-300' : 'bg-[var(--color-border)]'}`}/>}
                </div>
              ))}
            </div>

            {/* Error message */}
            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {otpError}
              </div>
            )}

            {/* Step 1 — Send OTP */}
            {!otpVerified && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3b5bdb] flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white">1</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Send OTP to your registered email
                  </p>
                </div>
                <button onClick={sendOtp} disabled={working}
                  className="w-full border border-[#3b5bdb] text-[#3b5bdb] text-sm font-semibold
                    py-2.5 rounded-xl hover:bg-indigo-50 transition-colors
                    flex items-center justify-center gap-2 disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {working ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            )}

            {/* Step 2 — Enter & verify OTP */}
            {otpSent && !otpVerified && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3b5bdb] flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-white">2</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Enter the 6-digit OTP from your email
                  </p>
                </div>
                <OtpInput value={otp} onChange={setOtp}/>
                <p className="text-[10px] text-[var(--color-text-secondary)] text-center">
                  Expires in 5 min · Max 3 attempts (BR-004)
                </p>
                <button onClick={verifyOtp} disabled={otp.length !== 6 || working}
                  className="w-full bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white text-sm font-semibold
                    py-2.5 rounded-xl disabled:opacity-40 transition-colors
                    flex items-center justify-center gap-2">
                  {working
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Verifying…</>
                    : <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Verify OTP
                      </>
                  }
                </button>
              </div>
            )}

            {/* Step 3 — Approve (only after OTP verified) */}
            {otpVerified && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3
                  flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Identity Verified</p>
                    <p className="text-[11px] text-emerald-600">
                      OTP confirmed. You can now approve the document.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)]
                  border border-[var(--color-border)] rounded-xl px-4 py-3">
                  Clicking <strong>Approve</strong> will apply a cryptographic HMAC-SHA256 digital
                  signature to this document. This action is irreversible and will be logged.
                </p>
                <button onClick={approveDoc} disabled={working}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold
                    py-3 rounded-xl disabled:opacity-50 transition-colors
                    flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
                  {working
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Applying signature…</>
                    : <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                        Approve &amp; Sign Document
                      </>
                  }
                </button>
              </div>
            )}

            {/* Cancel */}
            {!otpVerified && (
              <button onClick={closeModal}
                className="w-full bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]
                  text-sm font-medium py-2.5 rounded-xl
                  hover:text-[var(--color-text-primary)] transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Reject Modal ───────────────────────────────────────────────────── */}
      {active && mode === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}/>
          <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-[var(--color-text-primary)]">Reject Document</h3>
              <button onClick={closeModal}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="font-mono text-xs font-semibold text-red-700">{active.doc_uuid}</p>
              <p className="text-xs text-red-500 mt-0.5">
                Will revert to Draft — generator will be notified by email
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]
                uppercase tracking-wide mb-1.5">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea value={rejectReason} onChange={e => setReason(e.target.value)} rows={4}
                placeholder="Explain clearly why this document is being rejected..."
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm
                  bg-[var(--color-bg)] text-[var(--color-text-primary)]
                  placeholder-[var(--color-text-secondary)]
                  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300
                  transition resize-none"/>
            </div>

            <div className="flex gap-2">
              <button onClick={closeModal}
                className="flex-1 bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]
                  text-sm font-medium py-2.5 rounded-xl
                  hover:text-[var(--color-text-primary)] transition-colors">
                Cancel
              </button>
              <button onClick={rejectDoc} disabled={!rejectReason.trim() || working}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                  py-2.5 rounded-xl disabled:opacity-40 transition-colors">
                {working ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
