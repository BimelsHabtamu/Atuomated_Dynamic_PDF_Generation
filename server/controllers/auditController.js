const db = require('../config/db');

exports.getAuditTrail = async (req, res) => {
  const { doc_id } = req.params;
  const [rows] = await db.query(
    `SELECT al.*, u.full_name AS user_name
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     WHERE al.doc_id = ?
     ORDER BY al.timestamp ASC`,
    [doc_id]
  );
  res.json(rows);
};

exports.getDashboard = async (req, res) => {
  const userId = req.user.id;
  const role   = req.user.role;

  const isAdmin     = role === 'super_admin' || role === 'system_admin';
  const isApprover  = role === 'approver';
  const isGenerator = role === 'generator';

  const [[docsToday]] = isAdmin
    ? await db.query(`SELECT COUNT(*) AS count FROM generated_docs WHERE DATE(generated_at) = CURDATE()`)
    : await db.query(`SELECT COUNT(*) AS count FROM generated_docs WHERE DATE(generated_at) = CURDATE() AND generated_by = ?`, [userId]);

  const [[pendingApprovals]] = isAdmin
    ? await db.query(`SELECT COUNT(*) AS count FROM signature_requests WHERE status = 'pending'`)
    : isApprover
      ? await db.query(`SELECT COUNT(*) AS count FROM signature_requests WHERE status = 'pending' AND approver_id = ?`, [userId])
      : [[ { count: null } ]];

  const [[totalDocs]] = (isAdmin || isGenerator)
    ? isAdmin
      ? await db.query(`SELECT COUNT(*) AS count FROM generated_docs`)
      : await db.query(`SELECT COUNT(*) AS count FROM generated_docs WHERE generated_by = ?`, [userId])
    : [[ { count: null } ]];

  const [[activeUsers]] = isAdmin
    ? await db.query(`SELECT COUNT(*) AS count FROM users WHERE is_active = 1`)
    : [[ { count: null } ]];

  const [statusBreakdown] = (isAdmin || isGenerator)
    ? isAdmin
      ? await db.query(`SELECT status, COUNT(*) AS count FROM generated_docs GROUP BY status`)
      : await db.query(`SELECT status, COUNT(*) AS count FROM generated_docs WHERE generated_by = ? GROUP BY status`, [userId])
    : [ [] ];

  const [topTemplates] = (isAdmin || isGenerator)
    ? await db.query(
        `SELECT t.name, t.category, COUNT(gd.id) AS usage_count
         FROM generated_docs gd
         JOIN templates t ON t.id = gd.template_id
         ${isAdmin ? '' : 'WHERE gd.generated_by = ?'}
         GROUP BY t.id, t.name, t.category
         ORDER BY usage_count DESC LIMIT 5`,
        isAdmin ? [] : [userId]
      )
    : [ [] ];

  const [[avgApproval]] = await db.query(
    `SELECT AVG(TIMESTAMPDIFF(MINUTE, sr.created_at, sr.approved_at)) AS avg_minutes
     FROM signature_requests sr
     WHERE sr.status = 'approved' AND sr.approved_at IS NOT NULL
     ${isApprover ? 'AND sr.approver_id = ?' : ''}`,
    isApprover ? [userId] : []
  );

  const [recentActivity] = await db.query(
    `SELECT al.action, al.timestamp, al.ip_address, gd.doc_uuid, u.full_name AS user_name
     FROM audit_logs al
     LEFT JOIN generated_docs gd ON gd.id = al.doc_id
     LEFT JOIN users u ON u.id = al.user_id
     ${isAdmin ? '' : 'WHERE al.user_id = ?'}
     ORDER BY al.timestamp DESC LIMIT 8`,
    isAdmin ? [] : [userId]
  );

  const [deliveryStats] = (isAdmin || isGenerator)
    ? await db.query(`SELECT email_status, COUNT(*) AS count FROM delivery_logs GROUP BY email_status`)
    : [ [] ];

  res.json({
    docs_today:           docsToday.count,
    pending_approvals:    pendingApprovals.count,
    total_docs:           totalDocs.count,
    active_users:         activeUsers.count,
    status_breakdown:     statusBreakdown,
    top_templates:        topTemplates,
    avg_approval_minutes: avgApproval.avg_minutes ? Math.round(avgApproval.avg_minutes) : null,
    recent_activity:      recentActivity,
    delivery_stats:       deliveryStats,
  });
};

exports.searchDocuments = async (req, res) => {
  const { template_id, status, generated_by, from_date, to_date } = req.query;

  let query  = `SELECT gd.*, t.name AS template_name, u.full_name AS generated_by_name
                FROM generated_docs gd
                JOIN templates t ON t.id = gd.template_id
                JOIN users u ON u.id = gd.generated_by
                WHERE 1=1`;
  const params = [];

  if (template_id) { query += ' AND gd.template_id = ?'; params.push(template_id); }
  if (status)      { query += ' AND gd.status = ?';      params.push(status); }
  if (generated_by){ query += ' AND gd.generated_by = ?';params.push(generated_by); }
  if (from_date)   { query += ' AND DATE(gd.generated_at) >= ?'; params.push(from_date); }
  if (to_date)     { query += ' AND DATE(gd.generated_at) <= ?'; params.push(to_date); }

  query += ' ORDER BY gd.generated_at DESC';

  const [rows] = await db.query(query, params);
  res.json(rows);
};

exports.getAllAuditLogs = async (req, res) => {
  const { action, user_id, from_date, to_date } = req.query;

  let query  = `SELECT al.*, u.full_name AS user_name
                FROM audit_logs al
                LEFT JOIN users u ON u.id = al.user_id
                WHERE 1=1`;
  const params = [];

  if (action)    { query += ' AND al.action = ?';            params.push(action); }
  if (user_id)   { query += ' AND al.user_id = ?';           params.push(user_id); }
  if (from_date) { query += ' AND DATE(al.timestamp) >= ?';  params.push(from_date); }
  if (to_date)   { query += ' AND DATE(al.timestamp) <= ?';  params.push(to_date); }

  query += ' ORDER BY al.timestamp DESC LIMIT 500';

  const [rows] = await db.query(query, params);
  res.json(rows);
};

// ── FR-038: CSV export — documents per department / date range ────────────────
exports.exportDocumentsCsv = async (req, res) => {
  const { from_date, to_date, template_id, status, generated_by } = req.query;

  let query = `
    SELECT
      gd.doc_uuid              AS "Document ID",
      t.name                   AS "Template",
      t.category               AS "Category",
      u.full_name              AS "Generated By",
      u.department             AS "Department",
      gd.record_identifier     AS "Record ID",
      gd.status                AS "Status",
      gd.generated_at          AS "Generated At",
      COALESCE(
        (SELECT ds.signature_timestamp
         FROM digital_signatures ds WHERE ds.doc_id = gd.id ORDER BY ds.id DESC LIMIT 1),
        ''
      )                        AS "Signed At",
      COALESCE(
        (SELECT dl.sent_at
         FROM delivery_logs dl WHERE dl.doc_id = gd.id ORDER BY dl.id DESC LIMIT 1),
        ''
      )                        AS "Delivered At"
    FROM generated_docs gd
    JOIN templates t ON t.id = gd.template_id
    JOIN users u ON u.id = gd.generated_by
    WHERE 1=1`;

  const params = [];
  if (template_id)  { query += ' AND gd.template_id = ?';          params.push(template_id); }
  if (status)       { query += ' AND gd.status = ?';               params.push(status); }
  if (generated_by) { query += ' AND gd.generated_by = ?';         params.push(generated_by); }
  if (from_date)    { query += ' AND DATE(gd.generated_at) >= ?';  params.push(from_date); }
  if (to_date)      { query += ' AND DATE(gd.generated_at) <= ?';  params.push(to_date); }

  query += ' ORDER BY gd.generated_at DESC';

  const [rows] = await db.query(query, params);

  if (rows.length === 0) {
    return res.status(404).json({ message: 'No documents found for the given filters' });
  }

  // Build CSV manually — no extra dependency needed
  const headers = Object.keys(rows[0]);
  const escape  = (v) => {
    if (v === null || v === undefined) return '';
    const str = String(v).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
  };

  const csvLines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];

  const csv = csvLines.join('\r\n');
  const now = new Date().toISOString().slice(0, 10);
  const filename = `docuvault-export-${now}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv); // UTF-8 BOM so Excel opens Amharic text correctly
};
