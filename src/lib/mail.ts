import nodemailer from 'nodemailer';

interface BookingEmailParams {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  serviceInterest: string;
  meetingDate: string;
  timeSlot: string;
  timezone: string;
  notes: string;
}

interface ContactEmailParams {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  serviceInterest: string;
  message: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL on 465, STARTTLS on 587
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert failures
      },
    });
  }

  return null;
}

/**
 * Universal dispatcher that automatically chooses between:
 * 1. Resend REST API (if RESEND_API_KEY is defined)
 * 2. SMTP Transporter via Nodemailer (if SMTP_HOST, SMTP_USER, SMTP_PASS are defined)
 * 3. Local development console logging fallback
 */
async function dispatchEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const fromEmail = process.env.SMTP_FROM || 'contact@gravityforai.com';
  const fromName = 'Gravity For AI';
  const fromHeader = `"${fromName}" <${fromEmail}>`;

  // --- Option A: Resend API (HTTP REST — zero timeout, best for Vercel Serverless) ---
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromHeader,
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[MAIL] Resend API error:', data);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[MAIL] Resend network error:', err);
      return false;
    }
  }

  // --- Option B: Standard SMTP via Nodemailer (Hostinger, Google Workspace, Zoho, Titan) ---
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('[MAIL] SMTP send error:', err);
      return false;
    }
  }

  // --- Option C: Fallback development logger ---
  console.log('----------------------------------------------------');
  console.log(`[MAIL DISPATCH DEV MOCK] To: ${to}`);
  console.log(`[MAIL DISPATCH DEV MOCK] Subject: ${subject}`);
  console.log('[MAIL DISPATCH DEV MOCK] Configure SMTP_* or RESEND_API_KEY in Vercel to send real emails.');
  console.log('----------------------------------------------------');
  return true;
}

export async function sendBookingEmails(params: BookingEmailParams) {
  const formattedDate = new Date(params.meetingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@gravityforai.com';

  const clientHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 24px; color: #0A1B3D; }
          .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E2DC; padding: 32px; border-radius: 4px; }
          .header { border-bottom: 2px solid #122C57; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 14px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #122C57; }
          .title { font-size: 24px; color: #122C57; margin-top: 12px; margin-bottom: 8px; font-family: Georgia, serif; }
          .highlight-box { background: #F7F5F0; border-left: 4px solid #C99A44; padding: 16px; margin: 20px 0; }
          .btn { display: inline-block; background: #122C57; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 24px; }
          .footer { margin-top: 32px; font-size: 12px; color: #6B7280; text-align: center; border-top: 1px solid #E4E2DC; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GRAVITY FOR AI</div>
            <h1 class="title">Your AI Audit Call is Confirmed</h1>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">Meeting with Harsimran Singh (Lead AI Engineer)</p>
          </div>

          <p>Hi ${params.name},</p>
          <p>Thank you for scheduling your 20-minute discovery session with Gravity For AI. We will review your current business workflows and demonstrate how custom AI voice agents or autonomous agentic pipelines can automate your operations.</p>

          <div class="highlight-box">
            <div style="font-weight: 600; color: #122C57; margin-bottom: 8px;">Meeting Details:</div>
            <div><strong>Topic:</strong> ${params.serviceInterest}</div>
            <div><strong>Date:</strong> ${formattedDate}</div>
            <div><strong>Time:</strong> ${params.timeSlot} (${params.timezone})</div>
            <div><strong>Location:</strong> Google Meet (Video / Voice)</div>
          </div>

          <div style="text-align: center;">
            <a href="https://meet.google.com/landing" class="btn" target="_blank">Access Google Meet Room</a>
          </div>

          <div class="footer">
            Gravity For AI · Mansa, Punjab 151505, India<br/>
            Need to reschedule? Reply directly to this email or contact us at contact@gravityforai.com.
          </div>
        </div>
      </body>
    </html>
  `;

  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 20px; color: #0A1B3D;">
        <h2 style="color: #122C57;">📅 New AI Audit Call Booked!</h2>
        <p>A new discovery call has been scheduled on Gravity For AI:</p>
        <ul>
          <li><strong>Client Name:</strong> ${params.name}</li>
          <li><strong>Email:</strong> ${params.email}</li>
          <li><strong>Phone / WhatsApp:</strong> ${params.phone || 'Not provided'}</li>
          <li><strong>Business Name:</strong> ${params.businessName || 'Not specified'}</li>
          <li><strong>Service Interest:</strong> ${params.serviceInterest}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time Slot:</strong> ${params.timeSlot} (${params.timezone})</li>
          <li><strong>Notes / Bottleneck:</strong> ${params.notes}</li>
        </ul>
        <p style="color: #6B7280; font-size: 12px;">Logged in PostgreSQL via Gravity CMS</p>
      </body>
    </html>
  `;

  // Send to client and admin concurrently
  await Promise.allSettled([
    dispatchEmail({
      to: params.email,
      subject: `Confirmed: 20-Min AI Discovery Audit - ${formattedDate} at ${params.timeSlot}`,
      html: clientHtml,
    }),
    dispatchEmail({
      to: adminEmail,
      subject: `🔔 New Call Booked: ${params.name} (${params.businessName || 'SMB'}) - ${formattedDate}`,
      html: adminHtml,
    }),
  ]);

  return { success: true };
}

export async function sendContactInquiryEmail(params: ContactEmailParams) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@gravityforai.com';

  const clientHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F5F0; margin: 0; padding: 24px; color: #0A1B3D; }
          .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E2DC; padding: 32px; border-radius: 4px; }
          .header { border-bottom: 2px solid #122C57; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 14px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #122C57; }
          .title { font-size: 22px; color: #122C57; margin-top: 12px; margin-bottom: 8px; font-family: Georgia, serif; }
          .footer { margin-top: 32px; font-size: 12px; color: #6B7280; text-align: center; border-top: 1px solid #E4E2DC; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GRAVITY FOR AI</div>
            <h1 class="title">We Received Your Message</h1>
          </div>
          <p>Hi ${params.name},</p>
          <p>Thank you for reaching out to Gravity For AI. We have received your inquiry regarding <strong>${params.serviceInterest}</strong>.</p>
          <p>Harsimran Singh or an engineer from our Mansa, Punjab team will review your requirements and follow up with you within 24 hours.</p>
          <div class="footer">
            Gravity For AI · Mansa, Punjab 151505, India<br/>
            Direct Email: contact@gravityforai.com
          </div>
        </div>
      </body>
    </html>
  `;

  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 20px; color: #0A1B3D;">
        <h2 style="color: #122C57;">✉️ New Contact Inquiry Submitted</h2>
        <ul>
          <li><strong>Name:</strong> ${params.name}</li>
          <li><strong>Email:</strong> ${params.email}</li>
          <li><strong>Phone / WhatsApp:</strong> ${params.phone || 'N/A'}</li>
          <li><strong>Business:</strong> ${params.businessName || 'N/A'}</li>
          <li><strong>Service:</strong> ${params.serviceInterest}</li>
          <li><strong>Message:</strong> ${params.message}</li>
        </ul>
        <p style="color: #6B7280; font-size: 12px;">Stored in PostgreSQL Database under Leads</p>
      </body>
    </html>
  `;

  // Send to client and admin concurrently
  await Promise.allSettled([
    dispatchEmail({
      to: params.email,
      subject: `We have received your message - Gravity For AI`,
      html: clientHtml,
    }),
    dispatchEmail({
      to: adminEmail,
      subject: `✉️ New Inquiry from ${params.name} (${params.businessName || 'SMB'})`,
      html: adminHtml,
    }),
  ]);

  return { success: true };
}
