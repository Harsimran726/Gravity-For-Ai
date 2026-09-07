'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendContactInquiryEmail } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

const LeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  serviceInterest: z.string().default('AI Audit'),
  message: z.string().min(5, 'Please tell us briefly what you want to automate'),
  website_hp: z.string().max(0, 'Spam detected').optional(),
});

export type FormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitLeadAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
    businessName: formData.get('businessName') ? String(formData.get('businessName')) : undefined,
    serviceInterest: String(formData.get('serviceInterest') || 'AI Audit'),
    message: String(formData.get('message') || ''),
    website_hp: String(formData.get('website_hp') || ''),
  };

  // 1. Honeypot Check (silent fake success to fool bots)
  if (rawData.website_hp && rawData.website_hp.trim().length > 0) {
    return {
      success: true,
      message: 'Thank you! Your inquiry has been received.',
    };
  }

  // 2. Zod Validation
  const validated = LeadSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Please review the highlighted fields.',
    };
  }

  // 3. Persist to PostgreSQL FIRST
  try {
    await prisma.lead.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        businessName: validated.data.businessName,
        serviceInterest: validated.data.serviceInterest,
        message: validated.data.message,
        status: 'NEW',
      },
    });

    revalidatePath('/admin/leads');
    revalidatePath('/admin');
  } catch (error) {
    console.error('[LEAD] Critical: Failed to persist contact form submission to PostgreSQL:', error);
    return {
      success: false,
      message: 'We were unable to save your inquiry at this time. Please email us directly at contact@gravityforai.com.',
    };
  }

  // 4. Send email notification AFTER DB save
  try {
    await sendContactInquiryEmail({
      name: validated.data.name,
      email: validated.data.email,
      phone: validated.data.phone,
      businessName: validated.data.businessName,
      serviceInterest: validated.data.serviceInterest,
      message: validated.data.message,
    });
  } catch (emailErr) {
    // Non-critical - lead is already saved in DB
    console.error('[LEAD] Email notification failed (inquiry still saved):', emailErr);
  }

  return {
    success: true,
    message:
      'Thank you! Your inquiry has been submitted. We have sent a confirmation to your email and our team will contact you shortly.',
  };
}
