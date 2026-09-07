export interface FaqItemType {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItemType[] = [
  {
    question: 'What is an AI voice agent and how is it different from a regular chatbot?',
    answer:
      'Unlike a text chatbot on a website, an AI voice agent handles real telephone calls with natural speech, human pauses, and intelligent understanding. It can converse in English, Hindi, or Punjabi, check your live calendar, qualify callers, and book appointments directly.',
  },
  {
    question: 'Will my customers know they’re talking to an AI?',
    answer:
      'Our voice agents sound remarkably natural, polite, and responsive without the robotic delay of legacy IVR systems. If a caller asks something outside its trained parameters, the agent gracefully transfers the call or records an organized message for your team.',
  },
  {
    question: 'How is Gravity For AI different from using a platform like Vapi or Bolna directly?',
    answer:
      'Self-serve platforms are developer tools - you have to write code, design prompts, set up phone numbers, and manage database webhooks yourself. Gravity For AI delivers a complete, done-for-you service: we architect, train, connect, and manage the system so you simply enjoy the results.',
  },
  {
    question: 'How long does setup take from start to finish?',
    answer:
      'Standard AI voice agents and high-performance websites are typically designed, trained, and launched within 5 to 10 business days. Bespoke agentic workflows are scoped and deployed in planned milestones.',
  },
  {
    question: 'Do I need any technical knowledge to manage this?',
    answer:
      'None whatsoever. We handle the entire engineering, deployment, and ongoing optimization. You receive booked appointments, clean notifications, and weekly reclaimed hours.',
  },
];
