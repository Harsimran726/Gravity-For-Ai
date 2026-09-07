'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendBookingEmails } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

const BookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please provide a valid phone or WhatsApp number'),
  businessName: z.string().optional(),
  serviceInterest: z.string().default('Free 20-Min AI Discovery Audit'),
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date'),
  timeSlot: z.string().min(2, 'Please select an available time slot'),
  timezone: z.string().default('Asia/Kolkata (IST - UTC+5:30)'),
  notes: z.string().min(5, 'Please tell us what bottleneck or workflow you want to automate'),
  website_hp: z.string().max(0, 'Spam detected').optional(),
});

export type BookingState = {
  success?: boolean;
  message?: string;
  bookingDetails?: {
    name: string;
    email: string;
    meetingDate: string;
    timeSlot: string;
    timezone: string;
    serviceInterest: string;
  };
  errors?: Record<string, string[]>;
};

export async function createBookingAction(
  prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const rawData = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    businessName: String(formData.get('businessName') || ''),
    serviceInterest: String(formData.get('serviceInterest') || 'Free 20-Min AI Discovery Audit'),
    meetingDate: String(formData.get('meetingDate') || ''),
    timeSlot: String(formData.get('timeSlot') || ''),
    timezone: String(formData.get('timezone') || 'Asia/Kolkata (IST - UTC+5:30)'),
    notes: String(formData.get('notes') || ''),
    website_hp: String(formData.get('website_hp') || ''),
  };

  // 1. Honeypot check (silent pass to fool bots)
  if (rawData.website_hp && rawData.website_hp.trim().length > 0) {
    return {
      success: true,
      message: 'Booking confirmed! A calendar invite has been sent to your email.',
    };
  }

  // 2. Zod validation
  const validated = BookingSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Please review and complete the highlighted fields.',
    };
  }

  const {
    name, email, phone, businessName,
    serviceInterest, meetingDate, timeSlot, timezone, notes,
  } = validated.data;

  // 3. Validate date is not in the past (server-side guard)
  const selectedDate = new Date(meetingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return {
      success: false,
      errors: { meetingDate: ['Please select a future date for your booking.'] },
      message: 'The selected date is in the past. Please choose a future date.',
    };
  }

  // 4. Save to PostgreSQL FIRST (before sending email)
  // This ensures data is persisted even if email dispatch fails.
  let leadId: string | null = null;
  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        businessName,
        // Prefix allows bookings page to filter them from contact form leads
        serviceInterest: `[BOOKING] ${serviceInterest} - ${meetingDate} at ${timeSlot} ${timezone}`,
        message: notes,
        status: 'NEW',
      },
    });
    leadId = lead.id;

    revalidatePath('/admin/leads');
    revalidatePath('/admin/bookings');
    revalidatePath('/admin');
  } catch (err) {
    console.error('[BOOKING] Critical: Failed to persist booking to PostgreSQL:', err);
    return {
      success: false,
      message:
        'We were unable to save your booking at this time. Please try again or contact us directly at contact@gravityforai.com.',
    };
  }

  // 5. Send confirmation emails AFTER database write
  try {
    await sendBookingEmails({
      name, email, phone, businessName,
      serviceInterest, meetingDate, timeSlot, timezone, notes,
    });
  } catch (emailErr) {
    // Email failure is non-critical - booking is already saved in DB
    console.error('[BOOKING] Email dispatch failed (booking still saved). Lead ID:', leadId, emailErr);
  }

  return {
    success: true,
    message: 'Your AI Audit meeting is booked! A calendar confirmation has been sent to your email.',
    bookingDetails: {
      name,
      email,
      meetingDate,
      timeSlot,
      timezone,
      serviceInterest,
    },
  };
}
