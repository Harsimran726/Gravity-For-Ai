import * as React from 'react';
import type { Metadata } from 'next';
import { AdminShell } from './admin-shell';
import { getAdminSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Panel | Gravity For AI',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  return (
    <AdminShell session={session ? { name: session.name, email: session.email, role: session.role } : undefined}>
      {children}
    </AdminShell>
  );
}

