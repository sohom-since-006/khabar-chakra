'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface AppSidebarProps {
  locale: string;
}

export function AppSidebar({ locale }: AppSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: `/${locale}`, icon: 'household' as const },
    { label: 'Scan Food', href: `/${locale}/inventory/add`, icon: 'scan' as const },
    { label: 'My Inventory', href: `/${locale}/home`, icon: 'fridge' as const },
    { label: 'Expiry Reminders', href: `/${locale}/notifications`, icon: 'bell' as const },
    { label: 'Recipes', href: `/${locale}/recipes`, icon: 'cook' as const },
    { label: 'Share / Donate', href: `/${locale}/share/new`, icon: 'donate' as const },
    { label: 'Reuse / Recycle', href: `/${locale}/waste`, icon: 'recycle' as const },
    { label: 'Impact Tracker', href: `/${locale}/impact`, icon: 'streak' as const },
    { label: 'Settings', href: `/${locale}/settings`, icon: 'sliders' as const },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#FBFDF9] border-r border-[#E5EFE7] p-5 hidden xl:flex flex-col justify-between min-h-[calc(100vh-64px)] shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      <div>
        {/* User Profile Mini Badge */}
        <Link
          href={`/${locale}/profile`}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5EFE7] hover:border-[#B4D7BF] transition-all shadow-sm mb-6 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#165842] text-white flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
            🌿
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-[#0D382B] block">
              Shuvangi Dutta
            </span>
            <span className="text-xs text-[#2E7D5B] font-medium flex items-center gap-1 mt-0.5">
              Food Warrior 🌿
            </span>
          </div>
        </Link>

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
                    ? 'bg-[#E3EFE5] text-[#0F5132] shadow-sm font-bold translate-x-1'
                    : 'text-[#4A6359] hover:bg-[#F0F7F2] hover:text-[#0D382B]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? 'text-[#0F5132]' : 'text-[#648477]'
                  }`}
                >
                  <KhabarIcon name={item.icon} size={17} />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Illustration & Cursive Callout */}
      <div className="pt-6 border-t border-[#E5EFE7]/80 text-center relative overflow-hidden">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F2F8F3] to-[#E9F3EB] border border-[#DCEDE0] text-left relative">
          <div className="leading-none mb-1">
            <span className="font-cursive-sacramento text-2xl text-[#185A43] block">
              Small Steps
            </span>
            <span className="font-cursive-vibes text-2xl text-[#0B3A2B] block font-bold">
              Big Impact
            </span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[10px] text-[#557B6B] font-medium uppercase tracking-wider">
              West Bengal · ₹0 Free
            </span>
            <span className="text-xl">🌱</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
