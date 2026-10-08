'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { useUserSession } from '@/hooks/useUserSession';

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
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 360,
      damping: 26,
    },
  },
};

const cardHoverProps = {
  whileHover: {
    y: -4,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
  whileTap: { scale: 0.985 },
};

export default function LandingPage({ params }: LandingPageProps) {
  const [locale, setLocale] = useState('en');
  const { user, displayName, isLoggedIn } = useUserSession();

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

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
        className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden transition-colors"
      >
        {/* Top Hero Welcome Banner */}
        <motion.section
          variants={itemVariants}
          className="relative rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] shadow-sm dark:shadow-[0_0_25px_rgba(34,178,130,0.08)] overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[160px] p-6 lg:p-8 group transition-all"
        >
          <div className="z-10 space-y-2 max-w-xl">
            <div className="leading-tight">
              <span className="font-cursive-sacramento text-3xl sm:text-4xl text-[var(--kc-basil)] font-bold block">
                Welcome back,
              </span>
              <h1 className="font-montserrat text-3xl sm:text-5xl font-black text-[var(--kc-ink)] tracking-tight block -mt-1">
                {userGreeting}!
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-bold font-mono tracking-widest text-[var(--kc-muted)] uppercase">
              SMART TRACKING · ZERO WASTE · HOUSEHOLD SAVINGS
            </p>
            <div className="pt-1">
              <span className="font-cursive-vibes text-2xl sm:text-3xl text-[var(--kc-basil)] italic block">
                &ldquo;Track freshness. Cook creatively. Eliminate waste.&rdquo; ♡
              </span>
            </div>
          </div>

          {/* Right Fresh Produce Bowl Image */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="relative w-full md:w-80 h-44 sm:h-48 shrink-0 mt-4 md:mt-0 rounded-xl overflow-hidden shadow-sm border border-[var(--kc-card-border)] cursor-pointer"
          >
            <Image
              src="/images/fresh_produce_bowl.jpg"
              alt="Fresh vibrant organic vegetables"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--kc-card)] via-transparent to-transparent md:block hidden opacity-30" />
          </motion.div>
        </motion.section>

        {/* Middle Section: Hero Proclamation Card + Food Waste Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Forest Green Proclamation Banner (7 cols) */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#0B3728] via-[#0D382B] to-[#08261C] dark:from-[#061C14] dark:via-[#09291D] dark:to-[#04140E] p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-[#144737] dark:border-[#1C4D3A]"
          >
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#7BD4A8] tracking-widest uppercase">
                <KhabarIcon name="plant-based" size={15} />
                <span>KITCHEN INTELLIGENCE · PROCLAMATION NO. 01</span>
              </div>

              <h2 className="font-cursive-vibes text-3xl sm:text-5xl text-[#FFD56B] leading-tight font-bold">
                Never let good food go to waste.
              </h2>

              <p className="text-xs sm:text-sm text-[#D3E8DE] leading-relaxed max-w-lg font-montserrat font-normal">
                Track pantry and fridge freshness before the expiration clock runs out.
                Parse grocery receipts instantly via OCR, organize your shelves by urgency,
                and turn expiring ingredients into delicious home recipes while saving thousands in domestic groceries.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/${locale}/inventory/add`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC93C] text-[#0A281E] font-bold text-xs sm:text-sm hover:bg-[#FFD56B] transition-colors shadow-sm"
                >
                  <KhabarIcon name="scan" size={16} />
                  <span>Scan Food or Receipt (OCR) →</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={`/${locale}/inventory`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#217056] text-[#E0F3EB] font-semibold text-xs sm:text-sm hover:bg-[#144737] transition-colors"
                >
                  <KhabarIcon name="expiring" size={16} />
                  <span>Open &ldquo;Use This First&rdquo; Shelf</span>
                </Link>
              </motion.div>
            </div>

            {/* Background subtle art / photo thumbnail accent */}
            <div className="absolute -bottom-6 -right-6 w-52 h-52 opacity-25 rounded-full overflow-hidden pointer-events-none">
              <Image
                src="/images/vegetables_basket.jpg"
                alt="Fresh Food Happy Homes"
                fill
                className="object-cover"
              />
            </div>
          </motion.section>

          {/* Right: Food Waste Status Card (5 cols) */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-5 rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 shadow-sm flex flex-col justify-between space-y-6 transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--kc-hairline)]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <h3 className="font-cursive-sacramento text-2xl sm:text-3xl font-bold text-[var(--kc-ink)]">
                  Food Waste Status
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--kc-basil)] bg-[var(--kc-mint)] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live Household Radar
              </span>
            </div>

            {/* Circular Progress & Stat Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Circular Meter Gauge (Freshness Index) */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="var(--kc-hairline)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 25.1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center leading-tight">
                  <span className="font-montserrat font-extrabold text-2xl text-[var(--kc-ink)] block">
                    94%
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[var(--kc-muted)] uppercase block tracking-wider">
                    Freshness<br />Index
                  </span>
                </div>
              </div>

              {/* Status Pill Badges */}
              <div className="space-y-3 w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--kc-mint)] border border-[var(--kc-card-border)]"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--kc-basil)] text-white flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-[var(--kc-ink)] block">₹3,450</span>
                    <span className="text-[10px] text-[var(--kc-muted)] font-medium uppercase">
                      Money Saved (Month)
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-xs">
                    🔥
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-300 block">14 Days</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium uppercase">
                      Zero-Waste Streak
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Saved Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--kc-hairline)]">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#132A20] border border-[var(--kc-hairline)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--kc-mint)] text-[var(--kc-basil)] flex items-center justify-center shrink-0">
                  <KhabarIcon name="meal" size={16} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] text-[var(--kc-muted)] block truncate">Food Rescued</span>
                  <span className="text-base font-black text-[var(--kc-ink)] block truncate">12.5 kg</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#132A20] border border-[var(--kc-hairline)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--kc-mint)] text-[var(--kc-basil)] flex items-center justify-center shrink-0">
                  <KhabarIcon name="co2-avoided" size={16} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] text-[var(--kc-muted)] block truncate">CO₂ Avoided</span>
                  <span className="text-base font-black text-[var(--kc-ink)] block truncate">28.7 kg</span>
                </div>
              </div>
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
              className="p-5 rounded-2xl bg-[#EBF7EE] dark:bg-[#0D261B] border border-[#CCE7D4] dark:border-[#1E4D36] hover:border-[#96D2A8] transition-colors flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#163B2C] shadow-sm flex items-center justify-center text-[#16583E] dark:text-[#2BD697] group-hover:scale-110 transition-transform">
                  <KhabarIcon name="scan" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-[#16583E] dark:text-[#2BD697] block leading-none">
                    Scan & OCR
                  </h4>
                  <p className="text-[11px] text-[#4F7565] dark:text-[#8BBDA6] mt-1 line-clamp-1 font-medium">
                    Instant receipt & expiry intake.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1E7050] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
                →
              </div>
            </Link>
          </motion.div>

          {/* Card 2: My Pantry & Fridge */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/home`}
              className="p-5 rounded-2xl bg-[#EBF3FC] dark:bg-[#0E2033] border border-[#CDE1F8] dark:border-[#1D3E61] hover:border-[#96C2F2] transition-colors flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#17304C] shadow-sm flex items-center justify-center text-[#1E5698] dark:text-[#5B9EEA] group-hover:scale-110 transition-transform">
                  <KhabarIcon name="fridge" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-[#1E5698] dark:text-[#5B9EEA] block leading-none">
                    My Inventory
                  </h4>
                  <p className="text-[11px] text-[#557396] dark:text-[#8EABC9] mt-1 line-clamp-1 font-medium">
                    Multi-zone freshness tracker.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#245FAC] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
                →
              </div>
            </Link>
          </motion.div>

          {/* Card 3: "Use This First" Smart Shelf */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/inventory`}
              className="p-5 rounded-2xl bg-[#FDF1EC] dark:bg-[#301A14] border border-[#F8D6C9] dark:border-[#52291E] hover:border-[#F1AB94] transition-colors flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#42221A] shadow-sm flex items-center justify-center text-[#BA442B] dark:text-[#F3765A] group-hover:scale-110 transition-transform">
                  <KhabarIcon name="expiring" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-[#BA442B] dark:text-[#F3765A] block leading-none">
                    Use This First
                  </h4>
                  <p className="text-[11px] text-[#8C5D53] dark:text-[#C5978E] mt-1 line-clamp-1 font-medium">
                    Urgent 24–48h expiry shelf.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#D14F30] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
                →
              </div>
            </Link>
          </motion.div>

          {/* Card 4: "Before You Buy" Shopping Assistant */}
          <motion.div {...cardHoverProps}>
            <Link
              href={`/${locale}/shopping-list`}
              className="p-5 rounded-2xl bg-[#FFFBEB] dark:bg-[#2B230C] border border-[#FDE68A] dark:border-[#534212] hover:border-[#FCD34D] transition-colors flex items-center justify-between group shadow-sm h-full"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#3F3312] shadow-sm flex items-center justify-center text-[#B45309] dark:text-[#FBBF24] group-hover:scale-110 transition-transform">
                  <KhabarIcon name="shopping-list" size={22} />
                </div>
                <div>
                  <h4 className="font-cursive-sacramento text-2xl font-bold text-[#B45309] dark:text-[#FBBF24] block leading-none">
                    Before You Buy
                  </h4>
                  <p className="text-[11px] text-[#78350F] dark:text-[#D4A953] mt-1 line-clamp-1 font-medium">
                    Prevents duplicate purchases.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center text-xs group-hover:translate-x-1 transition-transform shrink-0">
                →
              </div>
            </Link>
          </motion.div>
        </motion.section>

        {/* Live "Use This First" Smart Shelf Preview */}
        <motion.section
          variants={itemVariants}
          className="p-6 rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] shadow-sm space-y-4 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <h3 className="text-lg font-bold text-[var(--kc-ink)]">
                  &ldquo;Use This First&rdquo; Priority Shelf
                </h3>
                <p className="text-xs text-[var(--kc-muted)]">
                  Items expiring soonest in your kitchen. Cook these first to keep your waste at ₹0.
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/recipes`}
              className="text-xs font-bold text-[var(--kc-basil)] hover:underline flex items-center gap-1 group"
            >
              <span>Auto-Generate Recipe</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Item 1 */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A2620] flex items-center justify-center text-xl shadow-inner">
                  🥛
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[var(--kc-ink)]">Red Cow Toned Milk</h5>
                  <span className="text-[11px] font-mono font-semibold text-[#D6381F] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D6381F] animate-ping" />
                    ~10 hours left · Fridge
                  </span>
                </div>
              </div>
              <Link
                href={`/${locale}/recipes`}
                className="px-3 py-1.5 rounded-lg bg-[#D6381F] text-white text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Cook
              </Link>
            </motion.div>

            {/* Item 2 */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A2620] flex items-center justify-center text-xl shadow-inner">
                  🍲
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[var(--kc-ink)]">Cooked Chholar Dal</h5>
                  <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                    ~18 hours left · Fridge
                  </span>
                </div>
              </div>
              <Link
                href={`/${locale}/recipes`}
                className="px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Cook
              </Link>
            </motion.div>

            {/* Item 3 */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A2620] flex items-center justify-center text-xl shadow-inner">
                  🥬
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[var(--kc-ink)]">Fresh Spinach (Palak)</h5>
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    ~48 hours left · Crisper
                  </span>
                </div>
              </div>
              <Link
                href={`/${locale}/recipes`}
                className="px-3 py-1.5 rounded-lg bg-[var(--kc-basil)] text-white text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Cook
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
