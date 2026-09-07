import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ADMIN_COOKIE_NAME, type AdminSession, type Role } from './auth-constants';

export { ADMIN_COOKIE_NAME, type AdminSession, type Role };

// --- Password Hashing ---

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// --- Session Cookie Signing (HMAC-SHA256) ---
// Prevents cookie forgery: even if someone reads the cookie value, they cannot
// craft a fake session because they don't have the NEXTAUTH_SECRET.

function getSessionSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || 'gravityforai-super-secure-production-secret-token-32chars';
  return secret;
}

export function signSession(sessionData: AdminSession): string {
  const secret = getSessionSecret();
  const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySession(cookieValue: string): AdminSession | null {
  try {
    const secret = getSessionSecret();
    const [payload, signature] = cookieValue.split('.');

    if (!payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const sessionData: AdminSession = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );
    return sessionData;
  } catch {
    return null;
  }
}

// --- Read Current Session (Server-side) ---

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}
