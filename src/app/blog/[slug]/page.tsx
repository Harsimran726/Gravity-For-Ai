import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, Github, Linkedin, CheckCircle2 } from 'lucide-react';

export function generateStaticParams() {
  return BLOG_POSTS_SEED.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS_SEED.find((p) => p.slug === params.slug);
  if (!post) {
    notFound();
  }

  // Advanced Nested Schema (Person + Organization + Article + Breadcrumbs + FAQPage)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl,
    },
    headline: post.title,
    description: post.metaDescription,
    image: post.ogImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    articleSection: post.category,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(', '),
    inLanguage: 'en-IN',
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
      description: post.author.bio,
      image: post.author.avatarUrl,
      url: 'https://gravity4ai.com/about',
      sameAs: [post.author.githubUrl, post.author.linkedinUrl],
      worksFor: {
        '@type': 'Organization',
        name: 'Gravity For AI',
        url: 'https://gravity4ai.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Mansa',
          addressRegion: 'Punjab',
          postalCode: '151505',
          addressCountry: 'IN',
        },
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gravity For AI',
      url: 'https://gravity4ai.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gravity4ai.com/icon.png',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mansa',
        addressRegion: 'Punjab',
        postalCode: '151505',
        addressCountry: 'IN',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gravity4ai.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://gravity4ai.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: post.canonicalUrl,
      },
    ],
  };

  const faqSchema =
    post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <head>
        <link rel="amphtml" href={`https://gravity4ai.com/amp/blog/${post.slug}`} />
      </head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="w-full flex flex-col">
        <SectionWrapper variant="white" className="pt-10 sm:pt-14 pb-20">
          <article className="max-w-3xl mx-auto space-y-10">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#122C57] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Articles
            </Link>

            {/* Header / Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#6B7280]">
                <span className="px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E4E2DC] text-[#122C57] font-semibold uppercase text-[10px]">
                  {post.category}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
                </span>
                <span>·</span>
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
                    <p className="text-xs text-[#6B7280]">{post.author.role} · Mansa, Punjab</p>
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
              <p className="text-base sm:text-lg leading-relaxed">{post.content.intro}</p>

              {/* Sections */}
              {post.content.sections.map((section) => (
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
            </div>

            {/* Structured FAQs */}
            {post.faqs.length > 0 && (
              <div className="space-y-6 pt-8 border-t border-[#E4E2DC]">
                <h3 className="font-serif text-2xl text-[#122C57]">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {post.faqs.map((faq) => (
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
                    LinkedIn Profile →
                  </a>
                  <a
                    href={post.author.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#122C57] hover:underline"
                  >
                    GitHub →
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
