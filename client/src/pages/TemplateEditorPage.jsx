import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useForm } from 'react-hook-form';
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  TableCellsIcon,
  PhotoIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['HR', 'Finance', 'Academic', 'Procurement', 'General'];
const WATERMARKS = ['', 'DRAFT', 'CONFIDENTIAL', 'FINAL'];

// ── Static field groups (shown when DB schema not yet loaded) ─────────────────
const STATIC_FIELDS = {
  '👤 Employee': [
    { label: 'Full Name',    tag: '{{employee.full_name}}' },
    { label: 'Position',     tag: '{{employee.position}}' },
    { label: 'Department',   tag: '{{employee.department}}' },
    { label: 'Email',        tag: '{{employee.email}}' },
    { label: 'Phone',        tag: '{{employee.phone}}' },
    { label: 'Employee ID',  tag: '{{employee.id}}' },
    { label: 'Join Date',    tag: '{{employee.join_date}}' },
  ],
  '💰 Finance': [
    { label: 'Salary',       tag: '{{finance.salary}}' },
    { label: 'Currency',     tag: '{{finance.currency}}' },
    { label: 'Pay Date',     tag: '{{finance.pay_date}}' },
    { label: 'Bank Name',    tag: '{{finance.bank_name}}' },
    { label: 'Account No.',  tag: '{{finance.account_number}}' },
  ],
  '🏢 System / Org': [
    { label: 'Company Name',   tag: '{{system.company_name}}' },
    { label: 'Department',     tag: '{{system.department}}' },
    { label: 'Address',        tag: '{{system.address}}' },
    { label: 'Contact Email',  tag: '{{system.contact_email}}' },
    { label: 'Contact Phone',  tag: '{{system.contact_phone}}' },
    { label: 'Company Seal',   tag: '{{system.company_seal}}' },
    { label: 'Logo URL',       tag: '{{system.logo_url}}' },
  ],
  '✍️ Approver': [
    { label: 'Full Name',       tag: '{{approver.full_name}}' },
    { label: 'Role / Title',    tag: '{{approver.role}}' },
    { label: 'Department',      tag: '{{approver.department}}' },
    { label: 'Signature Image', tag: '{{approver.signature_image}}' },
  ],
  '📅 Dates': [
    { label: 'Generation Date',    tag: '{{generation_date}}' },
    { label: 'Generation Time',    tag: '{{generation_time}}' },
    { label: 'Generation DateTime',tag: '{{generation_datetime}}' },
    { label: 'Effective Date',     tag: '{{effective_date}}' },
    { label: 'Year',               tag: '{{generation_year}}' },
    { label: 'Month',              tag: '{{generation_month}}' },
  ],
  '🔀 Logic Blocks': [
    { label: '{{#if}} block',      tag: '{{#if condition}}\nContent shown when true\n{{/if}}' },
    { label: '{{#if}} with else',  tag: '{{#if condition}}\nTrue content\n{{else}}\nFalse content\n{{/if}}' },
    { label: '{{#each}} loop',     tag: '{{#each items}}\n{{this.field_name}}\n{{/each}}' },
  ],
};

// ── Sample data for live preview ──────────────────────────────────────────────
const SAMPLE = {
  'employee.full_name': '',
  'employee.position':  'HR Manager',
  'employee.department':'Human Resources',
  'employee.email':     'sara@company.com',
  'employee.phone':     '+251 912 345 678',
  'employee.id':        'EMP-0042',
  'employee.join_date': '01 Jan 2022',
  'finance.salary':     'ETB 45,000',
  'finance.currency':   'ETB',
  'finance.pay_date':   '30 Aug 2026',
  'finance.bank_name':  'Commercial Bank of Ethiopia',
  'finance.account_number': '1000123456789',
  'system.company_name':   'Kombolcha Institute of Technology',
  'system.department':     'Human Resources',
  'system.address':        'Kombolcha, Amhara, Ethiopia',
  'system.contact_email':  'hr@kit.edu.et',
  'system.contact_phone':  '+251 331 234 567',
  'approver.full_name':    'Dr. Abebe Tadesse',
  'approver.role':         'Finance Director',
  'approver.department':   'Finance Office',
  generation_date:     new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
  generation_time:     new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
  generation_datetime: new Date().toLocaleString('en-US'),
  generation_year:     String(new Date().getFullYear()),
  generation_month:    new Date().toLocaleDateString('en-US', { month:'long' }),
  effective_date:      new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
};

function renderPreview(html) {
  if (!html) return '';
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  let result = html;

  // Fix relative image src paths (e.g. storage/uploads/logo.png → full URL)
  result = result.replace(
    /src="(?!http|data:)([^"]+)"/g,
    (_, path) => `src="${API}/${path.replace(/^\//, '')}"`
  );

  Object.entries(SAMPLE).forEach(([key, value]) => {
    const escaped = key.replace(/\./g, '\\.');
    result = result.replace(
      new RegExp(`{{${escaped}}}`, 'g'),
      `<mark style="background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:4px;font-weight:600">${value}</mark>`
    );
  });

  result = result.replace(
    /{{#if\s+.+?}}([\s\S]*?){{\/if}}/g,
    '<div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:6px 10px;margin:4px 0;border-radius:0 4px 4px 0">$1</div>'
  );
  result = result.replace(
    /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,
    '<div style="background:#fff7ed;border-left:3px solid #ea580c;padding:6px 10px;margin:4px 0"><em style="font-size:10px;color:#ea580c">LOOP ($1):</em> $2</div>'
  );
  result = result.replace(
    /{{[\w.]+}}/g,
    (match) => `<mark style="background:#fef9c3;color:#854d0e;padding:1px 5px;border-radius:4px">${match}</mark>`
  );

  return result;
}

function ToolBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor, onInsert }) {
  if (!editor) return null;

  const uploadImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axiosInstance.post('/templates/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const imageUrl = response.data.url || response.data.fullUrl || URL.createObjectURL(file);
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: {
            src: imageUrl,
            alt: file.name,
            style: 'width: 320px; height: auto; display: block; margin: 12px auto; border-radius: 12px; max-width: 100%;',
          },
        }).run();
      } catch {
        const imageUrl = URL.createObjectURL(file);
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: {
            src: imageUrl,
            alt: file.name,
            style: 'width: 320px; height: auto; display: block; margin: 12px auto; border-radius: 12px; max-width: 100%;',
          },
        }).run();
      }
    };

    input.click();
  };

  const insertByUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (!url) return;
    editor.chain().focus().insertContent({
      type: 'image',
      attrs: {
        src: url,
        alt: 'Inserted image',
        style: 'width: 320px; height: auto; display: block; margin: 12px auto; border-radius: 12px; max-width: 100%;',
      },
    }).run();
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><BoldIcon className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><ItalicIcon className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span className="text-[11px] font-black underline">U</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><span className="text-[11px] font-black line-through">S</span></ToolBtn>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><span className="text-[10px] font-black">H1</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><span className="text-[10px] font-black">H2</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><span className="text-[10px] font-black">H3</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph"><span className="text-[10px] font-bold">P</span></ToolBtn>

        <div className="mx-1 h-5 w-px bg-slate-200" />
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left align"><span className="text-[11px] font-bold">L</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center align"><span className="text-[11px] font-bold">C</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right align"><span className="text-[11px] font-bold">R</span></ToolBtn>

        <div className="mx-1 h-5 w-px bg-slate-200" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><ListBulletIcon className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list"><span className="text-[10px] font-bold">1.</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><span className="text-[10px] font-bold">❝</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><span className="text-[10px] font-bold">—</span></ToolBtn>
      </div>

      <div className="flex flex-wrap items-center gap-1 px-3 pb-2">
        <button type="button" onClick={uploadImage} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"><PhotoIcon className="h-3.5 w-3.5" />Insert Image</button>
        <button type="button" onClick={insertByUrl} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"><PhotoIcon className="h-3.5 w-3.5" />Image URL</button>
        <div className="mx-1 h-5 w-px bg-slate-200" />
        <ToolBtn onClick={() => onInsert('{{employee.full_name}}')} title="Add employee full name"><span className="text-[9px] font-bold text-blue-600">{'{{name}}'}</span></ToolBtn>
        <ToolBtn onClick={() => onInsert('{{finance.salary}}')} title="Add salary"><span className="text-[9px] font-bold text-emerald-600">{'{{salary}}'}</span></ToolBtn>
        <ToolBtn onClick={() => onInsert('{{generation_date}}')} title="Add generation date"><span className="text-[9px] font-bold text-violet-600">{'{{date}}'}</span></ToolBtn>
      </div>
    </div>
  );
}

const PROSE_CSS = `
.ProseMirror {
  min-height: 100%;
  outline: none;
  padding: 24px;
  font-family: Inter, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.75;
  color: #1a1a1a;
}
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}
.ProseMirror h1 { font-size: 23px; font-weight: 700; margin: 0 0 8px; }
.ProseMirror h2 { font-size: 19px; font-weight: 700; margin: 0 0 6px; }
.ProseMirror h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px; }
.ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 10px 0; }
.ProseMirror blockquote {
  border-left: 3px solid #cbd5e1;
  padding-left: 12px;
  color: #475569;
  margin: 10px 0;
}
.ProseMirror hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
.ProseMirror img {
  max-width: 100%;
  height: auto;
  cursor: pointer;
  border-radius: 12px;
  display: block;
  margin: 12px auto;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
.ProseMirror img.ProseMirror-selectednode {
  outline: 3px solid #3b82f6;
  outline-offset: 4px;
}
`;

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'HR',
      watermark_text: '',
      is_active: true,
    },
  });

  const [section, setSection] = useState('body');
  const [rightTab, setRightTab] = useState('fields');
  const [schema, setSchema] = useState({});
  const [openTables, setOpenTables] = useState({});
  const [fieldSearch, setFieldSearch] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [bodyHtml, setBodyHtml] = useState('');
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');

  const makeExtensions = (placeholder) => [
    StarterKit,
    Placeholder.configure({ placeholder }),
    Underline,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({ resizable: true, inline: false, allowBase64: true }),
  ];

  const bodyEditor = useEditor({
    extensions: makeExtensions('Start writing your document body here…'),
    onUpdate: ({ editor }) => setBodyHtml(editor.getHTML()),
  });

  const headerEditor = useEditor({
    extensions: makeExtensions('Optional header content…'),
    onUpdate: ({ editor }) => setHeaderHtml(editor.getHTML()),
  });

  const footerEditor = useEditor({
    extensions: makeExtensions('Optional footer content…'),
    onUpdate: ({ editor }) => setFooterHtml(editor.getHTML()),
  });

  const editors = { body: bodyEditor, header: headerEditor, footer: footerEditor };
  const activeEditor = editors[section];

  const insertPlaceholder = useCallback((tag) => {
    if (!activeEditor) return;
    activeEditor.chain().focus().insertContent(tag).run();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [activeEditor]);

  useEffect(() => {
    // Open the first 3 static groups by default
    const defaultOpen = Object.keys(STATIC_FIELDS)
      .slice(0, 3)
      .reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setOpenTables(defaultOpen);

    axiosInstance.get('/templates/schema')
      .then((response) => {
        setSchema(response.data || {});
        // Add DB tables to open state without overwriting static defaults
        const firstDbKey = Object.keys(response.data || {})[0];
        if (firstDbKey) {
          setOpenTables(prev => ({ ...prev, [`db_${firstDbKey}`]: true }));
        }
      })
      .catch(() => {});

    if (!isEdit) {
      setLoading(false);
      return;
    }

    axiosInstance.get(`/templates/${id}`)
      .then((response) => {
        const template = response.data;
        setValue('name', template.name || '');
        setValue('description', template.description || '');
        setValue('category', template.category || 'HR');
        setValue('watermark_text', template.watermark_text || '');
        setValue('is_active', Boolean(template.is_active));

        if (template.header_html && headerEditor) {
          headerEditor.commands.setContent(template.header_html);
          setHeaderHtml(template.header_html);
        }
        if (template.body_html && bodyEditor) {
          bodyEditor.commands.setContent(template.body_html);
          setBodyHtml(template.body_html);
        }
        if (template.footer_html && footerEditor) {
          footerEditor.commands.setContent(template.footer_html);
          setFooterHtml(template.footer_html);
        }
        if (template.logo_path) setLogoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${template.logo_path}`);
      })
      .catch(() => toast.error('Failed to load template'))
      .finally(() => setLoading(false));
  }, [bodyEditor, footerEditor, headerEditor, id, isEdit, setValue, toast]);

  const onSubmit = async (data, activate = false) => {
    if (!bodyHtml || bodyHtml === '<p></p>') {
      toast.error('Body content is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...data,
        is_active: activate ? true : data.is_active,
        header_html: headerHtml,
        body_html: bodyHtml,
        footer_html: footerHtml,
      };

      let savedId = id;
      if (isEdit) {
        await axiosInstance.put(`/templates/${id}`, payload);
        toast.success('Template updated');
      } else {
        const response = await axiosInstance.post('/templates', payload);
        savedId = response.data.id;
        toast.success('Template created');
      }

      if (logo && savedId) {
        const formData = new FormData();
        formData.append('logo', logo);
        await axiosInstance.post(`/templates/${savedId}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/templates');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const watchedWatermark = watch('watermark_text');

  // ── Merge static fields with live DB schema ──────────────────────────────
  // Static groups always appear first; DB tables appear below with a "DB:" prefix
  const filteredSchema = Object.entries(schema).reduce((acc, [table, fields]) => {
    const query    = fieldSearch.toLowerCase();
    const filtered = fields.filter(f =>
      f.field.toLowerCase().includes(query) || f.placeholder.toLowerCase().includes(query)
    );
    if (filtered.length) acc[table] = filtered;
    return acc;
  }, {});

  const dbGroups = Object.entries(filteredSchema).map(([table, fields]) => ({
    key:    `db_${table}`,
    label:  `🗄 ${table}`,
    isDb:   true,
    fields: fields.map(f => ({ label: f.field, tag: f.placeholder })),
  }));

  const staticGroups = Object.entries(STATIC_FIELDS).map(([group, fields]) => {
    const q       = fieldSearch.toLowerCase();
    const visible = fields.filter(f =>
      `${group} ${f.label} ${f.tag}`.toLowerCase().includes(q)
    );
    return { key: group, label: group, isDb: false, fields: visible };
  }).filter(g => g.fields.length > 0);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const resolvedLogo = logoPreview
    ? (logoPreview.startsWith('http') || logoPreview.startsWith('data:') || logoPreview.startsWith('blob:')
        ? logoPreview
        : `${API_BASE}/${logoPreview.replace(/^\//, '')}`)
    : '';

  const previewContent = `
    <div style="font-family:Inter,Arial,sans-serif;font-size:12.5px;color:#111;line-height:1.75">
      ${resolvedLogo ? `<img src="${resolvedLogo}" style="max-height:48px;object-fit:contain;margin-bottom:12px" alt="logo"/>` : ''}
      ${headerHtml && headerHtml !== '<p></p>' ? `<div style="border-bottom:2px solid #1d4ed8;padding-bottom:10px;margin-bottom:14px">${renderPreview(headerHtml)}</div>` : ''}
      <div>${renderPreview(bodyHtml)}</div>
      ${footerHtml && footerHtml !== '<p></p>' ? `<div style="border-top:1px solid #e5e7eb;margin-top:16px;padding-top:10px;font-size:11px;color:#6b7280">${renderPreview(footerHtml)}</div>` : ''}
    </div>`;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-slate-50">
      <style>{PROSE_CSS}</style>

      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => navigate('/templates')} className="text-slate-400 transition-colors hover:text-slate-700"><ArrowLeftIcon className="h-5 w-5" /></button>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Template Builder</div>
              <div className="mt-1 truncate text-xl font-bold text-slate-900">{watch('name') || 'New Template'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate('/templates')} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50">{saving ? 'Saving…' : 'Save Draft'}</button>
            <button type="button" disabled={saving} onClick={handleSubmit((data) => onSubmit(data, true))} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:opacity-50"><CheckCircleIcon className="h-4 w-4" />Activate</button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="w-[280px] flex-shrink-0 overflow-hidden border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Dynamic Fields</h2>
              <span className="text-[10px] font-medium text-slate-400">Live</span>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={fieldSearch} onChange={(event) => setFieldSearch(event.target.value)} placeholder="Search fields" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto p-4">
            {[...staticGroups, ...dbGroups].map((group) => (
              <div key={group.key}
                className={`rounded-2xl border ${group.isDb ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/70'}`}>
                <button
                  type="button"
                  onClick={() => setOpenTables(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 truncate">
                      {group.label}
                    </span>
                    {group.isDb && (
                      <span className="text-[9px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        DB
                      </span>
                    )}
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${openTables[group.key] !== false ? 'rotate-180' : ''}`} />
                </button>

                {openTables[group.key] !== false && (
                  <div className="space-y-1.5 p-2">
                    {group.fields.map((field) => (
                      <button
                        key={field.tag}
                        type="button"
                        onClick={() => insertPlaceholder(field.tag)}
                        className={`w-full rounded-xl border text-left shadow-sm transition-all
                          hover:shadow-md active:scale-[0.98]
                          ${field.tag.startsWith('{{#') || field.tag.startsWith('{{/') || field.tag.includes('#each') || field.tag.includes('#if')
                            ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                            : field.tag.startsWith('{{system.')
                            ? 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                            : field.tag.startsWith('{{approver.')
                            ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                            : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50'
                          } px-3 py-2`}
                      >
                        <div className="text-[11px] font-semibold text-slate-700">{field.label}</div>
                        <div className="mt-0.5 break-all font-mono text-[9px] text-slate-400 leading-tight">
                          {field.tag.length > 40 ? field.tag.slice(0, 38) + '…' : field.tag}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* DB schema source indicator */}
            {dbGroups.length > 0 && (
              <div className="flex items-center gap-1.5 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                <span className="text-[10px] text-slate-400">
                  {dbGroups.length} live DB table{dbGroups.length !== 1 ? 's' : ''} loaded
                </span>
              </div>
            )}
            {dbGroups.length === 0 && (
              <div className="flex items-center gap-1.5 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"/>
                <span className="text-[10px] text-slate-400">DB schema not connected</span>
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-100">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Template Name</label>
                <input {...register('name', { required: 'Template name is required' })} placeholder="Employee Salary Slip" className={`h-10 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none ${errors.name ? 'border-red-300' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'}`} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Category</label>
                <select {...register('category')} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  {CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="col-span-4">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Description</label>
                <input {...register('description')} placeholder="Optional summary" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Watermark</label>
                <select {...register('watermark_text')} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  {WATERMARKS.map((option) => <option key={option || 'none'} value={option}>{option || 'None'}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-200 bg-white px-4 py-2">
            {['header', 'body', 'footer'].map((item) => (
              <button key={item} type="button" onClick={() => setSection(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${section === item ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {item === 'header' ? 'Header' : item === 'body' ? 'Body' : 'Footer'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-4">
            <div className="mx-auto max-w-[860px] rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <EditorToolbar editor={activeEditor} onInsert={insertPlaceholder} />
              <div className="min-h-[520px] bg-slate-50/40 p-2">
                {['header', 'body', 'footer'].map((item) => (
                  <div key={item} style={{ display: section === item ? 'block' : 'none' }}>
                    <EditorContent editor={editors[item]} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  Active
                </label>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">{saved ? 'Saved' : 'Auto-save ready'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setRightTab('preview')} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Preview</button>
              </div>
            </div>
          </div>
        </main>

        <aside className="w-[380px] flex-shrink-0 overflow-hidden border-l border-slate-200 bg-white">
          <div className="flex border-b border-slate-200">
            <button type="button" onClick={() => setRightTab('properties')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${rightTab === 'properties' ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              Properties
            </button>
            <button type="button" onClick={() => setRightTab('preview')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${rightTab === 'preview' ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              Preview
            </button>
          </div>

          {rightTab === 'properties' ? (
            <div className="space-y-4 overflow-y-auto p-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Template Logo</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>

                {logoPreview ? (
                  <div className="flex items-center gap-3">
                    <img src={logoPreview} alt="Logo preview" className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain" />
                    <button type="button" onClick={() => { setLogo(null); setLogoPreview(''); }} className="text-xs font-medium text-red-500 hover:text-red-600">Remove</button>
                  </div>
                ) : (
                  <input type="file" accept="image/*" onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    try {
                      const formData = new FormData();
                      formData.append('image', file);
                      const response = await axiosInstance.post('/templates/upload-image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      setLogoPreview(response.data.url || response.data.fullUrl || URL.createObjectURL(file));
                    } catch {
                      setLogoPreview(URL.createObjectURL(file));
                    }
                    setLogo(file);
                  }} className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:font-semibold file:text-slate-700 hover:file:bg-slate-300" />
                )}
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Description</label>
                <textarea {...register('description')} rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Page Settings</span>
                  <span className="text-slate-400">A4</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Size</label>
                    <select defaultValue="A4" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"><option>A4</option><option>A5</option><option>Letter</option></select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Orientation</label>
                    <select defaultValue="Portrait" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"><option>Portrait</option><option>Landscape</option></select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-semibold text-slate-600">Document Layout</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600"><span>Header</span><span className="text-slate-400">Default</span></div>
                  <div className="flex items-center justify-between text-xs text-slate-600"><span>Footer</span><span className="text-slate-400">Default</span></div>
                  <div className="flex items-center justify-between text-xs text-slate-600"><span>Page Number</span><span className="text-slate-400">Enabled</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-[#e8eaf0] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Live Preview
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
                  Sample Data
                </span>
              </div>

              {/* A4 paper */}
              <div className="mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
                style={{ width: '100%', minHeight: '420px', borderRadius: '2px' }}>

                {/* PDF Header bar */}
                <div style={{
                  background: 'linear-gradient(90deg, #1e3a5f 0%, #2f5496 100%)',
                  padding: '8px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>
                    {watch('name') || 'DOCUMENT TITLE'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', fontFamily: 'Inter, sans-serif' }}>
                    {SAMPLE.generation_date}
                  </span>
                </div>

                {/* Document content */}
                <div style={{ padding: '20px 24px', fontFamily: 'Inter, Arial, sans-serif', fontSize: '11px', lineHeight: '1.7', color: '#1a1a1a', minHeight: '340px' }}>
                  {logoPreview && (
                    <img src={logoPreview.startsWith('http') || logoPreview.startsWith('data:') || logoPreview.startsWith('blob:')
                      ? logoPreview
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${logoPreview.replace(/^\//, '')}`}
                      alt="logo"
                      style={{ maxHeight: '44px', maxWidth: '160px', objectFit: 'contain', marginBottom: '10px' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}

                  {headerHtml && headerHtml !== '<p></p>' && (
                    <div style={{ borderBottom: '2px solid #1d4ed8', paddingBottom: '8px', marginBottom: '12px' }}
                      dangerouslySetInnerHTML={{ __html: renderPreview(headerHtml) }}/>
                  )}

                  {bodyHtml && bodyHtml !== '<p></p>'
                    ? <div dangerouslySetInnerHTML={{ __html: renderPreview(bodyHtml) }}/>
                    : <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '10px', textAlign: 'center', padding: '40px 0' }}>
                        Start writing in the Body editor to see the preview here
                      </div>
                  }

                  {footerHtml && footerHtml !== '<p></p>' && (
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '14px', paddingTop: '8px', fontSize: '10px', color: '#6b7280' }}
                      dangerouslySetInnerHTML={{ __html: renderPreview(footerHtml) }}/>
                  )}
                </div>

                {/* PDF Footer bar */}
                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  padding: '6px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f9fafb',
                }}>
                  <span style={{ fontSize: '7px', color: '#9ca3af', fontFamily: 'monospace' }}>
                    DOC-20260820-XXXXX
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '7px', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>
                      Page 1 of 1
                    </span>
                    <div style={{ width: '24px', height: '24px', background: '#e5e7eb', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '6px', color: '#9ca3af' }}>QR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Watermark indicator */}
              {watchedWatermark && (
                <div className="mt-2 text-center text-[10px] text-slate-500">
                  Watermark: <span className="font-bold text-red-500">{watchedWatermark}</span>
                </div>
              )}

              {/* Legend */}
              <div className="mt-3 space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Colour legend</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { color: '#dbeafe', textColor: '#1e40af', label: 'Matched data' },
                    { color: '#fef9c3', textColor: '#854d0e', label: 'Unresolved field' },
                    { color: '#f0fdf4', textColor: '#15803d', label: '{{#if}} block' },
                    { color: '#fff7ed', textColor: '#c2410c', label: '{{#each}} loop' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1">
                      <span style={{ background: l.color, color: l.textColor, fontSize: '8px', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}
