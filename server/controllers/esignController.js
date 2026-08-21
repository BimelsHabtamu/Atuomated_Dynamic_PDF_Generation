const db                = require('../config/db');
const bcrypt            = require('bcryptjs');
const crypto            = require('crypto');
const { sendOtpEmail, sendDocReadyEmail, sendDocSignedEmail, sendDocRejectedEmail } = require('../services/emailService');
const { computeHMAC }   = require('../services/pdfService');

// ── FR-021: Generator requests signature from Approver ──────────────────────
exports.requestSignature = async (req, res) => {
  const { doc_id, approver_id } = req.body;

  const [docs] = await db.query('SELECT * FROM generated_docs WHERE id = ?', [doc_id]);
  if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });
  if (docs[0].status !== 'draft') return res.status(400).json({ message: 'Document must be in draft status' });

  // BR-003: Self-approval not allowed
  if (docs[0].generated_by === approver_id) {
    return res.status(403).json({ message: 'Self-approval is not allowed (BR-003)' });
  }

  const [approvers] = await db.query('SELECT * FROM users WHERE id = ? AND role = ?', [approver_id, 'approver']);
  if (approvers.length === 0) return res.status(404).json({ message: 'Approver not found' });

  await db.query('INSERT INTO signature_requests (doc_id, approver_id, status) VALUES (?, ?, ?)', [doc_id, approver_id, 'pending']);
  await db.query('UPDATE generated_docs SET status = ? WHERE id = ?', ['pending', doc_id]);

  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, doc_id, 'SIGN', JSON.stringify({ step: 'requested', approver_id }), req.ip, req.headers['user-agent']]
  );

  const [generatorRows] = await db.query('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
  const generatorName   = generatorRows[0]?.full_name || 'A team member';
  await sendDocReadyEmail(approvers[0].email, approvers[0].full_name, docs[0].doc_uuid, generatorName).catch(() => {});

  res.json({ message: 'Signature request sent' });
};

// ── FR-023: Send OTP to approver ────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  const { request_id } = req.body;

  const [rows] = await db.query(
    `SELECT sr.*, u.email, u.full_name, gd.doc_uuid
     FROM signature_requests sr
     JOIN users u ON u.id = sr.approver_id
     JOIN generated_docs gd ON gd.id = sr.doc_id
     WHERE sr.id = ?`,
    [request_id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Signature request not found' });

  const request = rows[0];
  if (request.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });

  const otp     = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiry  = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Reset otp_verified so a new OTP invalidates any prior verification
  await db.query(
    'UPDATE signature_requests SET otp_code = ?, otp_expiry = ?, otp_attempts = 0, otp_verified = 0 WHERE id = ?',
    [otpHash, expiry, request_id]
  );

  await sendOtpEmail(request.email, request.full_name, otp, request.doc_uuid);

  res.json({ message: 'OTP sent to approver email' });
};

// ── FR-023: Verify OTP — marks otp_verified = 1 in DB ───────────────────────
exports.verifyOtp = async (req, res) => {
  const { request_id, otp } = req.body;

  const [rows] = await db.query('SELECT * FROM signature_requests WHERE id = ?', [request_id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

  const request = rows[0];

  // BR-004: Lock after 3 failed attempts
  if (request.otp_attempts >= 3) {
    return res.status(429).json({ message: 'Too many attempts. Request locked. Please request a new OTP (BR-004)' });
  }

  if (!request.otp_code) {
    return res.status(400).json({ message: 'No OTP has been sent for this request. Request an OTP first.' });
  }

  if (new Date() > new Date(request.otp_expiry)) {
    return res.status(400).json({ message: 'OTP has expired. Request a new OTP.' });
  }

  const valid = await bcrypt.compare(otp, request.otp_code);
  if (!valid) {
    await db.query('UPDATE signature_requests SET otp_attempts = otp_attempts + 1 WHERE id = ?', [request_id]);
    const remaining = 2 - request.otp_attempts;
    return res.status(401).json({ message: `Invalid OTP. ${remaining} attempt(s) remaining.` });
  }

  // ✅ Mark OTP as verified in DB — required before approve is allowed
  await db.query(
    'UPDATE signature_requests SET otp_verified = 1, otp_attempts = 0 WHERE id = ?',
    [request_id]
  );

  res.json({ message: 'OTP verified successfully', request_id });
};

// ── FR-024: Approve document — requires prior OTP verification ───────────────
exports.approveDocument = async (req, res) => {
  const { request_id } = req.body;

  const [rows] = await db.query(
    `SELECT sr.*, gd.doc_uuid, gd.file_hash, gd.id AS doc_id_int,
            u.full_name AS approver_name
     FROM signature_requests sr
     JOIN generated_docs gd ON gd.id = sr.doc_id
     JOIN users u ON u.id = sr.approver_id
     WHERE sr.id = ?`,
    [request_id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

  const request = rows[0];

  if (request.status !== 'pending') {
    return res.status(400).json({ message: 'This request is no longer pending' });
  }

  // ✅ Security gate: OTP must have been verified first
  if (!request.otp_verified) {
    return res.status(403).json({
      message: 'OTP verification is required before approving. Please verify the OTP first.'
    });
  }

  const secret    = process.env.JWT_SECRET;
  const hmac      = computeHMAC(request.file_hash, secret);
  const visualText = `Digitally Approved by ${request.approver_name} on ${new Date().toISOString()}`;

  await db.query(
    'INSERT INTO digital_signatures (doc_id, signer_id, crypto_hmac, visual_signature_text) VALUES (?, ?, ?, ?)',
    [request.doc_id, request.approver_id, hmac, visualText]
  );

  await db.query(
    'UPDATE signature_requests SET status = ?, approved_at = NOW() WHERE id = ?',
    ['approved', request_id]
  );
  await db.query(
    'UPDATE generated_docs SET status = ? WHERE id = ?',
    ['signed', request.doc_id]
  );

  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, request.doc_id, 'SIGN', JSON.stringify({ step: 'approved', hmac }), req.ip, req.headers['user-agent']]
  );

  const [genRows] = await db.query(
    'SELECT email, full_name FROM users WHERE id = (SELECT generated_by FROM generated_docs WHERE id = ?)',
    [request.doc_id]
  );
  if (genRows.length > 0) {
    await sendDocSignedEmail(genRows[0].email, genRows[0].full_name, request.doc_uuid, request.approver_name).catch(() => {});
  }

  res.json({ message: 'Document approved and signed', hmac });
};

// ── FR-025: Reject document ──────────────────────────────────────────────────
exports.rejectDocument = async (req, res) => {
  const { request_id, rejection_reason } = req.body;
  if (!rejection_reason) return res.status(400).json({ message: 'rejection_reason is required' });

  const [rows] = await db.query(
    `SELECT sr.*, gd.id AS doc_id, u.email AS generator_email,
            u.full_name AS generator_name, gd.doc_uuid,
            a.full_name AS approver_name
     FROM signature_requests sr
     JOIN generated_docs gd ON gd.id = sr.doc_id
     JOIN users u ON u.id = gd.generated_by
     JOIN users a ON a.id = sr.approver_id
     WHERE sr.id = ?`,
    [request_id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Request not found' });

  const request = rows[0];

  if (request.status !== 'pending') {
    return res.status(400).json({ message: 'This request is no longer pending' });
  }

  await db.query(
    'UPDATE signature_requests SET status = ?, rejection_reason = ? WHERE id = ?',
    ['rejected', rejection_reason, request_id]
  );
  await db.query('UPDATE generated_docs SET status = ? WHERE id = ?', ['draft', request.doc_id]);

  await sendDocRejectedEmail(
    request.generator_email, request.generator_name,
    request.doc_uuid, request.approver_name, rejection_reason
  ).catch(() => {});

  await db.query(
    'INSERT INTO audit_logs (user_id, doc_id, action, action_details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, request.doc_id, 'SIGN', JSON.stringify({ step: 'rejected', rejection_reason }), req.ip, req.headers['user-agent']]
  );

  res.json({ message: 'Document rejected. Generator has been notified.' });
};

// ── Get pending requests for the logged-in approver ──────────────────────────
exports.getPendingRequests = async (req, res) => {
  const [rows] = await db.query(
    `SELECT sr.*, gd.doc_uuid, gd.status AS doc_status,
            t.name AS template_name, u.full_name AS generator_name
     FROM signature_requests sr
     JOIN generated_docs gd ON gd.id = sr.doc_id
     JOIN templates t ON t.id = gd.template_id
     JOIN users u ON u.id = gd.generated_by
     WHERE sr.approver_id = ? AND sr.status = 'pending'
     ORDER BY sr.id DESC`,
    [req.user.id]
  );
  res.json(rows);
};
