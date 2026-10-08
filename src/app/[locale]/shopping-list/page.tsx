'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { AppSidebar } from '@/components/layout/AppSidebar';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

// Current simulated pantry stock for instant cross-checking
const INVENTORY_STOCK = [
  { name: 'Red Cow Toned Milk', category: 'Dairy', storage: 'Fridge', qty: '1 L', hoursLeft: 10, status: 'Expiring Soon' },
  { name: 'Cooked Chholar Dal', category: 'Cooked Food', storage: 'Fridge', qty: '4 servings', hoursLeft: 18, status: 'Consume Soon' },
  { name: 'Fresh Spinach (Palak)', category: 'Vegetables', storage: 'Fridge Crisper', qty: '500 g', hoursLeft: 48, status: 'Fresh' },
  { name: 'Gobindobhog Rice', category: 'Grains', storage: 'Pantry', qty: '5 kg', hoursLeft: 1800, status: 'Plentiful' },
  { name: 'Mustard Oil (Kachi Ghani)', category: 'Pantry Staples', storage: 'Pantry', qty: '2 L', hoursLeft: 7200, status: 'Plentiful' },
];

export default function BeforeYouBuyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState('en');
  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [query, setQuery] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { id: '1', name: 'Fresh Tomatoes', quantity: '1 kg', category: 'Vegetables', checked: false },
    { id: '2', name: 'Eggs (Brown)', quantity: '6 pcs', category: 'Dairy & Poultry', checked: false },
    { id: '3', name: 'Ginger & Garlic', quantity: '250 g', category: 'Spices & Aromatics', checked: true },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1 kg');

  // Real-time stock matching
  const matchingStock = query.trim()
    ? INVENTORY_STOCK.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setShoppingList([
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

  const toggleCheck = (id: string) => {
    setShoppingList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-[1440px] mx-auto flex w-full">
      <AppSidebar locale={locale} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden">
        {/* Header Title */}
        <div className="p-6 rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[var(--kc-basil)] uppercase">
            <KhabarIcon name="shopping-list" size={16} />
            <span>KITCHEN INTELLIGENCE · PANTRY CHECK</span>
          </div>
          <h1 className="font-montserrat text-2xl sm:text-4xl font-extrabold text-[var(--kc-ink)]">
            &ldquo;Before You Buy&rdquo; Shopping Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[var(--kc-muted)] max-w-2xl leading-relaxed">
            Stop buying what you already have. Type any ingredient before heading to the market
            or bazaar to cross-check your active kitchen stock and prevent duplicate food waste.
          </p>
        </div>

        {/* Real-time Pantry Check Scanner Box */}
        <section className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-[#211B0B] dark:to-[#171308] border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔍</span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--kc-ink)] font-montserrat">
                Instant Pantry & Fridge Cross-Check
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
              Live Stock Radar
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type grocery item (e.g. Milk, Rice, Spinach, Dal, Eggs)..."
              className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-[#121008] text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Feedback */}
          {query.trim() && (
            <div className="pt-2">
              {matchingStock.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-xl text-xs sm:text-sm text-red-800 dark:text-red-300 font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>
                      Hold on! You already have {matchingStock.length} matching item(s) in your kitchen!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchingStock.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#1A1810] border border-amber-200 dark:border-amber-900/80 flex items-center justify-between shadow-sm"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-[var(--kc-ink)]">{item.name}</h4>
                          <p className="text-xs text-[var(--kc-muted)] mt-0.5">
                            {item.qty} in {item.storage} · Status: <span className="font-semibold text-amber-700 dark:text-amber-400">{item.status}</span>
                          </p>
                        </div>
                        <Link
                          href={`/${locale}/recipes`}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[var(--kc-basil)] text-white hover:opacity-90"
                        >
                          Cook First
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>
                      &ldquo;{query}&rdquo; is not currently in your fridge or pantry. Safe to purchase!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShoppingList([
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
                    className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                  >
                    + Add to Shopping List
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Smart Household Shopping Checklist */}
        <section className="p-6 rounded-2xl bg-[var(--kc-card)] border border-[var(--kc-card-border)] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--kc-ink)] font-montserrat">
                Today&apos;s Verified Shopping List
              </h3>
              <p className="text-xs text-[var(--kc-muted)]">
                Items cross-checked against your home pantry before leaving the house.
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--kc-basil)]">
              {shoppingList.filter((i) => i.checked).length}/{shoppingList.length} Collected
            </span>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add needed grocery item..."
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-hairline)] bg-transparent text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
            <input
              type="text"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder="Qty (e.g. 500g, 1L, 2 pcs)"
              className="w-full sm:w-36 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--kc-hairline)] bg-transparent text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--kc-basil)] text-white text-sm font-bold hover:bg-[var(--kc-basil-hover)] transition-all shrink-0"
            >
              + Add Item
            </button>
          </form>

          {/* Checklist items */}
          <div className="space-y-2 pt-2">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  item.checked
                    ? 'bg-neutral-50 dark:bg-[#12241C] border-[var(--kc-hairline)] opacity-60'
                    : 'bg-white dark:bg-[#0E2219] border-[var(--kc-card-border)] shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    className="w-4 h-4 rounded accent-[var(--kc-basil)] cursor-pointer"
                  />
                  <div>
                    <span
                      className={`text-sm font-bold text-[var(--kc-ink)] block ${
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

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/inventory/add?name=${encodeURIComponent(item.name)}`}
                    className="text-[11px] font-semibold text-[var(--kc-basil)] hover:underline px-2 py-1 rounded bg-[var(--kc-mint)]"
                  >
                    + Move to Fridge
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-neutral-400 hover:text-red-500 p-1"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
