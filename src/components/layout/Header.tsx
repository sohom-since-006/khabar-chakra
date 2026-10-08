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
  const { user, displayName, avatarUrl, initials, isLoggedIn } = useUserSession();

  const navLinks = [
    { label: 'Home', href: `/${locale}`, icon: 'household' as const },
    { label: 'Inventory', href: `/${locale}/home`, icon: 'fridge' as const },
    { label: 'Scan & Add', href: `/${locale}/inventory/add`, icon: 'scan' as const },
    { label: 'Use First', href: `/${locale}/inventory`, icon: 'expiring' as const },
    { label: 'Recipes', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Shopping', href: `/${locale}/shopping-list`, icon: 'shopping-list' as const },
    { label: 'Waste & ₹', href: `/${locale}/waste`, icon: 'recycle' as const },
  ];

  return (
    <header className="sticky top-0 bg-[#0B3326] dark:bg-[#071F17] text-white z-50 border-b border-[#144737] dark:border-[#134232] shadow-sm transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Cursive Typography */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
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
            <span className="text-[10px] text-[#A5C7B7] font-medium tracking-tight block">
              খাবার চক্র : Smart Food Tracker & Zero Waste
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
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Custom Working Light/Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Expiry Reminders Notification Bell */}
          <Link
            href={`/${locale}/notifications`}
            className="p-2 text-[#C0E0D0] hover:text-white rounded-full bg-[#0E3E2F] hover:bg-[#165842] border border-[#195A44] relative transition-colors"
            title="Expiry Reminders & Alerts"
          >
            <KhabarIcon name="bell" size={17} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D6381F] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              2
            </span>
          </Link>

          {/* Real User Profile Chip or Sign In Button (Zero Fake Users) */}
          {isLoggedIn ? (
            <Link
              href={`/${locale}/profile`}
              className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#0E3E2F] hover:bg-[#165842] border border-[#195A44] transition-colors group"
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
              <span className="text-[#8FB7A3] text-[10px]">▼</span>
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFC93C] text-[#0A281E] hover:bg-[#FFD56B] text-xs font-bold transition-all shadow-sm"
            >
              <KhabarIcon name="profile" size={14} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#C0E0D0] hover:text-white bg-[#0E3E2F] border border-[#195A44] rounded-lg"
            aria-label="Toggle Navigation"
          >
            <KhabarIcon name={mobileMenuOpen ? "error" : "sliders"} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A2E22] dark:bg-[#051A13] border-t border-[#144737] px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#C8E8D9] hover:bg-[#144D39] hover:text-white"
            >
              <KhabarIcon name={item.icon} size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-[#164F3B] flex gap-2">
            {isLoggedIn ? (
              <Link
                href={`/${locale}/profile`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-[#164F3B] text-white rounded-lg"
              >
                My Kitchen Profile
              </Link>
            ) : (
              <Link
                href={`/${locale}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-[#FFC93C] text-[#0A281E] rounded-lg"
              >
                Sign In with Google
              </Link>
            )}
            <Link
              href={`/${locale}/inventory/add`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-semibold bg-[#165842] text-white rounded-lg"
            >
              + Add Food
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
