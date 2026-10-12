import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OrbitScrollThread } from '@/components/ui/orbit-thread';
import { PublicAnalytics } from '@/components/analytics/public-analytics';

import { SkipToContent } from '@/components/ui/skip-to-content';
import { MainContentWrapper } from '@/components/layout/main-content-wrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#122C57',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gravityforai.com'),
  title: {
    default: 'Gravity For AI - AI Voice Agents, Websites & Agentic Systems | Mansa, Punjab',
    template: '%s | Gravity For AI',
  },
  description:
    'Gravity For AI builds AI voice agents, agentic AI systems, and premium websites for local businesses in Punjab, India & beyond. Book a free AI audit.',
  authors: [{ name: 'Harsimran Singh', url: 'https://github.com/harsimran726' }],
  keywords: [
    'AI voice agent Mansa',
    'agentic AI development Punjab',
    'website development company Mansa',
    'AI automation for business',
    'AI receptionist India',
    'AI agency Chandigarh',
    'Bathinda AI automation',
  ],
  alternates: {
    types: {
      'application/rss+xml': 'https://gravityforai.com/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Gravity For AI',
    title: 'Gravity For AI - AI Voice Agents & Business Automation',
    description:
      'We build AI voice agents, custom agentic systems, and conversion-focused websites for local businesses.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-KGBMFDBJ';

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased bg-[#FFFFFF] text-[#0A1B3D] min-h-screen flex flex-col selection:bg-[#122C57] selection:text-[#F7F5F0]">
        <SkipToContent />
        <PublicAnalytics gtmId={gtmId}/>
        <Header />
        <OrbitScrollThread />
        <MainContentWrapper>{children}</MainContentWrapper>
        <Footer />
      </body>
    </html>
  );
}
