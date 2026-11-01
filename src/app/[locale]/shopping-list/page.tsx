'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { InventoryItem } from '@/domain/types';
import { calculateFreshness } from '@/domain/freshness';
import { getCleanInventory } from '@/utils/inventoryStorage';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

export default function BeforeYouBuyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState('en');
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [query, setQuery] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [inventoryStock, setInventoryStock] = useState<Array<{
    name: string;
    category: string;
    storage: string;
    qty: string;
    hoursLeft: number;
    status: string;
  }>>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1 kg');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // 1. Load active kitchen inventory for cross-checking
      const items: InventoryItem[] = getCleanInventory();
      const mapped = items
        .filter((i) => i.status === 'active')
        .map((i) => {
          const f = calculateFreshness({
            category: i.category,
            storage: i.storage,
            expiryDate: i.expiryDate,
            isFlagged: i.isFlagged,
          });
          return {
            name: i.name,
            category: i.category.replace(/_/g, ' '),
            storage: i.storage,
            qty: `${i.quantityValue} ${i.quantityUnit}`,
            hoursLeft: f.hoursRemaining,
            status: f.bandBadgeLabel,
          };
        });
      setInventoryStock(mapped);

      // 2. Load verified shopping list
      const saved = localStorage.getItem('kc_shopping_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setShoppingList(parsed);
        }
      }
    } catch (_err) {
      // LocalStorage unavailable
    }
  }, []);

  // Save to localStorage on change
  const saveList = (newList: ShoppingItem[]) => {
    setShoppingList(newList);
    try {
      localStorage.setItem('kc_shopping_list', JSON.stringify(newList));
    } catch (_e) {
      // Ignore
    }
  };

  // Real-time stock matching
  const matchingStock = query.trim()
    ? inventoryStock.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    saveList([
      ...shoppingList,
      {
        id: Date.now().toString(),
        name: newItemName.trim(),
        quantity: newItemQty,
        category: 'Grocery',
        checked: false,
      },
    ]);
    setNewItemName('');
  };

  const addQuickStaple = (name: string, qty: string, cat: string) => {
    if (shoppingList.some((i) => i.name.toLowerCase() === name.toLowerCase())) return;
    saveList([
      ...shoppingList,
      {
        id: Date.now().toString(),
        name,
        quantity: qty,
        category: cat,
        checked: false,
      },
    ]);
  };

  const toggleCheck = (id: string) => {
    saveList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    saveList(shoppingList.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    saveList(shoppingList.filter((item) => !item.checked));
  };

  return (
    <div className="max-w-[1440px] mx-auto flex w-full">
      <AppSidebar locale={locale} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
        {/* Header Title Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
            <KhabarIcon name="shopping-list" size={16} />
            <span>KITCHEN INTELLIGENCE · PANTRY CHECK</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[var(--kc-ink)] tracking-tight">
            &ldquo;Before You Buy&rdquo; Shopping Assistant
          </h1>
          <p className="font-heading text-xs sm:text-sm text-[var(--kc-muted)] max-w-2xl leading-relaxed">
            Stop buying what you already have. Type any ingredient before heading to the market
            or bazaar to cross-check your active kitchen stock and prevent duplicate food waste.
          </p>
        </div>

        {/* Real-time Pantry Check Scanner Box */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-orange-50/40 dark:from-[#211B0B]/40 dark:to-[#171308]/40 border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔍</span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--kc-ink)] font-heading">
                Instant Pantry &amp; Fridge Cross-Check
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1 rounded-full">
              Live Stock Radar
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type grocery item (e.g. Milk, Rice, Spinach, Dal, Eggs)..."
              className="w-full px-5 py-3.5 text-sm sm:text-base rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-white/80 dark:bg-[#121008]/80 text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-heading"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-4 text-xs font-heading text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Feedback */}
          {query.trim() && (
            <div className="pt-2 animate-fade-in">
              {matchingStock.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50/80 dark:bg-red-950/40 border border-red-300/80 dark:border-red-900/80 rounded-2xl text-xs sm:text-sm text-red-800 dark:text-red-300 font-heading font-semibold flex items-center gap-2.5">
                    <span>⚠️</span>
                    <span>
                      Hold on! You already have {matchingStock.length} matching item(s) in your kitchen!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchingStock.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl glass-card border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between shadow-sm"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-[var(--kc-ink)] font-heading">{item.name}</h4>
                          <p className="text-xs text-[var(--kc-muted)] font-heading mt-0.5">
                            {item.qty} in {item.storage} · Status: <span className="font-semibold text-amber-700 dark:text-amber-400">{item.status}</span>
                          </p>
                        </div>
                        <Link
                          href={`/${locale}/recipes`}
                          className="px-3.5 py-1.5 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-sm"
                        >
                          Cook First
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/80 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-heading font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>
                      &ldquo;{query}&rdquo; is not currently in your fridge or pantry. Safe to purchase!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      saveList([
                        ...shoppingList,
                        {
                          id: Date.now().toString(),
                          name: query.trim(),
                          quantity: '1 unit',
                          category: 'Fresh Grocery',
                          checked: false,
                        },
                      ]);
                      setQuery('');
                    }}
                    className="px-4 py-2 bg-emerald-800 text-white rounded-full text-xs font-heading font-bold hover:bg-emerald-900 transition-all shadow-sm shrink-0"
                  >
                    + Add to Shopping List
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Smart Household Shopping Checklist */}
        <section className="p-6 sm:p-8 rounded-3xl glass-card border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-4 gap-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--kc-ink)] font-heading">
                Today&apos;s Verified Shopping List
              </h3>
              <p className="text-xs text-[var(--kc-muted)] font-heading">
                Items cross-checked against your home pantry before leaving the house.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-heading font-bold text-emerald-700 dark:text-emerald-400">
                {shoppingList.filter((i) => i.checked).length}/{shoppingList.length} Collected
              </span>
              {shoppingList.some((i) => i.checked) && (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="text-xs px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:opacity-90 font-heading font-semibold transition-all cursor-pointer"
                >
                  Clear Completed
                </button>
              )}
            </div>
          </div>

          {/* Quick Staple Add Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[var(--kc-muted)] uppercase tracking-wider block">
              Quick Staples (1-Click Add):
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Cow Milk', qty: '1 L', cat: 'Dairy' },
                { name: 'Eggs (Dozen)', qty: '12 pcs', cat: 'Dairy & Poultry' },
                { name: 'Tomatoes', qty: '1 kg', cat: 'Vegetables' },
                { name: 'Onions', qty: '2 kg', cat: 'Vegetables' },
                { name: 'Mustard Oil', qty: '1 L', cat: 'Pantry' },
                { name: 'Basmati Rice', qty: '2 kg', cat: 'Grains' },
                { name: 'Atta / Flour', qty: '5 kg', cat: 'Grains' },
              ].map((staple) => (
                <button
                  key={staple.name}
                  type="button"
                  onClick={() => addQuickStaple(staple.name, staple.qty, staple.cat)}
                  className="text-xs px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-[var(--kc-ink)] hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-heading cursor-pointer"
                >
                  <span>+</span>
                  <span>{staple.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add needed grocery item..."
              className="flex-1 px-4 py-3 text-sm rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] text-[var(--kc-ink)] focus:outline-none focus:border-emerald-600 font-heading"
            />
            <input
              type="text"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder="Qty (e.g. 500g, 1L, 2 pcs)"
              className="w-full sm:w-40 px-4 py-3 text-sm rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] text-[var(--kc-ink)] focus:outline-none focus:border-emerald-600 font-heading"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-emerald-800 text-white text-sm font-heading font-bold hover:bg-emerald-900 transition-all shadow-md shrink-0 cursor-pointer"
            >
              + Add Item
            </button>
          </form>

          {/* Checklist items */}
          <div className="space-y-2 pt-2">
            {shoppingList.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-black/[0.1] dark:border-white/[0.1] rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] space-y-1.5">
                <p className="text-sm font-heading font-semibold text-[var(--kc-ink)]">
                  Your shopping checklist is clear
                </p>
                <p className="text-xs font-heading text-[var(--kc-muted)]">
                  Tap any quick staple above or enter items to build your verified grocery list.
                </p>
              </div>
            ) : (
              shoppingList.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    item.checked
                      ? 'bg-black/[0.01] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.05] opacity-60'
                      : 'glass-card border-black/[0.06] dark:border-white/[0.08] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 rounded accent-emerald-700 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`text-sm font-heading font-bold text-[var(--kc-ink)] block ${
                          item.checked ? 'line-through text-[var(--kc-muted)]' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[var(--kc-muted)] font-mono">
                        {item.quantity} · {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/${locale}/inventory/add?name=${encodeURIComponent(item.name)}`}
                      className="text-[11px] font-heading font-semibold text-emerald-800 dark:text-emerald-300 hover:underline px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50"
                    >
                      + Move to Fridge
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
