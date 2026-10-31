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
    { label: 'Scan Receipt', href: `/${locale}/inventory/add`, icon: 'scan' as const },
    { label: 'Use First', href: `/${locale}/inventory`, icon: 'expiring' as const },
    { label: 'Before You Buy', href: `/${locale}/shopping-list`, icon: 'shopping-list' as const },
    { label: 'Recipes', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Planner', href: `/${locale}/planner`, icon: 'calendar' as const },
    { label: 'Waste & ₹', href: `/${locale}/waste`, icon: 'recycle' as const },
  ];

  return (
    <header className="sticky top-0 bg-[#0B3326] dark:bg-[#071F17] text-white z-50 border-b border-[#144737] dark:border-[#134232] shadow-sm transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Cursive Typography */}
        <Link href={isLoggedIn ? `/${locale}/home` : `/${locale}`} className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-full bg-[#164D3B] p-1 flex items-center justify-center border border-[#217056] shadow-inner">
            <Image
              src="/branding/app-logo.png"
              alt="Khabar Chakra"
              width={34}
              height={34}
              className="rounded-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="font-cursive-sacramento text-2xl sm:text-[28px] font-bold tracking-wide text-[#F9F7EE] block -mb-1 group-hover:text-[#FFD56B] transition-colors">
              Khabar Chakra
            </span>
            <span className="text-[10px] text-[#A5C7B7] font-medium tracking-tight hidden sm:block">
              খাবার চক্র : Smart Food Tracker &amp; Zero Waste
            </span>
            <span className="text-[10px] text-[#A5C7B7] font-medium tracking-tight block sm:hidden">
              খাবার চক্র
            </span>
          </div>
        </Link>

        {/* Center: Sleek Pill Navigational Menu */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#08261C] dark:bg-[#041610] p-1 rounded-full border border-[#144737] dark:border-[#103D2E]">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#185A43] text-white shadow-sm font-semibold'
                    : 'text-[#B4D5C5] hover:text-white hover:bg-[#114232]'
                }`}
              >
                <KhabarIcon name={item.icon} size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle, Notifications & Real User Profile Chip */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Custom Working Light/Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Expiry Reminders Notification Bell */}
          <Link
            href={`/${locale}/notifications`}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#C0E0D0] hover:text-white rounded-full bg-[#0E3E2F] hover:bg-[#165842] border border-[#195A44] relative transition-colors focus-visible:ring-2 focus-visible:ring-[#2EB286]"
            title="Expiry Reminders & Alerts"
            aria-label="View Expiry Reminders and Alerts (2 pending)"
          >
            <KhabarIcon name="bell" size={18} />
            <span className="absolute 1.5 -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#D6381F] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              2
            </span>
          </Link>

          {/* Real User Profile Chip or Sign In Button (Zero Fake Users) */}
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#0E3E2F] hover:bg-[#165842] border border-[#195A44] transition-colors group"
                title="Kitchen Profile"
              >
                {avatarUrl ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#2EB286]">
                    <Image
                      src={avatarUrl}
                      alt={displayName || 'User Avatar'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#207357] text-[#D5F5E3] font-bold text-xs flex items-center justify-center border border-[#2EB286]">
                    {initials}
                  </div>
                )}
                <div className="text-left leading-tight max-w-[120px] truncate">
                  <span className="text-xs font-semibold text-[#F2FBF6] group-hover:text-white block truncate">
                    {displayName || user?.email?.split('@')[0]}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => signOut(locale)}
                className="px-2.5 py-1.5 rounded-full bg-[#8A2416] hover:bg-[#A82B1B] text-white text-xs font-bold transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-red-400"
                title="Sign Out"
                aria-label="Sign Out"
              >
                Sign Out ⎋
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFC93C] text-[#0A281E] hover:bg-[#FFD56B] text-xs font-bold transition-all shadow-sm"
            >
              <KhabarIcon name="profile" size={14} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile user avatar chip or Sign In button */}
          {isLoggedIn ? (
            <Link
              href={`/${locale}/profile`}
              className="sm:hidden w-8 h-8 rounded-full overflow-hidden border border-[#2EB286] flex items-center justify-center bg-[#207357] text-[#D5F5E3] font-bold text-xs shrink-0 shadow-sm"
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
              className="sm:hidden px-2.5 py-1 rounded-full bg-[#FFC93C] text-[#0A281E] text-xs font-bold shrink-0 shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#C0E0D0] hover:text-white bg-[#0E3E2F] border border-[#195A44] rounded-lg focus-visible:ring-2 focus-visible:ring-[#2EB286]"
            aria-label="Toggle Navigation"
          >
            <KhabarIcon name={mobileMenuOpen ? "error" : "sliders"} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A2E22] dark:bg-[#051A13] border-t border-[#144737] px-4 py-4 space-y-3 max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Mobile User Profile Card */}
          {isLoggedIn ? (
            <div className="p-3.5 rounded-xl bg-[#0E3E2F] border border-[#195A44] flex items-center justify-between gap-3 shadow-sm">
              <Link
                href={`/${locale}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 overflow-hidden group"
              >
                {avatarUrl ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#2EB286] shrink-0">
                    <Image src={avatarUrl} alt={displayName || 'User Avatar'} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#207357] text-[#D5F5E3] font-bold text-xs flex items-center justify-center border border-[#2EB286] shrink-0">
                    {initials}
                  </div>
                )}
                <div className="text-left leading-tight truncate">
                  <span className="text-sm font-bold text-white block truncate">
                    {displayName || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[11px] text-[#2EB286] font-medium block">
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
                className="px-3 py-1.5 rounded-lg bg-[#8A2416] hover:bg-[#A82B1B] text-white text-xs font-bold shrink-0 transition-colors shadow-sm"
                title="Sign Out"
              >
                Sign Out ⎋
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0E3E2F] border border-[#195A44] flex items-center justify-between gap-3 shadow-sm">
              <div className="leading-tight">
                <span className="text-xs font-bold text-white block">Domestic Kitchen Ledger</span>
                <span className="text-[11px] text-[#8FB7A3] block">Sign in to sync your inventory</span>
              </div>
              <Link
                href={`/${locale}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-full bg-[#FFC93C] text-[#0A281E] text-xs font-bold shadow-sm"
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#185A43] text-white font-bold shadow-sm'
                      : 'text-[#C8E8D9] hover:bg-[#144D39] hover:text-white'
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#C8E8D9] hover:bg-[#144D39] hover:text-white font-medium"
            >
              <KhabarIcon name="portion" size={18} />
              <span>Nutrition & Macros</span>
            </Link>
            <Link
              href={`/${locale}/settings/security`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#C8E8D9] hover:bg-[#144D39] hover:text-white font-medium"
            >
              <KhabarIcon name="sliders" size={18} />
              <span>Security & Password</span>
            </Link>
            <Link
              href={`/${locale}/team`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#C8E8D9] hover:bg-[#144D39] hover:text-white font-medium"
            >
              <KhabarIcon name="volunteer" size={18} />
              <span>Colophon & S-QUAD Team</span>
            </Link>
          </nav>

          {/* Bottom Fast Action in Drawer */}
          <div className="pt-3 border-t border-[#164F3B]">
            <Link
              href={`/${locale}/inventory/add`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider bg-[#165842] hover:bg-[#1d6d53] text-white rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
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
