'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME, verifyPassword, signSession, type AdminSession } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  // 1. Zod Validation
  const validated = LoginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Please review your input credentials.',
    };
  }

  let authenticatedUser: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  } | null = null;

  // 2. Query PostgreSQL Database via Prisma
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (dbUser) {
      const isMatch = await verifyPassword(password, dbUser.passwordHash);
      if (isMatch && dbUser.role === 'ADMIN') {
        authenticatedUser = {
          id: dbUser.id,
          name: dbUser.name || 'Admin',
          email: dbUser.email,
          role: dbUser.role as 'ADMIN',
        };
      }
    }
  } catch (err) {
    console.error('[AUTH] Database query error during authentication:', err);
    return {
      success: false,
      message: 'Authentication service unavailable. Please try again shortly.',
    };
  }

  // 3. Fallback for environment-variable-based admin (when DB is not yet seeded)
  if (!authenticatedUser) {
    const fallbackEmail = process.env.ADMIN_EMAIL;
    const fallbackHash = process.env.ADMIN_PASSWORD_HASH;

    if (
      fallbackEmail &&
      fallbackHash &&
      email === fallbackEmail.toLowerCase()
    ) {
      const isMatch = await verifyPassword(password, fallbackHash);
      if (isMatch) {
        authenticatedUser = {
          id: 'env-admin-fallback',
          name: 'Harsimran Singh',
          email: fallbackEmail,
          role: 'ADMIN',
        };
      }
    }
  }

  if (!authenticatedUser) {
    // Deliberate vague message to prevent user enumeration attacks
    return {
      success: false,
      message: 'Invalid credentials. Access denied.',
    };
  }

  // 4. Create HMAC-signed session cookie (NOT just base64 - prevents forgery)
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

  // 5. Log admin login in AuditLog
  try {
    await prisma.auditLog.create({
      data: {
        userId: authenticatedUser.id === 'env-admin-fallback' ? null : authenticatedUser.id,
        action: 'LOGIN',
        entityType: 'ADMIN_SESSION',
        details: `Successful admin login for ${authenticatedUser.email}`,
      },
    });
  } catch {
    // Non-blocking - login still succeeds even if audit log fails
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
