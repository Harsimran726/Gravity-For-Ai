'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { logoutAdminAction } from '@/actions/auth-actions';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Bookings & Calls', href: '/admin/bookings', icon: Calendar },
  { label: 'Blog / CMS', href: '/admin/blog', icon: FileText },
  { label: 'Leads & Inquiries', href: '/admin/leads', icon: Users },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'Site Settings', href: '/admin/settings', icon: Settings },
  { label: 'Security & Audit', href: '/admin/audit-log', icon: ShieldAlert },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On Login Page: Show ONLY the dedicated authentication UI (NO sidebar, NO navigation)
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-[#F7F5F0] flex items-center justify-center p-4 w-full">
        {children}
      </div>
    );
  }

  // On Authenticated Admin Pages: Show the full admin sidebar & dashboard workspace
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0A1B3D] flex flex-col md:flex-row w-full">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0A1B3D] text-[#F7F5F0] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#233A6B]">
            <Link href="/" className="flex items-center gap-2.5" target="_blank">
              <Image
                src="/apple-touch-icon.png"
                alt="Gravity For AI Logo"
                width={24}
                height={24}
                className="w-6 h-6 rounded-md object-contain"
              />
              <span className="font-sans font-medium text-sm tracking-widest text-[#F7F5F0] uppercase">
                Gravity CMS
              </span>
              <ExternalLink className="w-3 h-3 text-[#6B7280] ml-auto" />
            </Link>
            <p className="text-[11px] font-mono text-[#6B7280] mt-1">Admin Portal · v1.0</p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-sans transition-colors ${
                    isActive
                      ? 'bg-[#122C57] text-[#FFFFFF] font-semibold'
                      : 'text-[#F7F5F0]/80 hover:text-[#FFFFFF] hover:bg-[#122C57]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#C99A44]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-[#233A6B] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#122C57] border border-[#C99A44] flex items-center justify-center text-xs font-mono font-semibold text-[#FFFFFF]">
              HS
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-[#F7F5F0] truncate">Harsimran Singh</p>
              <p className="text-[10px] font-mono text-[#C99A44] uppercase">Role: Super Admin</p>
            </div>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#F7F5F0] transition-colors pt-1 cursor-pointer w-full text-left"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out (End Session)
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl">{children}</main>
    </div>
  );
}
