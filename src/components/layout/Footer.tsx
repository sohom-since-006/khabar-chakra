import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="almanac-rule-top bg-[var(--kc-bg)] text-[var(--kc-ink)] pt-12 pb-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--kc-hairline)] text-sm">
          {/* Col 1: Platform */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <Image
                src="/branding/app-logo.png"
                alt="Khabar Chakra Logo"
                width={32}
                height={32}
                className="rounded-sm object-contain"
              />
              <span className="font-bold tracking-tight text-sm text-[var(--kc-ink)]">
                Khabar Chakra
              </span>
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--kc-muted)]">
              01 · PLATFORM
            </div>
            <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
              Khabar Chakra (খাবার চক্র) is a domestic kitchen food-lifecycle intelligence platform: smart pantry & fridge tracking, dynamic freshness scoring, recipe rescue, and zero domestic waste analytics.
            </p>
            <div className="text-xs font-mono text-[var(--kc-muted)]">
              Domestic Kitchens · Personal Zero Waste
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--kc-muted)]">
              02 · DIRECTORY
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href={`/${locale}/home`} className="hover:text-[var(--kc-basil)]">
                  My Kitchen Inventory
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/inventory`} className="hover:text-[var(--kc-basil)]">
                  &ldquo;Use This First&rdquo; Priority Shelf
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/recipes`} className="hover:text-[var(--kc-basil)]">
                  Recipe Rescue Engine
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shopping-list`} className="hover:text-[var(--kc-basil)]">
                  &ldquo;Before You Buy&rdquo; Assistant
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/waste`} className="hover:text-[var(--kc-basil)]">
                  Waste & ₹ Savings Analytics
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="hover:text-[var(--kc-basil)]">
                  Frequently Answered Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Safety & Governance */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--kc-muted)]">
              03 · GOVERNANCE
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href={`/${locale}/legal/food-safety`} className="hover:text-[var(--kc-basil)]">
                  Food Safety Disclaimer & Standards
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/terms`} className="hover:text-[var(--kc-basil)]">
                  Terms of Service (18+)
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/privacy`} className="hover:text-[var(--kc-basil)]">
                  Privacy Policy & RLS Security
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/guidelines`} className="hover:text-[var(--kc-basil)]">
                  Domestic Zero-Waste Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Administrative Correspondence */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--kc-muted)]">
              04 · CORRESPONDENCE
            </div>
            <p className="text-xs text-[var(--kc-muted)]">
              Contact form dispatches route to our administrative inbox.
            </p>
            <div className="text-xs">
              <Link href={`/${locale}/contact`} className="text-[var(--kc-basil)] font-medium hover:underline">
                Send Dispatch →
              </Link>
            </div>
            <div className="pt-2 text-[11px] text-[var(--kc-muted)] italic">
              Technical support: Active via GitHub & Contact
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--kc-muted)] gap-3 font-mono">
          <div>
            © {new Date().getFullYear()} Khabar Chakra · Domestic Food Intelligence
          </div>
          <div>
            <Link
              href={`/${locale}/team`}
              className="hover:text-[var(--kc-basil)] underline underline-offset-4 decoration-[var(--kc-hairline)]"
            >
              Made by The S-QUAD
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
