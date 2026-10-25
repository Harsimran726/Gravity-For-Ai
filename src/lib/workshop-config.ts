export const workshop = { title: 'Idea to App', amount: 29900, regularAmount: 99900, offerMinutes: 20, currency: 'INR', dates: '31 October & 1 November 2026', time: '7–9 PM IST · Saturday & Sunday', closes: '2026-10-31T12:30:00Z' };
export function formatWorkshopPrice(amount:number){return `₹${amount/100}`;}
// Publish only permissioned, attributable feedback, clearly labelled by context.
export const workshopTestimonials: { quote: string; name: string; context: string; source: string }[] = [
  {name:'Sakshi Bansal', context:'AI course learner', source:'', quote:'I especially like the practical learning and the opportunity to practice with new AI tools. This course has helped me improve my skills and understand AI tools better.'},
  {name:'Khushdeep Dhiman', context:'AI course learner', source:'', quote:'I started building websites in my first week and got my first order after two weeks. The learning approach is unique and better.'},
];
// Feedback supplied by the course owner; lightly edited for clarity. These are
// course experiences, not results from the upcoming two-session workshop.

