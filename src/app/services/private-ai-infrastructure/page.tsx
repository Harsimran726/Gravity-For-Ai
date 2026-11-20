import type { Metadata } from 'next';
import Link from 'next/link';
import { PageSchema } from '@/components/seo/page-schema';
export const metadata: Metadata = {
  title: 'Private AI Infrastructure & LLM Setup India | Gravity For AI',
  description: 'Plan private AI infrastructure, self-hosted LLMs and document search with Gravity For AI. Based in Punjab, serving India and international teams remotely.',
  alternates: { canonical: 'https://gravityforai.com/services/private-ai-infrastructure' },
};
const faqs = [
  {question: 'What is private AI infrastructure?', answer: 'Private AI infrastructure runs models and supporting services in an environment controlled by your business, such as your cloud account or on-premise servers. Privacy depends on the complete setup, including external APIs, logs, backups and access permissions.'},
  {question: 'Can we search company documents using a private AI assistant?', answer: 'A document assistant can retrieve relevant passages from approved files and use them to answer questions with source references. The project needs document permissions, retrieval evaluation and a fallback when the evidence is insufficient.'},
  {question: 'Do we need to buy a GPU server?', answer: 'Not necessarily. Model size, concurrent users, response-time requirements and budget determine whether an existing machine, cloud GPU or dedicated server is appropriate. We assess these before recommending hardware.'},
  {question: 'How much does private AI setup cost?', answer: 'Pricing is scoped after reviewing the use case, documents, infrastructure and support needs. Ask for separate implementation, hosting, hardware and maintenance estimates. No standard price is published for this service.'},
  {question: 'Can you work with teams outside Punjab or India?', answer: 'Gravity For AI is based in Mansa, Punjab and scopes remote projects across India and internationally. Infrastructure access, working hours, data location and handover are agreed before implementation.'},
];
export default function PrivateAiPage() {
  return <>
    <PageSchema path="/services/private-ai-infrastructure" metadata={metadata} faqs={faqs} nodes={[{'@type':'Service', name:'Private AI Infrastructure Setup', serviceType:'Private AI Infrastructure and LLM Deployment', provider:{'@id':'https://gravityforai.com/#organization'}, areaServed:['India'], description:metadata.description}]} />
    <section className="max-w-5xl mx-auto px-6 pt-36 pb-20 space-y-10">
      <p>Mansa, Punjab · Remote delivery across India and internationally</p>
      <h1 className="font-serif text-4xl sm:text-6xl text-[#122C57]">Private AI infrastructure setup for your business</h1>
      <p className="text-xl leading-relaxed">Keep control of where your AI runs and how it accesses company information. Gravity For AI helps scope self-hosted language models, private document search and the infrastructure needed to operate them.</p>
      <Link href="/contact" className="inline-block bg-[#122C57] text-white px-6 py-4">Discuss your private AI project</Link>
      <h2 className="font-serif text-3xl">When a private setup makes sense</h2>
      <ul className="list-disc pl-6 space-y-3"><li>Your team needs answers from internal documents with access controls.</li><li>You need to evaluate where prompts, files and logs are processed.</li><li>You want to compare self-hosting costs with a managed model API.</li><li>You need AI connected to internal systems with clear approval boundaries.</li></ul>
      <h2 className="font-serif text-3xl">What we scope with you</h2>
      <div className="grid sm:grid-cols-2 gap-6">{[
        ['Architecture and sizing','Review workload, model quality, concurrency, memory and compute requirements before selecting infrastructure.'],
        ['Private document search','Plan ingestion, retrieval, source citations, document permissions and evaluation using representative questions.'],
        ['Deployment controls','Define authentication, network access, secrets, logging, backups and any external service dependencies.'],
        ['Handover and operations','Agree deployment documentation, monitoring, maintenance ownership and acceptance criteria.'],
      ].map(([title,text])=><article key={title} className="border p-6 space-y-3"><h3 className="text-xl font-medium">{title}</h3><p>{text}</p></article>)}</div>
      <h2 className="font-serif text-3xl">From feasibility to deployment</h2>
      <p className="leading-relaxed">Start with a use-case review and a small evaluation against your actual tasks. We then agree the architecture, implementation scope and acceptance checks before a production rollout. Hardware purchases and recurring infrastructure charges are quoted separately where applicable.</p>
      <h2 className="font-serif text-3xl">Questions before you invest</h2>
      {faqs.map(f=><article key={f.question} className="space-y-3"><h3 className="text-xl font-medium">{f.question}</h3><p className="leading-relaxed">{f.answer}</p></article>)}
      <p>Need AI to take actions across tools? Explore <Link className="underline" href="/services/agentic-ai-systems">agentic AI implementation</Link>. For a customer-facing site, see <Link className="underline" href="/services/website-development">website development</Link>.</p>
    </section>
  </>;
}
