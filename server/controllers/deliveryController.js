const db                    = require('../config/db');
const jwt                   = require('jsonwebtoken');
const path                  = require('path');
const { sendDeliveryEmail } = require('../services/emailService');

exports.getDeliveryLogs = async (req, res) => {
  const { recipient_email, email_status, from, to } = req.query;

  let query = `
    SELECT dl.*, gd.doc_uuid, gd.status AS doc_status, t.name AS template_name
    FROM delivery_logs dl
    JOIN generated_docs gd ON gd.id = dl.doc_id
    JOIN templates t ON t.id = gd.template_id
    WHERE 1=1
  `;
  const params = [];

  if (recipient_email) { query += ' AND dl.recipient_email LIKE ?'; params.push(`%${recipient_email}%`); }
  if (email_status)    { query += ' AND dl.email_status = ?';       params.push(email_status); }
  if (from)            { query += ' AND dl.sent_at >= ?';           params.push(from); }
  if (to)              { query += ' AND dl.sent_at <= ?';           params.push(to); }

  query += ' ORDER BY dl.sent_at DESC LIMIT 200';

  const [rows] = await db.query(query, params);
  res.json(rows);
};

exports.deliverDocument = async (req, res) => {
  const { doc_id, recipient_email, recipient_name } = req.body;

  const [docs] = await db.query('SELECT * FROM generated_docs WHERE id = ?', [doc_id]);
  if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });

  const doc = docs[0];
  if (doc.status !== 'signed') {
    return res.status(400).json({ message: 'Only signed documents can be delivered' });
  }

  const tokenPayload  = { doc_id, doc_uuid: doc.doc_uuid, recipient_email };
  const downloadToken = jwt.sign(tokenPayload, process.env.DOWNLOAD_TOKEN_SECRET, { expiresIn: '7d' });
  const tokenExpiry   = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const downloadLink  = `${process.env.CLIENT_URL}/download?token=${downloadToken}`;
  const fullPdfPath   = path.join(__dirname, '..', doc.file_path);

  await db.query(
    'INSERT INTO delivery_logs (doc_id, recipient_email, sent_at, download_token, token_expiry, email_status) VALUES (?, ?, NOW(), ?, ?, ?)',
    [doc_id, recipient_email, downloadToken, tokenExpiry, 'queued']
  );

  const [logRows] = await db.query('SELECT id FROM delivery_logs WHERE download_token = ?', [downloadToken]);
  const logId = logRows[0].id;

  try {
    await sendDeliveryEmail(recipient_email, recipient_name || recipient_email, doc.doc_uuid, downloadLink, fullPdfPath);
    await db.query('UPDATE delivery_logs SET email_status = ? WHERE id = ?', ['sent', logId]);
    await db.query(
      'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, doc_id, 'DELIVER', JSON.stringify({ recipient_email, download_token: downloadToken }), req.ip, req.headers['user-agent']]
    );
    await db.query('UPDATE generated_docs SET status = ? WHERE id = ?', ['delivered', doc_id]);
    res.json({ message: 'Document delivered', download_link: downloadLink });
  } catch (err) {
    await db.query('UPDATE delivery_logs SET email_status = ? WHERE id = ?', ['failed', logId]);
    res.status(500).json({ message: 'Email delivery failed', error: err.message });
  }
};

exports.downloadDocument = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token required' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.DOWNLOAD_TOKEN_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired download token' });
  }

  const [logs] = await db.query('SELECT * FROM delivery_logs WHERE download_token = ?', [token]);
  if (logs.length === 0) return res.status(404).json({ message: 'Token not found' });

  const log = logs[0];
  if (new Date() > new Date(log.token_expiry)) {
    return res.status(401).json({ message: 'Download link has expired' });
  }

  const [docs] = await db.query('SELECT * FROM generated_docs WHERE id = ?', [decoded.doc_id]);
  if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });

  await db.query(
    'UPDATE delivery_logs SET downloaded_at = NOW(), downloaded_ip = ? WHERE id = ?',
    [req.ip, log.id]
  );
  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [null, decoded.doc_id, 'DELIVER', JSON.stringify({ event: 'downloaded', recipient_email: decoded.recipient_email }), req.ip, req.headers['user-agent']]
  );

  const fullPath = path.join(__dirname, '..', docs[0].file_path);
  res.download(fullPath, `${docs[0].doc_uuid}.pdf`);
};
