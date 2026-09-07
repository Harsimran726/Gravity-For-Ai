import * as React from 'react';
import { prisma } from '@/lib/prisma';
import AdminBookingsClient from './bookings-client';
import { getBookingSettingsAction } from '@/actions/settings-actions';

// Server Component - fetches real booking data from PostgreSQL
export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  let bookings: Array<{
    id: string;
    name: string;
    businessName: string | null;
    email: string;
    phone: string | null;
    serviceInterest: string | null;
    message: string | null;
    status: string;
    createdAt: Date;
  }> = [];

  try {
    bookings = await prisma.lead.findMany({
      where: {
        // Only show entries created from the booking calendar (prefixed with [BOOKING])
        serviceInterest: {
          startsWith: '[BOOKING]',
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phone: true,
        serviceInterest: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error('[ADMIN BOOKINGS] Failed to fetch bookings from database:', err);
  }

  // Parse the booking details embedded in serviceInterest field
  // Format: "[BOOKING] Free 20-Min AI Discovery Audit - 2026-09-05 at 11:30 AM Asia/Kolkata (IST - UTC+5:30)"
  const serializedBookings = bookings.map((b) => {
    const raw = b.serviceInterest ?? '';
    const stripped = raw.replace('[BOOKING] ', '');

    // Extract date and time from the format: "service - YYYY-MM-DD at HH:MM AM/PM tz"
    const dateMatch = stripped.match(/(\d{4}-\d{2}-\d{2})/);
    const timeMatch = stripped.match(/at\s+(\d{1,2}:\d{2}\s+(?:AM|PM))/i);
    const tzMatch = stripped.match(/at\s+\d{1,2}:\d{2}\s+(?:AM|PM)\s+(.+)$/i);
    const serviceMatch = stripped.match(/^(.+?)\s+[—\-]/);

    return {
      id: b.id,
      name: b.name,
      businessName: b.businessName ?? '',
      email: b.email,
      phone: b.phone ?? '',
      serviceInterest: serviceMatch ? serviceMatch[1].trim() : stripped,
      meetingDate: dateMatch ? dateMatch[1] : '',
      timeSlot: timeMatch ? timeMatch[1].trim() : '',
      timezone: tzMatch ? tzMatch[1].trim() : 'IST',
      notes: b.message ?? '',
      status: b.status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST',
      createdAt: b.createdAt.toISOString(),
    };
  });

  const settings = await getBookingSettingsAction();

  return (
    <AdminBookingsClient 
      initialBookings={serializedBookings} 
      initialTimeSlots={settings.bookingTimeSlots} 
      initialCustomDateSlots={settings.customDateSlots} 
    />
  );
}
