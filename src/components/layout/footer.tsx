'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Hide footer completely on all /admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E4E2DC] text-[#122C57] py-16 sm:py-20">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-[#E4E2DC]">
          {/* Brand Info & NAP */}
          <div className="md:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#C99A44]"
            >
              <Image
                src="/apple-touch-icon.png"
                alt="Gravity For AI Logo"
                width={30}
                height={30}
                className="w-7 h-7 rounded-lg object-contain"
              />
              <span className="font-sans font-medium text-sm tracking-[0.18em] text-[#122C57] uppercase">
                Gravity <span className="font-normal text-[#122C57]/70">For AI</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-sm leading-relaxed">
              AI voice agents, agentic automation, and conversion-focused websites built and managed for growing businesses.
            </p>
            {/* NAP (Name, Address, Phone) structured for local search */}
            <div className="pt-2 text-xs text-[#6B7280] space-y-1 font-sans">
              <p className="font-medium text-[#0A1B3D]">Headquarters:</p>
              <Link href="/locations/mansa" className="text-[#122C57] hover:text-[#C99A44] font-medium flex items-center gap-1 transition-colors">
                Mansa, Punjab 151505, India (HQ) →
              </Link>
              <p>contact@gravityforai.com</p>
            </div>
          </div>

          {/* Services Column */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-mono tracking-wider uppercase text-[#122C57] font-semibold">Services</p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280]">
              <li>
                <Link href="/services/ai-voice-agents" className="hover:text-[#122C57] transition-colors">
                  AI Voice Agents
                </Link>
              </li>
              <li>
                <Link href="/services/website-development" className="hover:text-[#122C57] transition-colors">
                  Website Development
                </Link>
              </li>
              <li>
                <Link href="/services/agentic-ai-systems" className="hover:text-[#122C57] transition-colors">
                  Agentic AI Systems
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#122C57] transition-colors font-medium text-[#122C57]">
                  All Services Overview →
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Hubs Column */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-mono tracking-wider uppercase text-[#122C57] font-semibold">Regional Hubs</p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280]">
              <li>
                <Link href="/locations/mansa" className="text-[#122C57] font-semibold hover:text-[#C99A44] transition-colors flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C99A44]" /> Mansa (Primary HQ)
                </Link>
              </li>
              <li>
                <Link href="/locations/bathinda" className="hover:text-[#122C57] transition-colors">
                  Bathinda Hub
                </Link>
              </li>
              <li>
                <Link href="/locations/ludhiana" className="hover:text-[#122C57] transition-colors">
                  Ludhiana Hub
                </Link>
              </li>
              <li>
                <Link href="/locations/chandigarh" className="hover:text-[#122C57] transition-colors">
                  Chandigarh Tricity
                </Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-[#122C57] transition-colors font-medium text-[#122C57]">
                  All Location Hubs →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-mono tracking-wider uppercase text-[#122C57] font-semibold">Company</p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B7280]">
              <li>
                <Link href="/about" className="hover:text-[#122C57] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-[#122C57] transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#122C57] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#122C57] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#122C57] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>© 2026 Gravity For AI. All rights reserved.</p>
          <p className="text-[11px] text-[#6B7280]/80">
            Engineered for high performance, AEO & local discoverability.
          </p>
        </div>
      </div>
    </footer>
  );
}
