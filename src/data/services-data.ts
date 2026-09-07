export interface ServiceData {
  slug: string;
  serviceType: string;
  title: string;
  metaDescription: string;
  hero: {
    badge: string;
    h1: string;
    subheadline: string;
  };
  stakes: {
    h2: string;
    items: {
      tag: string;
      title: string;
      description: string;
    }[];
  };
  valueProp: {
    h2: string;
    geoParagraph: string;
    pillars: {
      title: string;
      description: string;
    }[];
  };
  guide: {
    stats: {
      value: string;
      label: string;
      detail: string;
    }[];
    testimonial: {
      name: string;
      role: string;
      city: string;
      quote: string;
    };
  };
  plan: {
    h2: string;
    steps: {
      num: string;
      title: string;
      description: string;
    }[];
  };
  explainer?: {
    h2: string;
    paragraph: string;
    details: string;
  };
  pricing: {
    h2: string;
    description: string;
    tiers: {
      name: string;
      price: string;
      popular?: boolean;
      features: string[];
    }[];
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const SERVICES_DATA: Record<string, ServiceData> = {
  'ai-voice-agents': {
    slug: 'ai-voice-agents',
    serviceType: 'AI Voice Agent Development',
    title: 'AI Voice Agent for Local Business - Never Miss a Call | Gravity For AI',
    metaDescription:
      'Gravity For AI builds AI voice agents that answer calls, qualify leads, and book appointments 24/7 for local businesses in English, Hindi, and Punjabi.',
    hero: {
      badge: 'Voice Answering & Qualification',
      h1: 'Never Miss Another Call - Your AI Receptionist Works 24/7',
      subheadline:
        'Answers instantly, qualifies leads, and books appointments directly into your calendar - in natural English, Hindi, or Punjabi.',
    },
    stakes: {
      h2: 'Unanswered Calls Are Quietly Draining Your Revenue',
      items: [
        {
          tag: '01 / LOST OPPORTUNITY',
          title: '40%+ After-Hours Call Loss',
          description:
            'Over 40% of inbound calls to local businesses occur after operating hours. Every unanswered ring is a prospective client calling your competitor next.',
        },
        {
          tag: '02 / FIXED OVERHEAD',
          title: 'High Receptionist Overhead',
          description:
            'A full-time front-desk salary only covers 8 hours a day, requires sick leave, and still experiences busy-signal bottlenecks during peak times.',
        },
        {
          tag: '03 / CALENDAR NO-SHOWS',
          title: 'Missed Appointments = Lost Cashflow',
          description:
            'Without instant booking and automated SMS confirmations, inquiry interest cools down and booking rates plummet.',
        },
      ],
    },
    valueProp: {
      h2: 'Done-For-You Call Handling, Engineered for Local Business',
      geoParagraph:
        'Gravity For AI builds AI voice agents that answer every call instantly, understand what the caller needs, and book the appointment - without you lifting a finger. We know how much a single missed call can cost a local business, which is exactly why we built this.',
      pillars: [
        {
          title: 'Instant Pick-Up & Triage',
          description: 'Zero hold times. Handles unlimited simultaneous calls during busy hours with zero hold queues.',
        },
        {
          title: 'Trilingual Fluency',
          description: 'Fluid, natural conversation in Punjabi, Hindi, and English with regional dialect sensitivity.',
        },
        {
          title: 'Direct Calendar Sync',
          description: 'Checks real-time slot availability and books appointments directly into your CRM or Google Calendar.',
        },
      ],
    },
    guide: {
      stats: [
        { value: '24/7', label: 'Availability', detail: 'Zero missed evening calls' },
        { value: '∞', label: 'Concurrent Lines', detail: 'No busy signals ever' },
        { value: '3', label: 'Languages', detail: 'Punjabi, Hindi, English' },
        { value: '< 1s', label: 'Voice Latency', detail: 'Natural human cadence' },
      ],
      testimonial: {
        name: 'Dr. Raman K.',
        role: 'Dental Clinic Director',
        city: 'Mansa, Punjab',
        quote:
          'Our front desk used to miss 5-8 patient inquiries every weekend. Since launching our AI voice agent, those calls turn directly into confirmed appointments on Monday morning.',
      },
    },
    plan: {
      h2: '3 Steps to Your Live AI Receptionist',
      steps: [
        {
          num: '01',
          title: 'Book an Audit',
          description: 'We review your call volume, recurring customer questions, and calendar setup in a 20-minute call.',
        },
        {
          num: '02',
          title: 'Custom Script & Training',
          description: 'We script, train, and integrate your voice agent with your live phone numbers and booking software.',
        },
        {
          num: '03',
          title: 'Go Live',
          description: 'Your phone line starts getting answered 24/7 the same week, with instant call logs sent to your team.',
        },
      ],
    },
    explainer: {
      h2: 'How the Voice Agent Sounds & Works',
      paragraph:
        'Your AI voice agent listens to what the caller says, understands the intent (booking, question, emergency, or complaint), checks your calendar in real time, and either books the slot or takes a detailed message - handing off to you only when it genuinely needs to.',
      details:
        'It speaks with natural pauses, polite phrasing, and regional cadence. Callers get immediate answers without feeling stuck in a frustrating mechanical menu.',
    },
    pricing: {
      h2: 'Simple Monthly Call Volume Tiers',
      description: 'Transparent monthly management with zero long-term lock-in.',
      tiers: [
        {
          name: 'Essential Receptionist',
          price: 'Starter Plan',
          features: [
            'Dedicated AI phone number',
            'Up to 300 minutes included / mo',
            'Calendar & booking integration',
            'English, Hindi & Punjabi support',
            'Daily call transcripts & alerts',
          ],
        },
        {
          name: 'Growth High-Volume',
          price: 'Growth Plan',
          popular: true,
          features: [
            'Up to 1,000 minutes included / mo',
            'Custom CRM & WhatsApp webhooks',
            'Live transfer to staff for VIP callers',
            'Priority voice latency tuning',
            'Weekly conversation optimization',
          ],
        },
        {
          name: 'Custom Enterprise',
          price: 'Custom Quote',
          features: [
            'Unlimited multi-line concurrent routing',
            'Custom EHR / ERP database lookup',
            'Bespoke voice cloning & training',
            'Dedicated account engineer',
            '99.9% uptime SLA',
          ],
        },
      ],
    },
    faqs: [
      {
        question: 'Will it sound robotic to my customers?',
        answer:
          'Not at all. We use low-latency neural voice synthesis with natural breathing, conversational pauses, and polite phrasing tailored for Indian and international callers.',
      },
      {
        question: 'Can it handle Punjabi, Hindi, and English in the same call?',
        answer:
          'Yes. The agent detects the language your caller speaks and responds seamlessly in that same language or dialect.',
      },
      {
        question: 'What happens if a caller asks something unexpected?',
        answer:
          'If a caller asks a complex question outside the trained parameters, the agent politely offers to route the call to your mobile or logs a detailed note for follow-up.',
      },
      {
        question: 'How is this different from tools like Vapi or Bolna?',
        answer:
          'Vapi and Bolna are developer platforms where you have to build, code, host, and debug the system yourself. Gravity For AI provides a complete, managed, done-for-you service.',
      },
    ],
  },

  'website-development': {
    slug: 'website-development',
    serviceType: 'Website Development',
    title: 'Website Development for Local & Premium Businesses | Gravity For AI',
    metaDescription:
      'Fast, modern, conversion-focused websites built by Gravity For AI for local and premium businesses. Engineered for sub-2s load speed and lead capture.',
    hero: {
      badge: 'High-Performance Web Engineering',
      h1: 'A Website That Actually Brings In Customers - Not Just Looks Good',
      subheadline:
        'Fast, mobile-first, conversion-engineered websites built to turn local Google searches into real discovery calls and revenue.',
    },
    stakes: {
      h2: 'Why Most Business Websites Fail to Generate Inquiries',
      items: [
        {
          tag: '01 / BOUNCE RATE',
          title: 'Slow Load Speeds Kill Traffic',
          description:
            'If your website takes more than 3 seconds to load on mobile, over 50% of visitors leave before seeing what you offer.',
        },
        {
          tag: '02 / BROCHUREWARE',
          title: 'Zero Conversion Architecture',
          description:
            'A website that just acts as an online brochure does not generate leads - it needs clear StoryBrand narrative hooks and friction-free CTAs.',
        },
        {
          tag: '03 / TEMPLATE FATIGUE',
          title: 'Generic Templates Build Zero Trust',
          description:
            'WordPress templates that thousands of other businesses use tell prospective clients that your service is interchangeable.',
        },
      ],
    },
    valueProp: {
      h2: 'Conversion-Engineered Architecture, 100% Custom',
      geoParagraph:
        'Gravity For AI designs and builds custom websites engineered to convert - fast load times, clear calls to action, and a design that actually reflects your business, not a template thousands of other businesses use.',
      pillars: [
        {
          title: 'Sub-2s Core Web Vitals',
          description: 'Built with Next.js 14 server components for instant page loads and high search engine ranking.',
        },
        {
          title: 'StoryBrand Persuasion Flow',
          description: 'Structured using our 7-step narrative framework to guide visitors from problem to booking.',
        },
        {
          title: 'Built-in SEO & GEO Schema',
          description: 'Injected LocalBusiness, Service, and FAQ schemas to dominate both Google Search and AI answer engines.',
        },
      ],
    },
    guide: {
      stats: [
        { value: '< 1.8s', label: 'Avg Mobile LCP', detail: 'Blazing fast load times' },
        { value: '100%', label: 'Custom Code', detail: 'Zero generic templates' },
        { value: '100/100', label: 'SEO Score', detail: 'Engineered for Google' },
        { value: 'AA', label: 'WCAG Accessibility', detail: 'Accessible to all users' },
      ],
      testimonial: {
        name: 'Amanpreet M.',
        role: 'Managing Partner',
        city: 'Ludhiana, Punjab',
        quote:
          'Our previous website took 6 seconds to open on phones. Gravity rebuilt our entire site on Next.js - our mobile inquiry rate doubled within the first month.',
      },
    },
    plan: {
      h2: '3 Steps to Your High-Converting Website',
      steps: [
        {
          num: '01',
          title: 'Strategy & Wireframe',
          description: 'We learn your business, target customers, and map the 7-step conversion narrative.',
        },
        {
          num: '02',
          title: 'Design & Engineering',
          description: 'We build your custom responsive site with Next.js, Tailwind, and local SEO schema.',
        },
        {
          num: '03',
          title: 'Launch & Measure',
          description: 'We test across devices, connect analytics, and deploy to global edge CDN caching.',
        },
      ],
    },
    pricing: {
      h2: 'Transparent Website Packages',
      description: 'Clear deliverables with full code ownership upon delivery.',
      tiers: [
        {
          name: 'Starter One-Page',
          price: 'Landing Page Tier',
          features: [
            'Single-page full 7-step StoryBrand layout',
            'Mobile-first responsive styling',
            'Direct booking / contact form integration',
            'Sub-2s Core Web Vitals performance',
            'Local SEO & JSON-LD schema',
          ],
        },
        {
          name: 'Business Multi-Page',
          price: 'Full Site Tier',
          popular: true,
          features: [
            '5-8 custom pages (Home, Services, About, Contact)',
            'Integrated blog / case studies engine',
            'Lead capture with auto-email notifications',
            'Advanced GEO & AEO search schemas',
            '60 days post-launch support & tuning',
          ],
        },
        {
          name: 'Premium Bespoke',
          price: 'Custom Platform',
          features: [
            'Custom database integrations & portals',
            'AI Voice Agent / Chatbot embedded',
            'Custom CRM workflows & APIs',
            'Ongoing monthly maintenance retainer',
            'Dedicated technical partner SLA',
          ],
        },
      ],
    },
    faqs: [
      {
        question: 'How long does it take to build and launch?',
        answer:
          'Most business websites are designed, developed, reviewed, and launched in 2 to 3 weeks.',
      },
      {
        question: 'Do I own the website after launch?',
        answer:
          'Yes, 100%. You own the complete source code, domain, and content without any vendor lock-in.',
      },
      {
        question: 'Will my website rank on Google in my city?',
        answer:
          'Yes. We build all pages with semantic HTML, local NAP schema, fast Core Web Vitals, and localized keywords specifically engineered for regional rankings.',
      },
    ],
  },

  'agentic-ai-systems': {
    slug: 'agentic-ai-systems',
    serviceType: 'Agentic AI System Development',
    title: 'Agentic AI Systems for Business Automation | Gravity For AI',
    metaDescription:
      'Gravity For AI designs agentic AI systems that automate multi-step business workflows end-to-end. Reclaim 20+ hours a week in back-office operations.',
    hero: {
      badge: 'Autonomous Workflow Automation',
      h1: 'AI That Doesn’t Just Answer - It Gets the Work Done',
      subheadline:
        'Custom autonomous AI agent pipelines that handle your multi-step back-office operations end-to-end, quietly in the background.',
    },
    stakes: {
      h2: 'Why Simple Chatbots Don’t Solve Real Business Bottlenecks',
      items: [
        {
          tag: '01 / FRAGMENTATION',
          title: 'Disconnected Operational Tools',
          description:
            'Your business uses emails, spreadsheets, CRMs, and messaging apps - and your staff spends hours manually copy-pasting data between them.',
        },
        {
          tag: '02 / SINGLE-STEP LIMITS',
          title: 'Basic Bots Stop at One Step',
          description:
            'Simple AI tools can answer a query, but they cannot verify a document, cross-check database records, and update your inventory in sequence.',
        },
        {
          tag: '03 / SCALING CEILING',
          title: 'Hiring to Handle Repetitive Admin',
          description:
            'As order volume or inquiries grow, business owners are forced to hire more admin staff rather than scaling cleanly with software.',
        },
      ],
    },
    valueProp: {
      h2: 'Multi-Step Coordinated AI Pipelines',
      geoParagraph:
        'Gravity For AI designs agentic AI systems - coordinated AI agents that carry out an entire workflow end to end, not just a single response. We map how your business actually operates, then build the system around it - not the other way around.',
      pillars: [
        {
          title: 'Multi-Agent Collaboration',
          description: 'Specialized agents that read, decide, verify, and execute tasks in disciplined sequential or parallel workflows.',
        },
        {
          title: 'Human-in-the-Loop Safeguards',
          description: 'Autonomous execution on standard tasks, with automatic escalation to your team whenever high-stakes decisions occur.',
        },
        {
          title: 'Custom API & DB Integration',
          description: 'Connects directly with your existing PostgreSQL databases, WhatsApp Business APIs, calendars, and ERPs.',
        },
      ],
    },
    guide: {
      stats: [
        { value: '20+ hrs', label: 'Saved Weekly', detail: 'Per deployed workflow' },
        { value: '0%', label: 'Copy-Paste Errors', detail: 'Automated data precision' },
        { value: '100%', label: 'Custom Scoped', detail: 'Tailored to your exact flow' },
        { value: '24/7', label: 'Continuous Execution', detail: 'Tasks run overnight' },
      ],
      testimonial: {
        name: 'Gurpreet S.',
        role: 'Operations Director',
        city: 'Bathinda, Punjab',
        quote:
          'We used to spend 3 hours every morning reconciling inventory dispatches and WhatsApp order notes. Gravity built an agentic pipeline that handles this automatically with zero discrepancies.',
      },
    },
    plan: {
      h2: '3 Steps to Autonomous Workflows',
      steps: [
        {
          num: '01',
          title: 'Workflow Mapping Audit',
          description: 'We analyze your current manual operational process, step by step, identifying where time and accuracy leak.',
        },
        {
          num: '02',
          title: 'Architecture & Agent Build',
          description: 'We construct the agent orchestration pipeline, integrate your databases, and establish strict validation guardrails.',
        },
        {
          num: '03',
          title: 'Deployment & Monitoring',
          description: 'We roll out the system in shadow mode, verify accuracy, switch to live execution, and continuously monitor telemetry.',
        },
      ],
    },
    explainer: {
      h2: 'What Is an Agentic AI System?',
      paragraph:
        'An agentic AI system is a set of AI agents working together to complete a task fully - for example, reading an inquiry, checking availability, drafting a response, and updating your records, all without a human doing each step manually.',
      details:
        'It is the difference between a tool that answers a question and a system that finishes the entire job.',
    },
    pricing: {
      h2: 'Custom-Scoped Engineering',
      description:
        'Every agentic system is architected around your exact operational workflows. We provide a transparent, fixed-scope quote after your initial audit call.',
      tiers: [
        {
          name: 'Workflow Sprint',
          price: 'Fixed Scope Quote',
          features: [
            'Single high-friction operational workflow automated',
            'Full database & notification integration',
            'Validation & error-handling guardrails',
            'Staff training and documentation',
            '30 days post-launch tuning & monitoring',
          ],
        },
        {
          name: 'Multi-Pipeline Suite',
          price: 'Custom Scope',
          popular: true,
          features: [
            'Multiple coordinated agent pipelines',
            'Custom internal admin dashboards',
            'Live WhatsApp & phone voice integration',
            'Human-in-the-loop review interfaces',
            'Ongoing quarterly enhancements & SLA',
          ],
        },
      ],
    },
    faqs: [
      {
        question: 'What is agentic AI and how is it different from a chatbot?',
        answer:
          'A chatbot only responds with text when spoken to. An agentic AI system has agency: it can use tools, query databases, execute multi-step logic, handle edge cases, and complete tasks from start to finish without continuous human prompting.',
      },
      {
        question: 'Is our business data safe and private?',
        answer:
          'Yes. We build with strict data isolation, encryption in transit and at rest, and never use your private business data to train public models.',
      },
      {
        question: 'What happens if an agent encounters an unknown situation?',
        answer:
          'Every agentic pipeline is built with confidence thresholds and graceful fallback mechanisms. If an edge case is detected, it pauses that specific task and alerts your team with full context.',
      },
    ],
  },
};
