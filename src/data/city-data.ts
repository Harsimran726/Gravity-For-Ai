export interface CityData {
  citySlug: string;
  cityName: string;
  region: string;
  country?: string;
  isHQ?: boolean;
  title: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  localDifferentiator: string;
  stakes: {
    tag: string;
    title: string;
    description: string;
  }[];
  valuePropParagraph: string;
  testimonial: {
    name: string;
    role: string;
    quote: string;
  };
}

export const CITIES_DATA: Record<string, CityData> = {
  // ==========================================
  // INDIA - PUNJAB & TRICITY
  // ==========================================
  mansa: {
    citySlug: 'mansa',
    cityName: 'Mansa',
    region: 'Punjab',
    country: 'India',
    isHQ: true,
    title: 'AI Voice Agents, Automation & Websites in Mansa, Punjab',
    metaDescription:
      'Gravity For AI is based in Mansa, Punjab. We build AI voice receptionists, custom business websites, and agentic automation for local Mansa businesses. Book an AI audit.',
    heroHeadline: "Mansa's AI Automation & Website Partner",
    heroSubheadline:
      'Built and managed right here in Mansa - no outsourced account managers, no generic scripts, and direct engineering access.',
    localDifferentiator:
      'As a Mansa-based engineering team, we understand this local market directly - because we live and work in it.',
    stakes: [
      {
        tag: '01 / MISSED INQUIRIES',
        title: 'Local Clinic & Shop Missed Calls',
        description:
          'When patients or customers call your clinic or business after 7 PM, an unanswered call is someone visiting another local business.',
      },
      {
        tag: '02 / UNNECESSARY OVERHEAD',
        title: 'Hiring Extra Staff for Basic Admin',
        description:
          'You do not need more full-time staff just to answer repetitive questions and copy numbers into ledgers - automation handles this 24/7.',
      },
    ],
    valuePropParagraph:
      'Gravity For AI designs, builds, and manages AI voice agents, agentic automation, and websites for businesses in Mansa. We understand the pressure of running a business without a local technical team, and we build systems that work quietly in the background.',
    testimonial: {
      name: 'Dr. Raman K.',
      role: 'Clinic Founder, Mansa',
      quote:
        'Having our AI engineering partner based right here in Mansa made all the difference. Our voice agent answers calls fluently in Punjabi and English.',
    },
  },

  bathinda: {
    citySlug: 'bathinda',
    cityName: 'Bathinda',
    region: 'Punjab',
    country: 'India',
    title: 'AI Voice Agents & Automation for Bathinda Businesses',
    metaDescription:
      'Gravity For AI provides AI voice agents, custom websites, and agentic workflows for clinics, logistics, and businesses in Bathinda, Punjab.',
    heroHeadline: "Bathinda's AI Voice Agent & Website Specialist",
    heroSubheadline:
      'Turn missed calls into booked clients and automate repetitive operations for your Bathinda business.',
    localDifferentiator:
      'Serving medical practices, industrial suppliers, and service businesses across Bathinda with bespoke AI systems.',
    stakes: [
      {
        tag: '01 / CALL VOLUME',
        title: 'Overwhelmed Front Desks & Dispatchers',
        description:
          'During peak business hours in Bathinda, lines get busy and high-value customer inquiries get lost in the noise.',
      },
      {
        tag: '02 / MANUAL PROCESSES',
        title: 'Repetitive Order & Appointment Tracking',
        description:
          'Hours wasted manually logging inquiries and confirming appointments can be reclaimed with automated pipelines.',
      },
    ],
    valuePropParagraph:
      'Gravity For AI delivers done-for-you AI voice agents and conversion-focused websites for growing businesses in Bathinda, ensuring your operations scale smoothly without administrative chaos.',
    testimonial: {
      name: 'Gurpreet S.',
      role: 'Operations Director, Bathinda',
      quote:
        'Gravity automated our dispatch communication and customer intake. We run smoother than ever with zero missed calls.',
    },
  },

  chandigarh: {
    citySlug: 'chandigarh',
    cityName: 'Chandigarh',
    region: 'Punjab & Chandigarh Tricity',
    country: 'India',
    title: 'Done-For-You AI Voice Agents & Agentic Systems in Chandigarh Tricity',
    metaDescription:
      'Done-for-you AI voice agents and custom agentic systems for businesses in Chandigarh, Mohali, and Panchkula. No DIY platforms - built and managed for you.',
    heroHeadline: "Chandigarh's Done-For-You AI Engineering Partner",
    heroSubheadline:
      'Not a generic DIY platform you have to configure yourself - custom AI voice agents and agentic pipelines built and managed end-to-end.',
    localDifferentiator:
      'Unlike generic templates and unmanaged tools in the Tricity, we take total ownership of your automation pipeline.',
    stakes: [
      {
        tag: '01 / DIY PLATFORM FATIGUE',
        title: 'Tools That Require You to Become an Engineer',
        description:
          'Most AI agencies hand you a complex software subscription. We design, script, connect, and manage the system for you.',
      },
      {
        tag: '02 / VENDOR DISCONNECT',
        title: 'Disconnected Agencies and Freelancers',
        description:
          'Get voice agents, modern websites, and workflow automation under a single, unified architectural standard.',
      },
    ],
    valuePropParagraph:
      'Gravity For AI builds enterprise-grade agentic AI systems and voice agents for Chandigarh, Mohali, and Panchkula companies ready to reclaim operational time without tech overhead.',
    testimonial: {
      name: 'Simranjeet S.',
      role: 'Agency Partner, Chandigarh',
      quote:
        'Gravity done-for-you model is what sets them apart. They delivered a fully functional voice agent and custom intake system in under two weeks.',
    },
  },


  ludhiana: {
    citySlug: 'ludhiana',
    cityName: 'Ludhiana',
    region: 'Punjab',
    country: 'India',
    title: 'AI Voice Agents & Industrial Automation in Ludhiana, Punjab',
    metaDescription:
      'Custom AI voice receptionists, B2B websites, and agentic back-office automation for Ludhiana industrial and commercial firms.',
    heroHeadline: "Ludhiana's AI Voice & Workflow Automation Engineers",
    heroSubheadline:
      'Built for Punjab commercial powerhouse. We automate customer intake, wholesale inquiries, and repetitive data workflows.',
    localDifferentiator:
      'Deep architectural focus on B2B order pipelines, industrial supplier triage, and multi-step operational tasks.',
    stakes: [
      {
        tag: '01 / OPERATIONAL FRICTION',
        title: 'Paperwork & Manual Data Transfer',
        description:
          'Copying inquiries between WhatsApp, phone calls, spreadsheets, and accounting software drains daily productivity.',
      },
      {
        tag: '02 / INBOUND BOTTLENECK',
        title: 'Missed Commercial Opportunities',
        description:
          'In a fast-moving market like Ludhiana, failing to answer wholesale or client calls promptly sends business to competitors.',
      },
    ],
    valuePropParagraph:
      'We engineer autonomous multi-agent pipelines and 24/7 AI voice receptionists for Ludhiana manufacturers, trading houses, and service providers who need serious, reliable automation.',
    testimonial: {
      name: 'Amanpreet M.',
      role: 'Managing Partner, Ludhiana',
      quote:
        'Our new website and intake automation represent our brand with authority. Inquiries flow directly into our systems.',
    },
  },

  // ==========================================
  // INDIA - DELHI
  // ==========================================
  delhi: {
    citySlug: 'delhi',
    cityName: 'Delhi',
    region: 'National Capital Territory',
    country: 'India',
    title: 'AI Voice Agents & Custom Agentic AI in Delhi, NCR',
    metaDescription:
      'Enterprise-grade AI voice receptionists, Next.js conversion websites, and autonomous workflow pipelines for Delhi businesses and consultancies.',
    heroHeadline: "Delhi's Premier AI Voice & Web Engineering Agency",
    heroSubheadline:
      'Done-for-you AI phone agents that never miss a lead and custom websites engineered for rapid search rankings and high conversion.',
    localDifferentiator:
      'High-throughput AI voice pipelines and zero-latency web engineering designed for Delhi intensely competitive commercial ecosystem.',
    stakes: [
      {
        tag: '01 / FIERCE COMPETITION',
        title: 'Lost Leads to Faster Responders',
        description:
          'In Delhi, customers reach out to 3 to 4 providers simultaneously. The business that answers immediately wins the client.',
      },
      {
        tag: '02 / ESCALATING PAYROLL',
        title: 'High Costs for 24/7 Front-Desk Shifts',
        description:
          'Maintaining round-the-clock telephone and chat reception in Delhi places an unsustainable strain on operating margins.',
      },
    ],
    valuePropParagraph:
      'Gravity For AI builds and manages custom AI voice agents and agentic automation for Delhi enterprises, delivering 24/7 responsiveness with zero hold queues and instant calendar bookings.',
    testimonial: {
      name: 'Vikramaditya S.',
      role: 'Consultancy Principal, Delhi',
      quote:
        'Gravity deployed our voice agent in under ten days. Our inquiry-to-consultation rate jumped by 42% in month one.',
    },
  },

};
