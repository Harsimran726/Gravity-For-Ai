'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const escapeHtml = (s:string) => s.replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]!));

// Schemas
const InviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  title: z.string().optional(),
});

const OutreachSchema = z.object({
  subject: z.string().min(1, 'Subject required'),
  message: z.string().min(10, 'Message too short'),
});

export type TeamActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Helper to dispatch email (inline, no import needed, uses Resend or SMTP from env)
async function sendTeamEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const fromEmail = process.env.SMTP_FROM || 'contact@gravityforai.com';
  const fromHeader = `"Gravity For AI" <${fromEmail}>`;

  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromHeader, to: [to], subject, html }),
    });
    if(!response.ok)throw new Error('Mail provider rejected request');
    return;
  }

  const nodemailer = await import('nodemailer');
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, tls: { rejectUnauthorized: true } });
    await transporter.sendMail({ from: fromHeader, to, subject, html });
  } else {
    throw new Error('Mail is not configured');
  }
}

// ACTION 1: Invite a new team member
export async function inviteTeamMemberAction(prevState: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized. Only admins can invite members.' };

  const raw = { name: String(formData.get('name') || ''), email: String(formData.get('email') || '').toLowerCase(), role: String(formData.get('role') || ''), title: String(formData.get('title') || '') };
  const validated = InviteSchema.safeParse(raw);
  if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors, message: 'Please fix the errors below.' };

  const { name, email, role, title } = validated.data;

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && !existing.passwordHash.startsWith('INVITE:')) return { success: false, message: `A team member with email ${email} already exists.` };

    const inviteToken = crypto.randomBytes(32).toString('hex');

    const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');
    const inviteExpiresAt = new Date(Date.now()+7*24*60*60*1000);
    const inviteData = {email,name,title:title||null,role,passwordHash:'INVITE:pending',bio:null,inviteTokenHash,inviteExpiresAt};
    // Reissuing a pending invitation invalidates its previous token.
    if(existing) await prisma.user.update({where:{id:existing.id},data:inviteData});
    else await prisma.user.create({data:inviteData});

    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gravityforai.com'}/admin/accept-invite#token=${inviteToken}&email=${encodeURIComponent(email)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F7F5F0; margin: 0; padding: 24px; color: #0A1B3D; }
          .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E2DC; padding: 32px; }
          .logo { font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #122C57; margin-bottom: 4px; }
          h1 { font-family: Georgia, serif; font-size: 24px; color: #122C57; margin: 12px 0; font-weight: 400; }
          .role-badge { display: inline-block; padding: 4px 12px; background: #122C57; color: #C99A44; font-size: 11px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 2px; }
          .btn { display: inline-block; background: #122C57; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin: 24px 0; }
          .info-box { background: #F7F5F0; border-left: 4px solid #C99A44; padding: 16px; margin: 20px 0; font-size: 13px; }
          .footer { margin-top: 32px; font-size: 11px; color: #9CA3AF; text-align: center; border-top: 1px solid #E4E2DC; padding-top: 16px; }
        </style></head>
        <body>
          <div class="container">
            <div class="logo">Gravity For AI</div>
            <h1>You've Been Invited to the Admin Team</h1>
            <p>Hi ${escapeHtml(name)},</p>
            <p><strong>${escapeHtml(session.name)}</strong> has invited you to join the Gravity For AI admin panel as:</p>
            <p><span class="role-badge">${role}</span></p>
            <div class="info-box">
              <strong>Your access level:</strong><br/>
              ${role === 'ADMIN' ? '✅ Full access — Dashboard, Blogs, Leads, Bookings, Team Management, Settings' : ''}
              ${role === 'EDITOR' ? '✅ Content access — Create, edit &amp; delete Blog Posts. View Leads &amp; Bookings.' : ''}
              ${role === 'VIEWER' ? '✅ Read-only access — View Leads and Bookings (cannot edit content).' : ''}
            </div>
            <p>Click below to accept your invitation and set your password:</p>
            <div style="text-align: center;">
              <a href="${inviteUrl}" class="btn">Accept Invitation &amp; Set Password</a>
            </div>
            <p style="font-size: 12px; color: #6B7280;">This invitation link expires in 7 days. If you did not expect this invitation, you can safely ignore this email.</p>
            <div class="footer">Gravity For AI · Mansa, Punjab 151505, India · gravityforai.com</div>
          </div>
        </body>
      </html>
    `;

    await sendTeamEmail({ to: email, subject: `You're invited to Gravity For AI Admin Panel — ${role} access`, html });

    await prisma.auditLog.create({ data: { userId: session.id, action: 'INVITE_SENT', entityType: 'TEAM_MEMBER', details: `Invited ${email} as ${role}` } }).catch(() => {});

    revalidatePath('/admin/team');
    return { success: true, message: `Invitation sent to ${email}. They will receive an email with a secure link to set their password.` };
  } catch (err) {
    console.error('[TEAM] Operation failed.');
    return { success: false, message: 'Failed to send invitation. Please try again.' };
  }
}

// ACTION 2: Update a team member's role
export async function updateTeamMemberRoleAction(memberId: string, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER'): Promise<TeamActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };
  if (memberId === session.id) return { success: false, message: 'You cannot change your own role.' };

  try {
    await prisma.user.update({ where: { id: memberId }, data: { role: newRole } });
    await prisma.auditLog.create({ data: { userId: session.id, action: 'ROLE_UPDATED', entityType: 'TEAM_MEMBER', entityId: memberId, details: `Changed role to ${newRole}` } }).catch(() => {});
    revalidatePath('/admin/team');
    return { success: true, message: 'Role updated successfully.' };
  } catch {
    return { success: false, message: 'Failed to update role.' };
  }
}

// ACTION 3: Remove a team member
export async function removeTeamMemberAction(memberId: string): Promise<TeamActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };
  if (memberId === session.id) return { success: false, message: 'You cannot remove yourself.' };

  try {
    const member = await prisma.user.findUnique({ where: { id: memberId }, select: { email: true, name: true } });
    await prisma.user.delete({ where: { id: memberId } });
    await prisma.auditLog.create({ data: { userId: session.id, action: 'MEMBER_REMOVED', entityType: 'TEAM_MEMBER', entityId: memberId, details: `Removed ${member?.email}` } }).catch(() => {});
    revalidatePath('/admin/team');
    return { success: true, message: `${member?.name || 'Team member'} has been removed.` };
  } catch {
    return { success: false, message: 'Failed to remove team member.' };
  }
}

// ACTION 4: Send outreach email to all or specific team members
export async function sendTeamOutreachAction(prevState: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized.' };

  const raw = { subject: String(formData.get('subject') || ''), message: String(formData.get('message') || '') };
  const validated = OutreachSchema.safeParse(raw);
  if (!validated.success) return { success: false, errors: validated.error.flatten().fieldErrors, message: 'Please fix the errors below.' };

  const recipientFilter = String(formData.get('recipients') || 'ALL');

  try {
    const members = await prisma.user.findMany({
      where: recipientFilter === 'ALL' ? {} : { role: recipientFilter as 'ADMIN' | 'EDITOR' | 'VIEWER' },
      select: { email: true, name: true, role: true },
    });

    if (members.length === 0) return { success: false, message: 'No team members found matching the selected filter.' };

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F7F5F0; margin: 0; padding: 24px; color: #0A1B3D; }
          .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E2DC; padding: 32px; }
          .logo { font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #122C57; }
          h1 { font-family: Georgia, serif; font-size: 22px; color: #122C57; margin: 12px 0; font-weight: 400; }
          .message-body { font-size: 14px; line-height: 1.7; white-space: pre-wrap; border-left: 4px solid #C99A44; padding: 16px; background: #F7F5F0; margin: 20px 0; }
          .sender { font-size: 12px; color: #6B7280; margin-top: 24px; }
          .footer { margin-top: 32px; font-size: 11px; color: #9CA3AF; text-align: center; border-top: 1px solid #E4E2DC; padding-top: 16px; }
        </style></head>
        <body>
          <div class="container">
            <div class="logo">Gravity For AI — Internal</div>
            <h1>${escapeHtml(validated.data.subject)}</h1>
            <div class="message-body">${escapeHtml(validated.data.message).replace(/\n/g, '<br/>')}</div>
            <div class="sender">— Sent by ${escapeHtml(session.name)} (${escapeHtml(session.email)}) via Gravity CMS</div>
            <div class="footer">Gravity For AI · Admin Portal · gravityforai.com</div>
          </div>
        </body>
      </html>
    `;

    const results = await Promise.allSettled(
      members.map((m) => sendTeamEmail({ to: m.email, subject: `[Gravity Team] ${escapeHtml(validated.data.subject)}`, html }))
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    await prisma.auditLog.create({ data: { userId: session.id, action: 'OUTREACH_SENT', entityType: 'TEAM_OUTREACH', details: `Subject: ${escapeHtml(validated.data.subject)} | Sent to ${sent}/${members.length} members` } }).catch(() => {});

    return { success: true, message: `Outreach email sent successfully to ${sent} team member${sent !== 1 ? 's' : ''}.` };
  } catch (err) {
    console.error('[TEAM] Operation failed.');
    return { success: false, message: 'Failed to send outreach email.' };
  }
}

// ACTION 5: Accept invite and set password
export async function acceptInviteAction(prevState: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const token = String(formData.get('token') || '');
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!/^[a-f0-9]{64}$/.test(token) || !z.string().email().safeParse(email).success || password.length < 8 || Buffer.byteLength(password,'utf8') > 72) {
    return { success: false, message: 'Invalid request parameters.' };
  }

  try {
    const member = await prisma.user.findUnique({ where: { email } });
    const invalid = {success:false,message:'Invalid or expired invitation. Ask your administrator for a new link.'};
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if(!member || !member.passwordHash.startsWith('INVITE:') || !member.inviteTokenHash || member.inviteTokenHash!==tokenHash || !member.inviteExpiresAt || member.inviteExpiresAt <= new Date())return invalid;
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(password,12);
    const accepted = await prisma.user.updateMany({where:{id:member.id,passwordHash:member.passwordHash,inviteTokenHash:tokenHash,inviteExpiresAt:{gt:new Date()}},data:{passwordHash:hash,inviteTokenHash:null,inviteExpiresAt:null,bio:null}});
    if(accepted.count!==1)return invalid;

    await prisma.auditLog.create({ data: { userId: member.id, action: 'INVITE_ACCEPTED', entityType: 'TEAM_MEMBER', details: `${email} accepted invite and set password` } }).catch(() => {});

    return { success: true, message: 'Account activated successfully!' };
  } catch (err) {
    console.error('[TEAM] Operation failed.');
    return { success: false, message: 'Failed to activate account. Please try again.' };
  }
}
