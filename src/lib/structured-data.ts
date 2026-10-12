/** Shared public entities. Never pass database records or custom editor JSON directly to JSON-LD. */
export const SITE_URL = 'https://gravityforai.com';
const ORG = `${SITE_URL}/#organization`;
const FOUNDER = `${SITE_URL}/#founder`;
const WEBSITE = `${SITE_URL}/#website`;
export type SchemaNode = Record<string, unknown>;
export type SchemaFaq = { question: string; answer: string };
export function publicUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value, SITE_URL); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
export function serializeSchema(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export interface PageSchemaInput {
  path: string; title: string; description?: string; type?: string;
  nodes?: SchemaNode[]; faqs?: SchemaFaq[];
}
export function buildPageGraph({ path, title, description, type = 'WebPage', nodes = [], faqs = [] }: PageSchemaInput) {
  const url = new URL(path, SITE_URL); url.hash = ''; url.search = '';
  const canonical = url.href.replace(/\/$/, '');
  const pageId = `${canonical}#webpage`;
  const ref = (id: string) => ({ '@id': id });
  const organization: SchemaNode = {
    '@type': 'Organization', '@id': ORG, name: 'Gravity For AI', url: SITE_URL,
    description: 'AI automation, voice agents, workflow integrations and custom website development.',
    email: 'contact@gravityforai.com', logo: { '@type': 'ImageObject', '@id': `${SITE_URL}/#logo`, url: `${SITE_URL}/android-chrome-512x512.png` },
    address: { '@type': 'PostalAddress', addressLocality: 'Mansa', addressRegion: 'Punjab', addressCountry: 'IN' },
    founder: ref(FOUNDER),
  };
  const founder: SchemaNode = { '@type': 'Person', '@id': FOUNDER, name: 'Harsimran Singh',
    jobTitle: 'Founder & Lead AI Engineer', worksFor: ref(ORG), url: `${SITE_URL}/about`,
    sameAs: ['https://www.linkedin.com/in/harsimransinghaiengineer/', 'https://github.com/harsimran726'] };
  const page: SchemaNode = { '@type': type, '@id': pageId, url: canonical || SITE_URL, name: title,
    description, inLanguage: 'en', isPartOf: ref(WEBSITE), publisher: ref(ORG), about: ref(ORG) };
  const graph: SchemaNode[] = [organization, founder,
    { '@type': 'WebSite', '@id': WEBSITE, url: SITE_URL, name: 'Gravity For AI', publisher: ref(ORG), inLanguage: 'en' }, page];
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length) {
    const labels: Record<string,string> = { blog:'Blog', services:'Services', locations:'Locations', lp:'Industry Solutions', 'case-studies':'Case Studies' };
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }];
    segments.forEach((segment, i) => crumbs.push({ '@type': 'ListItem', position: i+2,
      name: i === segments.length-1 ? title : (labels[segment] || segment.replace(/-/g,' ')),
      item: `${SITE_URL}/${segments.slice(0,i+1).join('/')}` }));
    page.breadcrumb = ref(`${canonical}#breadcrumb`);
    graph.push({ '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: crumbs });
  }
  for (const input of nodes) {
    const { '@context': ignored, ...node } = input;
    const nodeType = String(node['@type']);
    // Service areas describe delivery coverage, never additional physical offices.
    if (nodeType === 'LocalBusiness') continue;
    if (nodeType === 'CollectionPage' || nodeType === 'WebPage') {
      const { publisher, url: ignoredUrl, ...properties } = node;
      Object.assign(page, properties, { '@id': pageId });
      continue;
    }
    node['@id'] ||= `${canonical}#${nodeType.toLowerCase()}`;
    if (node.provider) node.provider = ref(ORG);
    if (node.publisher) node.publisher = ref(ORG);
    if (nodeType === 'Service' || nodeType === 'BlogPosting' || nodeType === 'ItemList') page.mainEntity = ref(String(node['@id']));
    if (nodeType === 'FAQPage') page.hasPart = ref(String(node['@id']));
    graph.push(node);
  }
  const questions = faqs.filter(f => f.question?.trim() && f.answer?.trim());
  if (questions.length && !graph.some(n => n['@type'] === 'FAQPage')) {
    const id = `${canonical}#faq`;
    page.hasPart = ref(id);
    graph.push({ '@type':'FAQPage', '@id':id, isPartOf:ref(pageId), mainEntity:questions.map(f => ({
      '@type':'Question', name:f.question, acceptedAnswer:{ '@type':'Answer', text:f.answer }
    })) });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
interface PublicPost {
  slug: string; title: string; metaDescription: string; canonicalUrl?: string | null;
  publishedAt?: string | Date | null; updatedAt?: string | Date | null; ogImage?: string | null;
  category?: string; faqs?: SchemaFaq[];
  author: { name: string; role?: string; linkedinUrl?: string | null; githubUrl?: string | null };
}
function isoDate(value?: string | Date | null) {
  if (!value) return undefined;
  const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
export function buildBlogGraph(post: PublicPost, includeFaqs = true) {
  const canonicalUrl = new URL(publicUrl(post.canonicalUrl) || `${SITE_URL}/blog/${post.slug}`);
  canonicalUrl.hash = ''; canonicalUrl.search = '';
  const canonical = canonicalUrl.href.replace(/\/$/, '');
  const isFounder = post.author.name.trim().toLowerCase() === 'harsimran singh';
  const isTeam = ['gravity team', 'gravity for ai'].includes(post.author.name.trim().toLowerCase());
  const authorId = isTeam ? ORG : isFounder ? FOUNDER : `${canonical}#author`;
  const sameAs = [publicUrl(post.author.linkedinUrl), publicUrl(post.author.githubUrl)].filter(Boolean);
  const author: SchemaNode = { '@type':'Person', '@id':authorId, name:post.author.name, jobTitle:post.author.role,
    ...(sameAs.length ? { url:sameAs[0], sameAs } : {}) };
  const image = publicUrl(post.ogImage);
  const article: SchemaNode = { '@type':'BlogPosting', '@id':`${canonical}#article`, headline:post.title,
    description:post.metaDescription, url:canonical, mainEntityOfPage:{ '@id':`${canonical}#webpage` },
    author:{ '@id':authorId }, publisher:{ '@id':ORG }, inLanguage:'en', articleSection:post.category,
    datePublished:isoDate(post.publishedAt), dateModified:isoDate(post.updatedAt) || isoDate(post.publishedAt),
    ...(image && !image.endsWith('/og-default.jpg') ? { image:[image] } : {}) };
  return buildPageGraph({ path:canonical, title:post.title, description:post.metaDescription,
    nodes:[...(!isFounder && !isTeam ? [author] : []), article], faqs:includeFaqs ? post.faqs : [] });
}
