const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  const role   = req.user.role;
  const items  = [];

  if (role === 'approver' || role === 'admin') {
    const [pending] = await db.query(
      `SELECT sr.id, gd.doc_uuid, u.full_name AS generator_name, sr.created_at
       FROM signature_requests sr
       JOIN generated_docs gd ON gd.id = sr.doc_id
       JOIN users u ON u.id = gd.generated_by
       WHERE sr.approver_id = ? AND sr.status = 'pending'
       ORDER BY sr.created_at DESC
       LIMIT 5`,
      [userId]
    );
    pending.forEach(r => {
      items.push({
        id:      `sign-${r.id}`,
        type:    'approval',
        text:    `${r.generator_name} requested your signature on ${r.doc_uuid}`,
        time:    r.created_at,
        unread:  true,
        link:    '/approvals',
      });
    });
  }

  const [recent] = await db.query(
    `SELECT al.id, al.action, al.timestamp, gd.doc_uuid
     FROM audit_logs al
     LEFT JOIN generated_docs gd ON gd.id = al.doc_id
     WHERE al.user_id = ?
     ORDER BY al.timestamp DESC
     LIMIT 5`,
    [userId]
  );

  const actionLabels = {
    GENERATE: 'You generated document',
    SIGN:     'Signature action on',
    DELIVER:  'You delivered document',
    VERIFY:   'You verified document',
    PREVIEW:  'You previewed document',
  };

  recent.forEach(r => {
    items.push({
      id:     `audit-${r.id}`,
      type:   'activity',
      text:   `${actionLabels[r.action] || r.action} ${r.doc_uuid || ''}`.trim(),
      time:   r.timestamp,
      unread: false,
      link:   '/audit',
    });
  });

  items.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json(items.slice(0, 8));
};
