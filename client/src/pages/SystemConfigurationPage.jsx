import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────
function isBoolean(key) {
  return [
    'otp_enabled','approval_required','system_email_enabled','in_app_enabled',
    'public_verification_enabled','qr_verification_enabled','show_document_metadata',
    'log_system_events','log_security_events',
  ].includes(key);
}
function isNumber(key) {
  return key.includes('minutes') || key.includes('attempts') || key.includes('rate_limit') ||
         key.includes('port')    || key.includes('upload_mb') || key.includes('days') ||
         key.includes('length');
}

const SECTIONS = [
  ['document',      'Document Configuration', [['numbering_format','Document ID format'],['default_status','Default status'],['pdf_page_size','PDF page size'],['pdf_orientation','PDF orientation'],['categories','Document categories']]],
  ['security',      'Security',               [['session_timeout_minutes','Session timeout (min)'],['min_password_length','Min password length'],['max_login_attempts','Max login attempts'],['verification_rate_limit','Verify rate limit /hr']], [['otp_enabled','OTP enabled']]],
  ['esignature',    'E-Signature',             [['otp_expiration_minutes','OTP expiration (min)'],['signature_provider','Signature provider']], [['approval_required','Approval required']]],
  ['notifications', 'Notifications',           [['smtp_host','SMTP host'],['smtp_port','SMTP port'],['smtp_from','Sender email']], [['system_email_enabled','System email notifications'],['in_app_enabled','In-app notifications']]],
  ['storage',       'Storage',                 [['storage_driver','Storage driver'],['storage_path','Storage path'],['max_upload_mb','Max upload (MB)'],['allowed_file_types','Allowed file types']]],
  ['verification',  'Verification',            [], [['public_verification_enabled','Public verification'],['qr_verification_enabled','QR verification'],['show_document_metadata','Show doc metadata']]],
  ['audit',         'Audit',                   [['retention_days','Log retention (days)']], [['log_system_events','Log system events'],['log_security_events','Log security events']]],
];

// ── Image upload card ─────────────────────────────────────────────────────────
function ImageUploadCard({ label, hint, currentUrl, onUpload, uploading }) {
  const inputRef = useRef(null);
  const resolvedUrl = currentUrl
    ? (currentUrl.startsWith('http') ? currentUrl : `${API_BASE}/${currentUrl}`)
    : null;

  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[var(--color-border)]
        bg-[var(--color-surface-raised)] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {resolvedUrl
          ? <img src={resolvedUrl} alt={label} className="w-full h-full object-contain p-1"/>
          : <svg className="w-7 h-7 text-[var(--color-text-secondary)]" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
        }
      </div>
      {/* Info + button */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{hint}</p>
        {resolvedUrl && (
          <p className="text-[10px] font-mono text-[var(--color-text-secondary)] mt-1 truncate">
            {currentUrl}
          </p>
        )}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden" onChange={e => onUpload(e.target.files[0])}/>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold
            bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white
            px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
          {uploading
            ? <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Uploading…</>
            : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                {resolvedUrl ? 'Replace Image' : 'Upload Image'}
              </>
          }
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SystemConfigurationPage() {
  const toast = useToast();
  const [config,  setConfig]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [sealUploading, setSealUploading] = useState(false);

  useEffect(() => {
    axiosInstance.get('/settings/system')
      .then(({ data }) => setConfig(data))
      .catch(err => toast.error(err.response?.data?.message || 'Could not load system configuration'))
      .finally(() => setLoading(false));
  }, []);

  const update = (section, key, value) =>
    setConfig(c => ({ ...c, [section]: { ...c[section], [key]: value } }));

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put('/settings/system', config);
      toast.success('System configuration saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    } finally { setSaving(false); }
  };

  const uploadSeal = async (file) => {
    if (!file) return;
    setSealUploading(true);
    try {
      const fd = new FormData();
      fd.append('seal', file);
      const { data } = await axiosInstance.post('/settings/seal', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setConfig(c => ({ ...c, institution: { ...c.institution, seal_url: data.seal_url } }));
      toast.success('Company seal uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seal upload failed');
    } finally { setSealUploading(false); }
  };

  if (loading) return (
    <div className="flex items-center gap-3 text-[var(--color-text-secondary)] text-sm py-12">
      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading system configuration…
    </div>
  );

  return (
    <form onSubmit={save} className="max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          System Configuration
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Platform-wide controls for the DocuVault institution, workflows, and infrastructure.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium
          text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          Super Admin only — changes apply to the entire platform
        </div>
      </div>

      {/* ── Institution & Branding ────────────────────────────────────────── */}
      <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#3b5bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
              Institution &amp; Branding
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Organization identity — appears on every generated PDF
            </p>
          </div>
        </div>
        <div className="p-6 space-y-6">

          {/* Text fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['university_name',      'Organization / University Name'],
              ['institute_department', 'Department / Institute'],
              ['address',             'Address'],
              ['contact_email',       'Contact Email'],
              ['contact_phone',       'Contact Phone'],
            ].map(([key, label]) => (
              <label key={key}
                className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                {label}
                <input
                  type="text"
                  value={config.institution?.[key] ?? ''}
                  onChange={e => update('institution', key, e.target.value)}
                  className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-xl
                    border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[var(--color-text-primary)]
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                    transition font-normal"
                />
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)]"/>

          {/* Image uploads */}
          <div>
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
              Branding Images
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Company Seal */}
              <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)]
                rounded-2xl p-4">
                <ImageUploadCard
                  label="Official Company Seal"
                  hint="PNG with transparent background recommended. Embedded in every signed PDF."
                  currentUrl={config.institution?.seal_url}
                  onUpload={uploadSeal}
                  uploading={sealUploading}
                />
              </div>

              {/* Letterhead Logo — stored as logo_url text field */}
              <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)]
                rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Letterhead Logo URL
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Public URL or relative path to the logo shown in the PDF header.
                </p>
                <input
                  type="text"
                  value={config.institution?.logo_url ?? ''}
                  onChange={e => update('institution', 'logo_url', e.target.value)}
                  placeholder="https://... or /uploads/logo.png"
                  className="w-full h-10 px-3.5 text-sm rounded-xl
                    border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[var(--color-text-primary)]
                    placeholder-[var(--color-text-secondary)]
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                    transition"
                />
              </div>
            </div>
          </div>

          {/* Placeholder reference */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-[#3b5bdb] uppercase tracking-wide mb-3">
              Available in templates
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                '{{system.company_name}}',
                '{{system.department}}',
                '{{system.address}}',
                '{{system.contact_email}}',
                '{{system.contact_phone}}',
                '{{system.company_seal}}',
                '{{system.logo_url}}',
              ].map(tag => (
                <code key={tag}
                  className="text-[11px] font-mono bg-white border border-indigo-200
                    text-[#3b5bdb] px-2.5 py-1 rounded-lg">
                  {tag}
                </code>
              ))}
            </div>
            <p className="text-[11px] text-[#3b5bdb]/70 mt-2">
              These are auto-injected into every PDF — no need to set them manually in each template.
            </p>
          </div>
        </div>
      </section>

      {/* ── Other sections ────────────────────────────────────────────────── */}
      {SECTIONS.map(([section, title, fields = [], toggles = []]) => (
        <section key={section}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-4">
            {fields.map(([key, label]) => (
              <label key={key}
                className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                {label}
                <input
                  type={isNumber(key) ? 'number' : 'text'}
                  value={config[section]?.[key] ?? ''}
                  onChange={e => update(section, key,
                    isNumber(key) ? Number(e.target.value) : e.target.value)}
                  className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-xl
                    border border-[var(--color-border)]
                    bg-[var(--color-bg)] text-[var(--color-text-primary)]
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                    transition font-normal"
                />
              </label>
            ))}
            {toggles.map(([key, label]) => (
              <label key={key}
                className="flex items-center gap-3 cursor-pointer sm:col-span-1">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer"
                    checked={!!config[section]?.[key]}
                    onChange={e => update(section, key, e.target.checked)}/>
                  <div className="w-10 h-5 bg-[var(--color-border)] rounded-full peer
                    peer-checked:bg-[#3b5bdb] transition-colors"/>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                    peer-checked:translate-x-5 transition-transform"/>
                </div>
                <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <button disabled={saving} type="submit"
          className="flex items-center gap-2 bg-[#3b5bdb] hover:bg-[#2f4ac4] text-white
            text-sm font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors
            shadow-sm shadow-indigo-200">
          {saving
            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Saving…</>
            : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 13l4 4L19 7"/>
                </svg>Save System Configuration</>
          }
        </button>
      </div>
    </form>
  );
}
