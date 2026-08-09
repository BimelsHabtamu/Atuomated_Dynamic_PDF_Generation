const db                  = require('../config/db');
const fs                  = require('fs');
const path                = require('path');
const { computeSHA256 }   = require('../services/pdfService');

exports.verifyByDocUuid = async (req, res) => {
  const { doc_uuid } = req.params;

  const [rows] = await db.query('SELECT * FROM generated_docs WHERE doc_uuid = ?', [doc_uuid]);
  if (rows.length === 0) return res.status(404).json({ message: 'Document not found' });

  const doc      = rows[0];
  const fullPath = path.join(__dirname, '..', doc.file_path);

  if (!fs.existsSync(fullPath)) {
    return res.status(200).json({
      authentic: false,
      message:   'File not found on server. Hash preserved in DB.',
      stored_hash: doc.file_hash,
      doc_uuid
    });
  }

  const fileBuffer     = fs.readFileSync(fullPath);
  const recomputedHash = computeSHA256(fileBuffer);
  const authentic      = recomputedHash === doc.file_hash;

  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [null, doc.id, 'VERIFY', JSON.stringify({ result: authentic ? 'authentic' : 'tampered', recomputed_hash: recomputedHash }), req.ip, req.headers['user-agent']]
  );

  res.json({
    authentic,
    message:        authentic ? 'Document is Authentic & Untampered' : 'Document is Corrupt or Forged',
    doc_uuid,
    status:         doc.status,
    generated_at:   doc.generated_at,
    stored_hash:    doc.file_hash,
    recomputed_hash: recomputedHash
  });
};

exports.verifyByUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const uploadedBuffer = req.file.buffer;
  const uploadedHash   = computeSHA256(uploadedBuffer);

  const [rows] = await db.query('SELECT * FROM generated_docs WHERE file_hash = ?', [uploadedHash]);

  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [null, rows.length > 0 ? rows[0].id : null, 'VERIFY', JSON.stringify({ method: 'upload', hash: uploadedHash, found: rows.length > 0 }), req.ip, req.headers['user-agent']]
  );

  if (rows.length === 0) {
    return res.json({
      authentic: false,
      message:   'Document is Corrupt or Forged — hash not found in database',
      uploaded_hash: uploadedHash
    });
  }

  const doc = rows[0];
  res.json({
    authentic:    true,
    message:      'Document is Authentic & Untampered',
    doc_uuid:     doc.doc_uuid,
    status:       doc.status,
    generated_at: doc.generated_at,
    uploaded_hash: uploadedHash
  });
};
