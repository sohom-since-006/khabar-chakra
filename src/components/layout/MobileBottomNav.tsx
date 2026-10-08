'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface MobileBottomNavProps {
  locale: string;
}

export function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Sanctuary', href: `/${locale}`, icon: 'household' as const },
    { label: 'Kitchen Shelf', href: `/${locale}/home`, icon: 'fridge' as const },
    { label: 'Add Food', href: `/${locale}/inventory/add`, icon: 'scan' as const, isCenter: true },
    { label: 'Recipes', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Shop Check', href: `/${locale}/shopping-list`, icon: 'shopping-list' as const },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--kc-card)]/95 backdrop-blur-md border-t border-[var(--kc-card-border)] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative -top-4 flex flex-col items-center group cursor-pointer focus:outline-none"
                aria-label="Add Food or Scan Receipt"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--kc-basil)] hover:bg-[var(--kc-basil-hover)] text-white flex items-center justify-center shadow-lg border-2 border-[var(--kc-card)] transition-transform group-hover:scale-105 active:scale-95">
                  <span className="text-xl font-bold">+</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[var(--kc-basil)] mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[var(--kc-basil)] font-bold'
                  : 'text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[var(--kc-mint)]' : ''}`}>
                <KhabarIcon name={item.icon} size={18} />
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
