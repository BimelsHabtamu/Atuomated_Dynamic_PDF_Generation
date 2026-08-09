const db = require('../config/db');

exports.getTemplates = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM templates ORDER BY created_at DESC');
  res.json(rows);
};

exports.getTemplateById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM templates WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Template not found' });
  const [placeholders] = await db.query('SELECT * FROM template_placeholders WHERE template_id = ?', [req.params.id]);
  res.json({ ...rows[0], placeholders });
};

exports.createTemplate = async (req, res) => {
  const { name, category, header_html, body_html, footer_html, watermark_text } = req.body;
  if (!name || !category || !body_html) {
    return res.status(400).json({ message: 'name, category, and body_html are required' });
  }
  const validCategories = ['HR', 'Finance', 'Academic', 'Procurement', 'General'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }
  const [result] = await db.query(
    'INSERT INTO templates (name, category, version, header_html, body_html, footer_html, watermark_text) VALUES (?, ?, 1, ?, ?, ?, ?)',
    [name, category, header_html || null, body_html, footer_html || null, watermark_text || null]
  );
  res.status(201).json({ message: 'Template created', id: result.insertId });
};

exports.updateTemplate = async (req, res) => {
  const { name, category, header_html, body_html, footer_html, watermark_text } = req.body;
  const [existing] = await db.query('SELECT * FROM templates WHERE id = ?', [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: 'Template not found' });
  const newVersion = existing[0].version + 1;
  await db.query(
    'UPDATE templates SET name = ?, category = ?, version = ?, header_html = ?, body_html = ?, footer_html = ?, watermark_text = ? WHERE id = ?',
    [name, category, newVersion, header_html || null, body_html, footer_html || null, watermark_text || null, req.params.id]
  );
  res.json({ message: 'Template updated', version: newVersion });
};

exports.setTemplateStatus = async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean' && is_active !== 0 && is_active !== 1) {
    return res.status(400).json({ message: 'is_active must be 0 or 1' });
  }
  await db.query('UPDATE templates SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
  res.json({ message: `Template ${is_active ? 'activated' : 'archived'}` });
};

exports.deleteTemplate = async (req, res) => {
  const [existing] = await db.query('SELECT id FROM templates WHERE id = ?', [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: 'Template not found' });
  await db.query('DELETE FROM templates WHERE id = ?', [req.params.id]);
  res.json({ message: 'Template deleted' });
};
