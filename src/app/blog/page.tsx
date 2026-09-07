import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeavyDraggable, GravityPull, ScrollReveal } from '@/components/ui/physics-effects';
import { Clock, Calendar, ArrowUpRight, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog & Technical Guides | Gravity For AI',
  description:
    'Practical guides, ROI teardowns, and architecture insights on AI voice agents, Next.js web development, and agentic AI systems for growing businesses.',
  alternates: {
    canonical: 'https://gravity4ai.com/blog',
  },
};

export default function BlogListingPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gravity For AI Blog',
    description: 'Technical and business guides on agentic AI, voice agents, and web engineering.',
    url: 'https://gravity4ai.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Gravity For AI',
      url: 'https://gravity4ai.com',
      logo: 'https://gravity4ai.com/icon.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mansa',
        addressRegion: 'Punjab',
        addressCountry: 'IN',
      },
    },
    hasPart: BLOG_POSTS_SEED.map((post) => ({
      '@type': 'Article',
      headline: post.title,
      url: post.canonicalUrl,
      datePublished: post.publishedAt,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="w-full flex flex-col">
        <SectionWrapper variant="white" className="pt-12 sm:pt-16 pb-16">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C99A44]">
                Insights &amp; Strategy
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl text-[#122C57] font-normal leading-[1.06]">
                Engineering &amp; Applied AI Blog
              </h1>
            </div>
          </ScrollReveal>
          <p className="font-sans text-base sm:text-lg text-[#0A1B3D]/80 leading-relaxed pt-2">
            Actionable guides, cost comparisons, and technical insights on deploying AI voice agents, high-speed websites, and agentic workflows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
            {BLOG_POSTS_SEED.map((post) => (
              <HeavyDraggable key={post.slug}>
                <GravityPull>
                  <Card
                    variant="outline"
                    className="flex flex-col justify-between hover:border-[#122C57] transition-all duration-300 group h-full"
                  >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-[#6B7280]">
                      <span className="px-2.5 py-0.5 bg-[#F7F5F0] border border-[#E4E2DC] text-[#122C57] uppercase font-semibold text-[10px]">
                        {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
                      </span>
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl text-[#122C57] group-hover:text-[#0A1B3D] leading-snug">
                      <Link href={`/blog/${post.slug}`} draggable={false} className="hover:underline underline-offset-4">
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed line-clamp-3">
                      {post.metaDescription}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#E4E2DC] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#122C57]/10 flex items-center justify-center text-[#122C57] text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-[#0A1B3D] font-medium">{post.author.name}</span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      draggable={false}
                      className="inline-flex items-center gap-1 text-xs font-mono uppercase text-[#122C57] group-hover:text-[#C99A44] font-semibold transition-colors"
                    >
                      Read <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
                </GravityPull>
              </HeavyDraggable>
            ))}
          </div>
        </SectionWrapper>

        {/* Newsletter / Audit CTA */}
        <SectionWrapper variant="warm" className="text-center py-20">
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="font-serif text-3xl text-[#122C57]">Want to Automate Your Business?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Book a free 20-minute AI audit. We will map your manual bottlenecks and show you what an automated system can achieve.
            </p>
            <div className="pt-4 flex justify-center">
              <Button href="/contact" size="md" variant="primary">
                Book a Free AI Audit
              </Button>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}
