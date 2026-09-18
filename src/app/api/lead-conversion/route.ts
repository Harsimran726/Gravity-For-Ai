import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hash(value: string) {
  if (!value) return '';
  const trimmed = value.trim().toLowerCase();
  // If already 64-char sha256 hex, preserve it
  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return trimmed;
  }
  return crypto
    .createHash('sha256')
    .update(trimmed)
    .digest('hex');
}

function normalizePhone(phone: string) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/^0+/, '');
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone, eventId, name, serviceInterest, customData } = await request.json();

    const pixelId =
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      '2111062089501666';

    const accessToken =
      process.env.META_ACCESS_TOKEN ||
      process.env.META_CONVERSIONS_API_TOKEN ||
      'EAAZA5r25sJFMBSiiCZC8kaZBlQYbokuF7kuw7JBzMjEzfANGPZBKdjeAlQTNVjGDG8eyhkyosdDTZA4IfZCOl2Fjv5p3Own2ZCTw1OFIytGrmVCGcno0sYP1Ev3sdPYKf0JAVZAfuook5oWtmgb7RIQJa3LqzAcBgGFuTZCvZC6pwc2ZBjSp5ITecVkrZA8nJO9nEiOpQwZDZD';

    const normalizedPhone = phone ? normalizePhone(phone) : '';

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          action_source: 'website',
          user_data: {
            em: email && email.trim() ? [hash(email)] : undefined,
            ph: normalizedPhone ? [hash(normalizedPhone)] : undefined,
          },
          custom_data: {
            currency: 'INR',
            content_name: serviceInterest || 'AI Voice Agent Lead',
            lead_event_source: 'Gravity For AI Website',
            ...(customData || {}),
          },
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API /api/lead-conversion] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
