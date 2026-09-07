export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  location: string;
  summary: string;
  challenge: string;
  solution: string;
  metrics: {
    label: string;
    value: string;
  }[];
  architecturePoints: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'mansa-clinic-ai-receptionist',
    title: 'How a Mansa Healthcare Clinic Captured 40+ Additional Patient Bookings Monthly with 24/7 AI Voice Answering',
    client: 'Regional Dental & Surgical Practice',
    industry: 'Healthcare / Clinical Practice',
    location: 'Mansa, Punjab',
    summary:
      'Replacing missed after-hours calls with a trilingual neural AI receptionist that qualifies patient needs and books appointments directly into clinic management calendars.',
    challenge:
      'The clinic received substantial call traffic after 6:30 PM from working patients. With no staff on duty, callers routinely booked with competing practices in the morning. Hiring full-time evening receptionists was cost-prohibitive and difficult to staff reliably.',
    solution:
      'Gravity For AI engineered a custom AI voice agent trained on clinic service guidelines, consultation fee schedules, and calendar rules. Operating 24/7 in Punjabi, Hindi, and English, the agent answers calls on the first ring, collects patient details, and syncs directly with calendar software.',
    metrics: [
      { label: 'After-Hours Calls Answered', value: '100%' },
      { label: 'Additional Monthly Bookings', value: '+42' },
      { label: 'Patient Satisfaction', value: '98%' },
      { label: 'Reception Overhead Saved', value: '₹35,000/mo' },
    ],
    architecturePoints: [
      'Low-latency WebRTC and telephony routing with instant fallback',
      'Context-aware intent classification in Punjabi, Hindi, and English',
      'Real-time Google Calendar and custom EHR webhook synchronization',
      'Automatic SMS confirmations sent to patients immediately upon booking',
    ],
  },
  {
    slug: 'bathinda-logistics-dispatch-automation',
    title: 'Eliminating 15 Hours of Weekly Dispatch Chaos for a Bathinda Logistics Fleet with Agentic AI',
    client: 'Northern Freight & Dispatch Co.',
    industry: 'Transportation & Logistics',
    location: 'Bathinda, Punjab',
    summary:
      'Deploying an agentic AI pipeline to automatically parse WhatsApp freight requests, verify driver schedules, calculate rates, and sync dispatch spreadsheets without manual data entry.',
    challenge:
      'Dispatch coordinators spent 3 to 4 hours daily copying shipment inquiries from WhatsApp groups into Excel sheets, cross-checking driver availability, and calculating route rates. Typos and delayed responses caused missed loads during busy harvest seasons.',
    solution:
      'We built an agentic multi-step pipeline. When a freight inquiry arrives via WhatsApp Business API, an intake agent extracts route and cargo parameters, a scheduling agent cross-references available fleet GPS locations, and a validation agent drafts an approved rate quotation for team review.',
    metrics: [
      { label: 'Weekly Hours Saved', value: '18 Hours' },
      { label: 'Quote Turnaround Time', value: '< 2 Mins' },
      { label: 'Dispatch Error Rate', value: '0.0%' },
      { label: 'Fleet Utilization', value: '+24%' },
    ],
    architecturePoints: [
      'WhatsApp Business Cloud API integration with webhook event listeners',
      'Structured entity extraction with strict schema validation guardrails',
      'PostgreSQL fleet location and availability state store',
      'Human-in-the-loop approval interface for high-value custom cargo routes',
    ],
  },
  {
    slug: 'ludhiana-exporter-conversion-platform',
    title: 'Transforming an Outdated Manufacturer Brochure into a Sub-2s Global Inquiry Engine',
    client: 'Apex Industrial Fasteners',
    industry: 'Manufacturing & Export',
    location: 'Ludhiana, Punjab',
    summary:
      'Rebuilding an 8-year-old WordPress website on Next.js 14 with StoryBrand persuasion architecture, sub-2s mobile loading, and direct international inquiry triage.',
    challenge:
      'The company had high-quality manufacturing capability but an outdated website taking 6+ seconds to load on mobile. International and domestic buyers abandoned the site before finding spec sheets, resulting in under 3 inquiries a month.',
    solution:
      'Gravity For AI engineered a bespoke Next.js website following our 7-step StoryBrand framework, optimized with AVIF media, structured product catalogs, and an interactive RFQ (Request for Quote) system with instant WhatsApp and email notifications.',
    metrics: [
      { label: 'Mobile LCP Load Time', value: '1.2s' },
      { label: 'Qualified Inquiries', value: '3.8x Increase' },
      { label: 'Core Web Vitals', value: '100 / 100' },
      { label: 'International RFQ Leads', value: '+14 / Mo' },
    ],
    architecturePoints: [
      'Next.js 14 App Router with Server-Side Rendering and Edge CDN caching',
      'Tailwind CSS design token system matching luxury industrial aesthetics',
      'JSON-LD Product, Organization, and LocalBusiness structured data',
      'Instant lead dispatch via Resend email and WhatsApp webhook integrations',
    ],
  },
];
