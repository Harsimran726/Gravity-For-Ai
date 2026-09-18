export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2111062089501666';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Fires standard Meta Pixel PageView
 */
export function trackMetaPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

/**
 * Fires Meta Pixel Lead conversion event
 */
export function trackMetaLead(
  data?: {
    content_name?: string;
    value?: number;
    currency?: string;
  },
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.fbq) {
    const payload = {
      content_name: data?.content_name || 'AI Call Agent Inquiry',
      currency: data?.currency || 'INR',
      ...(data?.value ? { value: data.value } : {}),
    };
    if (eventId) {
      window.fbq('track', 'Lead', payload, { eventID: eventId });
    } else {
      window.fbq('track', 'Lead', payload);
    }
  }
}

/**
 * Fires custom Meta Pixel event
 */
export function trackMetaCustomEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params || {});
  }
}
