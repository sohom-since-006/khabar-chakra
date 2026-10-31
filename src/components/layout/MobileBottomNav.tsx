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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--kc-card)]/95 backdrop-blur-md border-t border-[var(--kc-card-border)] px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Tab 1: Kitchen Home */}
        <Link
          href={`/${locale}/home`}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all ${
            isKitchenActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label="Kitchen Dashboard"
        >
          <div className={`p-1 rounded-lg ${isKitchenActive ? 'bg-[var(--kc-mint)]' : ''}`}>
            <KhabarIcon name="household" size={18} />
          </div>
          <span className="text-[10px] font-mono tracking-tight mt-0.5">Kitchen</span>
        </Link>

        {/* Tab 2: Use First (Freshness Urgency Shelf) */}
        <Link
          href={`/${locale}/inventory`}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all relative ${
            isUseFirstActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label="Use This First Urgency Shelf"
        >
          <div className={`p-1 rounded-lg ${isUseFirstActive ? 'bg-[var(--kc-mint)]' : ''}`}>
            <KhabarIcon name="expiring" size={18} />
          </div>
          <span className="text-[10px] font-mono tracking-tight mt-0.5">Use First</span>
        </Link>

        {/* Tab 3: Center Elevated FAB (+ Add Food & OCR) */}
        <Link
          href={`/${locale}/inventory/add`}
          className="relative -top-4 flex flex-col items-center group cursor-pointer focus:outline-none"
          aria-label="Scan Receipt or Log Food Item"
        >
          <div
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--kc-card)] transition-transform group-hover:scale-105 active:scale-95 ${
              isAddActive
                ? 'bg-[#FFC93C] text-[#0A281E]'
                : 'bg-[var(--kc-basil)] hover:bg-[var(--kc-basil-hover)] text-white'
            }`}
          >
            <span className="text-2xl font-bold leading-none">+</span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold mt-0.5 ${
              isAddActive ? 'text-[var(--kc-ink)]' : 'text-[var(--kc-basil)]'
            }`}
          >
            Intake
          </span>
        </Link>

        {/* Tab 4: Recipes */}
        <Link
          href={`/${locale}/recipes`}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all ${
            isRecipesActive
              ? 'text-[var(--kc-basil)] font-bold scale-105'
              : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
          }`}
          aria-label="Recipe Rescue"
        >
          <div className={`p-1 rounded-lg ${isRecipesActive ? 'bg-[var(--kc-mint)]' : ''}`}>
            <KhabarIcon name="cook" size={18} />
          </div>
          <span className="text-[10px] font-mono tracking-tight mt-0.5">Recipes</span>
        </Link>

        {/* Tab 5: Account / Profile */}
        <Link
          href={isLoggedIn ? `/${locale}/profile` : `/${locale}/login`}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all ${
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
              <div className={`p-1 rounded-lg ${isAccountActive ? 'bg-[var(--kc-mint)]' : ''}`}>
                <KhabarIcon name="profile" size={18} />
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono tracking-tight mt-0.5 truncate max-w-[50px]">
            {isLoggedIn ? 'Account' : 'Sign In'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
