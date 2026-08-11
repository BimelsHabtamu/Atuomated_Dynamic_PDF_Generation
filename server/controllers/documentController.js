const db         = require('../config/db');
const path       = require('path');
const { v4: uuidv4 } = require('uuid');
const { generatePDF } = require('../services/pdfService');

const PDF_DIR = path.join(__dirname, '../storage/pdfs');

exports.previewDocument = async (req, res) => {
  const { template_id, data } = req.body;
  const [rows] = await db.query('SELECT * FROM templates WHERE id = ? AND is_active = 1', [template_id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Template not found or archived' });
  const template = rows[0];
  let preview = template.body_html;
  for (const [key, value] of Object.entries(data || {})) {
    preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  res.json({ html: preview });
};

exports.generateDocument = async (req, res) => {
  const { template_id, record_identifier, data } = req.body;
  const [rows] = await db.query('SELECT * FROM templates WHERE id = ? AND is_active = 1', [template_id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Template not found or archived' });

  const template = rows[0];
  const dateStr  = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const safeName = template.name.replace(/[^a-zA-Z0-9]/g,'_').slice(0,30);
  const docUuid  = `DOC-${dateStr}-${uuidv4().slice(0,6).toUpperCase()}`;
  const fileName = `${safeName}_${record_identifier||'NOREF'}_${dateStr}.pdf`;
  const verifyBase = process.env.CLIENT_URL || 'http://localhost:5174';

  try {
    const { filePath, hash } = await generatePDF(template, data || {}, docUuid, verifyBase, PDF_DIR);
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    const namedPath    = path.join(PDF_DIR, fileName);
    require('fs').renameSync(filePath, namedPath);
    const relativeNamed = path.relative(path.join(__dirname, '..'), namedPath);

    const [result] = await db.query(
      'INSERT INTO generated_docs (doc_uuid, template_id, generated_by, record_identifier, file_path, file_hash, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [docUuid, template_id, req.user.id, record_identifier || null, relativeNamed, hash, 'draft', JSON.stringify(data || {})]
    );

    await db.query(
      'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, result.insertId, 'GENERATE', JSON.stringify({ template_id, record_identifier }), req.ip, req.headers['user-agent']]
    );

    res.status(201).json({ message: 'Document generated', doc_uuid: docUuid, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'PDF generation failed', error: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  const [rows] = await db.query(
    `SELECT gd.*, t.name AS template_name, u.full_name AS generated_by_name
     FROM generated_docs gd
     JOIN templates t ON t.id = gd.template_id
     JOIN users u ON u.id = gd.generated_by
     ORDER BY gd.generated_at DESC`
  );
  res.json(rows);
};

exports.getDocumentById = async (req, res) => {
  const [rows] = await db.query(
    `SELECT gd.*, t.name AS template_name, u.full_name AS generated_by_name
     FROM generated_docs gd
     JOIN templates t ON t.id = gd.template_id
     JOIN users u ON u.id = gd.generated_by
     WHERE gd.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Document not found' });
  res.json(rows[0]);
};

exports.downloadDocument = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM generated_docs WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Document not found' });
  const doc      = rows[0];
  const fullPath = path.join(__dirname, '..', doc.file_path);
  if (!require('fs').existsSync(fullPath)) {
    return res.status(404).json({ message: 'PDF file not found on server' });
  }
  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, doc.id, 'DELIVER', JSON.stringify({ event: 'manual_download' }), req.ip, req.headers['user-agent']]
  );
  res.download(fullPath, `${doc.doc_uuid}.pdf`);
};
