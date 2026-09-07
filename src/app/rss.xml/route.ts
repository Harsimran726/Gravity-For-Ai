import { NextResponse } from 'next/server';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';

export async function GET() {
  const baseUrl = 'https://gravity4ai.com';

  const itemsXml = BLOG_POSTS_SEED.map(
    (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.metaDescription}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${post.category}</category>
      <author>contact@gravity4ai.com (${post.author.name})</author>
    </item>`
  ).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gravity For AI - Technical Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Engineering and applied AI strategy for growing businesses by Gravity For AI (Mansa, Punjab).</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
    },
  });
}
