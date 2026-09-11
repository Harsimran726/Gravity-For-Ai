/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.ampproject.org;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://github.com https://avatars.githubusercontent.com https://gravityforai.com https://www.google-analytics.com;
  font-src 'self' https://fonts.gstatic.com data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // Tricity merges → /locations/chandigarh
      { source: '/locations/mohali', destination: '/locations/chandigarh', permanent: true },
      { source: '/locations/panchkula', destination: '/locations/chandigarh', permanent: true },
      // Punjab regional merges → /locations/punjab-regional
      { source: '/locations/barnala', destination: '/locations/punjab-regional', permanent: true },
      { source: '/locations/amritsar', destination: '/locations/punjab-regional', permanent: true },
      { source: '/locations/jalandhar', destination: '/locations/punjab-regional', permanent: true },
      { source: '/locations/patiala', destination: '/locations/punjab-regional', permanent: true },
      // Delhi merges → /locations/delhi
      { source: '/locations/new-delhi', destination: '/locations/delhi', permanent: true },
      { source: '/locations/delhi-ncr', destination: '/locations/delhi', permanent: true },
      // India remote → /locations/india-remote
      { source: '/locations/gandhinagar', destination: '/locations/india-remote', permanent: true },
      { source: '/locations/surat', destination: '/locations/india-remote', permanent: true },
      { source: '/locations/jaipur', destination: '/locations/india-remote', permanent: true },
      { source: '/locations/kolkata', destination: '/locations/india-remote', permanent: true },
      // US cities → /locations/united-states
      { source: '/locations/austin', destination: '/locations/united-states', permanent: true },
      { source: '/locations/raleigh', destination: '/locations/united-states', permanent: true },
      { source: '/locations/tampa', destination: '/locations/united-states', permanent: true },
      { source: '/locations/salt-lake-city', destination: '/locations/united-states', permanent: true },
      { source: '/locations/pittsburgh', destination: '/locations/united-states', permanent: true },
      // Germany cities → /locations/europe
      { source: '/locations/stuttgart', destination: '/locations/europe', permanent: true },
      { source: '/locations/leipzig', destination: '/locations/europe', permanent: true },
      { source: '/locations/nuremberg', destination: '/locations/europe', permanent: true },
      { source: '/locations/dresden', destination: '/locations/europe', permanent: true },
      { source: '/locations/hannover', destination: '/locations/europe', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
      {
        source: '/admin',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
