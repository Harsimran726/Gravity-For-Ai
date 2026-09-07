'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Completely hide public navigation bar on all /admin pages (especially /admin/login)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E2DC] py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          : 'bg-transparent py-6'
      )}
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Wordmark & Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#C99A44] outline-none"
        >
          {/* Brand Logo Icon */}
          <Image
            src="/apple-touch-icon.png"
            alt="Gravity For AI Logo"
            width={32}
            height={32}
            priority
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <span className="font-sans font-medium text-sm sm:text-base tracking-[0.18em] text-[#122C57] uppercase select-none">
            Gravity <span className="font-normal text-[#122C57]/70">For AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs sm:text-sm font-sans text-[#6B7280] hover:text-[#122C57] transition-colors tracking-wide outline-none focus-visible:text-[#122C57]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center">
          <Button href="/contact" size="sm" variant="primary">
            Book an AI Audit
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-3">
          <Button href="/contact" size="sm" variant="primary" className="text-xs px-3 py-1.5">
            Audit
          </Button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#122C57] hover:text-[#0A1B3D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A44]"
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="sm:hidden bg-[#FFFFFF] border-b border-[#E4E2DC] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-sans text-[#122C57] hover:text-[#C99A44] py-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2">
            <Button
              href="/contact"
              size="md"
              variant="primary"
              className="w-full justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book an AI Audit
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
