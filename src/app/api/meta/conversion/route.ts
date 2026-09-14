import { NextRequest, NextResponse } from 'next/server';
import {
  buildMetaLeadEventPayload,
  sendMetaConversionsApiEvent,
  MetaCapiPayload,
} from '@/lib/meta-conversions';

/**
 * POST /api/meta/conversion
 * Accepts either:
 * 1. The exact raw Meta Conversions API schema:
 *    {
 *      "data": [{
 *        "action_source": "system_generated",
 *        "custom_data": { "event_source": "crm", "lead_event_source": "Your CRM" },
 *        "event_name": "Lead",
 *        "event_time": 1673035686,
 *        "user_data": {
 *          "em": ["...sha256..."],
 *          "lead_id": 1234567890123456,
 *          "ph": ["...sha256..."]
 *        }
 *      }]
 *    }
 *
 * 2. Or simplified parameters for automatic SHA-256 normalization:
 *    {
 *      "email": "user@example.com",
 *      "phone": "+919876543210",
 *      "lead_id": 1234567890123456,
 *      "action_source": "system_generated",
 *      "lead_event_source": "Your CRM"
 *    }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let payload: MetaCapiPayload;

    if (body && Array.isArray(body.data)) {
      // Direct raw Meta CAPI format as provided by the user
      payload = body as MetaCapiPayload;
    } else if (body && (body.email || body.phone || body.lead_id || body.leadId)) {
      // Convenient auto-normalizing input
      payload = buildMetaLeadEventPayload({
        email: body.email,
        phone: body.phone,
        leadId: body.lead_id || body.leadId,
        eventTime: body.event_time || body.eventTime,
        actionSource: body.action_source || body.actionSource || 'system_generated',
        eventSource: body.event_source || body.custom_data?.event_source || 'crm',
        leadEventSource: body.lead_event_source || body.custom_data?.lead_event_source || 'Your CRM',
        customData: body.custom_data || {},
        testEventCode: body.test_event_code,
      });
    } else {
      return NextResponse.json(
        {
          error: 'Invalid payload. Expected either raw { data: [...] } or { email, phone, lead_id }',
        },
        { status: 400 }
      );
    }

    const response = await sendMetaConversionsApiEvent(payload);

    return NextResponse.json({
      success: response.success,
      delivered_to_meta: response.success,
      meta_response: response.result || null,
      error: response.error || null,
      sent_payload: payload,
    });
  } catch (error: any) {
    console.error('[API /api/meta/conversion] Error processing event:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing Meta conversion event.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Gravity For AI - Meta Conversions API (CAPI) Ingestion Endpoint',
    description: 'Direct server-side event tracking for CRM leads and system-generated events.',
    expected_format: {
      data: [
        {
          action_source: 'system_generated',
          custom_data: {
            event_source: 'crm',
            lead_event_source: 'Your CRM',
          },
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            em: ['7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068'],
            lead_id: 1234567890123456,
            ph: ['6069d14bf122fdfd931dc7beb58e5dfbba395b1faf05bdcd42d12358d63d8599'],
          },
        },
      ],
    },
  });
}
