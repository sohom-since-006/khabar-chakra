import 'server-only';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface ContactDispatchParams {
  name: string;
  email: string;
  topic: string;
  subject: string;
  message: string;
  ticketId: string;
}

export async function sendContactDispatchEmail(params: ContactDispatchParams) {
  if (!resend) {
    console.warn('Resend client skipped: RESEND_API_KEY is not defined.');
    return { success: false, reason: 'missing_api_key' };
  }

  // In Resend sandbox mode without verified domain, emails must be sent from onboarding@resend.dev
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Khabar Chakra <onboarding@resend.dev>';
  // Deliver to configured admin email or fallback
  const adminEmail = process.env.ADMIN_INBOX_EMAIL || 'delivered@resend.dev';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Khabar Chakra Dispatch #${params.ticketId}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFDF6; margin: 0; padding: 24px; color: #1C2420;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #C6EBD0; border-radius: 4px; overflow: hidden;">
          <!-- Almanac Folio Header -->
          <div style="background-color: #0B6E3C; padding: 16px 24px; color: #FFFFFF;">
            <div style="font-size: 11px; font-family: monospace; letter-spacing: 1px; opacity: 0.85;">
              KHABAR CHAKRA · খাবার চক্র · ADMIN DISPATCH
            </div>
            <h1 style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">
              Docket #${params.ticketId} · ${params.topic.toUpperCase()}
            </h1>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <div style="background-color: #F0FAF2; border-left: 4px solid #0B6E3C; padding: 12px 16px; margin-bottom: 20px;">
              <span style="font-size: 12px; font-family: monospace; color: #07502A; display: block; font-weight: bold;">
                TOPIC: ${params.topic.replace('_', ' ').toUpperCase()}
              </span>
              <span style="font-size: 14px; color: #1C2420; font-weight: 600;">
                ${params.subject}
              </span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #617369; width: 120px; font-family: monospace;">Sender:</td>
                <td style="padding: 6px 0; font-weight: 600;">${params.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #617369; font-family: monospace;">Email:</td>
                <td style="padding: 6px 0; font-family: monospace;">${params.email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #617369; font-family: monospace;">Logged At:</td>
                <td style="padding: 6px 0;">${new Date().toUTCString()}</td>
              </tr>
            </table>

            <div style="border-top: 1px solid #E4F5E8; padding-top: 16px;">
              <span style="font-size: 12px; font-family: monospace; color: #617369; display: block; margin-bottom: 8px;">
                MESSAGE CONTENT:
              </span>
              <div style="background: #FAFDF6; border: 1px solid #C6EBD0; padding: 14px; font-size: 13px; line-height: 1.6; border-radius: 2px; white-space: pre-wrap;">
                ${params.message}
              </div>
            </div>
          </div>

          <!-- Colophon Footer -->
          <div style="background: #F0FAF2; border-top: 1px solid #C6EBD0; padding: 12px 24px; font-size: 11px; font-family: monospace; color: #617369; text-align: center;">
            Khabar Chakra · West Bengal Community Food Lifecycle · S-QUAD
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      replyTo: params.email,
      subject: `[Khabar Chakra Docket #${params.ticketId}] ${params.subject}`,
      html,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Resend email error:', error);
    return { success: false, error };
  }
}
