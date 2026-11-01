'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserSession } from '@/hooks/useUserSession';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, displayName, avatarUrl, initials, isLoggedIn, signOut } = useUserSession();

  const navLinks = [
    { label: 'Home', href: isLoggedIn ? `/${locale}/home` : `/${locale}`, icon: 'household' as const },
    { label: 'Scan Intake', href: `/${locale}/inventory/add`, icon: 'scan' as const },
    { label: 'Use First', href: `/${locale}/inventory`, icon: 'expiring' as const },
    { label: 'Before You Buy', href: `/${locale}/shopping-list`, icon: 'shopping-list' as const },
    { label: 'Recipes', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Planner', href: `/${locale}/planner`, icon: 'calendar' as const },
    { label: 'Analytics', href: `/${locale}/waste`, icon: 'recycle' as const },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-[#071610]/85 border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Unified Typography */}
        <Link href={isLoggedIn ? `/${locale}/home` : `/${locale}`} className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-2xl bg-[var(--kc-mint)] dark:bg-[#123023] p-1 flex items-center justify-center border border-[var(--kc-card-border)] shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/branding/app-logo.png"
              alt="Khabar Chakra"
              width={32}
              height={32}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-cursive-sacramento text-2xl sm:text-[28px] font-bold text-[var(--kc-ink)] block -mb-1 group-hover:text-[var(--kc-basil)] transition-colors">
                Khabar Chakra
              </span>
              <span className="hidden md:inline-flex text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[var(--kc-mint)] text-[var(--kc-basil)] border border-[var(--kc-card-border)]">
                v2.0
              </span>
            </div>
            <span className="text-[10px] font-heading font-medium tracking-tight text-[var(--kc-muted)] block">
              খাবার চক্র · Smart Kitchen Food Intelligence
            </span>
          </div>
        </Link>

        {/* Center: Sleek Frosted Pill Navigational Menu (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/80 dark:bg-[#0D241B]/80 p-1.5 rounded-full border border-black/[0.05] dark:border-white/[0.06] shadow-inner">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-[#153D2C] text-[var(--kc-basil)] dark:text-[#34D399] shadow-sm font-bold border border-black/[0.04] dark:border-white/[0.08]'
                    : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] font-medium'
                }`}
              >
                <KhabarIcon name={item.icon} size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle, Notifications & Real User Profile Chip */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Custom Working Light/Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Expiry Reminders Notification Bell */}
          <Link
            href={`/${locale}/notifications`}
            className="w-9 h-9 flex items-center justify-center text-[var(--kc-muted)] hover:text-[var(--kc-ink)] rounded-full bg-neutral-100/80 dark:bg-[#0D241B]/80 hover:bg-neutral-200/80 dark:hover:bg-[#133527] border border-[var(--kc-card-border)] relative transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--kc-basil)]"
            title="Expiry Reminders & Alerts"
            aria-label="View Expiry Reminders and Alerts (2 pending)"
          >
            <KhabarIcon name="bell" size={17} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--kc-chilli)] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
              2
            </span>
          </Link>

          {/* Real User Profile Chip or Sign In Button (Zero Fake Users) */}
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-neutral-100/80 dark:bg-[#0D241B]/80 hover:bg-neutral-200/80 dark:hover:bg-[#133527] border border-[var(--kc-card-border)] transition-colors group"
                title="Kitchen Profile"
              >
                {avatarUrl ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[var(--kc-basil)] shadow-sm">
                    <Image
                      src={avatarUrl}
                      alt={displayName || 'User Avatar'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--kc-basil)] text-white font-heading font-bold text-xs flex items-center justify-center shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="text-left leading-tight max-w-[120px] truncate">
                  <span className="text-xs font-heading font-semibold text-[var(--kc-ink)] group-hover:text-[var(--kc-basil)] block truncate">
                    {displayName || user?.email?.split('@')[0]}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => signOut(locale)}
                className="px-2.5 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-heading font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
                title="Sign Out"
                aria-label="Sign Out"
              >
                Sign Out ⎋
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0B6E3C] to-[#128047] dark:from-[#10B981] dark:to-[#059669] text-white hover:brightness-105 text-xs font-heading font-bold transition-all shadow-sm"
            >
              <KhabarIcon name="profile" size={14} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile user avatar chip or Sign In button */}
          {isLoggedIn ? (
            <Link
              href={`/${locale}/profile`}
              className="sm:hidden w-8 h-8 rounded-full overflow-hidden border border-[var(--kc-basil)] flex items-center justify-center bg-[var(--kc-basil)] text-white font-heading font-bold text-xs shrink-0 shadow-sm"
              title="Kitchen Profile"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                initials
              )}
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="sm:hidden px-3 py-1 rounded-full bg-[var(--kc-basil)] text-white text-xs font-heading font-bold shrink-0 shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-[var(--kc-muted)] hover:text-[var(--kc-ink)] bg-neutral-100/80 dark:bg-[#0D241B]/80 border border-[var(--kc-card-border)] rounded-full focus-visible:ring-2 focus-visible:ring-[var(--kc-basil)]"
            aria-label="Toggle Navigation"
          >
            <KhabarIcon name={mobileMenuOpen ? "error" : "sliders"} size={17} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Frosted Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden backdrop-blur-2xl bg-white/95 dark:bg-[#071610]/95 border-t border-[var(--kc-card-border)] px-4 py-4 space-y-3 max-h-[calc(100vh-64px)] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Mobile User Profile Card */}
          {isLoggedIn ? (
            <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-[#0D241B]/80 border border-[var(--kc-card-border)] flex items-center justify-between gap-3 shadow-sm">
              <Link
                href={`/${locale}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 overflow-hidden group"
              >
                {avatarUrl ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--kc-basil)] shrink-0">
                    <Image src={avatarUrl} alt={displayName || 'User Avatar'} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--kc-basil)] text-white font-heading font-bold text-xs flex items-center justify-center shadow-inner shrink-0">
                    {initials}
                  </div>
                )}
                <div className="text-left leading-tight truncate">
                  <span className="text-sm font-heading font-bold text-[var(--kc-ink)] block truncate">
                    {displayName || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[11px] text-[var(--kc-basil)] font-medium block">
                    Kitchen Steward 🌿
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut(locale);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-heading font-bold shrink-0 transition-colors shadow-sm"
                title="Sign Out"
              >
                Sign Out ⎋
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-[#0D241B]/80 border border-[var(--kc-card-border)] flex items-center justify-between gap-3 shadow-sm">
              <div className="leading-tight">
                <span className="text-xs font-heading font-bold text-[var(--kc-ink)] block">Domestic Kitchen Ledger</span>
                <span className="text-[11px] text-[var(--kc-muted)] block">Sign in to sync your inventory</span>
              </div>
              <Link
                href={`/${locale}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-1.5 rounded-full bg-[var(--kc-basil)] text-white text-xs font-heading font-bold shadow-sm"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Navigation Links Grid / List */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading transition-all ${
                    isActive
                      ? 'bg-[var(--kc-mint)] text-[var(--kc-basil)] font-bold shadow-sm'
                      : 'text-[var(--kc-muted)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-[var(--kc-ink)] font-medium'
                  }`}
                >
                  <KhabarIcon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Additional Secondary Links on Mobile */}
            <Link
              href={`/${locale}/nutrition`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-[var(--kc-muted)] hover:text-[var(--kc-ink)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium"
            >
              <KhabarIcon name="portion" size={18} />
              <span>Nutrition & Macros</span>
            </Link>
            <Link
              href={`/${locale}/settings/security`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-[var(--kc-muted)] hover:text-[var(--kc-ink)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium"
            >
              <KhabarIcon name="sliders" size={18} />
              <span>Security & Password</span>
            </Link>
            <Link
              href={`/${locale}/team`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading text-[var(--kc-muted)] hover:text-[var(--kc-ink)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium"
            >
              <KhabarIcon name="volunteer" size={18} />
              <span>Colophon & S-QUAD Team</span>
            </Link>
          </nav>

          {/* Bottom Fast Action in Drawer */}
          <div className="pt-2 border-t border-[var(--kc-card-border)]">
            <Link
              href={`/${locale}/inventory/add`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-[#0B6E3C] to-[#128047] dark:from-[#10B981] dark:to-[#059669] text-white rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
            >
              <KhabarIcon name="scan" size={16} />
              <span>+ Log Food / Scan Receipt</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
