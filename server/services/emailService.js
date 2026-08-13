const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

function brand(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#111827;padding:20px 28px;display:flex;align-items:center;gap:12px">
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:8px;display:flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-weight:700;font-size:14px">D</span>
      </div>
      <span style="color:#fff;font-weight:700;font-size:16px">DocuVault</span>
    </div>
    <div style="padding:28px">${body}</div>
    <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center">
      This is an automated message from DocuVault — Internal Document System.<br/>Do not reply to this email.
    </div>
  </div></body></html>`;
}

function h(text) { return `<h2 style="margin:0 0 12px;font-size:18px;color:#111827">${text}</h2>`; }
function p(text) { return `<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6">${text}</p>`; }
function docBadge(uuid) { return `<div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin:12px 0;font-family:monospace;font-size:13px;color:#1d4ed8">${uuid}</div>`; }
function btn(text, url) { return `<a href="${url}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-top:8px">${text}</a>`; }

const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

async function send(to, subject, html) {
  if (!process.env.MAIL_USER || process.env.MAIL_USER === 'your_email@gmail.com') {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: `"DocuVault" <${process.env.MAIL_USER}>`, to, subject, html });
}

async function sendOtpEmail(toEmail, approverName, otp, docUuid) {
  await send(toEmail, `OTP Code for Document ${docUuid}`,
    brand('OTP for Signature',
      h('Your One-Time Password') +
      p(`Hello <strong>${approverName}</strong>, you have been requested to sign document:`) +
      docBadge(docUuid) +
      p('Your 6-digit OTP is:') +
      `<div style="font-size:32px;font-weight:900;letter-spacing:8px;color:#1d4ed8;margin:16px 0">${otp}</div>` +
      p('<strong>This OTP expires in 5 minutes.</strong> Do not share it with anyone.')
    )
  );
}

async function sendDocReadyEmail(toEmail, approverName, docUuid, generatorName) {
  await send(toEmail, `Action Required: Document ${docUuid} needs your signature`,
    brand('Signature Request',
      h('Document Ready for Your Signature') +
      p(`Hello <strong>${approverName}</strong>,`) +
      p(`<strong>${generatorName}</strong> has requested your e-signature on the following document:`) +
      docBadge(docUuid) +
      p('Please log in to DocuVault to review and sign this document.') +
      btn('Review & Sign Document', `${baseUrl}/approvals`)
    )
  );
}

async function sendDocSignedEmail(toEmail, generatorName, docUuid, approverName) {
  await send(toEmail, `Document ${docUuid} has been signed`,
    brand('Document Signed',
      h('✓ Document Signed Successfully') +
      p(`Hello <strong>${generatorName}</strong>,`) +
      p(`Your document has been digitally signed by <strong>${approverName}</strong>.`) +
      docBadge(docUuid) +
      p('You can now deliver this document to the recipient.') +
      btn('View Document', `${baseUrl}/documents`)
    )
  );
}

async function sendDocRejectedEmail(toEmail, generatorName, docUuid, approverName, reason) {
  await send(toEmail, `Document ${docUuid} has been rejected`,
    brand('Document Rejected',
      h('✗ Document Rejected') +
      p(`Hello <strong>${generatorName}</strong>,`) +
      p(`Your document has been rejected by <strong>${approverName}</strong>.`) +
      docBadge(docUuid) +
      `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 14px;margin:12px 0"><strong style="color:#dc2626">Rejection Reason:</strong><br/><span style="color:#374151;font-size:13px">${reason}</span></div>` +
      p('The document has been reverted to Draft status. Please make the necessary corrections and resubmit.') +
      btn('View Document', `${baseUrl}/documents`)
    )
  );
}

async function sendDeliveryEmail(toEmail, recipientName, docUuid, downloadLink, pdfPath) {
  const attachments = pdfPath && require('fs').existsSync(pdfPath)
    ? [{ path: pdfPath, filename: `${docUuid}.pdf` }] : [];
  const html = brand('Document Delivery',
    h('Your Document is Ready') +
    p(`Hello <strong>${recipientName || toEmail}</strong>,`) +
    p('A document has been prepared and delivered to you from DocuVault.') +
    docBadge(docUuid) +
    btn('Download Document', downloadLink) +
    p('<span style="font-size:12px;color:#9ca3af">This download link expires in 7 days.</span>')
  );
  if (!process.env.MAIL_USER || process.env.MAIL_USER === 'your_email@gmail.com') {
    console.log(`[EMAIL STUB] Delivery to: ${toEmail} | Doc: ${docUuid}`);
    return;
  }
  await transporter.sendMail({ from: `"DocuVault" <${process.env.MAIL_USER}>`, to: toEmail, subject: `Your Document ${docUuid} is Ready`, html, attachments });
}

async function sendRejectionEmail(toEmail, generatorName, docUuid, reason) {
  await sendDocRejectedEmail(toEmail, generatorName, docUuid, 'an approver', reason);
}

async function send24hrReminderEmail(toEmail, approverName, docUuid) {
  await send(toEmail, `Reminder: Document ${docUuid} awaiting your signature (24h)`,
    brand('Signature Reminder',
      h('⏰ Reminder: Document Awaiting Signature') +
      p(`Hello <strong>${approverName}</strong>,`) +
      p('This is a reminder that the following document has been waiting for your signature for <strong>24 hours</strong>:') +
      docBadge(docUuid) +
      p('Please review and sign at your earliest convenience.') +
      btn('Review & Sign Now', `${baseUrl}/approvals`)
    )
  );
}

async function send72hrEscalationEmail(toEmail, name, docUuid, role) {
  await send(toEmail, `Escalation: Document ${docUuid} unsigned for 72 hours`,
    brand('Signature Escalation',
      h('🚨 Document Unsigned for 72 Hours') +
      p(`Hello <strong>${name}</strong>,`) +
      p(`The following document has been <strong>unsigned for 72 hours</strong> and requires immediate attention:`) +
      docBadge(docUuid) +
      (role === 'approver'
        ? p('Please sign this document as soon as possible to avoid further escalation.') + btn('Sign Now', `${baseUrl}/approvals`)
        : p('This document was sent for signature 72 hours ago and has not been signed yet.') + btn('View Status', `${baseUrl}/documents`)
      )
    )
  );
}

module.exports = {
  sendOtpEmail,
  sendDocReadyEmail,
  sendDocSignedEmail,
  sendDocRejectedEmail,
  sendDeliveryEmail,
  sendRejectionEmail,
  send24hrReminderEmail,
  send72hrEscalationEmail,
};
