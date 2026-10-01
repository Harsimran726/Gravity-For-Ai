import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// ─── Token Personalisation ─────────────────────────────────────────────────
function personalise(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key.toLowerCase()] ?? '');
}

// ─── Email Dispatcher (same strategy as mail.ts) ───────────────────────────
async function sendOutreachEmail({
  to,
  toName,
  subject,
  html,
  messageId,
}: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  messageId: string;
}): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.SMTP_FROM || 'contact@gravityforai.com';
  const fromHeader = `"Gravity For AI" <${fromEmail}>`;
  const unsubscribeEmail = `unsubscribe@gravityforai.com`;

  const headers = {
    'Message-ID': `<${messageId}@gravityforai.com>`,
    'List-Unsubscribe': `<mailto:${unsubscribeEmail}?subject=Unsubscribe>, <https://gravityforai.com/unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'Reply-To': fromEmail,
    'X-Mailer': 'GravityForAI-Outreach/1.0',
  };

  // Option A: Resend API
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
          to: [`"${toName}" <${to}>`],
          subject,
          html,
          headers,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data?.message || 'Resend API error' };
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  // Option B: SMTP via Nodemailer
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      await transporter.sendMail({
        from: fromHeader,
        to: `"${toName}" <${to}>`,
        subject,
        html,
        headers,
        messageId: `<${messageId}@gravityforai.com>`,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  // Option C: Dev mock
  console.log(`[OUTREACH MOCK] To: ${to} | Subject: ${subject}`);
  return { success: true };
}

// ─── Helper: Reset sentToday if it's a new calendar day ────────────────────
async function maybeResetDailyCount(campaignId: string) {
  const campaign = await prisma.outreachCampaign.findUnique({
    where: { id: campaignId },
    select: { lastResetAt: true, sentToday: true },
  });
  if (!campaign) return;

  const now = new Date();
  const lastReset = campaign.lastResetAt ? new Date(campaign.lastResetAt) : null;
  const isNewDay =
    !lastReset ||
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate();

  if (isNewDay && campaign.sentToday > 0) {
    await prisma.outreachCampaign.update({
      where: { id: campaignId },
      data: { sentToday: 0, lastResetAt: now },
    });
  }
}

// ─── POST /api/admin/outreach/send-one ────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Auth
    const session = await getAdminSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await request.json();
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });

    // 2. Reset daily count if new day
    await maybeResetDailyCount(campaignId);

    // 3. Fetch campaign
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        subject: true,
        body: true,
        dailyLimit: true,
        sentToday: true,
        status: true,
      },
    });

    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    // 4. Daily limit check
    if (campaign.sentToday >= campaign.dailyLimit) {
      return NextResponse.json({
        limitReached: true,
        sentToday: campaign.sentToday,
        dailyLimit: campaign.dailyLimit,
        message: `Daily limit of ${campaign.dailyLimit} emails reached. Resumes tomorrow.`,
      });
    }

    // 5. Pick next SELECTED prospect
    const prospect = await prisma.outreachProspect.findFirst({
      where: { campaignId, status: 'SELECTED' },
      orderBy: { createdAt: 'asc' },
    });

    if (!prospect) {
      // No more selected → check if any PENDING remain
      const pendingCount = await prisma.outreachProspect.count({
        where: { campaignId, status: 'PENDING' },
      });
      return NextResponse.json({
        done: true,
        pendingCount,
        message: pendingCount > 0
          ? `No selected prospects remaining. ${pendingCount} are still PENDING — select them to continue.`
          : 'All selected prospects have been processed.',
      });
    }

    // 6. Personalise email
    const vars = {
      name: prospect.name,
      company: prospect.company || '',
      email: prospect.email,
      firstname: prospect.name.split(' ')[0],
    };
    const subject = personalise(campaign.subject, vars);
    const html = personalise(campaign.body, vars);
    const messageId = crypto.randomBytes(16).toString('hex');

    // 7. Send
    const result = await sendOutreachEmail({
      to: prospect.email,
      toName: prospect.name,
      subject,
      html,
      messageId,
    });

    // 8. Update prospect + campaign counters
    const newStatus = result.success ? 'SENT' : 'FAILED';
    const [updatedProspect] = await Promise.all([
      prisma.outreachProspect.update({
        where: { id: prospect.id },
        data: {
          status: newStatus,
          sentAt: result.success ? new Date() : undefined,
          error: result.error || null,
        },
      }),
      prisma.outreachCampaign.update({
        where: { id: campaignId },
        data: {
          totalSent: result.success ? { increment: 1 } : undefined,
          totalFailed: result.success ? undefined : { increment: 1 },
          sentToday: result.success ? { increment: 1 } : undefined,
          lastSentAt: result.success ? new Date() : undefined,
          status: 'ACTIVE',
        },
      }),
    ]);

    // 9. Count remaining
    const remaining = await prisma.outreachProspect.count({
      where: { campaignId, status: 'SELECTED' },
    });

    const sentToday = campaign.sentToday + (result.success ? 1 : 0);

    return NextResponse.json({
      prospect: updatedProspect,
      sent: result.success,
      error: result.error,
      remaining,
      sentToday,
      dailyLimit: campaign.dailyLimit,
      limitReached: sentToday >= campaign.dailyLimit,
    });
  } catch (err) {
    console.error('[OUTREACH API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
