export interface NicheLandingData {
  slug: string;
  badge: string;
  nicheTitle: string;
  painHookTopQuote?: {
    quote: string;
    author: string;
    role: string;
  };
  heroHeadline: string;
  heroSubheadline: string;
  heroStatBadge: string;
  meta: {
    title: string;
    description: string;
  };
  frictionSection: {
    tag: string;
    title: string;
    subtitle: string;
    points: {
      number: string;
      title: string;
      description: string;
    }[];
  };
  solutionSection: {
    tag: string;
    title: string;
    description: string;
    reelEmbedUrl?: string; // Optional Instagram Reel embed URL
    audioDemo: {
      callerType: string;
      scenario: string;
      duration: string;
      languages: string[];
      sampleTranscript: { speaker: string; text: string }[];
    };
    capabilities: string[];
  };
  proofSection: {
    statValue: string;
    statLabel: string;
    testimonial: {
      quote: string;
      name: string;
      role: string;
      city: string;
      results: string;
    };
    metricBadges: string[];
  };
  formSection: {
    tag: string;
    title: string;
    description: string;
    nicheFieldLabel: string;
    nicheFieldPlaceholder: string;
    options: string[];
  };
  faqSection: {
    tag: string;
    title: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  };
}

export const NICHE_LANDING_PAGES: Record<string, NicheLandingData> = {
  'real-estate': {
    slug: 'real-estate',
    badge: 'Real Estate & Property Agencies',
    nicheTitle: 'Real Estate Brokers, Developers & Property Agencies',
    heroHeadline:
      "Every Unanswered Call Is a Buyer Calling Your Competitor's Agent Instead.",
    heroSubheadline:
      'Gravity For AI builds custom 24/7 AI Voice Receptionists for real estate firms. It answers inbound calls instantly, qualifies buyer vs. seller budgets, shares WhatsApp brochures, and books site visits into your calendar.',
    heroStatBadge: '0 Missed Property Inquiries',
    meta: {
      title: 'AI Voice Receptionist for Real Estate & Brokers',
      description:
        'Never lose a property buyer to voicemail. Custom 24/7 AI call agents that qualify buyers, share brochures on WhatsApp, and book site visits automatically.',
    },
    frictionSection: {
      tag: '01 / THE COST OF MISSED CALLS',
      title: 'Why Real Estate Teams Lose High-Ticket Commissions Every Week',
      subtitle:
        'In property sales, speed-to-lead dictates who closes the deal. When high-intent buyers search listings, they call until someone picks up.',
      points: [
        {
          number: '01',
          title: 'Site Visits Missed While Showing Properties',
          description:
            'When you or your sales agents are physically showing a flat or commercial plot, incoming calls go straight to voicemail. 80% of property buyers never leave voicemails - they tap the next agency number.',
        },
        {
          number: '02',
          title: 'Weekend & Evening Lead Abandonment',
          description:
            'Serious working professionals browse 99acres, MagicBricks, and Instagram ads between 8 PM and 11 PM and across weekends. Unanswered weekend inquiries cool off before Monday morning.',
        },
        {
          number: '03',
          title: 'Hours Wasted on Unqualified Tire-Kickers',
          description:
            'Your high-performing agents burn precious hours repeating basic price points, unit sizes, and locations to callers without valid budgets or clear timelines.',
        },
      ],
    },
    solutionSection: {
      tag: '02 / LIVE SYSTEM DEMO',
      title: 'How the Real Estate AI Voice Agent Operates',
      description:
        'Built with natural, human-speed conversational latency. Speaks fluent Punjabi, Hindi, and Indian English, handling high call surges during marketing campaign launches.',
      audioDemo: {
        callerType: 'Inbound 3BHK Buyer Inquiry',
        scenario: 'Instant qualification, budget check & site visit scheduling',
        duration: '1m 24s',
        languages: ['English', 'Hindi', 'Punjabi'],
        sampleTranscript: [
          {
            speaker: 'Caller',
            text: 'Hi, I saw your Instagram ad for the luxury 3BHK project near Model Town. Is a site visit possible tomorrow?',
          },
          {
            speaker: 'AI Agent',
            text: 'Hello! Yes, absolutely. We have site visit slots available tomorrow at 11:30 AM or 4:00 PM with our senior property consultant. Which time works best for you?',
          },
          {
            speaker: 'Caller',
            text: '4:00 PM is good. What is the starting price for 3BHK units?',
          },
          {
            speaker: 'AI Agent',
            text: 'The 3BHK units start at 1.15 Cr with covered parking included. I have reserved your 4:00 PM slot for tomorrow, and I just sent the brochure and Google Maps location to your WhatsApp number.',
          },
        ],
      },
      capabilities: [
        'Instant 2-second call answer 24 hours a day, 7 days a week',
        'Automatic qualification: Buyer vs Seller, budget range, and timeline',
        'Instant WhatsApp dispatch of floor plans, brochures, and site pin',
        'Direct calendar sync with your sales team for physical site tours',
        'Full CRM logging with caller recording, transcript, and lead score',
      ],
    },
    proofSection: {
      statValue: '100%',
      statLabel: 'Lead Capture Rate Across 1,400+ Monthly Ad Calls',
      testimonial: {
        quote:
          'During our last project launch, our phone lines were ringing continuously. The AI voice agent answered every single caller, pre-screened buyers by budget, and booked 38 qualified site visits in the first 72 hours.',
        name: 'Harpreet S.',
        role: 'Managing Director, Commercial Realty Group',
        city: 'Punjab & Tricity',
        results: '38 Site Visits Booked in 72 Hours',
      },
      metricBadges: [
        'Sub-2s Pickup Time',
        '+44% Site Visit Conversion',
        'Zero Missed Ad Leads',
      ],
    },
    formSection: {
      tag: '03 / CLAIM YOUR AUDIT',
      title: 'Get a Custom AI Call Agent Prototype for Your Real Estate Firm',
      description:
        'Book a free 20-minute audit call. We will design a live custom voice agent trained on your actual property portfolio and show you a demo call live.',
      nicheFieldLabel: 'Primary Property Focus',
      nicheFieldPlaceholder: 'Select your core focus',
      options: [
        'Residential High-Rise & Villas',
        'Commercial Retail & SCOs',
        'Plotted Land & Agriculture',
        'General Real Estate Brokerage',
      ],
    },
    faqSection: {
      tag: '04 / COMMON QUESTIONS',
      title: 'Frequently Asked Questions by Real Estate Business Owners',
      faqs: [
        {
          question: 'Can the AI distinguish between genuine buyers and rental/tenant inquiries?',
          answer:
            'Yes. The voice agent follows an intelligent triage tree. It immediately identifies whether the caller is looking to purchase, sell, or rent, their target budget, and only routes high-ticket sales leads directly to your top closers while handling routine queries automatically.',
        },
        {
          question: 'Does it speak Punjabi, Hindi, and English fluently?',
          answer:
            'Yes. Our voice agents are engineered with multilingual language models. If a caller switches from Hindi to Punjabi or English mid-conversation, the AI seamlessly replies in the matching dialect.',
        },
        {
          question: 'How quickly can our real estate voice agent go live?',
          answer:
            'From intake to deployment, our done-for-you engineering timeline is 7 to 10 business days. We train the AI on your specific brochures, pricing, FAQs, and integrate directly with your existing CRM and WhatsApp numbers.',
        },
        {
          question: 'Will our callers realize they are speaking with an AI?',
          answer:
            'Our conversational latency is under 700ms with natural human pauses, polite Indian pronunciation, and voice modulation. Most callers interact with it effortlessly as a polite front-desk receptionist.',
        },
      ],
    },
  },

  'clinics': {
    slug: 'clinics',
    badge: 'Doctors, Clinics & Medical Practices',
    nicheTitle: 'Healthcare Clinics, Doctors & Multi-Specialty Practices',
    painHookTopQuote: {
      quote:
        'Having our AI engineering partner based right here in Punjab made all the difference. Our voice agent answers calls fluently in Punjabi and English.',
      author: 'Dr. Raman K.',
      role: 'Clinic Founder, Punjab',
    },
    heroHeadline:
      'When Patients Call Your Clinic After Hours, Unanswered Calls Become Someone Else’s Patients.',
    heroSubheadline:
      'Gravity For AI builds dedicated AI Medical Receptionists that answer patient inquiries 24/7 in Punjabi, Hindi, and English. Handles appointment bookings, clinic directions, doctor schedule FAQs, and patient triage with zero hold times.',
    heroStatBadge: '+42 Bookings / Month Captured After 7 PM',
    meta: {
      title: 'AI Medical Receptionist for Clinics & Healthcare Practices',
      description:
        'Capture patient calls after 7 PM without extra payroll. 24/7 AI call answering in Punjabi, Hindi & English for doctor clinics, dental practices, and hospitals.',
    },
    frictionSection: {
      tag: '01 / HEALTHCARE INTAKE BOTTLENECK',
      title: 'Why Busy Clinics Struggle with Telephone Reception',
      subtitle:
        'Patient satisfaction starts at the front desk. But when receptionists are overwhelmed with counter check-ins, the telephone becomes a liability.',
      points: [
        {
          number: '01',
          title: 'The Evening Patient Call Surge (7 PM - 10 PM)',
          description:
            'Patients often consult family after work hours or notice symptoms in the evening. Unanswered calls after 7 PM force worried patients to book appointments with competing nearby clinics.',
        },
        {
          number: '02',
          title: 'Front-Desk Multitasking Chaos',
          description:
            'Your receptionist cannot deliver warm patient check-in care while simultaneously answering a ringing phone, verifying lab reports, and billing insurance.',
        },
        {
          number: '03',
          title: 'Repetitive Routine Query Exhaustion',
          description:
            '70% of calls to your clinic are identical: "Is Dr. available today?", "What is the consultation fee?", "What are morning OPD timings?". These waste valuable human staff bandwidth.',
        },
      ],
    },
    solutionSection: {
      tag: '02 / CLINICAL SYSTEM DEMO',
      title: 'How the Medical AI Receptionist Works',
      description:
        'Trained on doctor OPD schedules, consultation rules, and clinic policies. Escalates true medical emergencies instantly and manages booking queues smoothly.',
      audioDemo: {
        callerType: 'Patient Consultation & Slot Booking',
        scenario: 'Doctor schedule verification & instant calendar reservation',
        duration: '1m 15s',
        languages: ['Punjabi', 'Hindi', 'English'],
        sampleTranscript: [
          {
            speaker: 'Patient',
            text: 'Sat Sri Akal ji, is the pediatric specialist available today for consultation?',
          },
          {
            speaker: 'AI Receptionist',
            text: 'Sat Sri Akal ji! Dr. Raman is available today for OPD from 5:00 PM to 8:30 PM. Would you like me to book an appointment for your child this evening?',
          },
          {
            speaker: 'Patient',
            text: 'Yes, around 6:30 PM if available.',
          },
          {
            speaker: 'AI Receptionist',
            text: 'I have scheduled your consultation slot for 6:30 PM today. A confirmation SMS and token number have been sent to this mobile number. Please arrive 10 minutes early.',
          },
        ],
      },
      capabilities: [
        'Full 24/7 reception coverage - zero missed patient inquiries',
        'Fluent trilingual conversational support (Punjabi, Hindi, English)',
        'Synchronized directly with your clinic appointment calendar software',
        'Automatic SMS / WhatsApp appointment confirmation with location directions',
        'Emergency detection with immediate emergency advisory and doctor escalation',
      ],
    },
    proofSection: {
      statValue: '+42',
      statLabel: 'Monthly In-Clinic Consultations Captured Outside Clinic Hours',
      testimonial: {
        quote:
          'Having our AI engineering partner based right here in Punjab made all the difference. Our voice agent answers calls fluently in Punjabi and English. Patients love that someone picks up immediately even late at night.',
        name: 'Dr. Raman K.',
        role: 'Founder & Lead Physician',
        city: 'Punjab Clinic Network',
        results: '+42 Patient Appointments / Month',
      },
      metricBadges: [
        'HIPAA & Data Privacy Focused',
        'Zero Ring Abandonment',
        'Saves 15+ Staff Hours / Week',
      ],
    },
    formSection: {
      tag: '03 / CLINICAL AUDIT',
      title: 'Get a Custom AI Receptionist Built for Your Practice',
      description:
        'Schedule a free 20-minute clinical workflow audit. We will analyze your patient call patterns and demonstrate a live voice agent tailored to your OPD hours.',
      nicheFieldLabel: 'Clinic Specialty',
      nicheFieldPlaceholder: 'Select your specialty',
      options: [
        'Multi-Specialty Clinic / Hospital',
        'Dental Practice',
        'Eye & ENT Care',
        'Pediatric & Gynecology',
        'Orthopedic / Physiotherapy',
      ],
    },
    faqSection: {
      tag: '04 / CLINICAL FAQ',
      title: 'Frequently Asked Questions by Doctors & Practice Owners',
      faqs: [
        {
          question: 'Is patient data kept private and secure?',
          answer:
            'Yes. All patient interactions, telephone recordings, and booking details are encrypted in transit and at rest in strict adherence to medical data privacy standards. No medical advice is dispensed by the AI.',
        },
        {
          question: 'What happens if a patient calls with a critical medical emergency?',
          answer:
            'The AI voice system is trained with strict clinical safety guardrails. When acute symptoms or emergencies are recognized, it immediately instructs the caller to proceed to the nearest emergency room or dials your designated on-call emergency line.',
        },
        {
          question: 'Does this replace our front-desk staff?',
          answer:
            'No - it empowers them. Your front desk can focus entirely on welcoming patients, managing billing, and clinical care while the AI silently handles routine phone calls and appointment bookings in the background.',
        },
        {
          question: 'Can it handle local Punjabi and Hindi accents?',
          answer:
            'Yes. Having engineered systems in Punjab, our speech-to-text models are trained to recognize colloquial Punjabi, Hindi, and regional accents without frustrating misinterpretations.',
        },
      ],
    },
  },

  'immigration': {
    slug: 'immigration',
    badge: 'Visa Consultants & Study Abroad',
    nicheTitle: 'Immigration Consultants, Visa Agencies & Study Abroad Counselors',
    heroHeadline:
      'Missed Calls During Visa Intake Season Cost You Signed Students & PR Clients.',
    heroSubheadline:
      'Gravity For AI builds 24/7 AI Voice Intake Agents for immigration consultancies. Pre-qualify student candidates, screen PR eligibility points, answer country criteria, and book counseling consultations automatically.',
    heroStatBadge: '65% Reduction in Repetitive Call Burden',
    meta: {
      title: 'AI Call Agent for Immigration & Visa Consultants',
      description:
        'Never lose a student or PR applicant during peak intake season. 24/7 AI voice intake agent that pre-qualifies candidates and schedules visa consultations.',
    },
    frictionSection: {
      tag: '01 / INTAKE SEASON OVERLOAD',
      title: 'Why Visa Consultancies Lose Serious Applicants During Peak Weeks',
      subtitle:
        'When intake deadlines approach for Canada, the UK, Australia, and Europe, telephone lines get swamped. Here is what happens behind the scenes:',
      points: [
        {
          number: '01',
          title: 'Peak Intake Season Line Congestion',
          description:
            'During September and January intake rushes, dozens of students and parents call at once. Engaged signals or voicemail prompts cause prospective students to call competing consultancies down the street.',
        },
        {
          number: '02',
          title: 'International Time-Zone Disconnects',
          description:
            'Overseas sponsors, relatives, and students calling from Canada, the UK, or the Gulf dial outside Indian business hours and get no response.',
        },
        {
          number: '03',
          title: 'Senior Counsellors Answering Basic Eligibility FAQs',
          description:
            'High-billing visa experts spend half their day answering repetitive baseline queries ("What is the IELTS band requirement for Canada?", "What are the fees?") instead of closing client files.',
        },
      ],
    },
    solutionSection: {
      tag: '02 / VISA INTAKE DEMO',
      title: 'How the Immigration AI Call Agent Works',
      description:
        'Acts as a knowledgeable first-line intake counselor. Conducts structured initial eligibility screening, gathers education background, and schedules serious applicants with senior counselors.',
      audioDemo: {
        callerType: 'Student Visa Inquiry (Canada & UK Intake)',
        scenario: 'Eligibility screening, IELTS score capture & counselor booking',
        duration: '1m 35s',
        languages: ['English', 'Punjabi', 'Hindi'],
        sampleTranscript: [
          {
            speaker: 'Student',
            text: 'Hello, I completed my B.Tech with 68% and have a 6.5 IELTS score. Can I apply for the upcoming Canada January intake?',
          },
          {
            speaker: 'AI Agent',
            text: 'Hello! Yes, with a 6.5 band and 68% in B.Tech, you are eligible for Post-Graduate programs in Canada for the upcoming intake. Which province or field of study do you prefer?',
          },
          {
            speaker: 'Student',
            text: 'I prefer Ontario or British Columbia in Project Management or Data.',
          },
          {
            speaker: 'AI Agent',
            text: 'Excellent. We have partner colleges open in both Ontario and BC. Let me schedule a 1-on-1 profile assessment with our Senior Canada Counselor for tomorrow at 2:00 PM. Would that suit you?',
          },
        ],
      },
      capabilities: [
        'Instant 24/7 candidate qualification across all international time zones',
        'Structured profile intake: qualification, IELTS/PTE scores, target country, budget',
        'Immediate appointment booking into counsellor calendars',
        'Instant WhatsApp confirmation with checklist of required documents',
        'CRM record creation with full caller details and verified readiness score',
      ],
    },
    proofSection: {
      statValue: '3.2x',
      statLabel: 'Faster Initial Profile Assessment & Lead-to-Meeting Rate',
      testimonial: {
        quote:
          'During our last Canada intake campaign, our ad spend generated thousands of calls. The AI agent filtered out unqualified inquiries, collected educational credentials on the spot, and sent 140 pre-vetted students into our office for face-to-face filings.',
        name: 'Amanpreet M.',
        role: 'Director of Overseas Education',
        city: 'Chandigarh & Punjab',
        results: '140 Pre-Vetted File Consultations in 1 Month',
      },
      metricBadges: [
        'Zero Intake Season Drops',
        'Worldwide Time-Zone Coverage',
        'Full CRM Integration',
      ],
    },
    formSection: {
      tag: '03 / COUNSELOR AUDIT',
      title: 'Get a Custom AI Voice Intake Agent for Your Consultancy',
      description:
        'Book a free 20-minute intake workflow audit. We will show you how our AI voice agent qualifies candidate profiles and integrates with your existing agency pipeline.',
      nicheFieldLabel: 'Primary Country / Visa Focus',
      nicheFieldPlaceholder: 'Select your main market',
      options: [
        'Canada Study & Express Entry',
        'UK & Europe Study Visas',
        'Australia & New Zealand',
        'USA Study & Visitor Visas',
        'Multi-Country Immigration Agency',
      ],
    },
    faqSection: {
      tag: '04 / IMMIGRATION AGENCY FAQ',
      title: 'Frequently Asked Questions by Immigration Consultants',
      faqs: [
        {
          question: 'Does the AI provide legal immigration advice?',
          answer:
            'No. The AI is strictly programmed as an intake and screening assistant. It collects candidate background facts (education, test scores, work history, country interest) and answers general public criteria questions, leaving all formal immigration guidance to your licensed advisors.',
        },
        {
          question: 'Can the AI collect applicant details and send them directly to our CRM?',
          answer:
            'Yes. The caller name, phone number, education credentials, IELTS scores, and preferred country are automatically parsed and pushed to your CRM (LeadSquared, Salesforce, HubSpot, or Google Sheets) in real time.',
        },
        {
          question: 'How does it handle callers who speak Punjabi or Hindi?',
          answer:
            'Many students and parents prefer discussing visa aspirations in Punjabi or Hindi. The AI detects the language within the first 3 seconds and responds natively with polite, culturally respectful phrasing.',
        },
        {
          question: 'Can it send the student a list of required documents via WhatsApp?',
          answer:
            'Yes. As soon as the consultation call concludes, the system triggers an automated WhatsApp message containing the checklist of documents (transcripts, IELTS TRF, passport copy) to bring to the counseling session.',
        },
      ],
    },
  },
};
