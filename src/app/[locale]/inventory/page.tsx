'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { InventoryItem } from '@/domain/types';
import { calculateFreshness } from '@/domain/freshness';
import { getCleanInventory } from '@/utils/inventoryStorage';

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

export default function UseThisFirstPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState('en');
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  React.useEffect(() => {
    try {
      const parsed: InventoryItem[] = getCleanInventory();
      const mapped: ShelfItem[] = parsed
        .filter((item) => item.status === 'active')
        .map((item) => {
          const freshness = calculateFreshness({
            category: item.category,
            storage: item.storage,
            expiryDate: item.expiryDate,
            isFlagged: item.isFlagged,
          });

          let urgency: 'critical' | 'warning' | 'safe' = 'safe';
          if (freshness.hoursRemaining <= 24) urgency = 'critical';
          else if (freshness.hoursRemaining <= 48) urgency = 'warning';

          const storageName =
            item.storage === 'fridge' ? 'Fridge' : item.storage === 'freezer' ? 'Freezer' : 'Pantry';

          return {
            id: item.id,
            name: item.name,
            category: item.category.replace(/_/g, ' '),
            storage: storageName as 'Fridge' | 'Pantry' | 'Freezer',
            quantity: `${item.quantityValue} ${item.quantityUnit}`,
            hoursRemaining: freshness.hoursRemaining,
            urgency,
            diet: item.dietType === 'non_veg' ? 'non_veg' : 'veg',
          };
        });
      setItems(mapped);
    } catch (_err) {
      // storage quota fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const [activeZone, setActiveZone] = useState<'all' | 'Fridge' | 'Pantry' | 'Freezer'>('all');

  const filteredItems = activeZone === 'all'
    ? items
    : items.filter((item) => item.storage === activeZone);

  const criticalItems = filteredItems.filter((i) => i.urgency === 'critical');
  const warningItems = filteredItems.filter((i) => i.urgency === 'warning');
  const safeItems = filteredItems.filter((i) => i.urgency === 'safe');

  return (
    <div className="max-w-[1440px] mx-auto flex w-full">
      <AppSidebar locale={locale} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
        {/* Header Title Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#D6381F] uppercase">
            <KhabarIcon name="expiring" size={16} />
            <span>URGENCY TRIAGE · USE THIS FIRST SHELF</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[var(--kc-ink)] tracking-tight">
            &ldquo;Use This First&rdquo; Priority Shelf
          </h1>
          <p className="font-heading text-xs sm:text-sm text-[var(--kc-muted)] max-w-2xl leading-relaxed">
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
              className={`px-5 py-2 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                activeZone === zone
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'glass-card text-[var(--kc-muted)] border border-black/[0.06] dark:border-white/[0.08] hover:text-[var(--kc-ink)]'
              }`}
            >
              {zone === 'all' ? 'All Storage Zones' : zone}
            </button>
          ))}
        </div>

        {/* Section 1: Critical (🔴 < 24 Hours) */}
        {criticalItems.length > 0 && (
          <section className="p-6 sm:p-7 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#D6381F] animate-ping" />
                <h2 className="text-base sm:text-lg font-bold text-red-900 dark:text-red-300 font-heading">
                  🔴 Immediate Attention (Expiring in &lt; 24h)
                </h2>
              </div>
              <span className="text-xs font-bold font-mono text-[#D6381F] bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full">
                {criticalItems.length} Urgent Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-card border border-red-200/70 dark:border-red-900/40 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-[var(--kc-ink)] font-heading truncate">{item.name}</h4>
                    <p className="text-xs text-[var(--kc-muted)] font-heading">
                      {item.quantity} · {item.storage} · {item.category}
                    </p>
                    <span className="inline-block text-[11px] font-mono font-bold text-[#D6381F]">
                      ⏳ {item.hoursRemaining} hours remaining
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/recipes?ingredient=${encodeURIComponent(item.name)}`}
                    className="px-4 py-2 rounded-full bg-[#D6381F] text-white text-xs font-heading font-bold hover:opacity-90 shadow-sm flex items-center gap-1 shrink-0 min-h-[38px]"
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
          <section className="p-6 sm:p-7 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <h2 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-300 font-heading">
                  🟡 Consume Soon (24–48 Hours)
                </h2>
              </div>
              <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-full">
                {warningItems.length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warningItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-card border border-amber-200/70 dark:border-amber-900/40 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-[var(--kc-ink)] font-heading truncate">{item.name}</h4>
                    <p className="text-xs text-[var(--kc-muted)] font-heading">
                      {item.quantity} · {item.storage} · {item.category}
                    </p>
                    <span className="inline-block text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                      ⏱️ {item.hoursRemaining} hours remaining
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/recipes?ingredient=${encodeURIComponent(item.name)}`}
                    className="px-4 py-2 rounded-full bg-[#F59E0B] text-white text-xs font-heading font-bold hover:opacity-90 shadow-sm flex items-center gap-1 shrink-0 min-h-[38px]"
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
          <section className="p-6 sm:p-7 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h2 className="text-base sm:text-lg font-bold text-[var(--kc-ink)] font-heading">
                  🟢 Plentiful Shelf Life (&gt; 48 Hours)
                </h2>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                Safe Stock
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl glass-card border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[var(--kc-ink)] font-heading">{item.name}</h4>
                    <p className="text-xs text-[var(--kc-muted)] font-heading">
                      {item.quantity} · {item.storage} · {item.category}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-heading text-emerald-700 dark:text-emerald-400">Fresh</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Zero-Waste All-Clear Empty State */}
        {isLoaded && filteredItems.length === 0 && (
          <div className="p-8 sm:p-14 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-inner border border-emerald-200/50 dark:border-emerald-900/50">
              ⚡
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--kc-ink)] font-heading">
                All Clear! Zero Food Waste Urgency
              </h3>
              <p className="text-xs sm:text-sm text-[var(--kc-muted)] font-heading leading-relaxed">
                {items.length === 0
                  ? 'Your kitchen inventory is currently empty. Scan a grocery receipt or log ingredients to activate automated shelf-life urgency triage.'
                  : `No ingredients in ${activeZone === 'all' ? 'any storage zone' : activeZone} are expiring in the next 48 hours.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
              <Link
                href={`/${locale}/inventory/add`}
                className="w-full sm:w-auto px-6 py-3 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <KhabarIcon name="scan" size={16} />
                <span>Scan Food or Receipt (OCR)</span>
              </Link>
              <Link
                href={`/${locale}/recipes`}
                className="w-full sm:w-auto px-6 py-3 text-xs font-heading font-bold rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] hover:bg-black/[0.05] transition-colors flex items-center justify-center gap-2"
              >
                <KhabarIcon name="cook" size={16} />
                <span>Explore Recipe Rescue</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
