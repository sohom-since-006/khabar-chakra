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
  const { user, displayName, avatarUrl, initials, isLoggedIn, signOut } = useUserSession();

  const menuItems = [
    { label: 'Overview', href: `/${locale}/home`, icon: 'household' as const },
    { label: 'Kitchen Ledger', href: `/${locale}/home`, icon: 'fridge' as const },
    { label: 'Scan & OCR Receipt', href: `/${locale}/inventory/add`, icon: 'scan' as const },
    { label: 'Use This First', href: `/${locale}/inventory`, icon: 'expiring' as const },
    { label: 'Before You Buy', href: `/${locale}/shopping-list`, icon: 'shopping-list' as const },
    { label: 'Recipe Rescue', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Meal Planner & Studio', href: `/${locale}/planner`, icon: 'calendar' as const },
    { label: 'Nutrition & Macros', href: `/${locale}/nutrition`, icon: 'portion' as const },
    { label: 'Waste & ₹ Analytics', href: `/${locale}/waste`, icon: 'recycle' as const },
    { label: 'Settings', href: `/${locale}/settings`, icon: 'sliders' as const },
  ];

  return (
    <aside className="w-68 shrink-0 bg-white/70 dark:bg-[#081812]/75 backdrop-blur-xl border-r border-[var(--kc-card-border)] p-4 sm:p-5 hidden xl:flex flex-col justify-between min-h-[calc(100vh-64px)] shadow-sm transition-colors duration-300">
      <div className="space-y-6">
        {/* User Profile Card or Guest Quick Sign-in */}
        {isLoggedIn ? (
          <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-[#0D241B]/70 border border-[var(--kc-card-border)] shadow-sm space-y-3">
            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-3 group"
            >
              {avatarUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--kc-basil)] shrink-0 shadow-sm">
                  <Image
                    src={avatarUrl}
                    alt={displayName || 'User Profile'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--kc-basil)] text-white flex items-center justify-center font-heading font-bold text-sm shadow-inner group-hover:scale-105 transition-transform shrink-0">
                  {initials}
                </div>
              )}
              <div className="leading-tight overflow-hidden">
                <span className="text-sm font-heading font-bold text-[var(--kc-ink)] block truncate group-hover:text-[var(--kc-basil)] transition-colors">
                  {displayName || user?.email?.split('@')[0]}
                </span>
                <span className="text-[11px] font-heading text-[var(--kc-basil)] font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--kc-basil)] animate-pulse" />
                  Kitchen Atelier
                </span>
              </div>
            </Link>
            <div className="pt-2 border-t border-[var(--kc-card-border)] flex items-center justify-between">
              <Link
                href={`/${locale}/settings/security`}
                className="text-[11px] font-heading font-medium text-[var(--kc-muted)] hover:text-[var(--kc-basil)] transition-colors"
              >
                Security
              </Link>
              <button
                type="button"
                onClick={() => signOut(locale)}
                className="text-[11px] font-heading font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                title="Sign Out"
              >
                Sign Out ⎋
              </button>
            </div>
          </div>
        ) : (
          <Link
            href={`/${locale}/login`}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[var(--kc-mint)]/80 to-transparent border border-[var(--kc-card-border)] hover:border-[var(--kc-basil)] transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--kc-basil)] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              👤
            </div>
            <div className="leading-tight">
              <span className="text-xs font-heading font-bold text-[var(--kc-ink)] block">
                eg. Home Chef
              </span>
              <span className="text-[11px] font-heading text-[var(--kc-basil)] font-semibold underline mt-0.5 block">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-heading transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--kc-mint)] dark:bg-[#143B2B] text-[var(--kc-basil)] dark:text-[#34D399] shadow-sm font-bold translate-x-1 border border-[var(--kc-card-border)]'
                    : 'text-[var(--kc-muted)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-[var(--kc-ink)] font-medium'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'text-[var(--kc-basil)] dark:text-[#34D399]' : 'text-[var(--kc-muted)]'
                  }`}
                >
                  <KhabarIcon name={item.icon} size={16} />
                </div>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme Toggler & Zero-Waste Motto */}
      <div className="pt-4 border-t border-[var(--kc-card-border)] space-y-3">
        {/* Quick Theme Switcher */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-neutral-100/70 dark:bg-[#0D241B]/70 border border-[var(--kc-card-border)]">
          <span className="text-[11px] font-heading font-medium text-[var(--kc-muted)] uppercase tracking-wider pl-1.5">
            Atmosphere
          </span>
          <ThemeToggle showLabel />
        </div>

        {/* Atelier Culinary Callout Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-white/80 to-[var(--kc-mint)]/40 dark:from-[#0E261C] dark:to-[#122E22] border border-[var(--kc-card-border)] text-left relative overflow-hidden shadow-sm">
          <div className="leading-tight mb-1.5">
            <span className="font-cursive-sacramento text-2xl text-[var(--kc-basil)] block">
              Every Meal Rescued
            </span>
            <span className="font-heading text-xs font-bold text-[var(--kc-ink)] block uppercase tracking-wider">
              Zero Domestic Waste
            </span>
          </div>
          <div className="flex justify-between items-end mt-2 pt-2 border-t border-[var(--kc-card-border)]">
            <span className="text-[10px] text-[var(--kc-muted)] font-mono uppercase tracking-wider">
              Kitchen Intelligence
            </span>
            <span className="text-base">🌿</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
