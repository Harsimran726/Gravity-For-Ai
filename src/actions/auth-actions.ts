'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME, verifyPassword, signSession, type AdminSession } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginState = {
  success?: boolean;
  requires2FA?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// Known master founder password hash for Admin@Gravity2026! (bcrypt 12 rounds)
const FOUNDER_MASTER_HASH = '$2b$12$Iha5OiP5kXY3/ae8gOY8/.6HYBfQojrFVLhjBMqL9soMExnvtZrFu';

export async function loginAdminAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawEmail = String(formData.get('email') || '').trim();
  const rawPassword = String(formData.get('password') || '').trim();

  // 1. Zod Validation
  const validated = LoginSchema.safeParse({ email: rawEmail, password: rawPassword });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Please review your input credentials.',
    };
  }

  const email = rawEmail.toLowerCase();
  const password = rawPassword;

  let authenticatedUser: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  } | null = null;

  // 2. Query PostgreSQL Database via Prisma (with graceful error handling)
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (dbUser) {
      // Check against stored database hash
      let isMatch = await verifyPassword(password, dbUser.passwordHash);

      // Also check against founder master password if this is a founder email
      if (!isMatch && (email === 'harsimran@gravityforai.com' || email === 'contact@gravityforai.com')) {
        isMatch = password === 'Admin@Gravity2026!' || (await verifyPassword(password, FOUNDER_MASTER_HASH));
      }

      if (isMatch && dbUser.role === 'ADMIN') {
        authenticatedUser = {
          id: dbUser.id,
          name: dbUser.name || 'Harsimran Singh',
          email: dbUser.email,
          role: 'ADMIN',
        };
      }
    }
  } catch (err) {
    // Non-fatal: Log database query error and proceed to emergency founder fallback check
    console.error('[AUTH] Database query encountered an issue, checking fallback credentials:', err);
  }

  // 3. Resilient Founder Master Fallback
  // Guarantees Harsimran Singh is NEVER locked out, even if the database is
  // sleeping, cold-starting, restarting, or has connection timeouts.
  if (!authenticatedUser) {
    const allowedFounderEmails = [
      'harsimran@gravityforai.com',
      'contact@gravityforai.com',
      (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    ].filter(Boolean);

    if (allowedFounderEmails.includes(email)) {
      let isFounderMatch = false;

      // Check standard master password
      if (password === 'Admin@Gravity2026!') {
        isFounderMatch = true;
      } else if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
        isFounderMatch = true;
      } else if (process.env.ADMIN_PASSWORD_HASH && (await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH))) {
        isFounderMatch = true;
      } else if (await verifyPassword(password, FOUNDER_MASTER_HASH)) {
        isFounderMatch = true;
      }

      if (isFounderMatch) {
        authenticatedUser = {
          id: 'founder-admin-harsimran',
          name: 'Harsimran Singh',
          email: email,
          role: 'ADMIN',
        };

        // Asynchronously ensure founder record exists in DB if possible
        prisma.user
          .upsert({
            where: { email },
            update: { role: 'ADMIN' },
            create: {
              id: 'founder-admin-' + (email.startsWith('contact') ? 'contact' : 'harsimran'),
              email,
              passwordHash: FOUNDER_MASTER_HASH,
              name: 'Harsimran Singh',
              role: 'ADMIN',
              title: 'Founder & Lead AI Engineer',
            },
          })
          .catch(() => {});
      }
    }
  }

  // 4. If credentials did not authenticate
  if (!authenticatedUser) {
    return {
      success: false,
      message: 'Invalid email or password. Please verify your credentials and try again.',
    };
  }

  // 5. Create HMAC-signed session cookie (edge and server safe)
  const sessionData: AdminSession = {
    id: authenticatedUser.id,
    name: authenticatedUser.name,
    email: authenticatedUser.email,
    role: authenticatedUser.role,
    twoFAVerified: true,
    loginTime: new Date().toISOString(),
  };

  const signedCookie = signSession(sessionData);

  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, signedCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // 6. Non-blocking audit log
  try {
    await prisma.auditLog.create({
      data: {
        userId: authenticatedUser.id === 'founder-admin-harsimran' ? null : authenticatedUser.id,
        action: 'LOGIN',
        entityType: 'ADMIN_SESSION',
        details: `Successful admin login for ${authenticatedUser.email}`,
      },
    });
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    message: 'Authenticated successfully. Redirecting to Admin Dashboard...',
  };
}

export async function logoutAdminAction() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
