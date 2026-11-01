'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { useUserSession } from '@/hooks/useUserSession';
import { InventoryItem } from '@/domain/types';
import { getCleanInventory } from '@/utils/inventoryStorage';

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 24,
    },
  },
};

const cardHoverProps = {
  whileHover: {
    y: -4,
    transition: { type: 'spring' as const, stiffness: 350, damping: 22 },
  },
  whileTap: { scale: 0.985 },
};

export default function LandingPage({ params }: LandingPageProps) {
  const [locale, setLocale] = useState('en');
  const { user, displayName, isLoggedIn } = useUserSession();
  const [shelfStats, setShelfStats] = useState({
    activeCount: 0,
    urgentCount: 0,
    freshCount: 0,
    savedCount: 0,
  });
  const [urgentItems, setUrgentItems] = useState<Array<{
    id: string;
    name: string;
    hoursLeft: number;
    storage: string;
    category: string;
  }>>([]);

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        if (sp.has('code')) {
          window.location.href = `/${p.locale}/auth/callback${window.location.search}`;
        }
      }
    });
  }, [params]);

  useEffect(() => {
    try {
      const items: InventoryItem[] = getCleanInventory();
      const active = items.filter((i) => i.status === 'active');
      const now = Date.now();
      const urgent = active
        .filter((i) => {
          if (!i.expiryDate) return false;
          const hoursLeft = (new Date(i.expiryDate).getTime() - now) / 3600000;
          return hoursLeft <= 48;
        })
        .map((i) => {
          const hoursLeft = Math.max(0, Math.round((new Date(i.expiryDate!).getTime() - now) / 3600000));
          return {
            id: i.id,
            name: i.name,
            hoursLeft,
            storage: i.storage === 'fridge' ? 'Fridge' : i.storage === 'freezer' ? 'Freezer' : 'Pantry',
            category: i.category,
          };
        })
        .sort((a, b) => a.hoursLeft - b.hoursLeft);

      setUrgentItems(urgent);
      const closed = items.filter((i) => i.status === 'closed');
      setShelfStats({
        activeCount: active.length,
        urgentCount: urgent.length,
        freshCount: Math.max(0, active.length - urgent.length),
        savedCount: closed.length,
      });
    } catch {
      // storage quota fallback
    }
  }, []);

  const userGreeting = isLoggedIn
    ? displayName || user?.email?.split('@')[0] || 'Home Chef'
    : 'Home Chef';

  return (
    <div className="max-w-[1440px] mx-auto flex w-full">
      {/* Left Navigation Sidebar */}
      <AppSidebar locale={locale} />

      {/* Main Sanctuary Dashboard View */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden transition-colors"
      >
        {/* Top Hero Welcome Banner */}
        <motion.section
          variants={itemVariants}
          className="relative rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[150px] p-5 sm:p-7 lg:p-9 group transition-all"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="leading-tight">
              <span className="font-cursive-sacramento text-3xl sm:text-4xl text-emerald-700 dark:text-emerald-400 font-bold block">
                Welcome back,
              </span>
              <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-black text-[var(--kc-ink)] tracking-tight block -mt-1">
                {userGreeting}!
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-[var(--kc-muted)] uppercase">
              SMART TRACKING · ZERO FOOD WASTE · HOUSEHOLD SAVINGS
            </p>
            <div className="pt-1">
              <span className="font-cursive-vibes text-xl sm:text-2xl md:text-3xl text-emerald-800 dark:text-emerald-300 italic block">
                &ldquo;Track freshness. Cook creatively. Eliminate waste.&rdquo; ♡
              </span>
            </div>
          </div>

          {/* Right Fresh Produce Bowl Image */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="relative w-full md:w-80 h-36 sm:h-44 md:h-48 shrink-0 mt-4 md:mt-0 rounded-2xl overflow-hidden shadow-md border border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
          >
            <Image
              src="/images/fresh_produce_bowl.jpg"
              alt="Fresh vibrant organic vegetables"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-60" />
          </motion.div>
        </motion.section>

        {/* Middle Section: Hero Proclamation Card + Kitchen Shelf Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left: Forest Green Proclamation Banner (7 cols) */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#061F16] via-[#0A2E21] to-[#04160F] p-6 sm:p-8 lg:p-9 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-emerald-800/40"
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>KITCHEN INTELLIGENCE · PROCLAMATION NO. 01</span>
              </div>

              <h2 className="font-cursive-vibes text-3xl sm:text-4xl md:text-5xl text-[#FFD56B] leading-tight font-bold">
                Never let good food go to waste.
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-lg font-heading font-normal">
                Track pantry and fridge freshness before the expiration clock runs out.
                Parse grocery receipts instantly via OCR, organize your shelves by urgency,
                and turn expiring ingredients into delicious home recipes while saving thousands in domestic groceries.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 sm:pt-8">
              {isLoggedIn ? (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      href={`/${locale}/inventory/add`}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFC93C] to-[#FFD56B] text-[#0A281E] font-heading font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all w-full sm:w-auto min-h-[44px]"
                    >
                      <KhabarIcon name="scan" size={16} />
                      <span>Scan Food or Receipt (OCR) →</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      href={`/${locale}/inventory`}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-emerald-500/40 text-emerald-100 font-heading font-semibold text-xs sm:text-sm hover:bg-emerald-800/30 transition-all w-full sm:w-auto min-h-[44px]"
                    >
                      <KhabarIcon name="expiring" size={16} />
                      <span>Open &ldquo;Use This First&rdquo; Shelf</span>
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      href={`/${locale}/login`}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFC93C] to-[#FFD56B] text-[#0A281E] font-heading font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all w-full sm:w-auto min-h-[44px]"
                    >
                      <span>Continue with Google / Login →</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      href={`/${locale}/signup`}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-emerald-500/40 text-emerald-100 font-heading font-semibold text-xs sm:text-sm hover:bg-emerald-800/30 transition-all w-full sm:w-auto min-h-[44px]"
                    >
                      <span>Create Free Kitchen Account</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Background subtle art / photo thumbnail accent */}
            <div className="absolute -bottom-6 -right-6 w-44 sm:w-52 h-44 sm:h-52 opacity-20 rounded-full overflow-hidden pointer-events-none">
              <Image
                src="/images/vegetables_basket.jpg"
                alt="Fresh Food Happy Homes"
                fill
                className="object-cover"
              />
            </div>
          </motion.section>

          {/* Right: Real Household Kitchen Status Radar */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-5 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-7 shadow-sm flex flex-col justify-between space-y-4 sm:space-y-5 transition-colors"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🌿</span>
                <h3 className="font-cursive-sacramento text-2xl sm:text-3xl font-bold text-[var(--kc-ink)]">
                  Kitchen Shelf Radar
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Household Sync
              </span>
            </div>

            {/* Clean Real Stats Grid */}
            <div className="grid grid-cols-2 gap-3 py-1">
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-[var(--kc-muted)] uppercase tracking-wider">Active Items</span>
                  <KhabarIcon name="fridge" size={15} className="text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--kc-ink)]">{shelfStats.activeCount}</span>
                  <span className="text-[10px] font-mono text-[var(--kc-muted)]">tracked</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">Urgent (&lt;48h)</span>
                  <KhabarIcon name="expiring" size={15} className="text-[#D6381F]" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#D6381F]">{shelfStats.urgentCount}</span>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">priority</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Fresh &amp; Safe</span>
                  <KhabarIcon name="plant-based" size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 dark:text-emerald-300">{shelfStats.freshCount}</span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">stable</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 uppercase tracking-wider">Meals Rescued</span>
                  <KhabarIcon name="meal" size={15} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-800 dark:text-sky-300">{shelfStats.savedCount}</span>
                  <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400">consumed</span>
                </div>
              </div>
            </div>

            {/* Contextual Status Ribbon & Fast Action */}
            <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                {shelfStats.urgentCount > 0 ? (
                  <span className="font-heading font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#D6381F] animate-ping shrink-0" />
                    <span>{shelfStats.urgentCount} item(s) require priority cooking</span>
                  </span>
                ) : (
                  <span className="font-heading font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                    <span>✨</span>
                    <span>All kitchen items are fresh &amp; stable</span>
                  </span>
                )}
              </div>

              <Link
                href={`/${locale}/inventory`}
                className="px-4 py-2.5 text-xs font-heading font-bold rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-center transition-all shadow-sm min-h-[44px] flex items-center justify-center shrink-0"
              >
                Open Priority Shelf →
              </Link>
            </div>
          </motion.section>
        </div>

        {/* 4 Core Pillars: Quick-Action Feature Cards */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Card 1: Scan & OCR Receipts */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/inventory/add`}
              className="p-5 sm:p-6 rounded-3xl glass-card border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-400/80 transition-all flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-900/50 shadow-inner flex items-center justify-center text-emerald-800 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                  <KhabarIcon name="scan" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-emerald-800 dark:text-emerald-300 block leading-none">
                    Scan &amp; OCR
                  </h4>
                  <p className="font-heading text-[11px] text-[var(--kc-muted)] mt-1 line-clamp-1 font-medium">
                    Instant receipt &amp; expiry intake.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0 shadow-sm">
                →
              </div>
            </Link>
          </motion.div>

          {/* Card 2: My Pantry & Fridge */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/home`}
              className="p-5 sm:p-6 rounded-3xl glass-card border border-sky-200/60 dark:border-sky-900/40 hover:border-sky-400/80 transition-all flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/50 dark:border-sky-900/50 shadow-inner flex items-center justify-center text-sky-800 dark:text-sky-300 group-hover:scale-110 transition-transform">
                  <KhabarIcon name="fridge" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-sky-800 dark:text-sky-300 block leading-none">
                    My Inventory
                  </h4>
                  <p className="font-heading text-[11px] text-[var(--kc-muted)] mt-1 line-clamp-1 font-medium">
                    Multi-zone freshness tracker.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-sky-800 text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0 shadow-sm">
                →
              </div>
            </Link>
          </motion.div>

          {/* Card 3: "Use This First" Smart Shelf */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/inventory`}
              className="p-5 sm:p-6 rounded-3xl glass-card border border-rose-200/60 dark:border-rose-900/40 hover:border-rose-400/80 transition-all flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/50 dark:border-rose-900/50 shadow-inner flex items-center justify-center text-rose-800 dark:text-rose-300 group-hover:scale-110 transition-transform">
                  <KhabarIcon name="expiring" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-rose-800 dark:text-rose-300 block leading-none">
                    Use This First
                  </h4>
                  <p className="font-heading text-[11px] text-[var(--kc-muted)] mt-1 line-clamp-1 font-medium">
                    Urgent 24–48h expiry shelf.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0 shadow-sm">
                →
              </div>
            </Link>
          </motion.div>

          {/* Card 4: "Before You Buy" Shopping Assistant */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/shopping-list`}
              className="p-5 sm:p-6 rounded-3xl glass-card border border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400/80 transition-all flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50 dark:border-amber-900/50 shadow-inner flex items-center justify-center text-amber-800 dark:text-amber-300 group-hover:scale-110 transition-transform">
                  <KhabarIcon name="shopping-list" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-amber-800 dark:text-amber-300 block leading-none">
                    Before You Buy
                  </h4>
                  <p className="font-heading text-[11px] text-[var(--kc-muted)] mt-1 line-clamp-1 font-medium">
                    Prevents duplicate purchases.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0 shadow-sm">
                →
              </div>
            </Link>
          </motion.div>
        </motion.section>

        {/* Live "Use This First" Smart Shelf Preview */}
        <motion.section
          variants={itemVariants}
          className="p-6 sm:p-8 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--kc-ink)]">
                  &ldquo;Use This First&rdquo; Priority Shelf
                </h3>
                <p className="font-heading text-xs text-[var(--kc-muted)]">
                  Items expiring soonest in your kitchen. Cook these first to keep your waste at ₹0.
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/recipes`}
              className="text-xs font-heading font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 group w-fit"
            >
              <span>Auto-Generate Recipe</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {urgentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {urgentItems.slice(0, 3).map((item) => {
                const isCritical = item.hoursLeft <= 24;
                const emoji =
                  item.category.includes('dairy') ? '🥛' :
                  item.category.includes('cooked') ? '🍲' :
                  item.category.includes('veg') ? '🥬' :
                  item.category.includes('fruit') ? '🍎' :
                  item.category.includes('meat') ? '🥩' : '🥫';

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm ${
                      isCritical
                        ? 'border-red-200/80 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A2620] flex items-center justify-center text-xl shadow-inner shrink-0">
                        {emoji}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-heading text-sm font-bold text-[var(--kc-ink)] truncate">{item.name}</h5>
                        <span className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                          isCritical ? 'text-[#D6381F]' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {isCritical && <span className="w-2 h-2 rounded-full bg-[#D6381F] animate-ping shrink-0" />}
                          <span>~{item.hoursLeft}h left · {item.storage}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/recipes?ingredient=${encodeURIComponent(item.name)}`}
                      className={`px-4 py-2 rounded-full text-white text-xs font-heading font-bold hover:opacity-90 shadow-sm shrink-0 min-h-[36px] flex items-center justify-center ${
                        isCritical ? 'bg-[#D6381F]' : 'bg-[#F59E0B]'
                      }`}
                    >
                      Cook
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : !isLoggedIn ? (
            <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-black/[0.1] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl shadow-inner">
                🔐
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-heading text-base font-bold text-[var(--kc-ink)]">
                  Connect Your Kitchen Shelves
                </h4>
                <p className="font-heading text-xs text-[var(--kc-muted)] leading-relaxed">
                  Sign in with Google to track your domestic fridge and pantry, view items expiring within 48h, and turn potential waste into complete meals.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-800 text-white text-xs font-heading font-bold hover:bg-emerald-900 transition-all shadow-sm"
                >
                  <span>Sign In with Google to Open Kitchen</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 text-center space-y-2">
              <span className="text-2xl">✨</span>
              <h4 className="font-heading text-base font-bold text-[var(--kc-ink)]">
                All Kitchen Shelves Stable &amp; Fresh
              </h4>
              <p className="font-heading text-xs text-[var(--kc-muted)] max-w-md mx-auto leading-relaxed">
                {shelfStats.activeCount === 0
                  ? 'No kitchen items logged yet. Scan a grocery receipt or add ingredients to start tracking shelf-life urgency.'
                  : 'Zero ingredients are expiring within 48 hours. Your domestic food waste risk is currently at ₹0.'}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${locale}/inventory/add`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-800 text-white text-xs font-heading font-bold hover:bg-emerald-900 transition-colors shadow-sm"
                >
                  <span>+ Add Food Item</span>
                </Link>
              </div>
            </div>
          )}
        </motion.section>
      </motion.main>
    </div>
  );
}
