const nodemailer = require('nodemailer');
const emailjs = require('@emailjs/nodejs');

/* ============================================================
   EMAIL PROVIDERS
   ============================================================ */

/* ---------- EmailJS (primary) ---------- */

function isEmailJSConfigured() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY
  );
}

async function sendWithEmailJS({ to, subject, html, text, fromName, replyTo }) {
  return emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    {
      to_email: to,
      subject,
      from_name: fromName || 'Mojinet',
      reply_to: replyTo || process.env.EMAILJS_REPLY_TO || '',
      message_html: html || '',
      message_text:
        text ||
        (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''),
    },
    {
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );
}

/* ---------- Nodemailer (fallback — QQ & Gmail) ---------- */

let qqTransporter = null;
function getQQTransporter() {
  if (qqTransporter) return qqTransporter;
  qqTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: String(process.env.SMTP_SECURE) !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return qqTransporter;
}

let gmailTransporter = null;
function getGmailTransporter() {
  if (gmailTransporter) return gmailTransporter;
  gmailTransporter = nodemailer.createTransport({
    host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.GMAIL_SMTP_PORT) || 465,
    secure: String(process.env.GMAIL_SMTP_SECURE) !== 'false',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  return gmailTransporter;
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatCNY(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '¥0.00';
  return `¥${num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const escapeHtml = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c])
  );

const isUrl = (s) => /^https?:\/\/\S+$/i.test((s || '').trim());

/* ============================================================
   SENDERS
   ============================================================ */

/* Internal (admin notifications) — EmailJS → fallback QQ SMTP */
async function sendEmail({ to, subject, html, text }) {
  if (isEmailJSConfigured()) {
    try {
      return await sendWithEmailJS({
        to,
        subject,
        html,
        text,
        fromName: 'Mojinet',
        replyTo: process.env.SMTP_USER || process.env.GMAIL_USER,
      });
    } catch (err) {
      console.error('❌ EmailJS (admin) failed, falling back to SMTP:', err.message);
    }
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ No email provider configured — admin email skipped');
    return { skipped: true };
  }
  return getQQTransporter().sendMail({
    from: `"Mojinet" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: text || html?.replace(/<[^>]+>/g, ' '),
    html,
  });
}

/* Customer‑facing — EmailJS → fallback Gmail SMTP */
async function sendCustomerEmail({ to, subject, html, text }) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Mojinet Support';

  if (isEmailJSConfigured()) {
    try {
      return await sendWithEmailJS({
        to,
        subject,
        html,
        text,
        fromName,
        replyTo: process.env.GMAIL_USER || process.env.EMAILJS_REPLY_TO,
      });
    } catch (err) {
      console.error('❌ EmailJS (customer) failed, falling back to SMTP:', err.message);
    }
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('⚠️ No email provider configured — customer email skipped');
    return { skipped: true };
  }
  return getGmailTransporter().sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: text || html?.replace(/<[^>]+>/g, ' '),
    html,
  });
}

/* ============================================================
   EMAIL — NEW ORDER (to admin)
   ============================================================ */

async function sendNewOrderNotification({ order, customer, product }) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!to) return { skipped: true };

  const orderId = String(order._id).slice(-6).toUpperCase();
  const amount = formatCNY(order.amount);
  const method = order.paymentMethod === 'wechat' ? 'WeChat Pay' : 'Alipay';
  const adminUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin`;

  let proofRows = '';
  let proofText = '';
  if (order.paymentProof) {
    proofRows = `<tr><td style="padding:8px 0;color:#64748b;">Proof</td><td style="padding:8px 0;text-align:right;color:#4f46e5;">Screenshot attached</td></tr>`;
    proofText = 'Proof: screenshot attached';
  } else if (order.paymentReference) {
    proofRows = `<tr><td style="padding:8px 0;color:#64748b;">Transaction code</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;">****${escapeHtml(order.paymentReference)}</td></tr>`;
    proofText = `Transaction code: ****${order.paymentReference}`;
  } else if (order.paymentRemark) {
    proofRows = `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top;">Payment remark</td><td style="padding:8px 0;text-align:right;color:#0f172a;word-break:break-word;">${escapeHtml(order.paymentRemark)}</td></tr>`;
    proofText = `Payment remark: ${order.paymentRemark}`;
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
        <div style="display:inline-block;background:#eef2ff;color:#4f46e5;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:12px;">NEW ORDER</div>
        <h2 style="margin:0 0 6px;font-size:20px;color:#0f172a;">New payment awaiting verification</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 20px;">A customer just submitted a payment.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;">Order</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0f172a;">#${orderId}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Product</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${escapeHtml(product?.title) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Amount</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;">${amount}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Method</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${method}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Customer</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${escapeHtml(customer?.name) || '—'} &lt;${escapeHtml(customer?.email) || '—'}&gt;</td></tr>
          ${proofRows}
        </table>

        <a href="${adminUrl}" style="display:inline-block;margin-top:22px;background:#4f46e5;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600;font-size:14px;">Review in admin console →</a>
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">Automated message from Mojinet.</p>
      </div>
    </div>
  `;

  const text = [
    `New order #${orderId} awaiting verification`,
    `Product: ${product?.title || '—'}`,
    `Amount: ${amount}`,
    `Method: ${method}`,
    `Customer: ${customer?.name || '—'} <${customer?.email || '—'}>`,
    proofText,
    `Admin: ${adminUrl}`,
  ].filter(Boolean).join('\n');

  return sendEmail({
    to,
    subject: `[Mojinet] New order #${orderId} — ${amount} (${method})`,
    html,
    text,
  });
}

/* ============================================================
   EMAIL — ORDER APPROVED (to customer)
   ============================================================ */

async function sendOrderApprovedEmail({ to, name, order, product, deliveryContent }) {
  const orderId = String(order._id).slice(-6).toUpperCase();
  const amount = formatCNY(order.amount);
  const method = order.paymentMethod === 'wechat' ? 'WeChat Pay' : 'Alipay';
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;
  const guideUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/guide`;

  const durationDays = product?.durationDays ?? null;
  const expiresAt = order.expiresAt ? new Date(order.expiresAt) : null;
  const expiresStr = expiresAt
    ? expiresAt.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const previewIsUrl = isUrl(deliveryContent);
  const previewHtml = deliveryContent
    ? previewIsUrl
      ? `<a href="${escapeHtml(deliveryContent.trim())}" target="_blank" rel="noreferrer" style="color:#4f46e5;font-weight:600;word-break:break-all;text-decoration:none;">${escapeHtml(deliveryContent.trim())}</a>`
      : `<div style="white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;">${escapeHtml(deliveryContent)}</div>`
    : `<span style="color:#94a3b8;font-style:italic;">Available on your dashboard</span>`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="display:inline-block;background:#ecfdf5;color:#059669;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:14px;">
          ✓ ORDER APPROVED
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Your access is ready, ${escapeHtml(name || 'there')} 🎉</h2>
        <p style="color:#475569;font-size:14px;line-height:1.65;margin:0 0 22px;">
          Good news — we've verified your payment and released your access details.
          Open your dashboard to view and copy them any time.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:22px;">
          <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
            <tr><td style="padding:6px 0;color:#64748b;width:110px;">Order</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">#${orderId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Product</td><td style="padding:6px 0;color:#0f172a;">${escapeHtml(product?.title) || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Amount</td><td style="padding:6px 0;color:#0f172a;font-weight:700;">${amount} · ${method}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Duration</td><td style="padding:6px 0;color:#0f172a;">${durationDays ? `${durationDays} days` : '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Expires</td><td style="padding:6px 0;color:#0f172a;">${expiresStr}</td></tr>
          </table>
        </div>

        <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:16px 18px;margin-bottom:22px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#4f46e5;margin-bottom:8px;">
            Your delivery details
          </div>
          ${previewHtml}
        </div>

        <a href="${dashboardUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Open my dashboard →
        </a>

        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;">
          <p style="color:#0f172a;font-size:13.5px;font-weight:600;margin:0 0 8px;">What's next?</p>
          <ol style="color:#64748b;font-size:13.5px;line-height:1.7;margin:0;padding-left:20px;">
            <li>Open your dashboard and copy the delivery details above.</li>
            <li>
              New to the app? Follow our step-by-step
              <a href="${guideUrl}" style="color:#4f46e5;font-weight:600;">installation guide</a>.
            </li>
            <li>Need help? Reply from your dashboard chat — we answer fast.</li>
          </ol>
        </div>

        <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;">
          This is an automated message from Mojinet Support. If you didn't
          place this order, contact us at <a href="mailto:${process.env.GMAIL_USER}" style="color:#4f46e5;">${process.env.GMAIL_USER}</a>.
        </p>
      </div>
    </div>
  `;

  const text = [
    `Your order is approved, ${name || 'there'}!`,
    '',
    `Order: #${orderId}`,
    `Product: ${product?.title || '—'}`,
    `Amount: ${amount} · ${method}`,
    `Duration: ${durationDays ? `${durationDays} days` : '—'}`,
    `Expires: ${expiresStr}`,
    '',
    'Delivery details:',
    deliveryContent || '(available on your dashboard)',
    '',
    `Open your dashboard: ${dashboardUrl}`,
    `Installation guide: ${guideUrl}`,
    '',
    '— Mojinet Support',
  ].join('\n');

  return sendCustomerEmail({
    to,
    subject: `[Mojinet] Your order #${orderId} is approved — access is ready`,
    html,
    text,
  });
}

/* ============================================================
   EMAIL — ORDER REJECTED (to customer)
   ============================================================ */

async function sendOrderRejectedEmail({ to, name, order, product, reason }) {
  const orderId = String(order._id).slice(-6).toUpperCase();
  const amount = formatCNY(order.amount);
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="display:inline-block;background:#fef2f2;color:#dc2626;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:14px;">
          ORDER COULD NOT BE VERIFIED
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;">We couldn't verify your payment</h2>
        <p style="color:#475569;font-size:14px;line-height:1.65;margin:0 0 22px;">
          Hi ${escapeHtml(name || 'there')}, we reviewed your payment for order
          <b>#${orderId}</b> but couldn't confirm it. No charge has been released to us
          — if you did pay, please reply from your dashboard so we can sort it out.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:22px;">
          <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
            <tr><td style="padding:6px 0;color:#64748b;width:110px;">Order</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">#${orderId}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Product</td><td style="padding:6px 0;color:#0f172a;">${escapeHtml(product?.title) || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Amount</td><td style="padding:6px 0;color:#0f172a;font-weight:700;">${amount}</td></tr>
          </table>
        </div>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin-bottom:22px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#b91c1c;margin-bottom:6px;">
            Reason
          </div>
          <div style="color:#0f172a;font-size:14px;line-height:1.6;">
            ${escapeHtml(reason || 'The payment could not be matched to a transaction.')}
          </div>
        </div>

        <p style="color:#475569;font-size:14px;line-height:1.65;margin:0 0 22px;">
          If this was a mistake, open your dashboard and message us directly —
          we'll re‑check as fast as we can.
        </p>

        <a href="${dashboardUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Open my dashboard →
        </a>

        <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;">
          Automated message from Mojinet Support · <a href="mailto:${process.env.GMAIL_USER}" style="color:#4f46e5;">${process.env.GMAIL_USER}</a>
        </p>
      </div>
    </div>
  `;

  const text = [
    `Order #${orderId} could not be verified`,
    '',
    `Hi ${name || 'there'}, we could not verify your payment for:`,
    `Product: ${product?.title || '—'}`,
    `Amount: ${amount}`,
    `Reason: ${reason || 'Payment could not be matched.'}`,
    '',
    `Open your dashboard to message us: ${dashboardUrl}`,
    '',
    '— Mojinet Support',
  ].join('\n');

  return sendCustomerEmail({
    to,
    subject: `[Mojinet] Order #${orderId} could not be verified`,
    html,
    text,
  });
}

/* ============================================================
   EMAIL — PASSWORD RESET (to customer)
   ============================================================ */

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <div style="display:inline-block;background:#eef2ff;color:#4f46e5;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:12px;">
          PASSWORD RESET
        </div>
        <h2 style="margin:0 0 6px;font-size:22px;color:#0f172a;">Reset your password</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
          Hi ${escapeHtml(name) || 'there'}, we received a request to reset the password
          for your Mojinet account. Click the button below to choose a new one.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Reset password →
        </a>
        <p style="color:#64748b;font-size:13px;margin:24px 0 0;">
          This link expires in <b>15 minutes</b>. If you didn't request this, you can
          safely ignore this email.
        </p>
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;padding-top:20px;border-top:1px solid #e2e8f0;">
          If the button doesn't work, copy this link into your browser:<br>
          <span style="word-break:break-all;color:#4f46e5;">${resetUrl}</span>
        </p>
      </div>
    </div>
  `;

  const text = [
    `Reset your Mojinet password`,
    '',
    `Hi ${name || 'there'},`,
    `Click the link below to choose a new password. It expires in 15 minutes.`,
    '',
    resetUrl,
    '',
    `If you didn't request this, ignore this email.`,
  ].join('\n');

  return sendCustomerEmail({
    to,
    subject: '[Mojinet] Reset your password',
    html,
    text,
  });
}

module.exports = {
  sendEmail,
  sendCustomerEmail,
  sendNewOrderNotification,
  sendOrderApprovedEmail,
  sendOrderRejectedEmail,
  sendPasswordResetEmail,
  formatCNY,
};