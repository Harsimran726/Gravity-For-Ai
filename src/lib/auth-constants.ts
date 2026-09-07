export const ADMIN_COOKIE_NAME = 'gravity_admin_session';

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  twoFAVerified: boolean;
  loginTime: string;
}
