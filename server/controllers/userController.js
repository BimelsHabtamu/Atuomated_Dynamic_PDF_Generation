const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const fs     = require('fs');
const path   = require('path');

exports.getMySettings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, avatar_url, signature_url, role, department,
              language, theme, notification_email, session_timeout_minutes
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load account settings', error: err.message });
  }
};

exports.updateMySettings = async (req, res) => {
  const { full_name, email, phone, language, theme, notification_email, session_timeout_minutes } = req.body;
  if (!full_name || !email) return res.status(400).json({ message: 'Name and email are required' });
  const timeout = Number(session_timeout_minutes);
  if (!Number.isInteger(timeout) || timeout < 5 || timeout > 1440) {
    return res.status(400).json({ message: 'Session timeout must be between 5 and 1440 minutes' });
  }
  if (!['en', 'am'].includes(language) || !['system', 'light', 'dark'].includes(theme)) {
    return res.status(400).json({ message: 'Invalid language or theme preference' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, req.user.id]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already exists' });
    await db.query(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, language = ?, theme = ?,
       notification_email = ?, session_timeout_minutes = ? WHERE id = ?`,
      [full_name, email, phone || null, language, theme, notification_email ? 1 : 0, timeout, req.user.id]
    );
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, avatar_url, role, department, language, theme, notification_email, session_timeout_minutes FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save account settings', error: err.message });
  }
};

exports.updateMyAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Profile photo is required' });
  try {
    const avatarUrl = `/uploads/${req.file.filename}`;
    await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save profile photo', error: err.message });
  }
};

// ── POST /users/me/signature — upload personal signature image ───────────────
exports.uploadSignature = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Signature image is required' });
  try {
    // Delete old signature file if it exists
    const [rows] = await db.query('SELECT signature_url FROM users WHERE id = ?', [req.user.id]);
    const old = rows[0]?.signature_url;
    if (old) {
      const oldPath = path.join(__dirname, '..', 'storage', 'uploads', path.basename(old));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const signatureUrl = `/uploads/${req.file.filename}`;
    await db.query('UPDATE users SET signature_url = ? WHERE id = ?', [signatureUrl, req.user.id]);
    res.json({ signature_url: signatureUrl });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save signature image', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, phone, role, department, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Returns only approvers (and admins who can approve) — accessible by all authenticated roles
exports.getApprovers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE role IN ('approver', 'super_admin', 'system_admin') AND is_active = 1
       ORDER BY full_name ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.createUser = async (req, res) => {
  const { full_name, email, password, role, department } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'full_name, email, password, role are required' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hash, role, department || null]
    );
    res.status(201).json({ message: 'User created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { full_name, phone, department, is_active } = req.body;
  try {
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, department = ?, is_active = ? WHERE id = ?',
      [full_name, phone || null, department || null, is_active, req.params.id]
    );
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changeRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ['super_admin', 'system_admin', 'generator', 'approver', 'recipient'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Both current and new password are required' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
