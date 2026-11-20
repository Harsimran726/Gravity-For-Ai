import Link from 'next/link';
const services = [
  ['Website development', '/services/website-development', 'Need a business website, a faster mobile experience or a clearer path from enquiry to booking? Discuss your pages, integrations and launch scope.'],
  ['Agentic AI implementation', '/services/agentic-ai-systems', 'Reduce repetitive work across email, spreadsheets and your CRM with connected AI workflows and human review.'],
  ['Private AI infrastructure setup', '/services/private-ai-infrastructure', 'Explore self-hosted models, private document search and deployment in infrastructure your business controls.'],
  ['AI voice agents', '/services/ai-voice-agents', 'Handle missed enquiries, appointment requests and routine phone questions with an AI receptionist.'],
];
export function ServiceDiscovery() {
  return <section className="max-w-[1240px] mx-auto px-6 py-16 space-y-8">
    <h2 className="font-serif text-3xl text-[#122C57]">Find the right solution for your business</h2>
    <div className="grid md:grid-cols-2 gap-8">{services.map(([name, href, text]) => <article key={href} className="border border-[#E4E2DC] p-6 space-y-3"><h3 className="text-xl font-medium"><Link href={href} className="underline">{name}</Link></h3><p className="leading-relaxed">{text}</p></article>)}</div>
    <p className="leading-relaxed">Gravity For AI, also searched as Gravity 4 AI, is based in <Link className="underline" href="/locations/mansa">Mansa, Punjab</Link>. Explore our <Link className="underline" href="/locations/punjab-regional">Punjab coverage</Link>, <Link className="underline" href="/locations/india-remote">remote services across India</Link>, and support for <Link className="underline" href="/locations/united-states">US</Link> and <Link className="underline" href="/locations/europe">European teams</Link>.</p>
  </section>;
}
