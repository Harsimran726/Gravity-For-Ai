import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { WebsiteEnquiryForm } from './form';
import { MobileEnquiryCta } from './mobile-cta';
export const metadata: Metadata = {
 title: 'Websites for Interior Businesses in Mohali & Chandigarh',
 description: 'A clear path from your project portfolio to customer enquiries. Founder-led website development from ₹20,000.',
 alternates: {canonical: 'https://gravityforai.com/lp/interior-websites'}, robots: {index:false,follow:true},
};
const cta = 'inline-flex items-center justify-center rounded-lg bg-[#122C57] px-7 py-4 text-white font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#946A26]';
export default function InteriorWebsitesPage() {
 return <div className="bg-[#F8F6F0] text-[#122C57] pb-24 md:pb-0">
  <header className="mx-auto max-w-6xl px-6 py-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD6C7]">
   <span className="text-sm font-semibold tracking-[0.2em]">GRAVITY FOR AI</span><span className="text-xs text-[#946A26] tracking-widest uppercase">Mohali · Chandigarh</span>
  </header>
  <section className="max-w-5xl mx-auto px-6 pt-14 pb-12 sm:pt-20 text-center">
   <p className="text-xs tracking-widest uppercase text-[#946A26] font-semibold">For interior designers & renovation business owners</p>
   <h1 className="font-serif text-4xl sm:text-6xl leading-tight mt-6">Show your best projects. <span className="text-[#946A26]">Make the next enquiry easy.</span></h1>
   <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed mt-6">A mobile-friendly website where customers can explore your work, understand your services and share their project requirements.</p>
   <p className="mt-5 font-semibold">Website projects from ₹20,000 · Planned around your business</p>
   <a href="#website-enquiry" className={`${cta} mt-7`}>Book a discovery call <span aria-hidden="true" className="ml-3">→</span></a>
   <p className="text-sm text-slate-500 mt-3">Discuss your priorities, recommended pages and an indicative project estimate.</p>
  </section>
  <section aria-label="Website design across desktop and mobile" className="max-w-6xl mx-auto px-6 pb-20">
   <div className="relative rounded-[28px] bg-[#EAE5DA] border border-[#DDD6C7] p-5 sm:p-10 lg:px-16 lg:py-12 overflow-hidden">
    <div aria-hidden="true" className="absolute w-[580px] h-[580px] rounded-full border border-[#C6AD7F]/35 -right-40 -top-52"/>
    <div aria-hidden="true" className="absolute w-[460px] h-[460px] rounded-full border border-[#C6AD7F]/35 -right-24 -top-36"/>
    <div className="relative flex flex-wrap justify-between gap-3 mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#946A26]">Designed to be explored. Built to be used.</p><span className="text-xs text-slate-600">Illustrative website concept</span></div>
    <div className="relative pb-8 sm:pb-10 pr-10 sm:pr-24">
     <div className="rounded-xl overflow-hidden bg-[#F6F3EB] border border-[#122C57]/15 shadow-xl">
      <div className="h-7 sm:h-9 bg-white flex gap-1.5 items-center px-4 border-b border-[#E4E2DC]"><span className="w-2 h-2 rounded-full bg-[#D8C2A1]"/><span className="w-2 h-2 rounded-full bg-[#D8C2A1]"/><span className="w-2 h-2 rounded-full bg-[#D8C2A1]"/><span className="ml-4 text-[8px] sm:text-[10px] text-slate-500">FORM & STILL / Design preview</span></div>
      <div className="px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center"><span className="text-[8px] sm:text-xs tracking-widest font-semibold text-[#302D25]">FORM & STILL</span><span className="text-[7px] sm:text-[10px] text-[#857254]">Spaces · Approach · Enquire</span></div>
      <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-3 sm:gap-7 px-4 sm:px-8 pb-6 sm:pb-10"><div><p className="text-[6px] sm:text-[9px] uppercase tracking-widest text-[#857254]">Considered living</p><h2 className="font-serif text-xl sm:text-4xl lg:text-5xl leading-tight mt-3 text-[#302D25]">Spaces that<br/>feel like you.</h2><p className="hidden sm:block text-xs text-[#302D25]/70 max-w-52 mt-4 leading-relaxed">Thoughtful proportions. Natural materials. Room for everyday life.</p><span className="inline-block bg-[#302D25] text-white text-[6px] sm:text-[10px] px-3 sm:px-5 py-2 sm:py-3 mt-4 sm:mt-6">Explore our spaces ↗</span></div><div className="relative h-40 sm:h-72 lg:h-80"><Image unoptimized src="/website-concepts/interior.webp" alt="Interior studio website concept with a project photograph beside its headline" fill sizes="(max-width:640px) 50vw, 45vw" className="object-cover rounded-sm"/></div></div>
     </div>
     <div className="absolute right-0 bottom-0 w-[28%] sm:w-[24%] rounded-[18px] sm:rounded-[28px] border-[5px] sm:border-[7px] border-[#17243A] bg-[#F6F3EB] shadow-2xl overflow-hidden" aria-hidden="true"><div className="h-3 sm:h-5 flex justify-center items-start bg-[#F6F3EB]"><span className="bg-[#17243A] w-1/2 h-2 sm:h-3 rounded-b-lg"/></div><div className="px-2 sm:px-4 py-2 sm:py-3"><p className="text-[5px] sm:text-[8px] tracking-widest font-semibold">FORM & STILL</p><p className="font-serif text-sm sm:text-2xl leading-tight mt-2 sm:mt-4 text-[#302D25]">A little space.<br/>A lot of possibility.</p></div><div className="relative h-24 sm:h-44"><Image unoptimized src="/website-concepts/interior.webp" alt="" fill sizes="25vw" className="object-cover"/></div><div className="p-2 sm:p-4"><div className="h-1 w-full bg-[#D7D0C1] rounded"/><div className="h-1 w-2/3 bg-[#D7D0C1] rounded mt-1.5"/><div className="bg-[#302D25] text-white text-center text-[5px] sm:text-[9px] py-2 mt-3">Start a conversation ↗</div></div></div>
    </div>
    <div className="relative grid grid-cols-3 gap-2 sm:gap-6 mt-5 border-t border-[#CABFA9] pt-5 text-center">{[['01','Show your work'],['02','Build confidence'],['03','Invite an enquiry']].map(([n,label])=><div key={n}><span className="text-[10px] text-[#946A26]">{n}</span><p className="text-xs sm:text-sm font-semibold mt-1">{label}</p></div>)}</div>
   </div>
  </section>
  <section aria-labelledby="problem-title" className="max-w-6xl mx-auto px-6 pb-16">
   <div className="rounded-2xl bg-white border border-[#DDD6C7] p-6 sm:p-10">
    <p className="text-xs uppercase tracking-widest text-[#946A26]">The customer’s journey</p>
    <h2 id="problem-title" className="font-serif text-3xl sm:text-4xl mt-3">Great work needs a clear next step.</h2>
    <p className="text-slate-600 mt-4 max-w-3xl">A visitor may like a project but still need to know what you offer, where you work and how to enquire. A well-planned website brings those answers together.</p>
    <div className="grid md:grid-cols-3 gap-5 mt-8">{[
      ['01 / Interest','“I like their work.”','Show selected projects with context, not just scattered images.','Project portfolio'],
      ['02 / Confidence','“Are they right for me?”','Explain your services, process and service areas clearly.','Services + process'],
      ['03 / Action','“How do I speak to them?”','Give visitors one simple way to share their requirement.','Enquiry form'],
    ].map(([step,title,copy,label])=><article key={step} className="rounded-xl bg-[#F8F6F0] border border-[#E4E2DC] p-6"><p className="text-xs text-[#946A26] font-semibold">{step}</p><h3 className="font-serif text-2xl mt-4">{title}</h3><p className="text-sm text-slate-600 leading-relaxed mt-4">{copy}</p><div className="mt-6 border-t border-[#DDD6C7] pt-4 text-sm font-semibold">{label}</div></article>)}</div>
    <a href="#website-enquiry" className={`${cta} mt-7`}>Book a discovery call</a>
    <p className="text-xs text-slate-500 mt-5">Illustrative customer journey. Enquiry volumes and business results are not guaranteed.</p>
   </div>
  </section>
  <section id="website-samples" aria-labelledby="samples-title" className="max-w-6xl mx-auto px-6 pb-16 scroll-mt-6">
   <p className="text-xs uppercase tracking-widest text-[#946A26]">Explore the possibilities</p>
   <h2 id="samples-title" className="font-serif text-3xl sm:text-4xl mt-3">Three businesses. Three design directions.</h2>
   <p className="text-slate-600 mt-4 max-w-2xl">Preview the complete page design: header, content, imagery and enquiry flow. Open any sample to explore the full website. These are fictional concepts, not completed client work.</p>
   <div className="grid md:grid-cols-3 gap-6 mt-8">{[
    {slug:'interior-studio',image:'interior',title:'Form & Still',label:'Interior studio',headline:'Spaces that feel like you.',bg:'#F5F1E9',color:'#302D25'},
    {slug:'renovation-house',image:'renovation',title:'Earth / Again',label:'Renovation company',headline:'Keep the soul. Reimagine the space.',bg:'#F6EDE1',color:'#542E24'},
    {slug:'kitchen-atelier',image:'kitchen',title:'Grove Kitchens',label:'Modular kitchen specialist',headline:'Everyday rituals. Beautifully made.',bg:'#183A2E',color:'#F2F0E6'},
   ].map(c=><article key={c.slug} className="rounded-xl overflow-hidden border border-[#DDD6C7] bg-white"><Link href={`/lp/interior-websites/samples/${c.slug}`} aria-label={`Preview ${c.title} sample website`} className="block group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#946A26]">
    <div className="p-3 bg-[#E9E7E1] border-b border-[#DDD6C7]">
     <div className="rounded-lg overflow-hidden border border-black/10 bg-white shadow-sm transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
      <div className="h-7 flex items-center gap-1 px-3 bg-[#FAFAF9] border-b border-black/10" aria-hidden="true"><span className="w-1.5 h-1.5 rounded-full bg-[#D9A69D]"/><span className="w-1.5 h-1.5 rounded-full bg-[#DAC495]"/><span className="w-1.5 h-1.5 rounded-full bg-[#A7B7A2]"/><span className="ml-3 text-[8px] text-slate-500 truncate">{c.title.toLowerCase()} / website preview</span></div>
      <div style={{background:c.slug==='kitchen-atelier'?'#F2F0E6':c.bg,color:c.slug==='kitchen-atelier'?'#183A2E':c.color}} aria-hidden="true">
       <div className="flex justify-between items-center px-4 py-4 border-b border-current/10"><span className="text-[8px] font-semibold tracking-widest uppercase">{c.title}</span><span className="text-[6px] uppercase tracking-widest">Explore the concept ↓</span></div>
       {c.slug==='kitchen-atelier'?<div className="relative h-[188px] text-white"><Image unoptimized src={`/website-concepts/${c.image}.webp`} alt="" fill sizes="33vw" className="object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10"/><div className="absolute bottom-4 left-4 right-4"><p className="text-[6px] uppercase tracking-widest">Designed around the way you live</p><p className="font-serif text-[23px] leading-tight mt-2 max-w-[190px]">{c.headline}</p><span className="inline-block border border-white/70 px-2 py-1 text-[6px] mt-2">Discover the design ↓</span></div></div>
       :<div className="grid grid-cols-2 gap-3 px-4 py-5 h-[188px] items-center"><div className={c.slug==='renovation-house'?'order-2':''}><p className="text-[6px] uppercase tracking-widest">Considered spaces. Everyday living.</p><p className="font-serif text-[21px] leading-[1.1] mt-2">{c.headline}</p><p className="text-[6px] leading-relaxed opacity-70 mt-2">Thoughtful spaces, natural materials and a clear design approach.</p><span style={{background:c.color,color:c.bg}} className="inline-block px-2 py-1.5 text-[6px] mt-3">Explore our approach ↓</span></div><div className={`relative h-full overflow-hidden ${c.slug==='renovation-house'?'rounded-t-[50px]':''}`}><Image unoptimized src={`/website-concepts/${c.image}.webp`} alt="" fill sizes="20vw" className="object-cover"/></div></div>}
       <div className="px-4 pt-4 pb-5 border-t border-current/10"><div className="grid grid-cols-[1fr_2fr] gap-3"><span className="text-[6px] uppercase tracking-widest">01 / The approach</span><div><p className="font-serif text-base leading-tight">{c.slug==='interior-studio'?'Less noise. More meaning.':c.slug==='renovation-house'?'Good bones. A new beginning.':'A place for everything.'}</p><div className="h-1 bg-current opacity-10 mt-2 rounded"/><div className="h-1 bg-current opacity-10 mt-1 rounded w-4/5"/></div></div><div className="grid grid-cols-3 gap-2 mt-5">{['Design','Materials','Details'].map((label,i)=><div key={label} className="border-t border-current/20 pt-2"><p className="text-[6px] opacity-60">0{i+1}</p><p className="font-serif text-[10px] mt-1">{label}</p></div>)}</div></div>
       <div style={{background:c.slug==='kitchen-atelier'?'#183A2E':c.color,color:c.slug==='kitchen-atelier'?'#F2F0E6':c.bg}} className="px-4 py-4 flex items-center justify-between gap-3"><p className="font-serif text-[13px]">Imagine your business here.</p><span className="text-[6px] border border-current/60 px-2 py-1.5">Let’s talk →</span></div>
      </div>
     </div>
    </div>
    <div className="p-5"><p className="text-xs text-[#946A26]">WEBSITE DESIGN CONCEPT</p><h3 className="font-semibold mt-2">{c.label}</h3><p className="text-sm mt-4 underline underline-offset-4">Open full website preview →</p></div>
   </Link></article>)}</div>
   <p className="text-xs text-slate-500 mt-5">Your final website, features and design are agreed in the proposal; these concepts do not define a fixed package.</p>
  </section>
  <section aria-labelledby="proof-heading" className="bg-white border-y border-[#DDD6C7] px-6 py-12"><div className="max-w-6xl mx-auto">
   <p className="text-xs uppercase tracking-widest text-[#946A26]">See before you decide</p><h2 id="proof-heading" className="font-serif text-3xl sm:text-4xl mt-3">A clear design. A clear scope.</h2>
   <div className="grid md:grid-cols-3 gap-6 mt-7">{[
    ['Explore the design','Open the working concepts above. Explore the layout, project presentation and enquiry journey.'],
    ['Plan your starting scope','Discuss your essential pages, project gallery, mobile layout and enquiry form. Your written quote confirms what fits your budget.'],
    ['Know the next step','Review the scope, delivery milestones and costs before deciding to proceed.'],
   ].map(([title,copy],i)=><article key={title} className="rounded-xl bg-[#F8F6F0] border border-[#E4E2DC] p-6"><span className="text-xs text-[#946A26]">0{i+1}</span><h3 className="font-semibold mt-3">{title}</h3><p className="text-sm text-slate-600 leading-relaxed mt-3">{copy}</p></article>)}</div>
  </div></section>
  <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">
   <div><p className="text-xs uppercase tracking-widest text-[#946A26]">Your next step</p><h2 className="font-serif text-4xl mt-4">Leave the conversation with a clearer plan.</h2><p className="text-slate-600 mt-4 leading-relaxed">Discuss the pages you need, the enquiry journey and an indicative investment. Final scope follows in writing.</p>
   <ol className="mt-8 space-y-6">{[['Share your requirement','Fill in your business details and planned budget.'],['AI callback','Our AI assistant calls about your enquiry and captures what you need. You can ask for a human.'],['Founder discussion','We confirm a meeting time to review fit, scope and next steps.'],['Written proposal','Review the deliverables, milestones and payment terms before signing.']].map(([h,b],i)=><li key={h} className="flex gap-4"><span className="text-[#946A26] font-semibold">0{i+1}</span><div><h3 className="font-semibold">{h}</h3><p className="text-sm text-slate-600 mt-1">{b}</p></div></li>)}</ol>
   </div><div id="website-enquiry" className="scroll-mt-6"><WebsiteEnquiryForm/></div>
  </section>
  <section aria-labelledby="faq-heading" className="bg-[#EEEAE1] border-t border-[#DDD6C7] px-6 py-16 sm:py-20"><div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.4fr] gap-10 lg:gap-20 items-start"><div className="lg:sticky lg:top-10">
   <p className="text-xs uppercase tracking-widest text-[#946A26]">Before we talk</p><h2 id="faq-heading" className="font-serif text-3xl sm:text-4xl mt-3">Your questions, answered.</h2>
   <p className="text-slate-600 leading-relaxed mt-5 max-w-sm">A little clarity before the first conversation. Here’s what to expect when we build your website.</p>
   <div className="relative mt-8 rounded-2xl bg-[#122C57] text-white p-7 overflow-hidden"><div aria-hidden="true" className="absolute -right-10 -top-10 w-40 h-40 border border-[#C99A44]/40 rounded-full"/><div aria-hidden="true" className="absolute -right-4 -top-4 w-28 h-28 border border-[#C99A44]/40 rounded-full"/><span aria-hidden="true" className="relative font-serif text-5xl text-[#E0BA70]">?</span><h3 className="relative font-serif text-2xl mt-4">Have something else in mind?</h3><p className="relative text-sm text-white/75 mt-3 leading-relaxed">Tell us about your business and the website you’d like to create.</p><a href="#website-enquiry" className="relative inline-flex items-center gap-5 text-sm font-semibold text-[#E0BA70] mt-6 underline underline-offset-8">Let’s talk about it <span aria-hidden="true">↗</span></a></div></div>
   <div className="space-y-3">{[
    ['Can you create a new website or redesign our current one?','Both. We review your business, current website and priorities, then agree what should be built or improved.'],
    ['What is included in the website project?','We agree the pages, project galleries, enquiry forms and any integrations in your written scope. The sample websites show design possibilities; they are not a fixed package.'],
    ['How much does a website cost?','Projects start from ₹20,000. Your quote depends on the content, pages and functionality you need. We confirm the full scope and any recurring costs before work begins.'],
    ['How long will it take?','We agree a delivery timeline after reviewing the scope and how much content is ready. Your proposal includes review milestones and the information we need from you.'],
    ['Will the website work on mobile?','Yes. The agreed website is designed for mobile and desktop, with responsive layouts and a clear enquiry journey.'],
    ['Do you help with content and project photos?','We can plan the page structure and discuss copy support. You provide approved business details and project images, or we agree suitable licensed or illustrative alternatives.'],
    ['Are hosting, domain and support included?','These are itemised in the proposal so you can see what is included and what, if anything, renews separately.'],
    ['What happens after I request a call?','Our AI assistant may call to understand your enquiry. We then confirm a suitable time for a founder discussion. Submitting the form does not automatically book a meeting.'],
    ['Will a website guarantee customers?','No. We can improve how your business presents its work and receives enquiries. Results also depend on traffic, your offer, demand and follow-up.'],
   ].map(([q,a],i)=><details key={q} open={i===0} className="group rounded-xl border border-[#DDD6C7] bg-white open:border-[#C99A44] open:shadow-sm transition-shadow"><summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-3 sm:gap-4 p-5 sm:p-6 font-semibold text-sm sm:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#946A26] rounded-xl"><span aria-hidden="true" className="text-xs font-normal text-[#946A26] shrink-0">0{i+1}</span><span className="flex-1">{q}</span><span aria-hidden="true" className="w-7 h-7 shrink-0 rounded-full bg-[#F3F0E8] group-open:bg-[#122C57] group-open:text-white flex items-center justify-center text-lg font-normal"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span></summary><div className="px-5 sm:px-6 pb-6"><p className="border-t border-[#EEEAE1] pt-4 text-sm sm:text-base text-slate-600 leading-relaxed">{a}</p></div></details>)}</div>
   </div>
  </section>
  <footer className="border-t border-[#DDD6C7] px-6 py-8 text-sm"><div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-between"><span>Gravity For AI · Mansa, Punjab</span><a className="underline" href="mailto:contact@gravityforai.com">contact@gravityforai.com</a><a className="underline" href="/privacy-policy">Privacy policy</a></div></footer>
  <MobileEnquiryCta/>
 </div>;
}
