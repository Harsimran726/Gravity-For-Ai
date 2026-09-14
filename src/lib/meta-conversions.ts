import crypto from 'crypto';

export interface MetaCapiUserData {
  em?: string[]; // SHA256 hashed emails
  ph?: string[]; // SHA256 hashed phone numbers
  lead_id?: number | string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
}

export interface MetaCapiCustomData {
  event_source?: string;
  lead_event_source?: string;
  content_name?: string;
  currency?: string;
  value?: number;
  [key: string]: any;
}

export interface MetaCapiEventItem {
  action_source: 'system_generated' | 'website' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'other';
  custom_data?: MetaCapiCustomData;
  event_name: string;
  event_time: number;
  user_data: MetaCapiUserData;
  event_source_url?: string;
}

export interface MetaCapiPayload {
  data: MetaCapiEventItem[];
  test_event_code?: string;
}

/**
 * SHA-256 hash helper required by Meta Conversions API
 */
export function hashSha256(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  // If already SHA-256 (64 hex characters), return as-is
  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return crypto.createHash('sha256').update(trimmed.toLowerCase()).digest('hex');
}

/**
 * Normalizes email according to Meta specification:
 * - lowercase
 * - trimmed of whitespace
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone number according to Meta specification:
 * - remove non-digit characters (+, spaces, dashes, brackets)
 * - remove leading zeros
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/^0+/, '');
}

/**
 * Converts a CUID or string ID into a consistent numeric or preserved lead_id
 */
export function formatLeadId(id: string | number): number | string {
  if (typeof id === 'number') return id;
  if (/^\d+$/.test(id)) {
    const num = parseInt(id, 10);
    if (!isNaN(num) && num <= Number.MAX_SAFE_INTEGER) return num;
  }
  return id;
}

export interface CreateMetaLeadEventOptions {
  email?: string;
  phone?: string;
  leadId?: number | string;
  eventTime?: number;
  actionSource?: 'system_generated' | 'website';
  eventSource?: string;
  leadEventSource?: string;
  customData?: Record<string, any>;
  testEventCode?: string;
}

/**
 * Constructs the exact Meta Conversions API JSON payload:
 * {
 *   "data": [
 *     {
 *       "action_source": "system_generated",
 *       "custom_data": {
 *         "event_source": "crm",
 *         "lead_event_source": "Gravity For AI CRM"
 *       },
 *       "event_name": "Lead",
 *       "event_time": 1673035686,
 *       "user_data": {
 *         "em": ["7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068"],
 *         "lead_id": 1234567890123456,
 *         "ph": ["6069d14bf122fdfd931dc7beb58e5dfbba395b1faf05bdcd42d12358d63d8599"]
 *       }
 *     }
 *   ]
 * }
 */
export function buildMetaLeadEventPayload(options: CreateMetaLeadEventOptions): MetaCapiPayload {
  const userData: MetaCapiUserData = {};

  if (options.email && options.email.trim().length > 0) {
    const normalized = normalizeEmail(options.email);
    userData.em = [hashSha256(normalized)];
  }

  if (options.phone && options.phone.trim().length > 0) {
    const normalized = normalizePhone(options.phone);
    if (normalized.length > 0) {
      userData.ph = [hashSha256(normalized)];
    }
  }

  if (options.leadId !== undefined && options.leadId !== null) {
    userData.lead_id = formatLeadId(options.leadId);
  }

  const eventTime = options.eventTime || Math.floor(Date.now() / 1000);

  const payload: MetaCapiPayload = {
    data: [
      {
        action_source: options.actionSource || 'system_generated',
        custom_data: {
          event_source: options.eventSource || 'crm',
          lead_event_source: options.leadEventSource || 'Gravity For AI CRM',
          ...(options.customData || {}),
        },
        event_name: 'Lead',
        event_time: eventTime,
        user_data: userData,
      },
    ],
  };

  const testCode = options.testEventCode || process.env.META_TEST_EVENT_CODE;
  if (testCode && testCode.trim().length > 0) {
    payload.test_event_code = testCode.trim();
  }

  return payload;
}

/**
 * Dispatches a Meta Conversions API event to Meta's Graph API
 */
export async function sendMetaConversionsApiEvent(payload: MetaCapiPayload): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.info(
      '[META CAPI] Pixel ID or Conversions API Token not yet configured in environment variables. Event skipped.',
      {
        pixelIdConfigured: Boolean(pixelId),
        tokenConfigured: Boolean(accessToken),
        eventsCount: payload.data?.length || 0,
      }
    );
    return {
      success: false,
      error: 'NEXT_PUBLIC_META_PIXEL_ID or META_CONVERSIONS_API_TOKEN not configured.',
    };
  }

  const graphApiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';
  const url = `https://graph.facebook.com/${graphApiVersion}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[META CAPI] Meta Conversions API returned error response:', data);
      return {
        success: false,
        error: data.error?.message || 'Meta API returned non-200 status',
        result: data,
      };
    }

    console.info('[META CAPI] Lead conversion event successfully delivered to Meta:', {
      events_received: data.events_received,
      fbtrace_id: data.fbtrace_id,
    });

    return {
      success: true,
      result: data,
    };
  } catch (err: any) {
    console.error('[META CAPI] Network dispatch failure sending event to Meta:', err);
    return {
      success: false,
      error: err.message || 'Unknown network error',
    };
  }
}
