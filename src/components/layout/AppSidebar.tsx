'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserSession } from '@/hooks/useUserSession';

interface AppSidebarProps {
  locale: string;
}

export function AppSidebar({ locale }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, displayName, avatarUrl, initials, isLoggedIn } = useUserSession();

  const menuItems = [
    { label: 'Dashboard', href: `/${locale}`, icon: 'household' as const },
    { label: 'Scan & OCR Receipt', href: `/${locale}/inventory/add`, icon: 'scan' as const },
    { label: 'My Inventory', href: `/${locale}/home`, icon: 'fridge' as const },
    { label: 'Use This First', href: `/${locale}/inventory`, icon: 'expiring' as const },
    { label: 'Before You Buy', href: `/${locale}/shopping-list`, icon: 'shopping-list' as const },
    { label: 'Recipe Rescue', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Nutrition & Macros', href: `/${locale}/nutrition`, icon: 'portion' as const },
    { label: 'Waste & ₹ Impact', href: `/${locale}/waste`, icon: 'recycle' as const },
    { label: 'Settings', href: `/${locale}/settings`, icon: 'sliders' as const },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[var(--kc-card)] border-r border-[var(--kc-card-border)] p-4 sm:p-5 hidden xl:flex flex-col justify-between min-h-[calc(100vh-64px)] shadow-sm transition-colors">
      <div className="space-y-5">
        {/* User Profile Mini Badge or Guest Quick Sign-in */}
        {isLoggedIn ? (
          <Link
            href={`/${locale}/profile`}
            className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#132A20] border border-[var(--kc-hairline)] hover:border-[var(--kc-basil)] transition-all shadow-sm group"
          >
            {avatarUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#2EB286] shrink-0">
                <Image
                  src={avatarUrl}
                  alt={displayName || 'User Profile'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--kc-basil)] text-white flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition-transform shrink-0">
                {initials}
              </div>
            )}
            <div className="leading-tight overflow-hidden">
              <span className="text-sm font-bold text-[var(--kc-ink)] block truncate">
                {displayName || user?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-[var(--kc-basil)] font-semibold flex items-center gap-1 mt-0.5">
                Kitchen Lead 🌿
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href={`/${locale}/login`}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[var(--kc-mint)] to-transparent border border-[var(--kc-hairline)] hover:border-[var(--kc-basil)] transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--kc-basil)] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              👤
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-[var(--kc-ink)] block">
                eg. Home Chef
              </span>
              <span className="text-[11px] text-[var(--kc-basil)] font-semibold underline mt-0.5 block">
                Sign In with Google →
              </span>
            </div>
          </Link>
        )}

        {/* Sidebar Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--kc-mint)] text-[var(--kc-basil)] shadow-sm font-bold translate-x-1 border border-[var(--kc-card-border)]'
                    : 'text-[var(--kc-muted)] hover:bg-neutral-100 dark:hover:bg-[#132E22] hover:text-[var(--kc-ink)]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'text-[var(--kc-basil)]' : 'text-[var(--kc-muted)]'
                  }`}
                >
                  <KhabarIcon name={item.icon} size={17} />
                </div>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme Toggler & Zero-Waste Motto */}
      <div className="pt-4 border-t border-[var(--kc-hairline)] space-y-3">
        {/* Quick Theme Switcher */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-[#132A20] border border-[var(--kc-hairline)]">
          <span className="text-[11px] font-mono font-medium text-[var(--kc-muted)] uppercase tracking-wider pl-1">
            Theme
          </span>
          <ThemeToggle showLabel />
        </div>

        {/* Almanac Cursive Callout Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-neutral-50 to-[var(--kc-mint)] dark:from-[#0E261C] dark:to-[#122E22] border border-[var(--kc-card-border)] text-left relative overflow-hidden">
          <div className="leading-none mb-1">
            <span className="font-cursive-sacramento text-2xl text-[var(--kc-basil)] block">
              Small Steps
            </span>
            <span className="font-cursive-vibes text-2xl text-[var(--kc-ink)] block font-bold">
              Zero Waste
            </span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[10px] text-[var(--kc-muted)] font-mono uppercase tracking-wider">
              Smart Kitchen Ledger
            </span>
            <span className="text-lg">🌿</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
