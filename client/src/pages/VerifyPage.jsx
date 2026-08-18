import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0 w-32">{label}</span>
      <span className="text-sm text-gray-800 text-right break-all">{value ?? '—'}</span>
    </div>
  );
}

function ResultBanner({ authentic, message }) {
  return (
    <div className={`rounded-2xl border-2 p-5 flex items-start gap-4 animate-in ${authentic ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${authentic ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {authentic
          ? <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
          : <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
        }
      </div>
      <div>
        <p className={`text-base font-bold ${authentic ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
        <p className={`text-xs mt-1 ${authentic ? 'text-emerald-600' : 'text-red-500'}`}>
          {authentic
            ? 'SHA-256 hash verified. This document has not been modified since generation.'
            : 'Hash mismatch detected. This document may have been altered externally.'}
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const [docId, setDocId]     = useState('');
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const addHistory = (id, res) => {
    setHistory(prev => {
      const entry = { id, template: res.template_name || id, authentic: res.authentic, ts: new Date() };
      return [entry, ...prev.filter(h => h.id !== id)].slice(0, 5);
    });
  };

  const verifyById = async () => {
    if (!docId.trim()) return;
    setLoading(true); setResult(null); setNotFound(false);
    try {
      const res = await axiosInstance.get(`/verify/${docId.trim().toUpperCase()}`);
      setResult(res.data);
      addHistory(docId.trim().toUpperCase(), res.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else setNotFound(true);
    } finally { setLoading(false); }
  };

  const verifyByUpload = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setNotFound(false);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await axiosInstance.post('/verify/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      if (res.data.doc_uuid) addHistory(res.data.doc_uuid, res.data);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Verify any DocuVault document using SHA-256 cryptographic hash verification.</p>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Public — no login required
          </span>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* By Doc ID */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verify by Document ID</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input value={docId} onChange={e => { setDocId(e.target.value); setResult(null); setNotFound(false); }}
                  onKeyDown={e => e.key === 'Enter' && verifyById()}
                  placeholder="DOC-YYYYMMDD-XXXXX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
              </div>
              <button onClick={verifyById} disabled={!docId.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-colors">
                {loading && !file
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                }
                Verify
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="mx-3 text-xs text-gray-400 bg-white px-1">or upload PDF</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* By Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verify by Uploading PDF</label>
            <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files[0]); setResult(null); setNotFound(false); }}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold file:text-xs hover:file:bg-blue-100 transition-all" />
            {file && (
              <button onClick={verifyByUpload} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 transition-colors">
                {loading && file
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Verifying...</>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>Upload & Verify {file.name}</>
                }
              </button>
            )}
          </div>
        </div>

        {/* Not found */}
        {notFound && !result && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 animate-in">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Document Not Found</p>
              <p className="text-xs text-red-500 mt-1">No document matching <span className="font-mono font-semibold">{docId.toUpperCase()}</span> exists in the system.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <ResultBanner authentic={result.authentic} message={result.message} />

            {/* Doc info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Information</p>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Document ID"  value={<span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{result.doc_uuid}</span>} />
                <InfoRow label="Status"       value={<span className="capitalize">{result.status}</span>} />
                <InfoRow label="Generated At" value={fmt(result.generated_at)} />
              </div>
            </div>

            {/* Hash */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Integrity Check</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Stored SHA-256 Hash</p>
                  <p className="font-mono text-[11px] text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 break-all">{result.stored_hash || result.file_hash || '—'}</p>
                </div>
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${result.authentic ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${result.authentic ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {result.authentic
                      ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                    }
                  </div>
                  <p className={`text-xs font-semibold ${result.authentic ? 'text-emerald-700' : 'text-red-600'}`}>
                    {result.authentic ? 'Hashes match — document integrity confirmed' : 'Hash mismatch — document may be tampered'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Verifications</p>
              <button onClick={() => setHistory([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear</button>
            </div>
            <div className="divide-y divide-gray-50">
              {history.map((h, i) => (
                <button key={i} onClick={() => { setDocId(h.id); setTimeout(() => verifyById(), 50); }}
                  className="flex items-center gap-3 w-full px-5 py-3 hover:bg-gray-50 transition-colors text-left">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${h.authentic ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {h.authentic
                      ? <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      : <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-semibold text-gray-700">{h.id}</p>
                    <p className="text-[10px] text-gray-400 truncate">{h.template}</p>
                  </div>
                  <span className={`text-[10px] font-bold flex-shrink-0 ${h.authentic ? 'text-emerald-600' : 'text-red-500'}`}>
                    {h.authentic ? '✓ Authentic' : '✗ Invalid'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}   

      </div>
    </div>
  );
}
