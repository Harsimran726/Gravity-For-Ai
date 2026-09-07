import * as React from 'react';
import type { Metadata } from 'next';
import { AdminShell } from './admin-shell';

export const metadata: Metadata = {
  title: 'Admin Panel | Gravity For AI',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
