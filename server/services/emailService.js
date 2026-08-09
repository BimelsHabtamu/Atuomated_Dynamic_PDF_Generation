const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendOtpEmail(toEmail, approverName, otp, docUuid) {
  await transporter.sendMail({
    from:    `"PDF Engine" <${process.env.MAIL_USER}>`,
    to:      toEmail,
    subject: `Your OTP for Document ${docUuid}`,
    html:    `<p>Hello ${approverName},</p><p>Your one-time password to approve document <strong>${docUuid}</strong> is:</p><h2>${otp}</h2><p>This OTP expires in 5 minutes. Do not share it.</p>`,
  });
}

async function sendDeliveryEmail(toEmail, recipientName, docUuid, downloadLink, pdfPath) {
  await transporter.sendMail({
    from:        `"PDF Engine" <${process.env.MAIL_USER}>`,
    to:          toEmail,
    subject:     `Your Document ${docUuid} is Ready`,
    html:        `<p>Hello ${recipientName},</p><p>Your document <strong>${docUuid}</strong> is ready.</p><p><a href="${downloadLink}">Click here to download</a> (link expires in 7 days)</p>`,
    attachments: pdfPath ? [{ path: pdfPath }] : [],
  });
}

async function sendRejectionEmail(toEmail, generatorName, docUuid, reason) {
  await transporter.sendMail({
    from:    `"PDF Engine" <${process.env.MAIL_USER}>`,
    to:      toEmail,
    subject: `Document ${docUuid} Rejected`,
    html:    `<p>Hello ${generatorName},</p><p>Document <strong>${docUuid}</strong> has been rejected.</p><p>Reason: ${reason}</p>`,
  });
}

module.exports = { sendOtpEmail, sendDeliveryEmail, sendRejectionEmail };
