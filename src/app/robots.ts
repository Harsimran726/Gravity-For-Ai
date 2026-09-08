import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = ['/admin', '/admin/', '/api', '/api/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      // Explicit permissions for major AI / LLM search & answer engines (AEO / GEO)
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Applebot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: 'https://gravityforai.com/sitemap.xml',
    host: 'https://gravityforai.com',
  };
}
