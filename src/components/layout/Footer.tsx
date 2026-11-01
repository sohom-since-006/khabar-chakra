import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-[var(--kc-card-border)] bg-white/60 dark:bg-[#071610]/70 backdrop-blur-xl text-[var(--kc-ink)] pt-14 pb-10 mt-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--kc-card-border)] text-sm">
          {/* Col 1: Platform & Atelier */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[var(--kc-mint)] dark:bg-[#123023] p-1 flex items-center justify-center border border-[var(--kc-card-border)] shadow-sm">
                <Image
                  src="/branding/app-logo.png"
                  alt="Khabar Chakra Logo"
                  width={28}
                  height={28}
                  className="rounded-lg object-contain"
                />
              </div>
              <span className="font-heading font-bold tracking-tight text-base text-[var(--kc-ink)]">
                Khabar Chakra <span className="text-xs font-mono font-normal text-[var(--kc-basil)]">v2.0</span>
              </span>
            </div>
            <div className="font-heading text-[11px] font-semibold uppercase tracking-wider text-[var(--kc-muted)]">
              01 · Domestic Kitchen Intelligence
            </div>
            <p className="text-xs text-[var(--kc-muted)] leading-relaxed font-sans">
              Khabar Chakra (খাবার চক্র) is a domestic kitchen food-lifecycle intelligence platform: smart pantry & fridge tracking, dynamic freshness scoring, recipe rescue, and zero domestic waste analytics.
            </p>
            <div className="text-xs font-heading font-medium text-[var(--kc-basil)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--kc-basil)]" />
              100% Private Domestic Sanctuary · ₹0 Operating Cost
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <div className="font-heading text-[11px] font-semibold uppercase tracking-wider text-[var(--kc-muted)]">
              02 · Kitchen Ledger
            </div>
            <ul className="space-y-2 text-xs font-heading">
              <li>
                <Link href={`/${locale}/home`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Kitchen Inventory Overview
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/inventory`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  &ldquo;Use This First&rdquo; Priority Shelf
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/recipes`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Recipe Rescue Engine
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shopping-list`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  &ldquo;Before You Buy&rdquo; Assistant
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/waste`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Domestic Waste & ₹ Analytics
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Frequently Answered Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Safety & Governance */}
          <div className="space-y-2">
            <div className="font-heading text-[11px] font-semibold uppercase tracking-wider text-[var(--kc-muted)]">
              03 · Safety & Security
            </div>
            <ul className="space-y-2 text-xs font-heading">
              <li>
                <Link href={`/${locale}/legal/food-safety`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Food Safety Standards
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/terms`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Terms of Service (18+)
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/privacy`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Privacy Policy & RLS Security
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/guidelines`} className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors">
                  Zero-Waste Kitchen Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Correspondence & S-QUAD */}
          <div className="space-y-2">
            <div className="font-heading text-[11px] font-semibold uppercase tracking-wider text-[var(--kc-muted)]">
              04 · Atelier Correspondence
            </div>
            <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
              Have feedback, ingredient requests, or need technical support? Send a dispatch to the student engineering team.
            </p>
            <div className="pt-1">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--kc-mint)] dark:bg-[#123023] text-[var(--kc-basil)] text-xs font-heading font-semibold hover:brightness-105 border border-[var(--kc-card-border)] transition-all"
              >
                Send Dispatch →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--kc-muted)] gap-3 font-heading">
          <div>
            © {new Date().getFullYear()} Khabar Chakra · Built for domestic kitchens and zero waste.
          </div>
          <div>
            <Link
              href={`/${locale}/team`}
              className="text-[var(--kc-muted)] hover:text-[var(--kc-basil)] underline underline-offset-4 decoration-[var(--kc-card-border)] font-medium transition-colors"
            >
              Designed & Engineered by The S-QUAD
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
