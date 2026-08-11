import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
//import TextStyle from '@tiptap/extension-text-style';
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
const WATERMARKS  = ['', 'DRAFT', 'CONFIDENTIAL', 'FINAL'];

const SAMPLE = {
  'users.full_name': 'Sara Ahmed',
  'users.email': 'sara@company.com',
  'users.department': 'HR',
  generation_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  effective_date:  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
};

function renderPreview(html) {
  if (!html) return '';
  let r = html;

  Object.entries(SAMPLE).forEach(([k, v]) => {
    const escaped = k.replace(/\./g, '\\.');
    r = r.replace(
      new RegExp(`{{${escaped}}}`, 'g'),
      `<mark style="background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:4px;font-weight:600">${v}</mark>`,
    );
  });

  r = r.replace(
    /{{#if\s+.+?}}([\s\S]*?){{\/if}}/g,
    '<div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:6px 10px;margin:4px 0;border-radius:0 4px 4px 0">$1</div>',
  );

  r = r.replace(
    /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,
    '<div style="background:#fff7ed;border-left:3px solid #ea580c;padding:6px 10px;margin:4px 0"><em style="font-size:10px;color:#ea580c">LOOP ($1):</em> $2</div>',
  );

  r = r.replace(
    /{{[\w.]+}}/g,
    m => `<mark style="background:#fef9c3;color:#854d0e;padding:1px 5px;border-radius:4px">${m}</mark>`,
  );

  return r;
}

function ToolBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded flex items-center justify-center transition-colors
        ${active
          ? 'bg-gray-800 text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor, onInsert }) {
  if (!editor) return null;

  function handleImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        editor.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function handleImageUrl() {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-100">
      <div className="flex items-center gap-0.5 px-3 py-2 flex-wrap">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <BoldIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <ItalicIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="text-xs font-bold underline">U</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <span className="text-xs font-bold line-through">S</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <span className="text-[11px] font-black">H1</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <span className="text-[11px] font-black">H2</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <span className="text-[11px] font-black">H3</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">
          <span className="text-[11px] font-bold">P</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <span className="text-[11px] font-bold">≡L</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <span className="text-[11px] font-bold">≡C</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <span className="text-[11px] font-bold">≡R</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <ListBulletIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <span className="text-[11px] font-bold">1.</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <span className="text-[11px] font-bold">&quot;</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <span className="text-[11px] font-bold">—</span>
        </ToolBtn>
      </div>

      <div className="flex items-center gap-1 px-3 pb-2 flex-wrap">
        <button
          type="button"
          onClick={handleImageUpload}
          title="Upload Image"
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <PhotoIcon className="w-3.5 h-3.5" />
          Upload Image
        </button>
        <button
          type="button"
          onClick={handleImageUrl}
          title="Insert image by URL"
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <PhotoIcon className="w-3.5 h-3.5" />
          Image URL
        </button>

        <div className="w-px h-5 bg-gray-200 mx-0.5" />

        <ToolBtn onClick={() => onInsert('{{#if condition}}\n  content\n{{/if}}')} title="Conditional #if block">
          <span className="text-[10px] font-bold text-emerald-600">#if</span>
        </ToolBtn>
        <ToolBtn onClick={() => onInsert('{{#each items}}\n  {{this.field}}\n{{/each}}')} title="#each loop">
          <span className="text-[10px] font-bold text-orange-500">loop</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-0.5" />

        <ToolBtn onClick={() => onInsert('{{generation_date}}')} title="Generation date placeholder">
          <span className="text-[10px] font-bold text-purple-600">date</span>
        </ToolBtn>
        <ToolBtn onClick={() => onInsert('\n\n__________________________\nAuthorised Signature\n')} title="Signature line">
          <span className="text-[10px] font-bold text-gray-500">sig</span>
        </ToolBtn>
      </div>
    </div>
  );
}

/* ─── ProseMirror CSS ───────────────────────────────────────────────────── */
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
.ProseMirror h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; }
.ProseMirror h2 { font-size: 18px; font-weight: 600; margin: 0 0 6px; }
.ProseMirror h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
.ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
.ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0;
}
.ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
.ProseMirror img {
  max-width: 100%;
  height: auto;
  cursor: pointer;
  border-radius: 4px;
  display: block;
  margin: 8px 0;
}
.ProseMirror img.ProseMirror-selectednode {
  outline: 3px solid #3b82f6;
}
`;

export default function TemplateEditorPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const isEdit   = Boolean(id);

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

  const [section,    setSection]   = useState('body');
  const [rightTab,   setRightTab]  = useState('fields');
  const [schema,     setSchema]    = useState({});
  const [openTables, setOpenTables]= useState({});
  const [fieldSearch,setSearch]    = useState('');
  const [logo,       setLogo]      = useState(null);
  const [logoPreview,setLogoPrev]  = useState('');
  const [saving,     setSaving]    = useState(false);
  const [saved,      setSaved]     = useState(false);
  const [loading,    setLoading]   = useState(isEdit);
  const [bodyHtml,   setBodyHtml]  = useState('');
  const [headerHtml, setHeaderHtml]= useState('');
  const [footerHtml, setFooterHtml]= useState('');

  function makeExtensions(placeholder) {
    return [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ resizable: true, inline: false, allowBase64: true }),
    ];
  }
  const bodyEditor = useEditor({
    extensions: makeExtensions('Start writing your document body here…'),
    onUpdate: ({ editor }) => setBodyHtml(editor.getHTML()),
  });

  const headerEditor = useEditor({
    extensions: makeExtensions('Optional header content (company name, logo area)…'),
    onUpdate: ({ editor }) => setHeaderHtml(editor.getHTML()),
  });

  const footerEditor = useEditor({
    extensions: makeExtensions('Optional footer (date, signature line)…'),
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
    axiosInstance.get('/templates/schema')
      .then(r => {
        setSchema(r.data);
        const first = Object.keys(r.data)[0];
        if (first) setOpenTables({ [first]: true });
      })
      .catch(() => {});

    if (!isEdit) return;

    axiosInstance.get(`/templates/${id}`)
      .then(res => {
        const t = res.data;
        setValue('name',           t.name           || '');
        setValue('description',    t.description    || '');
        setValue('category',       t.category       || 'HR');
        setValue('watermark_text', t.watermark_text || '');
        setValue('is_active',      !!t.is_active);

        if (t.header_html && headerEditor) {
          headerEditor.commands.setContent(t.header_html);
          setHeaderHtml(t.header_html);
        }
        if (t.body_html && bodyEditor) {
          bodyEditor.commands.setContent(t.body_html);
          setBodyHtml(t.body_html);
        }
        if (t.footer_html && footerEditor) {
          footerEditor.commands.setContent(t.footer_html);
          setFooterHtml(t.footer_html);
        }
        if (t.logo_path) setLogoPrev(`http://localhost:5000/${t.logo_path}`);
      })
      .catch(() => toast.error('Failed to load template'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  /* ── submit ── */
  const onSubmit = async (data, activate = false) => {
    if (!bodyHtml || bodyHtml === '<p></p>') {
      toast.error('Body content is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...data,
        is_active:   activate ? true : data.is_active,
        header_html: headerHtml,
        body_html:   bodyHtml,
        footer_html: footerHtml,
      };

      let savedId = id;
      if (isEdit) {
        await axiosInstance.put(`/templates/${id}`, payload);
        toast.success('Saved — new version created');
      } else {
        const r = await axiosInstance.post('/templates', payload);
        savedId  = r.data.id;
        toast.success('Template created');
      }

      if (logo && savedId) {
        const fd = new FormData();
        fd.append('logo', logo);
        await axiosInstance.post(`/templates/${savedId}/logo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/templates');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── filtered schema ── */
  const filteredSchema = Object.entries(schema).reduce((acc, [table, fields]) => {
    const q = fieldSearch.toLowerCase();
    const f = fields.filter(
      fi => fi.field.toLowerCase().includes(q) || fi.placeholder.toLowerCase().includes(q),
    );
    if (f.length) acc[table] = f;
    return acc;
  }, {});

  /* ── derived values ── */
  const watchedWatermark = watch('watermark_text');

  const previewContent = `
    <div style="font-family:Inter,Arial,sans-serif;font-size:12.5px;color:#111;line-height:1.75">
      ${logoPreview ? `<img src="${logoPreview}" style="max-height:48px;object-fit:contain;margin-bottom:12px" alt="logo"/>` : ''}
      ${headerHtml && headerHtml !== '<p></p>'
        ? `<div style="border-bottom:2px solid #1d4ed8;padding-bottom:10px;margin-bottom:14px">${renderPreview(headerHtml)}</div>`
        : ''}
      <div>${renderPreview(bodyHtml)}</div>
      ${footerHtml && footerHtml !== '<p></p>'
        ? `<div style="border-top:1px solid #e5e7eb;margin-top:16px;padding-top:10px;font-size:11px;color:#6b7280">${renderPreview(footerHtml)}</div>`
        : ''}
    </div>`;

  /* ── loading spinner ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  /* ════════════════════════════════ JSX ════════════════════════════════════ */
  return (
    <form
      onSubmit={handleSubmit(d => onSubmit(d, false))}
      className="flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* ── ProseMirror CSS ── */}
      <style>{PROSE_CSS}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 gap-4">
        {/* left: breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-400 hidden sm:inline">Templates</span>
          <span className="text-gray-300 hidden sm:inline">/</span>
          <span className="text-sm font-semibold text-gray-800 truncate">
            {watch('name') || (isEdit ? 'Edit Template' : 'Create Template')}
          </span>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium flex-shrink-0">
              <CheckCircleIcon className="w-3.5 h-3.5" />Saved
            </span>
          )}
        </div>

        {/* right: action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="text-sm text-gray-600 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit(d => onSubmit(d, true))}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-sm shadow-blue-600/20"
          >
            <CheckCircleIcon className="w-4 h-4" />Activate
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2-COLUMN BODY
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ────────────────────────────────────────────────────────────────────
            LEFT — editor panel
        ──────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

          {/* Meta fields */}
          <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-3">
            <div className="grid grid-cols-12 gap-3 items-end">
              {/* name */}
              <div className="col-span-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Template Name *
                </label>
                <input
                  {...register('name', { required: true })}
                  placeholder="e.g. Employee Salary Slip"
                  className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition
                    ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
                />
              </div>

              {/* category */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* description */}
              <div className="col-span-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Description
                </label>
                <input
                  {...register('description')}
                  placeholder="What is this template used for?"
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>

              {/* watermark */}
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Watermark
                </label>
                <select
                  {...register('watermark_text')}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {WATERMARKS.map(w => (
                    <option key={w} value={w}>{w || 'None'}</option>
                  ))}
                </select>
              </div>

              {/* is_active */}
              <div className="col-span-1 flex items-center gap-2 pb-1">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  id="is_active"
                  className="accent-blue-600 rounded"
                />
                <label htmlFor="is_active" className="text-xs text-gray-600 cursor-pointer">Active</label>
              </div>
            </div>
          </div>

          {/* Section tabs (header / body / footer) */}
          <div className="flex-shrink-0 flex bg-white border-b border-gray-100">
            {[['header', 'Header'], ['body', 'Body *'], ['footer', 'Footer']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`px-5 py-3 text-xs font-semibold transition-colors relative
                  ${section === key
                    ? 'text-blue-600 bg-blue-50/30'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
                {section === key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Tiptap toolbar */}
          <EditorToolbar editor={activeEditor} onInsert={insertPlaceholder} />

          {/* Tiptap editor content — three panels, show/hide by section */}
          <div className="flex-1 overflow-y-auto bg-white">
            {['header', 'body', 'footer'].map(s => (
              <div key={s} style={{ display: section === s ? 'block' : 'none' }} className="h-full">
                <EditorContent editor={editors[s]} />
              </div>
            ))}
          </div>

          {/* Logo upload bottom bar */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-2.5 flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logo</span>
            {logoPreview ? (
              <div className="flex items-center gap-2">
                <img src={logoPreview} alt="logo" className="h-7 rounded" />
                <button
                  type="button"
                  onClick={() => { setLogo(null); setLogoPrev(''); }}
                  className="text-[10px] text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setLogo(f); setLogoPrev(URL.createObjectURL(f)); }
                }}
                className="text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium file:text-[11px] hover:file:bg-gray-200"
              />
            )}
            <span className="ml-auto text-[10px] text-gray-400">Tiptap rich-text editor</span>
          </div>
        </div>
        {/* END LEFT */}

        {/* ────────────────────────────────────────────────────────────────────
            RIGHT — fields + preview panel
        ──────────────────────────────────────────────────────────────────── */}
        <div className="w-[380px] flex-shrink-0 flex flex-col overflow-hidden bg-white border-l border-gray-100">

          {/* Tab switcher */}
          <div className="flex-shrink-0 flex border-b border-gray-100">
            {[['fields', 'Fields'], ['preview', 'Preview']].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setRightTab(k)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors relative
                  ${rightTab === k
                    ? 'text-gray-900 bg-white'
                    : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}
              >
                {l}
                {rightTab === k && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />
                )}
              </button>
            ))}
          </div>

          {/* ── FIELDS PANEL ── */}
          {rightTab === 'fields' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* search */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={fieldSearch}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search fields…"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              {/* scrollable field list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Special blocks */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Special Blocks</p>
                  <div className="space-y-1.5">
                    {[
                      {
                        label: 'Conditional (if)',
                        tag:   '{{#if condition}}\n  content\n{{/if}}',
                        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
                      },
                      {
                        label: 'Loop / Repeater (each)',
                        tag:   '{{#each items}}\n  {{this.field}}\n{{/each}}',
                        color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
                      },
                      {
                        label: 'Generation Date',
                        tag:   '{{generation_date}}',
                        color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
                      },
                      {
                        label: 'Effective Date',
                        tag:   '{{effective_date}}',
                        color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                      },
                    ].map(b => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => insertPlaceholder(b.tag)}
                        className={`w-full text-left text-[11px] font-semibold px-3 py-2 rounded-lg border transition-colors ${b.color}`}
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* DB fields accordion */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Database Fields</p>
                  {Object.entries(filteredSchema).map(([table, fields]) => (
                    <div key={table} className="mb-2">
                      {/* accordion header */}
                      <button
                        type="button"
                        onClick={() => setOpenTables(o => ({ ...o, [table]: !o[table] }))}
                        className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="capitalize">{table.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                            {fields.length}
                          </span>
                          <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${openTables[table] ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* accordion body */}
                      {openTables[table] && (
                        <div className="mt-1 space-y-0.5 pl-2">
                          {fields.map(f => (
                            <button
                              key={f.field}
                              type="button"
                              onClick={() => insertPlaceholder(f.placeholder)}
                              className="flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-700 group-hover:text-blue-700 truncate capitalize">
                                  {f.field.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono truncate">{f.placeholder}</p>
                              </div>
                              <span className={[
                                'text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 flex-shrink-0',
                                f.type === 'int' || f.type === 'decimal' || f.type === 'bigint'
                                  ? 'bg-blue-100 text-blue-600'
                                  : f.type.includes('date')
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-gray-100 text-gray-500',
                              ].join(' ')}
                              >
                                {f.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* END FIELDS PANEL */}

          {/* ── PREVIEW PANEL ── */}
          {rightTab === 'preview' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* A4 preview area */}
              <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                <div
                  className="bg-white shadow-md rounded-sm mx-auto relative"
                  style={{ maxWidth: '340px', minHeight: '480px', padding: '24px 28px 60px' }}
                >
                  {/* watermark */}
                  {watchedWatermark && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', pointerEvents: 'none',
                    }}>
                      <span style={{
                        fontSize: '44px', fontWeight: 900, color: '#e5e7eb',
                        transform: 'rotate(-35deg)', userSelect: 'none',
                        opacity: 0.6, letterSpacing: '4px',
                      }}>
                        {watchedWatermark}
                      </span>
                    </div>
                  )}

                  {/* content */}
                  {!bodyHtml || bodyHtml === '<p></p>' ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      minHeight: '380px', textAlign: 'center', color: '#9ca3af',
                    }}>
                      <TableCellsIcon style={{ width: '40px', height: '40px', marginBottom: '10px', opacity: 0.4 }} />
                      <p style={{ fontSize: '13px' }}>Start writing to see preview</p>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                  )}

                  {/* doc footer inside preview card */}
                  <div style={{
                    position: 'absolute', bottom: '8px', left: '20px', right: '20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                  }}>
                    <div style={{ fontSize: '8px', color: '#9ca3af' }}>
                      <div>Doc ID: DOC-PREVIEW-XXXX</div>
                      <div style={{ color: '#93c5fd' }}>docuvault.app/verify</div>
                    </div>
                    <div style={{
                      width: '30px', height: '30px', background: '#f3f4f6',
                      borderRadius: '3px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '8px', color: '#9ca3af',
                    }}>QR</div>
                  </div>
                </div>
              </div>

              {/* preview footer: colour legend + print */}
              <div className="flex-shrink-0 bg-white border-t border-gray-100 p-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    { c: 'bg-blue-200',   l: 'Filled field' },
                    { c: 'bg-yellow-200', l: 'Unfilled field' },
                    { c: 'bg-emerald-200',l: '#if block' },
                    { c: 'bg-orange-200', l: '#each loop' },
                  ].map(x => (
                    <div key={x.l} className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded-sm ${x.c}`} />
                      <span className="text-[10px] text-gray-500">{x.l}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.open();
                    w.document.write(
                      `<!DOCTYPE html><html><head><title>Preview</title></head><body style="padding:40px;font-family:Arial">${previewContent}</body></html>`,
                    );
                    w.document.close();
                    w.print();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 transition-colors"
                >
                  <PhotoIcon className="w-4 h-4" />
                  Print / Download Preview
                </button>
              </div>
            </div>
          )}
          {/* END PREVIEW PANEL */}

        </div>
        {/* END RIGHT */}

      </div>
      {/* END 2-COLUMN BODY */}

    </form>
  );
}
