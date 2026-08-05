const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // 2. Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is disabled. Contact admin.' });
    }

    // 3. Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. Sign JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 5. Return token + user info (never return password_hash)
    res.json({
      token,
      user: {
        id:         user.id,
        full_name:  user.full_name,
        email:      user.email,
        role:       user.role,
        department: user.department,
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
