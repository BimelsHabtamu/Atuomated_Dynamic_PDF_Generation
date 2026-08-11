const db     = require('../config/db');
const bcrypt = require('bcryptjs');

const users = [
  { full_name: 'Super Admin',    email: 'superadmin@test.com',   password: 'password', role: 'super_admin'  },
  { full_name: 'System Admin',   email: 'sysadmin@test.com',     password: 'password', role: 'system_admin' },
  { full_name: 'Sara Ahmed',     email: 'generator@test.com',    password: 'password', role: 'generator'    },
  { full_name: 'John Mekonen',   email: 'approver@test.com',     password: 'password', role: 'approver'     },
  { full_name: 'Liya Tesfaye',   email: 'recipient@test.com',    password: 'password', role: 'recipient'    },
];

async function seed() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await db.query('DELETE FROM users WHERE email = ?', [u.email]);
    await db.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [u.full_name, u.email, hash, u.role]
    );
    console.log(`✓ ${u.role.padEnd(12)} → ${u.email}`);
  }
  console.log('\nAll 5 users created. Password for all: password');
  process.exit(0);
}

seed().catch(e => { console.error(e.message); process.exit(1); });
