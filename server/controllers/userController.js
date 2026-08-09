const db     = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, role, department, is_active, created_at FROM users ORDER BY created_at DESC'
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
  const { full_name, department, is_active } = req.body;
  try {
    await db.query(
      'UPDATE users SET full_name = ?, department = ?, is_active = ? WHERE id = ?',
      [full_name, department, is_active, req.params.id]
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
  const validRoles = ['admin', 'generator', 'approver', 'recipient'];
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
