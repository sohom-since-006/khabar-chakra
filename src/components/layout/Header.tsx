'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="almanac-rule sticky top-0 bg-[var(--kc-bg)] z-40 transition-colors">
      {/* Top Folio Bar */}
      <div className="px-4 py-1.5 flex justify-between items-center text-xs text-[var(--kc-muted)] border-b border-[var(--kc-hairline)] font-mono">
        <span>KHABAR CHAKRA · খাবার চক্র · VOL. 1</span>
        <span className="hidden sm:inline">WEST BENGAL COMMUNITY FOOD LIFECYCLE</span>
        <span>₹0 FREE PLATFORM</span>
      </div>

      {/* Main Masthead Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-[var(--kc-ink)] hover:opacity-90">
            <span className="w-8 h-8 rounded-sm bg-[var(--kc-basil)] text-white flex items-center justify-center font-bold text-sm">
              খচ
            </span>
            <div className="leading-tight">
              <span className="font-bold tracking-tight text-lg block">Khabar Chakra</span>
              <span className="text-[10px] text-[var(--kc-muted)] block -mt-0.5">খাবার চক্র · Kitchen Almanac</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link href={`/${locale}/available`} className="hover:text-[var(--kc-basil)] transition-colors">
              Available Food
            </Link>
            <Link href={`/${locale}/home`} className="hover:text-[var(--kc-basil)] transition-colors">
              My Kitchen
            </Link>
            <Link href={`/${locale}/recipes`} className="hover:text-[var(--kc-basil)] transition-colors">
              Recipes
            </Link>
            <Link href={`/${locale}/nutrition`} className="hover:text-[var(--kc-basil)] transition-colors">
              Nutrition
            </Link>
            <Link href={`/${locale}/waste`} className="hover:text-[var(--kc-basil)] transition-colors">
              Waste
            </Link>
            <Link href={`/${locale}/impact`} className="hover:text-[var(--kc-basil)] transition-colors">
              Impact
            </Link>
            <Link href={`/${locale}/help`} className="hover:text-[var(--kc-basil)] transition-colors">
              Help
            </Link>
            <Link href={`/${locale}/faq`} className="hover:text-[var(--kc-basil)] transition-colors">
              FAQ
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-[var(--kc-basil)] transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Auth CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/notifications`}
            className="p-1.5 text-[var(--kc-ink)] hover:text-[var(--kc-basil)] border border-[var(--kc-hairline)] rounded-sm relative"
            title="Freshness Alerts"
            aria-label="Freshness Alerts"
          >
            <KhabarIcon name="bell" size={18} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--kc-chilli)]" />
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href={`/${locale}/login`}
              className="text-sm font-medium px-3 py-1.5 hover:text-[var(--kc-basil)] transition-colors"
            >
              Log in
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="text-sm font-semibold px-3 py-1.5 bg-[var(--kc-basil)] text-white rounded-sm hover:opacity-90 transition-opacity"
            >
              Register Ledger
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[var(--kc-ink)] border border-[var(--kc-hairline)] rounded-sm"
            aria-label="Toggle Navigation"
          >
            <KhabarIcon name={mobileMenuOpen ? "error" : "sliders"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--kc-hairline)] bg-[var(--kc-bg)] px-4 py-4 space-y-3">
          <Link
            href={`/${locale}/available`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Available Food
          </Link>
          <Link
            href={`/${locale}/home`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            My Kitchen
          </Link>
          <Link
            href={`/${locale}/recipes`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Recipe Rescue
          </Link>
          <Link
            href={`/${locale}/nutrition`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Nutrition Journal
          </Link>
          <Link
            href={`/${locale}/notifications`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium flex items-center justify-between"
          >
            <span>Freshness Alerts</span>
            <span className="w-2 h-2 rounded-full bg-[var(--kc-chilli)]" />
          </Link>
          <Link
            href={`/${locale}/share/new`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium text-[var(--kc-basil)] font-semibold"
          >
            + Post Surplus Food
          </Link>
          <Link
            href={`/${locale}/emergency`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium text-[var(--kc-chilli)] font-semibold"
          >
            ★ Emergency NGO Relief
          </Link>
          <Link
            href={`/${locale}/waste`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Waste Separation Guide
          </Link>
          <Link
            href={`/${locale}/impact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Impact Accounting Ledger
          </Link>
          <Link
            href={`/${locale}/help`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Help Centre
          </Link>
          <Link
            href={`/${locale}/faq`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            FAQ
          </Link>
          <Link
            href={`/${locale}/contact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium"
          >
            Contact Admin
          </Link>
          <Link
            href={`/${locale}/team`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-1.5 font-medium text-[var(--kc-muted)]"
          >
            Team S-QUAD
          </Link>
          <div className="pt-3 border-t border-[var(--kc-hairline)] flex gap-2">
            <Link
              href={`/${locale}/login`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm border border-[var(--kc-hairline)] rounded-sm font-medium"
            >
              Log in
            </Link>
            <Link
              href={`/${locale}/signup`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm bg-[var(--kc-basil)] text-white rounded-sm font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
