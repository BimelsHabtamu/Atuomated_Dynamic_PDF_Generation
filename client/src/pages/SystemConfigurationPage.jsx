import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const SECTIONS = [
  ['institution', 'Institution', [['university_name', 'University name'], ['institute_department', 'Institute / department'], ['logo_url', 'Logo URL'], ['address', 'Address'], ['contact_email', 'Contact email'], ['contact_phone', 'Contact phone']]],
  ['document', 'Document Configuration', [['numbering_format', 'Document ID / numbering format'], ['default_status', 'Default document status'], ['pdf_page_size', 'PDF page size'], ['pdf_orientation', 'PDF orientation'], ['categories', 'Document categories']]],
  ['security', 'Security', [['session_timeout_minutes', 'Session timeout (minutes)'], ['min_password_length', 'Minimum password length'], ['max_login_attempts', 'Maximum login attempts'], ['verification_rate_limit', 'Verification rate limit (per hour)']], [['otp_enabled', 'OTP enabled']]],
  ['esignature', 'E-Signature', [['otp_expiration_minutes', 'OTP expiration (minutes)'], ['signature_provider', 'Signature provider']], [['approval_required', 'Approval required before signing']]],
  ['notifications', 'Notifications', [['smtp_host', 'SMTP host'], ['smtp_port', 'SMTP port'], ['smtp_from', 'Sender email']], [['system_email_enabled', 'System email notifications'], ['in_app_enabled', 'In-app notifications']]],
  ['storage', 'Storage', [['storage_driver', 'Storage driver'], ['storage_path', 'Document storage path'], ['max_upload_mb', 'Maximum upload size (MB)'], ['allowed_file_types', 'Allowed file types']]],
  ['verification', 'Verification', [], [['public_verification_enabled', 'Public verification'], ['qr_verification_enabled', 'QR verification'], ['show_document_metadata', 'Show document metadata']]],
  ['audit', 'Audit', [['retention_days', 'Audit log retention (days)']], [['log_system_events', 'Log system events'], ['log_security_events', 'Log security events']]],
];

function isBoolean(key) { return ['otp_enabled', 'approval_required', 'system_email_enabled', 'in_app_enabled', 'public_verification_enabled', 'qr_verification_enabled', 'show_document_metadata', 'log_system_events', 'log_security_events'].includes(key); }
function isNumber(key) { return key.includes('minutes') || key.includes('attempts') || key.includes('rate_limit') || key.includes('port') || key.includes('upload_mb') || key.includes('days') || key.includes('length'); }

export default function SystemConfigurationPage() {
  const toast = useToast();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { axiosInstance.get('/settings/system').then(({ data }) => setConfig(data)).catch(err => toast.error(err.response?.data?.message || 'Could not load system configuration')).finally(() => setLoading(false)); }, []);
  const update = (section, key, value) => setConfig(current => ({ ...current, [section]: { ...current[section], [key]: value } }));
  const save = async e => { e.preventDefault(); setSaving(true); try { await axiosInstance.put('/settings/system', config); toast.success('System configuration saved'); } catch (err) { toast.error(err.response?.data?.message || 'Could not save system configuration'); } finally { setSaving(false); } };
  if (loading) return <div className="text-sm text-gray-500">Loading system configuration...</div>;
  return (
    <form onSubmit={save} className="max-w-5xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">System Configuration</h1><p className="text-sm text-gray-400 mt-0.5">Platform-wide controls for the DocuVault institution, workflows, and infrastructure.</p><div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">Super Admin access: changes apply to the entire platform.</div></div>
      {SECTIONS.map(([section, title, fields, toggles]) => <section key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><h2 className="text-sm font-bold text-gray-800">{title}</h2><div className="grid sm:grid-cols-2 gap-4 mt-4">{[...(fields || []), ...(toggles || [])].map(([key, label]) => isBoolean(key) ? <label key={key} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!config[section]?.[key]} onChange={e => update(section, key, e.target.checked)} />{label}</label> : <label key={key} className="text-sm font-medium text-gray-700">{label}<input type={isNumber(key) ? 'number' : 'text'} value={config[section]?.[key] ?? ''} onChange={e => update(section, key, isNumber(key) ? Number(e.target.value) : e.target.value)} className="mt-1.5 w-full h-10 px-3.5 text-sm rounded-lg border border-gray-300" /></label>)}</div></section>)}
      <button disabled={saving} className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save System Configuration'}</button>
    </form>
  );
}
