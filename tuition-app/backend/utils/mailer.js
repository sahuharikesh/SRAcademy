const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

// Best-effort — account creation should never fail just because the email
// couldn't be sent (missing/invalid SMTP config, provider hiccup, etc).
exports.sendWelcomeEmail = async ({ to, academyName, email, password }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('⚠️  SMTP not configured — skipping welcome email to', to);
    return;
  }
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Your ${academyName} account is ready`,
      html: `
        <p>Hi,</p>
        <p>Your academy account for <strong>${academyName}</strong> has been created. Here are your login details:</p>
        <ul>
          <li>Login URL: <a href="${loginUrl}">${loginUrl}</a></li>
          <li>Email: <strong>${email}</strong></li>
          <li>Password: <strong>${password}</strong></li>
        </ul>
        <p>Please log in and change your password from Settings.</p>
      `,
    });
  } catch (e) {
    console.error('⚠️  Failed to send welcome email:', e.message);
  }
};
