'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { useUserSession } from '@/hooks/useUserSession';

interface MobileBottomNavProps {
  locale: string;
}

export function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isLoggedIn, avatarUrl, initials } = useUserSession();

  const isKitchenActive = pathname === `/${locale}/home` || pathname === `/${locale}`;
  const isUseFirstActive =
    pathname.startsWith(`/${locale}/inventory`) &&
    !pathname.includes('/add') &&
    !pathname.includes('/check');
  const isAddActive = pathname.startsWith(`/${locale}/inventory/add`);
  const isRecipesActive = pathname.startsWith(`/${locale}/recipes`);
  const isAccountActive =
    pathname.startsWith(`/${locale}/profile`) ||
    pathname.startsWith(`/${locale}/settings`) ||
    pathname.startsWith(`/${locale}/login`);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto backdrop-blur-2xl bg-white/92 dark:bg-[#081812]/92 border border-black/[0.07] dark:border-white/[0.1] rounded-full px-3 py-1.5 shadow-2xl transition-colors duration-300"
    >
      <div className="flex items-center justify-between">
        {/* Tab 1: Kitchen Home */}
        <Link
          href={`/${locale}/home`}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-2xl transition-all duration-200 ${
            isKitchenActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label="Kitchen Dashboard"
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isKitchenActive ? 'bg-[var(--kc-mint)] dark:bg-[#133829]' : ''}`}>
            <KhabarIcon name="household" size={18} />
          </div>
          <span className="text-[10px] font-heading font-medium tracking-tight mt-0.5">Kitchen</span>
        </Link>

        {/* Tab 2: Use First */}
        <Link
          href={`/${locale}/inventory`}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-2xl transition-all duration-200 relative ${
            isUseFirstActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label="Use This First Urgency Shelf"
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isUseFirstActive ? 'bg-[var(--kc-mint)] dark:bg-[#133829]' : ''}`}>
            <KhabarIcon name="expiring" size={18} />
          </div>
          <span className="text-[10px] font-heading font-medium tracking-tight mt-0.5">Use First</span>
        </Link>

        {/* Tab 3: Center Elevated Intake FAB */}
        <Link
          href={`/${locale}/inventory/add`}
          className="relative -top-3.5 flex flex-col items-center group cursor-pointer focus:outline-none"
          aria-label="Scan Receipt or Add Food"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#081812] transition-transform duration-200 group-hover:scale-105 active:scale-95 ${
              isAddActive
                ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white ring-2 ring-[var(--kc-mango)]'
                : 'bg-gradient-to-tr from-[#0B6E3C] to-[#128047] dark:from-[#10B981] dark:to-[#059669] text-white shadow-emerald-500/20'
            }`}
          >
            <span className="text-xl font-bold leading-none">+</span>
          </div>
          <span
            className={`text-[9.5px] font-heading font-bold mt-0.5 tracking-tight ${
              isAddActive ? 'text-[var(--kc-ink)]' : 'text-[var(--kc-basil)]'
            }`}
          >
            Scan
          </span>
        </Link>

        {/* Tab 4: Recipes */}
        <Link
          href={`/${locale}/recipes`}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-2xl transition-all duration-200 ${
            isRecipesActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label="Recipe Rescue"
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isRecipesActive ? 'bg-[var(--kc-mint)] dark:bg-[#133829]' : ''}`}>
            <KhabarIcon name="cook" size={18} />
          </div>
          <span className="text-[10px] font-heading font-medium tracking-tight mt-0.5">Recipes</span>
        </Link>

        {/* Tab 5: Account / Profile */}
        <Link
          href={isLoggedIn ? `/${locale}/profile` : `/${locale}/login`}
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-2xl transition-all duration-200 ${
            isAccountActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label={isLoggedIn ? 'Kitchen Profile & Settings' : 'Sign In'}
        >
          <div className={`p-0.5 rounded-full ${isAccountActive ? 'ring-2 ring-[var(--kc-basil)]' : ''}`}>
            {isLoggedIn && avatarUrl ? (
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[var(--kc-basil)]">
                <Image src={avatarUrl} alt="Account" fill className="object-cover" />
              </div>
            ) : isLoggedIn ? (
              <div className="w-5 h-5 rounded-full bg-[var(--kc-basil)] text-white flex items-center justify-center text-[9px] font-bold">
                {initials}
              </div>
            ) : (
              <div className={`p-1 rounded-xl transition-colors ${isAccountActive ? 'bg-[var(--kc-mint)] dark:bg-[#133829]' : ''}`}>
                <KhabarIcon name="profile" size={18} />
              </div>
            )}
          </div>
          <span className="text-[10px] font-heading font-medium tracking-tight mt-0.5 truncate max-w-[50px]">
            {isLoggedIn ? 'Account' : 'Sign In'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
