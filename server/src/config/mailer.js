/**
 * SAHARA — Email Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports two email providers, chosen by environment:
 *
 *   1. Resend (recommended — free 3,000 emails/month, no credit card)
 *      Set RESEND_API_KEY in .env → get free key at https://resend.com
 *
 *   2. SMTP / Gmail (fallback — uses nodemailer)
 *      Set SMTP_USER + SMTP_PASS in .env
 *      For Gmail: use an App Password (not your regular password)
 *      Guide: https://support.google.com/accounts/answer/185833
 *
 * If neither is configured, emails are logged to console (dev mode).
 * Email failures NEVER crash the server.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const nodemailer = require('nodemailer')
const axios      = require('axios')

// ─── Choose provider ──────────────────────────────────────────────────────────
const getProvider = () => {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') return 'resend'
  if (process.env.SMTP_USER && process.env.SMTP_PASS &&
      process.env.SMTP_USER !== 'your_gmail@gmail.com') return 'smtp'
  return 'console'   // dev mode — log emails to console instead of sending
}

// ─── Resend provider ──────────────────────────────────────────────────────────
const sendViaResend = async ({ to, subject, html }) => {
  const res = await axios.post(
    'https://api.resend.com/emails',
    {
      from:    process.env.RESEND_FROM_EMAIL || 'SAHARA <onboarding@resend.dev>',
      to:      [to],
      subject,
      html,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      timeout: 10000,
    }
  )
  console.log(`📧  Email sent via Resend: ${res.data?.id || 'ok'} → ${to}`)
}

// ─── SMTP / nodemailer provider ───────────────────────────────────────────────
let smtpTransporter = null
const getSmtpTransporter = () => {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return smtpTransporter
}

const sendViaSMTP = async ({ to, subject, html }) => {
  const info = await getSmtpTransporter().sendMail({
    from:    process.env.EMAIL_FROM || `SAHARA <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
  console.log(`📧  Email sent via SMTP: ${info.messageId} → ${to}`)
}

// ─── Main sendMail function ───────────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
  const provider = getProvider()
  try {
    if (provider === 'resend') {
      await sendViaResend({ to, subject, html })
    } else if (provider === 'smtp') {
      await sendViaSMTP({ to, subject, html })
    } else {
      // Dev mode: log to console so developers can see email content
      console.log('\n📧  [DEV EMAIL — not sent, no email provider configured]')
      console.log(`   To:      ${to}`)
      console.log(`   Subject: ${subject}`)
      console.log(`   Preview: ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)}…`)
      console.log('   To send real emails: set RESEND_API_KEY in server/.env')
      console.log('   Get a free key at: https://resend.com\n')
    }
  } catch (err) {
    // Swallow email errors — never crash the server because email failed
    console.error(`❌  Email send failed (${provider}): ${err.response?.data?.message || err.message}`)
    if (provider === 'smtp' && err.message?.includes('auth')) {
      console.error('   → SMTP auth failed. For Gmail, use an App Password: https://support.google.com/accounts/answer/185833')
    }
    if (provider === 'resend' && err.response?.status === 401) {
      console.error('   → Resend API key invalid. Check RESEND_API_KEY in server/.env')
    }
  }
}

// ─── HTML Email Templates ────────────────────────────────────────────────────

const BASE_STYLES = `font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafb; color: #292524;`

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="${BASE_STYLES} margin:0; padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb; padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); max-width:600px; width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9,#14b8a6); padding:28px 32px;">
            <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">🌊 SAHARA</h1>
            <p style="margin:4px 0 0; color:rgba(255,255,255,0.8); font-size:13px;">AI-Powered Mental Wellness Platform</p>
          </td>
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="background:#f8fafb; padding:24px 32px; border-top:1px solid #e7e5e4;">
            <p style="margin:0 0 8px; font-size:12px; color:#a8a29e;">
              🆘 <strong>Crisis Support:</strong> iCall <strong>9152987821</strong> | Emergency <strong>112</strong> | Vandrevala Foundation <strong>1860-2662-345</strong>
            </p>
            <p style="margin:0; font-size:11px; color:#d6d3d1;">
              SAHARA is a wellness support tool, not a medical provider.<br>
              © ${new Date().getFullYear()} SAHARA Mental Wellness Platform
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const welcomeEmail = (name) => emailWrapper(`
  <h2 style="margin:0 0 8px; color:#0c4a6e; font-size:22px;">Welcome, ${name}! 👋</h2>
  <p style="color:#57534e; margin:0 0 20px; line-height:1.6;">Your wellness journey on SAHARA begins now. We're glad you're here.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    ${['Clinical Screening (PHQ-9, GAD-7)', 'Private Mood Journal', 'AI Wellness Assistant', 'Professional Care Booking'].map(f =>
      `<tr><td style="padding:6px 0; color:#57534e; font-size:14px;">✅ &nbsp;${f}</td></tr>`
    ).join('')}
  </table>
  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
     style="display:inline-block; background:linear-gradient(135deg,#0ea5e9,#14b8a6); color:#fff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:600; font-size:15px;">
    Go to Dashboard →
  </a>
  <p style="margin:24px 0 0; font-size:13px; color:#a8a29e;">If you didn't create this account, you can safely ignore this email.</p>
`)

const passwordResetEmail = (name, resetLink) => emailWrapper(`
  <h2 style="margin:0 0 8px; color:#0c4a6e; font-size:22px;">Reset your password</h2>
  <p style="color:#57534e; margin:0 0 8px; line-height:1.6;">Hi ${name},</p>
  <p style="color:#57534e; margin:0 0 24px; line-height:1.6;">
    We received a request to reset your SAHARA password. This link expires in <strong>15 minutes</strong>.
  </p>
  <a href="${resetLink}" style="display:inline-block; background:#0ea5e9; color:#fff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:600; font-size:15px;">
    Reset Password →
  </a>
  <p style="margin:24px 0 0; font-size:13px; color:#a8a29e;">If you didn't request this, you can safely ignore this email.</p>
`)

const emailVerificationEmail = (name, verifyLink) => emailWrapper(`
  <h2 style="margin:0 0 8px; color:#0c4a6e; font-size:22px;">Verify your email address ✉️</h2>
  <p style="color:#57534e; margin:0 0 8px; line-height:1.6;">Hi ${name},</p>
  <p style="color:#57534e; margin:0 0 24px; line-height:1.6;">
    Thank you for joining SAHARA! Please verify your email address to enable all features including appointment reminders and professional notifications.
    This link expires in <strong>24 hours</strong>.
  </p>
  <a href="${verifyLink}" style="display:inline-block; background:linear-gradient(135deg,#0ea5e9,#14b8a6); color:#fff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:600; font-size:15px;">
    Verify Email Address →
  </a>
  <p style="margin:16px 0 0; font-size:13px; color:#78716c;">
    Or copy this link into your browser:<br>
    <span style="color:#0ea5e9; word-break:break-all; font-size:12px;">${verifyLink}</span>
  </p>
  <p style="margin:16px 0 0; font-size:13px; color:#a8a29e;">If you didn't create a SAHARA account, you can safely ignore this email.</p>
`)

const appointmentConfirmEmail = (patientName, doctorName, date, time, type) => emailWrapper(`
  <h2 style="margin:0 0 16px; color:#0c4a6e; font-size:22px;">Appointment Confirmed ✅</h2>
  <p style="color:#57534e; margin:0 0 20px;">Hi ${patientName}, your session has been booked successfully.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff; border-radius:12px; padding:20px; margin:0 0 24px;">
    <tr><td style="padding:6px 0; font-size:14px; color:#0369a1;"><strong>Doctor:</strong> &nbsp;${doctorName}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#0369a1;"><strong>Date:</strong> &nbsp;${date}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#0369a1;"><strong>Time:</strong> &nbsp;${time}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#0369a1;"><strong>Type:</strong> &nbsp;${type}</td></tr>
  </table>
  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments"
     style="display:inline-block; background:linear-gradient(135deg,#0ea5e9,#14b8a6); color:#fff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:600; font-size:15px;">
    View Appointments →
  </a>
`)

const appointmentReminderEmail = (patientName, doctorName, date, time) => emailWrapper(`
  <h2 style="margin:0 0 16px; color:#0c4a6e; font-size:22px;">Your appointment is tomorrow 🗓️</h2>
  <p style="color:#57534e; margin:0 0 20px;">Hi ${patientName}, just a friendly reminder about your upcoming session.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa; border-radius:12px; padding:20px; margin:0 0 24px;">
    <tr><td style="padding:6px 0; font-size:14px; color:#0f766e;"><strong>Doctor:</strong> &nbsp;${doctorName}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#0f766e;"><strong>Date:</strong> &nbsp;${date}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#0f766e;"><strong>Time:</strong> &nbsp;${time}</td></tr>
  </table>
  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/appointments"
     style="display:inline-block; background:linear-gradient(135deg,#0ea5e9,#14b8a6); color:#fff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:600; font-size:15px;">
    View Details →
  </a>
`)

const crisisAlertEmail = (patientId, assessmentType, timestamp) => emailWrapper(`
  <h2 style="margin:0 0 8px; color:#b91c1c; font-size:20px;">⚠️ Risk Indicator — Review Required</h2>
  <p style="color:#57534e; margin:0 0 20px; line-height:1.6;">A clinical screening returned a risk indicator that requires professional review.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:20px; margin:0 0 24px;">
    <tr><td style="padding:6px 0; font-size:14px; color:#9a3412;"><strong>Patient ID:</strong> &nbsp;${patientId}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#9a3412;"><strong>Assessment:</strong> &nbsp;${assessmentType}</td></tr>
    <tr><td style="padding:6px 0; font-size:14px; color:#9a3412;"><strong>Timestamp:</strong> &nbsp;${new Date(timestamp).toLocaleString()}</td></tr>
  </table>
  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/doctor/risk"
     style="display:inline-block; background:#dc2626; color:#fff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:600; font-size:15px;">
    Review in Dashboard →
  </a>
`)

module.exports = {
  sendMail,
  welcomeEmail,
  passwordResetEmail,
  emailVerificationEmail,
  appointmentConfirmEmail,
  appointmentReminderEmail,
  crisisAlertEmail,
}
