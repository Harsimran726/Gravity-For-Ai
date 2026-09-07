'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBookingSettingsAction() {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        bookingTimeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
        customDateSlots: {},
      };
    }
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      });
    }
    return {
      bookingTimeSlots: settings.bookingTimeSlots,
      customDateSlots: (settings.customDateSlots as Record<string, string[]>) || {},
    };
  } catch (err) {
    console.warn('[SETTINGS] Database not reachable during build or request, using fallback settings');
    return {
      bookingTimeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
      customDateSlots: {},
    };
  }
}

export async function updateBookingTimeSlotsAction(newTimeSlots: string[]) {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      await prisma.siteSettings.create({ data: { bookingTimeSlots: newTimeSlots } });
    } else {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { bookingTimeSlots: newTimeSlots },
      });
    }
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateCustomDateSlotsAction(dateString: string, slots: string[]) {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }
    
    const currentCustomSlots = (settings.customDateSlots as Record<string, string[]>) || {};
    
    if (slots.length === 0) {
      delete currentCustomSlots[dateString];
    } else {
      currentCustomSlots[dateString] = slots;
    }
    
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { customDateSlots: currentCustomSlots },
    });
    
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
