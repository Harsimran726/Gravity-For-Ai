import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';

export function generateStaticParams() {
  return BLOG_POSTS_SEED.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = BLOG_POSTS_SEED.find((p) => p.slug === params.slug);
  if (!post) return { title: 'AMP Article Not Found | Gravity For AI' };

  return {
    title: `${post.title} (AMP) | Gravity For AI`,
    description: post.metaDescription,
    alternates: {
      canonical: post.canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function AmpBlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS_SEED.find((p) => p.slug === params.slug);
  if (!post) {
    notFound();
  }

  const ampSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl,
    },
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
      url: 'https://gravity4ai.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gravity For AI',
      url: 'https://gravity4ai.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gravity4ai.com/icon.png',
      },
    },
  };

  return (
    <>
      <head>
        <link rel="canonical" href={post.canonicalUrl} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0A1B3D; background: #FFFFFF; margin: 0; padding: 0; }
            .amp-header { background: #122C57; color: #FFFFFF; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
            .amp-logo { font-size: 14px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #FFFFFF; text-decoration: none; }
            .amp-container { max-width: 680px; margin: 0 auto; padding: 24px 20px 60px; }
            .amp-badge { display: inline-block; font-size: 11px; font-family: monospace; text-transform: uppercase; color: #C99A44; margin-bottom: 12px; }
            .amp-title { font-size: 28px; line-height: 1.2; color: #122C57; margin: 0 0 16px; font-family: Georgia, serif; }
            .amp-meta { font-size: 12px; color: #6B7280; border-bottom: 1px solid #E4E2DC; padding-bottom: 16px; margin-bottom: 24px; }
            .amp-takeaway { background: #F7F5F0; border-left: 4px solid #C99A44; padding: 14px 16px; margin-bottom: 24px; font-size: 14px; font-weight: 500; }
            .amp-h2 { font-size: 20px; color: #122C57; font-family: Georgia, serif; margin: 28px 0 12px; }
            .amp-btn { display: inline-block; background: #122C57; color: #FFFFFF; padding: 12px 24px; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.05em; }
            .amp-footer { border-top: 1px solid #E4E2DC; padding: 24px 20px; font-size: 12px; color: #6B7280; text-align: center; }
          `,
          }}
        />
      </head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ampSchema) }}
      />

      <header className="amp-header">
        <a href="/" className="amp-logo">Gravity For AI</a>
        <a href="/contact" style={{ color: '#C99A44', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Book Audit</a>
      </header>

      <main className="amp-container">
        <span className="amp-badge">{post.category} · {post.readingTime} min read</span>
        <h1 className="amp-title">{post.title}</h1>
        <div className="amp-meta">
          By {post.author.name} · Published {new Date(post.publishedAt).toLocaleDateString('en-US')} · Mansa, Punjab
        </div>

        <div className="amp-takeaway">
          <strong>Key Takeaway:</strong> {post.geoAnswer}
        </div>

        <p>{post.content.intro}</p>

        {post.content.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="amp-h2">{section.heading}</h2>
            <p>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: '32px', padding: '20px', background: '#F7F5F0', border: '1px solid #E4E2DC' }}>
          <h3 style={{ margin: '0 0 8px', fontFamily: 'Georgia, serif', color: '#122C57' }}>Schedule Your 20-Minute AI Audit</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
            We analyze your workflows and inbound inquiries from Mansa, Punjab with zero obligation.
          </p>
          <a href="/contact" className="amp-btn">Book an AI Audit</a>
        </div>
      </main>

      <footer className="amp-footer">
        © {new Date().getFullYear()} Gravity For AI · Mansa, Punjab 151505, India · <a href={post.canonicalUrl} style={{ color: '#122C57' }}>View Canonical Version</a>
      </footer>
    </>
  );
}
