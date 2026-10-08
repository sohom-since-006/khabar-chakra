'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { AppSidebar } from '@/components/layout/AppSidebar';

interface ShelfItem {
  id: string;
  name: string;
  category: string;
  storage: 'Fridge' | 'Pantry' | 'Freezer';
  quantity: string;
  hoursRemaining: number;
  urgency: 'critical' | 'warning' | 'safe';
  diet: 'veg' | 'non_veg';
}

const SHELF_ITEMS: ShelfItem[] = [
  {
    id: '1',
    name: 'Red Cow Toned Milk',
    category: 'Dairy',
    storage: 'Fridge',
    quantity: '1 L',
    hoursRemaining: 10,
    urgency: 'critical',
    diet: 'veg',
  },
  {
    id: '2',
    name: 'Cooked Chholar Dal with Coconut',
    category: 'Cooked Food',
    storage: 'Fridge',
    quantity: '4 servings',
    hoursRemaining: 18,
    urgency: 'critical',
    diet: 'veg',
  },
  {
    id: '3',
    name: 'Fresh Spinach (Palak)',
    category: 'Vegetables',
    storage: 'Fridge',
    quantity: '500 g',
    hoursRemaining: 36,
    urgency: 'warning',
    diet: 'veg',
  },
  {
    id: '4',
    name: 'Ripe Bananas (Robusta)',
    category: 'Fruits',
    storage: 'Pantry',
    quantity: '4 pcs',
    hoursRemaining: 42,
    urgency: 'warning',
    diet: 'veg',
  },
  {
    id: '5',
    name: 'Gobindobhog Rice',
    category: 'Grains & Pulses',
    storage: 'Pantry',
    quantity: '5 kg',
    hoursRemaining: 1800,
    urgency: 'safe',
    diet: 'veg',
  },
];

export default function UseThisFirstPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState('en');
  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [activeZone, setActiveZone] = useState<'all' | 'Fridge' | 'Pantry' | 'Freezer'>('all');

  const filteredItems = activeZone === 'all'
    ? SHELF_ITEMS
    : SHELF_ITEMS.filter((item) => item.storage === activeZone);

  const criticalItems = filteredItems.filter((i) => i.urgency === 'critical');
  const warningItems = filteredItems.filter((i) => i.urgency === 'warning');
  const safeItems = filteredItems.filter((i) => i.urgency === 'safe');

  return (
    <div className="max-w-[1440px] mx-auto flex w-full">
      <AppSidebar locale={locale} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[var(--kc-chilli)] uppercase">
            <KhabarIcon name="expiring" size={16} />
            <span>URGENCY TRIAGE · USE THIS FIRST SHELF</span>
          </div>
          <h1 className="font-montserrat text-2xl sm:text-4xl font-extrabold text-[var(--kc-ink)]">
            &ldquo;Use This First&rdquo; Priority Shelf
          </h1>
          <p className="text-xs sm:text-sm text-[var(--kc-muted)] max-w-2xl leading-relaxed">
            Your kitchen&apos;s automated triage queue. Ingredients here are expiring within
            the next 24 to 48 hours. Cook with them today to guarantee zero food waste in your household.
          </p>
        </div>

        {/* Filter Zones */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'Fridge', 'Pantry', 'Freezer'] as const).map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setActiveZone(zone)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeZone === zone
                  ? 'bg-[var(--kc-basil)] text-white shadow-sm'
                  : 'bg-[var(--kc-card)] text-[var(--kc-muted)] border border-[var(--kc-hairline)] hover:text-[var(--kc-ink)]'
              }`}
            >
              {zone === 'all' ? 'All Storage Zones' : zone}
            </button>
          ))}
        </div>

        {/* Section 1: Critical (🔴 < 24 Hours) */}
        {criticalItems.length > 0 && (
          <section className="p-6 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#D6381F] animate-ping" />
                <h2 className="text-base sm:text-lg font-bold text-red-900 dark:text-red-300 font-montserrat">
                  🔴 Immediate Attention (Expiring in &lt; 24h)
                </h2>
              </div>
              <span className="text-xs font-bold font-mono text-[#D6381F] bg-red-100 dark:bg-red-900/40 px-2.5 py-1 rounded-full">
                {criticalItems.length} Urgent Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#1A1414] border border-red-200 dark:border-red-900/50 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[var(--kc-ink)]">{item.name}</h4>
                    <p className="text-xs text-[var(--kc-muted)]">
                      {item.quantity} · {item.storage} · {item.category}
                    </p>
                    <span className="inline-block text-[11px] font-mono font-bold text-[#D6381F]">
                      ⏳ {item.hoursRemaining} hours remaining
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/recipes?ingredient=${encodeURIComponent(item.name)}`}
                    className="px-3.5 py-2 rounded-xl bg-[#D6381F] text-white text-xs font-bold hover:opacity-90 shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <span>Cook Meal</span>
                    <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Warning (🟡 24–48 Hours) */}
        {warningItems.length > 0 && (
          <section className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <h2 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-300 font-montserrat">
                  🟡 Consume Soon (24–48 Hours)
                </h2>
              </div>
              <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-full">
                {warningItems.length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warningItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#1A1810] border border-amber-200 dark:border-amber-900/50 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[var(--kc-ink)]">{item.name}</h4>
                    <p className="text-xs text-[var(--kc-muted)]">
                      {item.quantity} · {item.storage} · {item.category}
                    </p>
                    <span className="inline-block text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                      ⏱️ {item.hoursRemaining} hours remaining
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/recipes?ingredient=${encodeURIComponent(item.name)}`}
                    className="px-3.5 py-2 rounded-xl bg-[#F59E0B] text-white text-xs font-bold hover:opacity-90 shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <span>Cook Meal</span>
                    <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Plentiful & Safe Stock */}
        {safeItems.length > 0 && (
          <section className="p-6 rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                <h2 className="text-base sm:text-lg font-bold text-[var(--kc-ink)] font-montserrat">
                  🟢 Plentiful Shelf Life (&gt; 48 Hours)
                </h2>
              </div>
              <span className="text-xs font-bold font-mono text-[var(--kc-basil)] bg-[var(--kc-mint)] px-2.5 py-1 rounded-full">
                Safe Stock
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-neutral-50 dark:bg-[#12261C] border border-[var(--kc-hairline)] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[var(--kc-ink)]">{item.name}</h4>
                    <p className="text-xs text-[var(--kc-muted)]">
                      {item.quantity} · {item.storage} · {item.category}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[var(--kc-basil)]">Fresh</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
