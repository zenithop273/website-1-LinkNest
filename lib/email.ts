// Email sending via Resend API (no extra npm package — pure fetch)
// Falls back to console.log in dev when RESEND_API_KEY is absent

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function sendVerificationEmail(
  toEmail: string,
  toName: string,
  otp: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  // Dev / no-key fallback — log to console so you can still test
  if (!apiKey) {
    console.log(`[EMAIL DEV] To: ${toEmail}  OTP: ${otp}`)
    return { ok: true }
  }

  const html = buildEmailHtml(toName, otp)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'LinkNest <noreply@linknest.app>',
        to: [toEmail],
        subject: `${otp} is your LinkNest verification code`,
        html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[EMAIL] Resend error:', err)
      return { ok: false, error: 'Failed to send email' }
    }
    return { ok: true }
  } catch (e) {
    console.error('[EMAIL] Network error:', e)
    return { ok: false, error: 'Email service unavailable' }
  }
}

export async function sendPasswordResetEmail(
  toEmail: string, toName: string, otp: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.log(`[EMAIL DEV] Password Reset To: ${toEmail}  OTP: ${otp}`); return { ok: true } }
  const html = buildResetEmailHtml(toName, otp)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'LinkNest <noreply@linknest.app>', to: [toEmail], subject: `${otp} — Reset your LinkNest password`, html }),
    })
    if (!res.ok) return { ok: false, error: 'Failed to send email' }
    return { ok: true }
  } catch { return { ok: false, error: 'Email service unavailable' } }
}

function buildResetEmailHtml(name: string, otp: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;"><tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:20px;border:1px solid #2d2d50;overflow:hidden;max-width:480px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px;text-align:center;">
  <span style="color:#fff;font-size:18px;font-weight:700;">🔐 LinkNest</span>
  <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">Reset Your Password</h1>
</td></tr>
<tr><td style="padding:36px 32px;color:#e2e8f0;">
  <p style="margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
  <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">Use this code to reset your password. Expires in <strong style="color:#fbbf24;">15 minutes</strong>.</p>
  <div style="background:#0f0f1a;border:1px solid #f59e0b;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#f59e0b;font-weight:600;">Reset code</p>
    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#fff;font-family:monospace;">${otp}</p>
  </div>
  <p style="margin:0;font-size:12px;color:#64748b;">If you didn't request this, ignore this email. Your password won't change.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #2d2d50;text-align:center;">
  <p style="margin:0;font-size:11px;color:#475569;">© 2024 LinkNest</p>
</td></tr>
</table></td></tr></table></body></html>`
}

function buildEmailHtml(name: string, otp: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:20px;border:1px solid #2d2d50;overflow:hidden;max-width:480px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 16px;margin-bottom:12px;">
              <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">🔗 LinkNest</span>
            </div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Verify Your Email</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;color:#e2e8f0;">
            <p style="margin:0 0 8px;font-size:15px;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.6;">
              Use the 6-digit code below to verify your LinkNest account. It expires in <strong style="color:#a78bfa;">15 minutes</strong>.
            </p>
            <!-- OTP box -->
            <div style="background:#0f0f1a;border:1px solid #6366f1;border-radius:16px;padding:24px;text-align:center;margin:0 0 28px;">
              <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6366f1;font-weight:600;">Your verification code</p>
              <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#fff;font-family:monospace;">${otp}</p>
            </div>
            <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
              If you didn't create a LinkNest account, you can safely ignore this email. Do not share this code with anyone.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #2d2d50;text-align:center;">
            <p style="margin:0;font-size:11px;color:#475569;">© 2024 LinkNest · Your personal link hub</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
