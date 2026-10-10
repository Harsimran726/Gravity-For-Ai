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

export async function loginAdminAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Configuration failure must not become an unhandled server-action exception.
  if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_SECRET.trim()) {
    console.error('[AUTH_CONFIG] NEXTAUTH_SECRET must be configured.');
    return {
      success: false,
      message: 'Sign-in is temporarily unavailable because server authentication is not configured. Please contact the site administrator.',
    };
  }

  const rawEmail = String(formData.get('email') || '').trim();
  const rawPassword = String(formData.get('password') || '');

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

      // Check the password hash is a real bcrypt hash (not an INVITE: placeholder)
      const isActivated = !dbUser.passwordHash.startsWith('INVITE:');

      if (isMatch && isActivated) {
        authenticatedUser = {
          id: dbUser.id,
          name: dbUser.name || 'Team Member',
          email: dbUser.email,
          role: dbUser.role as 'ADMIN' | 'EDITOR' | 'VIEWER',
        };
      } else if (isMatch && !isActivated) {
        return {
          success: false,
          message: 'Your invitation is pending. Please check your email for the invitation link to activate your account.',
        };
      }
    }
  } catch (err) {
    // Non-fatal: Log database query error and proceed to emergency founder fallback check
    console.error('[AUTH] Database authentication unavailable.');
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
