import { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';

const CATEGORY_COLORS = {
  HR: 'bg-blue-100 text-blue-700', Finance: 'bg-green-100 text-green-700',
  Academic: 'bg-purple-100 text-purple-700', Procurement: 'bg-orange-100 text-orange-700', General: 'bg-gray-100 text-gray-600',
};
const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-700',
  signed: 'bg-blue-100 text-blue-700', delivered: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-600',
};
const TYPE_INPUT = { string: 'text', number: 'number', date: 'date' };

function StepBadge({ step, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-blue-600' : done ? 'text-emerald-500' : 'text-gray-300'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2
        ${active ? 'border-blue-600 bg-blue-600 text-white' : done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 bg-white text-gray-300'}`}>
        {done ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : step}
      </div>
      <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

export default function GenerateDocPage() {
  const [step, setStep]             = useState(1);
  const [templates, setTemplates]   = useState([]);
  const [selectedId, setSelected]   = useState(null);
  const [template, setTemplate]     = useState(null);
  const [values, setValues]         = useState({});
  const [recordId, setRecordId]     = useState('');
  const [preview, setPreview]       = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [search, setSearch]         = useState('');
  const [error, setError]           = useState('');

  useEffect(() => {
    axiosInstance.get('/templates').then(r => setTemplates(r.data.filter(t => t.is_active)));
    axiosInstance.get('/documents').then(r => setRecentDocs(r.data.slice(0, 8))).catch(() => {});
  }, []);

  const selectTemplate = async (id) => {
    setSelected(id);
    setPreview(''); setError(''); setGenerated(null);
    const res   = await axiosInstance.get(`/templates/${id}`);
    const tmpl  = res.data;
    setTemplate(tmpl);
    const init  = {};
    (tmpl.placeholders || []).forEach(p => { init[p.field_path] = p.default_value || ''; });
    setValues(init);
  };

  const allFilled = useMemo(() => {
    if (!template?.placeholders?.length) return !!selectedId;
    return template.placeholders.every(p => values[p.field_path]?.trim());
  }, [template, values, selectedId]);

  const doPreview = async () => {
    setPreviewing(true); setError('');
    try {
      const res = await axiosInstance.post('/documents/preview', { template_id: Number(selectedId), data: values });
      setPreview(res.data.html);
    } catch (e) { setError(e.response?.data?.message || 'Preview failed'); }
    finally { setPreviewing(false); }
  };

  const doGenerate = async () => {
    setGenerating(true); setError('');
    try {
      const res = await axiosInstance.post('/documents/generate', {
        template_id: Number(selectedId),
        record_identifier: recordId || null,
        data: values,
      });
      setGenerated(res.data);
      setStep(3);
      axiosInstance.get('/documents').then(r => setRecentDocs(r.data.slice(0, 8))).catch(() => {});
    } catch (e) { setError(e.response?.data?.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  const reset = () => {
    setStep(1); setSelected(null); setTemplate(null);
    setValues({}); setRecordId(''); setPreview(''); setGenerated(null); setError('');
  };

  const filteredDocs = recentDocs.filter(d =>
    d.doc_uuid.toLowerCase().includes(search.toLowerCase()) ||
    (d.template_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Document</h1>
        <p className="text-sm text-gray-400 mt-0.5">Select a template, fill the fields, preview and generate a PDF</p>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <StepBadge step={1} label="Select Template" active={step === 1} done={step > 1} />
          <div className={`flex-1 h-px ${step > 1 ? 'bg-emerald-300' : 'bg-gray-100'}`} />
          <StepBadge step={2} label="Fill Data" active={step === 2} done={step > 2} />
          <div className={`flex-1 h-px ${step > 2 ? 'bg-emerald-300' : 'bg-gray-100'}`} />
          <StepBadge step={3} label="Generated" active={step === 3} done={false} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-4">

          {/* Step 1 */}
          <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${step === 1 ? 'border-blue-100' : 'border-gray-100'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${step === 1 ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > 1 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Select Template</p>
                  {step > 1 && template && <p className="text-xs text-emerald-600">{template.name} selected</p>}
                </div>
              </div>
              {step > 1 && <button onClick={() => { setStep(1); setPreview(''); }} className="text-xs text-blue-600 font-medium">Change</button>}
            </div>
            {step === 1 && (
              <div className="p-5 space-y-3">
                {templates.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No active templates. Create one first.</p>}
                {templates.map(t => (
                  <button key={t.id} onClick={() => selectTemplate(t.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedId === t.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedId === t.id ? 'bg-blue-600' : 'bg-gray-100'}`}>
                        <svg className={`w-4.5 h-4.5 ${selectedId === t.id ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold ${selectedId === t.id ? 'text-blue-700' : 'text-gray-800'}`}>{t.name}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[t.category] || 'bg-gray-100 text-gray-500'}`}>{t.category}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">v{t.version} · {t.watermark_text || 'No watermark'}</p>
                      </div>
                      {selectedId === t.id && <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
                    </div>
                  </button>
                ))}
                <button onClick={() => setStep(2)} disabled={!selectedId}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2">
                  Continue to Fill Data →
                </button>
              </div>
            )}
          </div>

          {/* Step 2 */}
          {step >= 2 && (
            <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${step === 2 ? 'border-blue-100' : 'border-gray-100'}`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${step === 2 ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > 2 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>{step > 2 ? '✓' : '2'}</div>
                  <p className="text-sm font-bold text-gray-800">Fill in Data Fields</p>
                </div>
                {template?.placeholders && (
                  <span className="text-xs text-gray-400">
                    {template.placeholders.filter(p => values[p.field_path]?.trim()).length}/{template.placeholders.length} filled
                  </span>
                )}
              </div>
              {step === 2 && template && (
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Record Identifier (optional)</label>
                    <input value={recordId} onChange={e => setRecordId(e.target.value)} placeholder="e.g. EMP-001, STU-2024-042"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" />
                  </div>

                  {template.placeholders?.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Template Fields</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {template.placeholders.map(p => (
                          <div key={p.field_path}>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                              <code className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{`{{${p.field_path}}}`}</code>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${p.data_type === 'number' ? 'bg-blue-50 text-blue-500' : p.data_type === 'date' ? 'bg-purple-50 text-purple-500' : 'bg-gray-50 text-gray-400'}`}>{p.data_type}</span>
                            </label>
                            <input type={TYPE_INPUT[p.data_type] || 'text'} value={values[p.field_path] || ''}
                              onChange={e => setValues(v => ({ ...v, [p.field_path]: e.target.value }))}
                              placeholder={p.default_value || `Enter ${p.field_path.replace(/_/g, ' ')}`}
                              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition ${values[p.field_path]?.trim() ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={doPreview} disabled={previewing}
                      className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center gap-2 transition-colors">
                      {previewing ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                      {previewing ? 'Loading...' : preview ? 'Refresh Preview' : 'Preview'}
                    </button>
                    <button onClick={doGenerate} disabled={!allFilled || generating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 transition-colors">
                      {generating ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Generate PDF</>}
                    </button>
                  </div>

                  {preview && (
                    <div className="border border-blue-100 rounded-xl overflow-hidden mt-2">
                      <div className="px-4 py-2 bg-blue-50/30 border-b border-blue-100 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">HTML Preview</p>
                        <span className="text-[10px] text-gray-400">Rendered from template body</span>
                      </div>
                      <div className="p-5 bg-white">
                        <div className="prose prose-sm max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: preview }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — success */}
          {step === 3 && generated && (
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/40 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm font-bold text-emerald-700">PDF Generated Successfully</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                  {[
                    { label: 'Document ID', value: <span className="font-mono text-sm font-semibold text-gray-800 bg-white border border-gray-200 px-3 py-1 rounded-lg">{generated.doc_uuid}</span> },
                    { label: 'Status',      value: <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Draft</span> },
                    { label: 'DB Record',   value: <span className="text-sm text-gray-700">ID #{generated.id} — saved to generated_docs</span> },
                    { label: 'Hash',        value: <span className="font-mono text-[10px] text-gray-500">Stored in file_hash column</span> },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{r.label}</span>
                      <div>{r.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <a href={`/api/documents/${generated.id}/download`} target="_blank" rel="noreferrer"
                    className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF
                  </a>
                  <button onClick={reset} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                    Generate Another
                  </button>
                  <a href="/documents" className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-center">
                    View Documents
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {template && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selected Template</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{template.name}</p>
                  <p className="text-xs text-gray-400">{template.category} · v{template.version}</p>
                </div>
              </div>
              {template.placeholders?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Fields</span><span className="font-medium text-gray-700">{template.placeholders.length}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Filled</span><span className="font-medium text-emerald-600">{template.placeholders.filter(p => values[p.field_path]?.trim()).length} / {template.placeholders.length}</span></div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${template.placeholders.filter(p => values[p.field_path]?.trim()).length / template.placeholders.length * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Documents</p>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">{recentDocs.length}</span>
            </div>
            <div className="px-4 py-2.5 border-b border-gray-100">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {filteredDocs.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No documents yet</p>}
              {filteredDocs.map(d => (
                <div key={d.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-gray-600 truncate">{d.doc_uuid}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{d.template_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
