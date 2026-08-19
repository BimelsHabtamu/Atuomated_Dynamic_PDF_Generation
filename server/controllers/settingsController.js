const db = require('../config/db');

const DEFAULTS = {
  institution: { university_name: '', institute_department: '', logo_url: '', address: '', contact_email: '', contact_phone: '' },
  document: { numbering_format: 'DOC-{YYYY}-{0000}', default_status: 'draft', pdf_page_size: 'A4', pdf_orientation: 'portrait', categories: 'Academic, Finance, HR, General' },
  security: { session_timeout_minutes: 60, min_password_length: 8, max_login_attempts: 5, otp_enabled: true, verification_rate_limit: 60 },
  esignature: { otp_expiration_minutes: 10, approval_required: true, signature_provider: 'internal' },
  notifications: { smtp_host: '', smtp_port: 587, smtp_from: '', system_email_enabled: true, in_app_enabled: true },
  storage: { storage_driver: 'local', storage_path: 'server/storage/pdfs', max_upload_mb: 10, allowed_file_types: 'pdf' },
  verification: { public_verification_enabled: true, qr_verification_enabled: true, show_document_metadata: true },
  audit: { retention_days: 365, log_system_events: true, log_security_events: true },
};

function mergeDefaults(value) {
  const parsed = value ? JSON.parse(value) : {};
  return Object.fromEntries(Object.entries(DEFAULTS).map(([section, fields]) => [section, { ...fields, ...(parsed[section] || {}) }]));
}

exports.getSystemConfiguration = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT config_json FROM system_settings WHERE config_key = ?', ['platform']);
    res.json(mergeDefaults(rows[0]?.config_json));
  } catch (err) {
    res.status(500).json({ message: 'Failed to load system configuration', error: err.message });
  }
};

exports.updateSystemConfiguration = async (req, res) => {
  try {
    const configuration = mergeDefaults(JSON.stringify(req.body));
    await db.query(
      `INSERT INTO system_settings (config_key, config_json, updated_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE config_json = VALUES(config_json), updated_by = VALUES(updated_by)`,
      ['platform', JSON.stringify(configuration), req.user.id]
    );
    res.json({ message: 'System configuration saved', configuration });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save system configuration', error: err.message });
  }
};
