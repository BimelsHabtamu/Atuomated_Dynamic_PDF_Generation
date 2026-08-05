const db     = require('../config/db');
const bcrypt = require('bcryptjs');
async function createAdmin() {
  const hash = await bcrypt.hash('password', 10);  
  await db.query('DELETE FROM users WHERE email = ?', ['admin@test.com']);  
  await db.query(
    'insert into users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Super Admin', 'admin@test.com', hash, 'super_admin']
  );  
  console.log('Admin user created successfully');
  console.log('Email:    admin@test.com');
  console.log('Password: password');
  process.exit(0);
}
createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
