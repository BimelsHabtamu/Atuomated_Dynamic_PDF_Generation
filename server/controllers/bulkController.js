const path = require('path');
const fs   = require('fs');
const db   = require('../config/db');
const { enqueueBulkJob, getJobProgress } = require('../services/bulkJobService');

// ── POST /api/documents/bulk — start a bulk generation job ──────────────────
exports.startBulkJob = async (req, res) => {
  const { template_id, records } = req.body;

  if (!template_id) return res.status(400).json({ message: 'template_id is required' });
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'records must be a non-empty array' });
  }
  if (records.length > 500) {
    return res.status(400).json({ message: 'Maximum 500 records per bulk job' });
  }

  try {
    const verifyBase = process.env.CLIENT_URL || 'http://localhost:5174';
    const result = await enqueueBulkJob({
      templateId:     template_id,
      records,
      generatedBy:    req.user.id,
      verifyBaseUrl:  verifyBase,
    });

    res.status(202).json({
      message: `Bulk job queued — ${result.total} documents will be generated`,
      job_uuid: result.jobUuid,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── GET /api/documents/bulk/:jobUuid — get real-time progress ────────────────
exports.getBulkJobProgress = async (req, res) => {
  try {
    const progress = await getJobProgress(req.params.jobUuid);
    if (!progress) return res.status(404).json({ message: 'Job not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/documents/bulk/:jobUuid/download — download the zip ─────────────
exports.downloadBulkZip = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM bulk_jobs WHERE job_uuid = ?',
    [req.params.jobUuid]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Job not found' });

  const job = rows[0];

  if (job.status !== 'done') {
    return res.status(400).json({
      message: `Job is not complete yet. Current status: ${job.status}`,
      percent: job.total > 0 ? Math.round(((job.completed + job.failed) / job.total) * 100) : 0,
    });
  }

  if (!job.zip_path) {
    return res.status(404).json({ message: 'Zip file not available' });
  }

  const fullPath = path.join(__dirname, '..', job.zip_path);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: 'Zip file not found on server' });
  }

  res.download(fullPath, `${job.job_uuid}.zip`);
};

// ── GET /api/documents/bulk — list all bulk jobs for this user/admin ─────────
exports.listBulkJobs = async (req, res) => {
  const { role, id: userId } = req.user;
  const isAdmin = role === 'super_admin' || role === 'system_admin';

  const [rows] = await db.query(
    `SELECT bj.job_uuid, bj.status, bj.total, bj.completed, bj.failed,
            bj.created_at, bj.updated_at,
            t.name AS template_name, u.full_name AS created_by_name
     FROM bulk_jobs bj
     JOIN templates t ON t.id = bj.template_id
     JOIN users u ON u.id = bj.created_by
     ${isAdmin ? '' : 'WHERE bj.created_by = ?'}
     ORDER BY bj.created_at DESC
     LIMIT 50`,
    isAdmin ? [] : [userId]
  );

  res.json(rows.map(r => ({
    ...r,
    percent: r.total > 0 ? Math.round(((r.completed + r.failed) / r.total) * 100) : 0,
  })));
};
