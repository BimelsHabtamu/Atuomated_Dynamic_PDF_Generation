import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import PublicLayout from '../components/PublicLayout';

// Soft white theme — matches LandingPage
// bg-[#f7f8fc]  page bg
// #3b5bdb       primary indigo
// #1e2a3a       dark text
// #64748b       muted text
// #e8eaf0       border

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3
      border-b border-[#f0f0f4] last:border-0">
      <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide
        flex-shrink-0 w-36">
        {label}
      </span>
      <span className="text-sm text-[#1e2a3a] text-right break-all">{value ?? '—'}</span>
    </div>
  );
}

function ResultBanner({ authentic, message }) {
  return (
    <div className={`rounded-2xl border-2 p-5 flex items-start gap-4 animate-in ${
      authentic ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
        authentic ? 'bg-emerald-500' : 'bg-red-500'
      }`}>
        {authentic
          ? <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          : <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
        }
      </div>
      <div>
        <p className={`text-base font-bold ${authentic ? 'text-emerald-700' : 'text-red-700'}`}>
          {message}
        </p>
        <p className={`text-xs mt-1 leading-relaxed ${authentic ? 'text-emerald-600' : 'text-red-500'}`}>
          {authentic
            ? 'SHA-256 hash verified. This document has not been modified since it was generated.'
            : 'Hash mismatch detected. This document may have been altered or corrupted externally.'}
        </p>
      </div>
    </div>
  );
}

export default function PublicVerifyPage() {
  const { doc_uuid: paramId } = useParams();

  const [docId,    setDocId]    = useState(paramId ?? '');
  const [file,     setFile]     = useState(null);
  const [result,   setResult]   = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);

  const addHistory = (id, res) => {
    setHistory(prev => {
      const entry = { id, template: res.template_name || id, authentic: res.authentic };
      return [entry, ...prev.filter(h => h.id !== id)].slice(0, 5);
    });
  };

  const verifyById = async (overrideId) => {
    const id = (overrideId ?? docId).trim().toUpperCase();
    if (!id) return;
    setLoading(true); setResult(null); setNotFound(false);
    try {
      const res = await axiosInstance.get(`/verify/${id}`);
      setResult(res.data);
      addHistory(id, res.data);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const verifyByUpload = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setNotFound(false);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await axiosInstance.post('/verify/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      if (res.data.doc_uuid) addHistory(res.data.doc_uuid, res.data);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  return (
    <PublicLayout>

      {/* ── Hero — soft white with indigo tint ──────────── */}
      <div className="bg-[#f7f8fc] pt-28 pb-12 px-4 relative overflow-hidden
        border-b border-[#e8eaf0]">

        {/* Soft indigo glow — top right */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px]
          bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-full
          pointer-events-none -translate-y-1/4 translate-x-1/4"/>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #3b5bdb 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}/>

        <div className="relative max-w-3xl mx-auto text-center space-y-5">

          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#e8eaf0]
            shadow-sm flex items-center justify-center mx-auto">
            <img src="/logo.png" alt="DocuVault" className="w-10 h-10 object-contain"/>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1e2a3a]">
              Document Verification
            </h1>
            <p className="text-[#64748b] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Verify the authenticity of any official DocuVault document
              using cryptographic SHA-256 hash verification.
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600
              font-semibold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>
              Public — no login required
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#3b5bdb]
              font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              SHA-256 Secured
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]
              font-semibold bg-white border border-[#e8eaf0] px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3 text-[#3b5bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Instant Result
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="bg-[#f7f8fc] py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Search card */}
          <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-sm p-6 space-y-5">

            {/* By Doc ID */}
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                Verify by Document ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                    text-[#94a3b8] pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input
                    value={docId}
                    onChange={e => { setDocId(e.target.value); setResult(null); setNotFound(false); }}
                    onKeyDown={e => e.key === 'Enter' && verifyById()}
                    placeholder="e.g. DOC-20260818-00142"
                    className="w-full pl-10 pr-4 py-3 border border-[#e8eaf0] rounded-xl
                      text-sm font-mono text-[#1e2a3a] placeholder-[#c0c8d8]
                      focus:outline-none focus:ring-2 focus:ring-indigo-200
                      focus:border-indigo-400 bg-[#f7f8fc] transition"
                  />
                </div>
                <button
                  onClick={() => verifyById()}
                  disabled={!docId.trim() || loading}
                  className="bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white text-sm font-bold
                    px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all"
                >
                  {loading && !file
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                  }
                  Verify
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 h-px bg-[#f0f0f4]"/>
              <span className="mx-3 text-xs text-[#94a3b8] bg-white px-1">or upload PDF</span>
              <div className="flex-1 h-px bg-[#f0f0f4]"/>
            </div>

            {/* By Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                Verify by Uploading PDF
              </label>
              <input
                type="file" accept=".pdf"
                onChange={e => { setFile(e.target.files[0]); setResult(null); setNotFound(false); }}
                className="w-full text-sm text-[#64748b]
                  file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                  file:bg-indigo-50 file:text-[#3b5bdb] file:font-semibold file:text-xs
                  hover:file:bg-indigo-100 transition-all"
              />
              {file && (
                <button
                  onClick={verifyByUpload} disabled={loading}
                  className="w-full bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white text-sm font-bold
                    py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2
                    shadow-sm shadow-indigo-200 transition-all"
                >
                  {loading && file
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Verifying...</>
                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>Upload &amp; Verify — {file.name}</>
                  }
                </button>
              )}
            </div>
          </div>

          {/* Not found */}
          {notFound && !result && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5
              flex items-start gap-4 animate-in">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center
                justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Document Not Found</p>
                <p className="text-xs text-red-500 mt-1">
                  No document matching{' '}
                  <span className="font-mono font-semibold">{docId.toUpperCase()}</span>
                  {' '}exists in the system.
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <ResultBanner authentic={result.authentic} message={result.message} />

              {/* Doc info */}
              <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#f7f8fc] border-b border-[#e8eaf0]
                  flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#3b5bdb] rounded-full"/>
                  <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                    Document Information
                  </p>
                </div>
                <div className="px-5 py-1">
                  <InfoRow label="Document ID"
                    value={
                      <span className="font-mono text-xs bg-[#f0f2fa] px-2 py-0.5 rounded">
                        {result.doc_uuid}
                      </span>
                    }
                  />
                  <InfoRow label="Status"
                    value={
                      <span className={`capitalize text-xs font-bold px-2.5 py-1 rounded-full ${
                        result.status === 'signed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : result.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-[#f0f2fa] text-[#64748b]'
                      }`}>
                        {result.status}
                      </span>
                    }
                  />
                  <InfoRow label="Generated At" value={fmt(result.generated_at)} />
                  {result.template_name && (
                    <InfoRow label="Template" value={result.template_name} />
                  )}
                </div>
              </div>

              {/* Integrity */}
              <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#f7f8fc] border-b border-[#e8eaf0]
                  flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#3b5bdb] rounded-full"/>
                  <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                    Integrity Check
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
                      Stored SHA-256 Hash
                    </p>
                    <p className="font-mono text-[11px] text-[#64748b] bg-[#f7f8fc]
                      border border-[#e8eaf0] rounded-xl px-4 py-3 break-all leading-relaxed">
                      {result.stored_hash || result.file_hash || '—'}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${
                    result.authentic
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-red-50 border-red-100'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.authentic ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {result.authentic
                        ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                          </svg>
                        : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                      }
                    </div>
                    <p className={`text-xs font-semibold ${
                      result.authentic ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {result.authentic
                        ? 'Hashes match — document integrity confirmed'
                        : 'Hash mismatch — document may be tampered'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e8eaf0] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#e8eaf0] flex items-center justify-between">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  Recent Verifications
                </p>
                <button onClick={() => setHistory([])}
                  className="text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors">
                  Clear
                </button>
              </div>
              <div className="divide-y divide-[#f0f0f4]">
                {history.map((h, i) => (
                  <button key={i}
                    onClick={() => { setDocId(h.id); verifyById(h.id); }}
                    className="flex items-center gap-3 w-full px-5 py-3
                      hover:bg-[#f7f8fc] transition-colors text-left">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      h.authentic ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {h.authentic
                        ? <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                        : <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-semibold text-[#1e2a3a]">{h.id}</p>
                      <p className="text-[10px] text-[#94a3b8] truncate">{h.template}</p>
                    </div>
                    <span className={`text-[10px] font-bold flex-shrink-0 ${
                      h.authentic ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {h.authentic ? 'Authentic' : 'Invalid'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
         

          {/* Back to home */}
          <div className="text-center pb-4">
            <Link to="/"
              className="inline-flex items-center gap-2 text-sm text-[#3b5bdb]
                font-semibold hover:text-[#2f4ac4] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
