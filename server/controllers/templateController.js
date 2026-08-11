const db = require('../config/db');

const VALID_CATEGORIES = ['HR', 'Finance', 'Academic', 'Procurement', 'General'];

exports.getSchemaFields = async (req, res) => {
  try {
    const [tables] = await db.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );
    const result = {};
    for (const { TABLE_NAME } of tables) {
      const [cols] = await db.query(
        `SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [process.env.DB_NAME, TABLE_NAME]
      );
      result[TABLE_NAME] = cols.map(c => ({
        field:       c.COLUMN_NAME,
        type:        c.DATA_TYPE,
        placeholder: `{{${TABLE_NAME}.${c.COLUMN_NAME}}}`,
      }));
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Schema fetch failed', error: err.message });
  }
};

exports.getTemplates = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM templates ORDER BY created_at DESC');
  res.json(rows);
};

exports.getTemplateById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM templates WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Template not found' });
  const [placeholders] = await db.query(
    'SELECT * FROM template_placeholders WHERE template_id = ?', [req.params.id]
  );
  res.json({ ...rows[0], placeholders });
};

exports.createTemplate = async (req, res) => {
  const { name, description, category, header_html, body_html, footer_html, watermark_text } = req.body;
  if (!name || !category || !body_html) {
    return res.status(400).json({ message: 'name, category, and body_html are required' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }
  const [result] = await db.query(
    `INSERT INTO templates (name, description, category, version, header_html, body_html, footer_html, watermark_text)
     VALUES (?, ?, ?, 1, ?, ?, ?, ?)`,
    [name, description || null, category, header_html || null, body_html, footer_html || null, watermark_text || null]
  );
  res.status(201).json({ message: 'Template created', id: result.insertId });
};

exports.updateTemplate = async (req, res) => {
  const { name, description, category, header_html, body_html, footer_html, watermark_text } = req.body;
  const [existing] = await db.query('SELECT * FROM templates WHERE id = ?', [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: 'Template not found' });
  const newVersion = existing[0].version + 1;
  await db.query(
    `UPDATE templates SET name=?, description=?, category=?, version=?,
     header_html=?, body_html=?, footer_html=?, watermark_text=? WHERE id=?`,
    [name, description || null, category, newVersion,
     header_html || null, body_html, footer_html || null, watermark_text || null, req.params.id]
  );
  res.json({ message: 'Template updated', version: newVersion });
};

exports.setTemplateStatus = async (req, res) => {
  const { is_active } = req.body;
  await db.query('UPDATE templates SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
  res.json({ message: `Template ${is_active ? 'activated' : 'archived'}` });
};

exports.deleteTemplate = async (req, res) => {
  const [existing] = await db.query('SELECT id FROM templates WHERE id = ?', [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: 'Template not found' });
  await db.query('DELETE FROM templates WHERE id = ?', [req.params.id]);
  res.json({ message: 'Template deleted' });
};

exports.uploadLogo = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const relativePath = `uploads/${req.file.filename}`;
  await db.query('UPDATE templates SET logo_path = ? WHERE id = ?', [relativePath, req.params.id]);
  res.json({ message: 'Logo uploaded', path: relativePath, url: `/uploads/${req.file.filename}` });
};
