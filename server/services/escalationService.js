const db = require('../config/db');
const { send24hrReminderEmail, send72hrEscalationEmail } = require('./emailService');

async function checkEscalations() {
  try {
    const [pending] = await db.query(`
      SELECT sr.id, sr.doc_id, sr.created_at,
             a.email AS approver_email, a.full_name AS approver_name,
             g.email AS generator_email, g.full_name AS generator_name,
             gd.doc_uuid
      FROM signature_requests sr
      JOIN users a  ON a.id  = sr.approver_id
      JOIN generated_docs gd ON gd.id = sr.doc_id
      JOIN users g  ON g.id  = gd.generated_by
      WHERE sr.status = 'pending'
    `);

    const now = Date.now();

    for (const req of pending) {
      const ageHours = (now - new Date(req.created_at).getTime()) / (1000 * 60 * 60);

      if (ageHours >= 72) {
        await send72hrEscalationEmail(req.approver_email,  req.approver_name,  req.doc_uuid, 'approver');
        await send72hrEscalationEmail(req.generator_email, req.generator_name, req.doc_uuid, 'generator');
        console.log(`[Escalation] 72hr escalation sent for ${req.doc_uuid}`);
      } else if (ageHours >= 24 && ageHours < 25) {
        await send24hrReminderEmail(req.approver_email, req.approver_name, req.doc_uuid);
        console.log(`[Escalation] 24hr reminder sent for ${req.doc_uuid}`);
      }
    }
  } catch (err) {
    console.error('[Escalation] Error:', err.message);
  }
}

function startEscalationJob() {
  console.log('[Escalation] Job started — checking every hour');
  checkEscalations();
  setInterval(checkEscalations, 60 * 60 * 1000);
}

module.exports = { startEscalationJob };
