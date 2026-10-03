import * as React from 'react';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, Github, Linkedin, CheckCircle2 } from 'lucide-react';
import { VoiceAgentMockup } from '@/components/visuals/voice-agent-mockup';
import { BrowserSpeedMockup } from '@/components/visuals/browser-speed-mockup';
import { PipelineOrchestratorMockup } from '@/components/visuals/pipeline-orchestrator-mockup';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dbPost = await prisma.blogPost.findUnique({ where: { slug: params.slug }, include: { author: true } });
  
  if (dbPost && dbPost.status === 'PUBLISHED') {
    return {
      title: `${dbPost.title} | Gravity For AI`,
      description: dbPost.metaDescription,
      alternates: {
        canonical: dbPost.canonicalUrl || `https://gravityforai.com/blog/${dbPost.slug}`,
      },
      openGraph: {
        title: dbPost.title,
        description: dbPost.metaDescription,
        url: dbPost.canonicalUrl || `https://gravityforai.com/blog/${dbPost.slug}`,
        type: 'article',
        publishedTime: dbPost.publishedAt?.toISOString() || new Date().toISOString(),
        authors: [dbPost.author?.name || 'Gravity Team'],
        images: [{ url: dbPost.ogImage || 'https://gravityforai.com/og-default.jpg' }],
      },
    };
  }

  const post = BLOG_POSTS_SEED.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Article Not Found | Gravity For AI' };

  return {
    title: `${post.title} | Gravity For AI`,
    description: post.metaDescription,
    alternates: {
      canonical: post.canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: post.canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: post.ogImage }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let dbPost = await prisma.blogPost.findUnique({ 
    where: { slug: params.slug },
    include: { author: true, category: true, faqs: true }
  });

  let post: any = null;
  let isDbPost = false;

  if (dbPost && dbPost.status === 'PUBLISHED') {
    post = {
      ...dbPost,
      category: dbPost.category?.name || 'General',
      author: {
        name: dbPost.author?.name || 'Gravity Team',
        avatarUrl: 'https://gravityforai.com/icon.png',
        role: dbPost.author?.title || 'Author',
        bio: dbPost.author?.bio || '',
        linkedinUrl: '#',
        githubUrl: '#',
      },
      content: { intro: '', sections: [], conclusion: '' },
      faqs: dbPost.faqs || [],
      publishedAt: dbPost.publishedAt?.toISOString() || new Date().toISOString(),
      ogImage: dbPost.ogImage || 'https://gravityforai.com/og-default.jpg',
      readingTime: dbPost.readingTime || 5,
    };
    isDbPost = true;
  } else {
    post = BLOG_POSTS_SEED.find((p) => p.slug === params.slug);
  }

  if (!post) {
    notFound();
  }

  // Advanced Nested Schema (Person + Organization + Article + Breadcrumbs + FAQPage)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.ogImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.linkedinUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gravity For AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gravityforai.com/icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl || `https://gravityforai.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="w-full flex flex-col">
        <SectionWrapper variant="white" className="pt-10 pb-16">
          <article className="max-w-3xl mx-auto space-y-12">
            <Link
              href="/blog"
              draggable={false}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#6B7280] hover:text-[#122C57] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Articles
            </Link>

            {/* Header / Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#6B7280]">
                <span className="px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E4E2DC] text-[#122C57] font-semibold uppercase text-[10px]">
                  {post.category}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
                </span>
                <span>•</span>
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[50px] leading-[1.08] text-[#122C57] font-normal">
                {post.title}
              </h1>

              {/* Author Byline */}
              <div className="pt-3 flex items-center justify-between border-t border-b border-[#E4E2DC] py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full border border-[#E4E2DC] object-cover"
                  />
                  <div>
                    <p className="font-sans font-medium text-sm text-[#122C57]">{post.author.name}</p>
                    <p className="text-xs text-[#6B7280]">{post.author.role} • Mansa, Punjab</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={post.author.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#6B7280] hover:text-[#122C57] transition-colors"
                    aria-label="Author GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href={post.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#6B7280] hover:text-[#122C57] transition-colors"
                    aria-label="Author LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* GEO Direct-Answer Key Takeaway Callout */}
            <div className="p-6 bg-[#F7F5F0] border-l-4 border-[#C99A44] space-y-2">
              <p className="font-mono text-xs uppercase tracking-wider text-[#C99A44] font-semibold">
                Direct Answer / Key Takeaway
              </p>
              <p className="font-sans text-sm sm:text-base text-[#0A1B3D]/90 leading-relaxed font-medium">
                {post.geoAnswer}
              </p>
            </div>

            {/* Article Intro */}
            <div className="prose prose-lg max-w-none text-[#0A1B3D]/90 space-y-6 leading-relaxed">
              {isDbPost ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="font-serif text-3xl sm:text-4xl text-[#122C57] font-normal leading-snug mt-12 mb-6" {...props} />,
                    h2: ({node, ...props}) => <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57] font-normal leading-snug mt-10 mb-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="font-serif text-xl sm:text-2xl text-[#122C57] font-medium leading-snug mt-8 mb-4" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed mb-6" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mt-4 mb-6 text-[#0A1B3D]/80" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 mt-4 mb-6 text-[#0A1B3D]/80" {...props} />,
                    li: ({node, ...props}) => <li className="pl-2" {...props} />,
                    a: ({node, ...props}) => <a className="text-[#C99A44] hover:underline font-medium" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-[#0A1B3D]" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#C99A44] pl-4 italic my-6 text-[#122C57]/80" {...props} />,
                  }}
                >
                  {post.bodyContent}
                </ReactMarkdown>
              ) : (
                <>
                  <p className="text-base sm:text-lg leading-relaxed">{post.content.intro}</p>

                  {/* Visual Engineering Mockup */}
                  <div className="my-8 not-prose flex justify-center w-full">
                    {post.category.includes('Voice') && <VoiceAgentMockup />}
                    {post.category.includes('Agentic') && <PipelineOrchestratorMockup />}
                    {post.category.includes('Website') && <BrowserSpeedMockup />}
                  </div>

                  {/* Sections */}
                  {post.content.sections.map((section: any) => (
                    <div key={section.heading} className="space-y-4 pt-4">
                      <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57] font-normal leading-snug">
                        {section.heading}
                      </h2>
                      <p className="text-sm sm:text-base leading-relaxed text-[#0A1B3D]/90">
                        {section.body}
                      </p>
                      {section.takeaway && (
                        <Card variant="outline" className="p-4 flex items-start gap-3 bg-[#FFFFFF]">
                          <CheckCircle2 className="w-5 h-5 text-[#C99A44] shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm font-medium text-[#122C57]">{section.takeaway}</p>
                        </Card>
                      )}
                    </div>
                  ))}

                  {/* Conclusion */}
                  <div className="space-y-3 pt-6 border-t border-[#E4E2DC]">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#122C57]">Conclusion</h3>
                    <p className="text-sm sm:text-base leading-relaxed">{post.content.conclusion}</p>
                  </div>
                </>
              )}
            </div>

            {/* Structured FAQs */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="space-y-6 pt-8 border-t border-[#E4E2DC]">
                <h3 className="font-serif text-2xl text-[#122C57]">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {post.faqs.map((faq: any) => (
                    <Card key={faq.question} variant="warm" className="space-y-2">
                      <p className="font-sans font-medium text-sm sm:text-base text-[#122C57]">
                        {faq.question}
                      </p>
                      <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">{faq.answer}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio Box (E-E-A-T) */}
            <Card variant="outline" className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 bg-[#F7F5F0]/60">
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="w-16 h-16 rounded-full border-2 border-[#122C57] object-cover shrink-0"
              />
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase text-[#C99A44] tracking-wider font-semibold">About the Author</p>
                <h4 className="font-serif text-xl text-[#122C57]">{post.author.name}</h4>
                <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">{post.author.bio}</p>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={post.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#122C57] hover:underline"
                  >
                    LinkedIn Profile ↗
                  </a>
                  <a
                    href={post.author.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#122C57] hover:underline"
                  >
                    GitHub ↗
                  </a>
                </div>
              </div>
            </Card>

            {/* Next Steps CTA */}
            <div className="pt-8 border-t border-[#E4E2DC] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-serif text-2xl text-[#122C57]">Ready to Apply This to Your Business?</h4>
                <p className="text-xs sm:text-sm text-[#6B7280]">Book a free 20-minute audit call with our team in Mansa.</p>
              </div>
              <Button href="/contact" size="md" variant="primary">
                Book an AI Audit
              </Button>
            </div>
          </article>
        </SectionWrapper>
      </div>
    </>
  );
}
