import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useToast }  from '../context/ToastContext';

const CATEGORIES  = ['HR', 'Finance', 'Academic', 'Procurement', 'General'];
const WATERMARKS  = ['', 'DRAFT', 'CONFIDENTIAL', 'FINAL'];

const COMMON_PLACEHOLDERS = [
  { label: 'Employee Name',  tag: '{{employee_name}}' },
  { label: 'Employee ID',    tag: '{{employee_id}}' },
  { label: 'Department',     tag: '{{department}}' },
  { label: 'Salary',         tag: '{{salary}}' },
  { label: 'Company Name',   tag: '{{company_name}}' },
  { label: 'Date',           tag: '{{generation_date}}' },
  { label: 'Student Name',   tag: '{{student_name}}' },
  { label: 'GPA',            tag: '{{gpa}}' },
  { label: 'Supplier Name',  tag: '{{supplier_name}}' },
  { label: 'Amount',         tag: '{{amount}}' },
  { label: 'Recipient',      tag: '{{recipient}}' },
  { label: 'Subject',        tag: '{{subject}}' },
];

function renderPreview(html, sampleData) {
  if (!html) return '';
  let result = html;
  Object.entries(sampleData).forEach(([key, val]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), `<span style="background:#dbeafe;color:#1d4ed8;padding:0 3px;border-radius:3px;font-weight:600">${val}</span>`);
  });
  result = result.replace(/{{(\w+)}}/g, '<span style="background:#fef3c7;color:#92400e;padding:0 3px;border-radius:3px">{{$1}}</span>');
  return result;
}

const SAMPLE_DATA = {
  employee_name: 'Sara Ahmed', employee_id: 'EMP-001', department: 'Finance',
  salary: '5,000 ETB', company_name: 'Acme Corp', generation_date: new Date().toLocaleDateString(),
  student_name: 'Liya Tesfaye', gpa: '3.85', supplier_name: 'TechSupply Ltd',
  amount: '25,000 ETB', recipient: 'All Staff', subject: 'Q3 Update',
};

export default function TemplateEditorPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const isEdit   = Boolean(id);

  const [form, setForm] = useState({
    name: '', category: 'HR', watermark_text: '',
    header_html: '', body_html: '', footer_html: '',
  });
  const [activeTab, setActiveTab]   = useState('body');
  const [showPreview, setPreview]   = useState(true);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(isEdit);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    axiosInstance.get(`/templates/${id}`)
      .then(res => {
        const t = res.data;
        setForm({ name: t.name, category: t.category, watermark_text: t.watermark_text || '', header_html: t.header_html || '', body_html: t.body_html || '', footer_html: t.footer_html || '' });
      })
      .catch(() => toast.error('Failed to load template'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const insertPlaceholder = (tag) => {
    const field = activeTab + '_html';
    const el    = document.querySelector(`textarea[data-field="${field}"]`);
    if (!el) {
      setForm(f => ({ ...f, [field]: (f[field] || '') + tag }));
      return;
    }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const current = form[field] || '';
    const updated = current.slice(0, start) + tag + current.slice(end);
    setForm(f => ({ ...f, [field]: updated }));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
  };

  const handleSave = async () => {
    if (!form.name.trim())      { toast.error('Template name is required'); return; }
    if (!form.body_html.trim()) { toast.error('Body HTML is required');     return; }
    setSaving(true);
    try {
      if (isEdit) { await axiosInstance.put(`/templates/${id}`, form); toast.success('Template updated — new version saved'); }
      else        { await axiosInstance.post('/templates', form);       toast.success('Template created successfully'); }
      navigate('/templates');
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
    );
  }

  const currentField = activeTab + '_html';
  const previewHtml  = `
    <div style="font-family:Arial,sans-serif;color:#111;padding:0">
      ${form.header_html ? `<div style="border-bottom:2px solid #3b82f6;padding-bottom:12px;margin-bottom:16px">${renderPreview(form.header_html, SAMPLE_DATA)}</div>` : ''}
      <div>${renderPreview(form.body_html, SAMPLE_DATA)}</div>
      ${form.footer_html ? `<div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:16px;font-size:12px;color:#888">${renderPreview(form.footer_html, SAMPLE_DATA)}</div>` : ''}
    </div>
  `;

  return (
    <div className="space-y-4 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Template' : 'New Template'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{isEdit ? `Editing — saving creates version v${form.version + 1 || 'next'}` : 'Design your document layout with live preview'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(p => !p)}
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${showPreview ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button onClick={() => navigate('/templates')} className="text-xs font-medium text-gray-600 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-sm shadow-blue-600/20">
            {saving ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{isEdit ? 'Save Changes' : 'Create Template'}</>}
          </button>
        </div>
      </div>

      {/* Meta fields */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Template Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Monthly Payslip"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition ${!form.name.trim() ? 'border-gray-200' : 'border-gray-200'}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Watermark</label>
            <select value={form.watermark_text} onChange={e => setForm(f => ({ ...f, watermark_text: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              {WATERMARKS.map(w => <option key={w} value={w}>{w || 'None'}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`} style={{ minHeight: '480px' }}>

        {/* Editor pane */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Section tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {[['header', 'Header'], ['body', 'Body *'], ['footer', 'Footer']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors relative ${activeTab === key ? 'text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
                {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
              </button>
            ))}
          </div>

          {/* Placeholder toolbar */}
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Insert:</span>
              {COMMON_PLACEHOLDERS.map(ph => (
                <button key={ph.tag} onClick={() => insertPlaceholder(ph.tag)}
                  className="text-[10px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded transition-colors">
                  {ph.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 p-4">
            <textarea
              data-field={currentField}
              value={form[currentField]}
              onChange={e => setForm(f => ({ ...f, [currentField]: e.target.value }))}
              placeholder={
                activeTab === 'header' ? '<h1>{{company_name}}</h1>' :
                activeTab === 'body'   ? '<p>Dear {{employee_name}},</p>\n<p>Your salary for this month is <strong>{{salary}}</strong>.</p>' :
                '<p>Generated on {{generation_date}}</p>'
              }
              className="w-full h-full min-h-[320px] resize-none font-mono text-xs text-gray-700 bg-transparent focus:outline-none leading-relaxed"
            />
          </div>

          {/* Bottom hint */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">HTML supported · Click any placeholder button above to insert</p>
            <span className="text-[10px] text-gray-400">{(form[currentField] || '').length} chars</span>
          </div>
        </div>

        {/* Preview pane */}
        {showPreview && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs font-semibold text-gray-500">Live Preview</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] text-blue-500 font-medium">Updates as you type</span>
              </div>
            </div>

            {/* A4-like preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="bg-white shadow-md rounded-sm mx-auto max-w-[560px] min-h-[700px] p-10 relative">
                {form.watermark_text && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-sm">
                    <span className="text-6xl font-black text-gray-200 opacity-40 rotate-[-35deg] select-none tracking-widest">
                      {form.watermark_text}
                    </span>
                  </div>
                )}
                {!form.body_html && !form.header_html ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Start typing HTML in the editor</p>
                    <p className="text-xs text-gray-300 mt-1">Preview updates live as you write</p>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="text-sm leading-relaxed" />
                )}
                <div className="absolute bottom-4 left-10 right-10 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-gray-400">Doc ID: DOC-PREVIEW-XXXX</div>
                    <div className="text-[9px] text-blue-400 underline">Verify at: docuvault.app/verify</div>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-400">QR</div>
                </div>
              </div>
            </div>

            {/* Sample data note */}
            <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center">
                <span className="text-blue-500 font-medium">Blue</span> = filled placeholders &nbsp;·&nbsp;
                <span className="text-yellow-600 font-medium">Yellow</span> = unfilled placeholders &nbsp;·&nbsp; Using sample data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
