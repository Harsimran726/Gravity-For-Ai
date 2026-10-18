import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Workflow, Code2, AudioLines, Check, Plus, MapPin } from 'lucide-react';
import { PageSchema } from '@/components/seo/page-schema';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { FounderWorkbench } from '@/components/visuals/founder-workbench';

const description = 'Gravity For AI is an AI automation and web development company in Mansa, Punjab, founded by Harsimran Singh. Meet the founder and explore our approach.';
export const metadata: Metadata = {
  title: 'About Gravity For AI | AI Automation & Web Development', description,
  alternates: { canonical: 'https://gravityforai.com/about' },
  openGraph: { title: 'Meet Gravity For AI & Founder Harsimran Singh', description, url: 'https://gravityforai.com/about', type: 'website' },
};
const faqs = [
  { question: 'What does Gravity For AI do?', answer: 'Gravity For AI builds custom AI automation, voice agents, CRM integrations and websites. We connect business enquiries, information and follow-up processes so teams can spend less time on repetitive work.' },
  { question: 'Who founded Gravity For AI?', answer: 'Harsimran Singh is the founder and lead AI engineer of Gravity For AI. He works on business workflow design, AI systems and web development. His personal profile is available at harsimransingh.bio.' },
  { question: 'Where is Gravity For AI based?', answer: 'Gravity For AI is based in Mansa, Punjab, India. We work with businesses locally and collaborate remotely with teams in other locations.' },
  { question: 'Can you work with our existing website or CRM?', answer: 'Yes. We first review your current tools, available integrations and workflow. We then agree whether to connect existing systems, improve them or build a new solution.' },
  { question: 'How do we start a project?', answer: 'Share the workflow or website you want to improve through our contact page. We discuss your requirements, agree the scope and success measures, and provide a proposal before development begins.' },
];
const services = [
  { icon: Workflow, title: 'AI automation', text: 'Connect enquiries, documents and everyday tools into workflows with clear human review points.', tags: 'CRM integrations · Follow-ups · Internal workflows' },
  { icon: AudioLines, title: 'AI voice agents', text: 'Handle routine conversations, capture useful details and route requests to the right person.', tags: 'Enquiry handling · Call summaries · Handoffs' },
  { icon: Code2, title: 'Web development', text: 'Turn your services into a clear, responsive website with a straightforward path to enquiry.', tags: 'Business websites · Landing pages · Custom portals' },
];
const steps = [
  ['Understand', 'Map the process, the people involved and the bottleneck worth solving.'],
  ['Build', 'Agree the scope, then develop a solution around your tools and team.'],
  ['Validate', 'Test real scenarios and review results against agreed success measures.'],
  ['Hand over', 'Document the workflow and agree training, access and ongoing support.'],
];

export default function AboutPage() {
  return <div className="text-[#122C57]">
    <PageSchema path="/about" metadata={metadata} type="AboutPage" faqs={faqs} />
    <SectionWrapper animate={false} className="!py-16 sm:!py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-6 text-xs font-mono uppercase tracking-[0.2em] text-[#896425]">About Gravity For AI</p>
          <h1 className="font-serif text-4xl sm:text-6xl leading-[1.08] tracking-tight">Better systems.<br /><span className="text-[#896425]">More room to grow.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#40516C]">Gravity For AI is an AI automation and web development company based in Mansa, Punjab, founded by Harsimran Singh.</p>
          <p className="mt-4 max-w-xl leading-relaxed text-[#40516C]">We build websites, voice agents and connected workflows that help businesses manage enquiries and reduce repetitive work.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5"><Button href="/contact">Discuss your project</Button><Link href="#founder" className="font-medium underline underline-offset-4">Meet the founder</Link></div>
          <p className="mt-8 flex items-center gap-2 text-sm text-[#40516C]"><MapPin size={16} aria-hidden="true" /> Mansa, Punjab · Working with teams remotely</p>
        </div>
        <div className="rounded-3xl border border-[#E4E2DC] bg-[#F7F5F0] p-5 sm:p-8"><FounderWorkbench /><p className="mt-5 text-center text-xs font-mono uppercase tracking-widest text-[#40516C]">People + thoughtful engineering</p></div>
      </div>
    </SectionWrapper>

    <SectionWrapper animate={false} variant="warm" className="!py-16 sm:!py-20">
      <div className="mb-9 max-w-2xl"><p className="text-xs font-mono uppercase tracking-widest text-[#896425]">What we do</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">One business. Connected systems.</h2><p className="mt-4 text-[#40516C] leading-relaxed">Start with the problem that matters most. Build the right solution around it.</p></div>
      <div className="grid gap-5 md:grid-cols-3">{services.map(({ icon: Icon, title, text, tags }) => <article key={title} className="rounded-2xl border border-[#E4E2DC] bg-white p-7"><Icon size={28} className="mb-7 text-[#896425]" aria-hidden="true" /><h3 className="font-serif text-2xl">{title}</h3><p className="mt-4 leading-relaxed text-[#40516C]">{text}</p><p className="mt-6 border-t border-[#E4E2DC] pt-4 text-xs leading-relaxed text-[#40516C]">{tags}</p></article>)}</div>
      <Link href="/services" className="mt-7 inline-flex items-center gap-2 font-medium underline underline-offset-4">Explore our services <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </SectionWrapper>

    <SectionWrapper animate={false} id="founder" className="!py-16 sm:!py-24">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 items-center">
        <div className="overflow-hidden rounded-3xl bg-[#122C57] text-white">
          <div className="p-8 sm:p-10"><p className="text-xs font-mono uppercase tracking-widest text-[#EAC580]">The person behind the work</p><Image src="https://1.gravatar.com/avatar/85b5ed2edbd43fe08a87b9a1f045331e52a152a4349f94aa1235fba0849ba60f?s=512&d=initials" width={256} height={256} alt="Harsimran Singh, founder of Gravity For AI" className="mx-auto my-8 aspect-square rounded-2xl object-cover" unoptimized /><h2 className="font-serif text-3xl">Harsimran Singh</h2><p className="mt-2 text-sm text-white/80">Founder &amp; Lead AI Engineer</p></div>
          <a href="https://harsimransingh.bio" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border-t border-white/20 px-8 py-5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"><span>Explore my personal profile<span className="mt-1 block text-xs text-white/70">harsimransingh.bio · opens in a new tab</span></span><ArrowUpRight aria-hidden="true" /></a>
        </div>
        <div><p className="text-xs font-mono uppercase tracking-widest text-[#896425]">Our approach</p><h3 className="mt-4 font-serif text-3xl sm:text-4xl leading-tight">Technology should make your work easier to manage.</h3><p className="mt-6 text-[#40516C] leading-relaxed">Harsimran founded Gravity For AI to help businesses put AI and web technology to practical use. His work brings together workflow design, AI development and the integrations that connect a business day to day.</p><p className="mt-4 text-[#40516C] leading-relaxed">We begin by understanding what your team needs. Then we agree what to build, how to check it works and where a person should remain in control.</p><ul className="mt-7 space-y-4">{['A clear scope before development begins', 'Human review where judgement matters', 'Progress you can review, with an agreed handover'].map(item => <li key={item} className="flex items-start gap-3"><Check size={20} className="shrink-0 text-[#896425]" aria-hidden="true" /><span>{item}</span></li>)}</ul><a href="https://www.linkedin.com/in/harsimransinghaiengineer/" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 font-medium underline underline-offset-4">Connect with Harsimran on LinkedIn <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a></div>
      </div>
    </SectionWrapper>

    <SectionWrapper animate={false} variant="warm" className="!py-16 sm:!py-20">
      <h2 className="font-serif text-3xl sm:text-4xl">From first conversation to a working system.</h2>
      <ol className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], i) => <li key={title} className="border-t border-[#CFC7B6] pt-5"><span className="font-mono text-sm text-[#896425]">0{i + 1}</span><h3 className="mt-4 text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#40516C]">{text}</p></li>)}</ol>
      <Link href="/case-studies" className="mt-9 inline-flex items-center gap-2 font-medium underline underline-offset-4">Explore our case studies <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </SectionWrapper>

    <SectionWrapper animate={false} className="!py-16 sm:!py-20">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-mono uppercase tracking-widest text-[#896425]">A few useful answers</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Get to know us.</h2></div><div className="space-y-3">{faqs.map(faq => <details key={faq.question} className="group rounded-xl border border-[#E4E2DC] bg-[#F7F5F0] open:bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-5 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#122C57] [&::-webkit-details-marker]:hidden">{faq.question}<Plus size={18} className="shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" /></summary><p className="px-5 pb-5 leading-relaxed text-[#40516C]">{faq.answer}</p></details>)}</div></div>
      <div className="mt-16 rounded-3xl bg-[#122C57] p-8 sm:p-12 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8"><div><h2 className="font-serif text-3xl">What would you like to improve?</h2><p className="mt-3 max-w-xl text-white/80">Bring us a workflow, a website idea or a bottleneck. We will help define a practical starting point.</p></div><Link href="/contact" className="shrink-0 rounded-lg bg-white px-6 py-4 font-medium text-[#122C57] hover:bg-[#F7F5F0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Let’s talk <span aria-hidden="true">→</span></Link></div>
    </SectionWrapper>
  </div>;
}
