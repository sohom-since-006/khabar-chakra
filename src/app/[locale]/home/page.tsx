'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InventoryItem, ItemOutcome } from '@/domain/types';
import { calculateFreshness } from '@/domain/freshness';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

// Default starter items for an Indian household kitchen ledger
const SEED_ITEMS: InventoryItem[] = [
  {
    id: 'seed_milk',
    ownerId: 'local_user',
    name: 'Red Cow Toned Milk',
    category: 'dairy',
    dietType: 'veg',
    quantityValue: 1,
    quantityUnit: 'L',
    purchaseDate: new Date(Date.now() - 48 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 10 * 3600000).toISOString(), // ~10h left (expiring)
    expirySource: 'user_provided',
    storage: 'fridge',
    calories: 62,
    consumptionType: 'eat_directly',
    healthAdvisories: [
      { condition: 'Lactose Intolerance', warning: 'Contains dairy lactose.', severity: 'avoid' },
    ],
    fssaiStatus: 'verified',
    fssaiLicenseNo: '10014022002598',
    isFlagged: false,
    notes: 'Opened yesterday morning. Kept on top shelf.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_dal',
    ownerId: 'local_user',
    name: 'Cooked Chholar Dal with Coconut',
    category: 'cooked_food',
    dietType: 'veg',
    quantityValue: 4,
    quantityUnit: 'servings',
    purchaseDate: new Date(Date.now() - 14 * 3600000).toISOString(),
    cookedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 18 * 3600000).toISOString(), // ~18h left (consume soon)
    expirySource: 'auto_estimated',
    storage: 'fridge',
    calories: 145,
    consumptionType: 'eat_directly',
    fssaiStatus: 'exempt',
    isFlagged: false,
    notes: 'Prepared for dinner. In airtight steel dabba.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_palak',
    ownerId: 'local_user',
    name: 'Fresh Spinach (Palak)',
    category: 'vegetables',
    dietType: 'veg',
    quantityValue: 500,
    quantityUnit: 'g',
    purchaseDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 48 * 3600000).toISOString(), // ~48h left (fresh)
    expirySource: 'auto_estimated',
    storage: 'fridge',
    calories: 23,
    consumptionType: 'needs_cooking',
    healthAdvisories: [
      { condition: 'Kidney Stones', warning: 'High in oxalates.', severity: 'caution' },
    ],
    fssaiStatus: 'exempt',
    isFlagged: false,
    notes: 'Bought from local market.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mutton',
    ownerId: 'local_user',
    name: 'Raw Mutton Cutlets',
    category: 'meat_fish_egg',
    dietType: 'non_veg',
    quantityValue: 750,
    quantityUnit: 'g',
    purchaseDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 24 * 3600000).toISOString(),
    expirySource: 'auto_estimated',
    storage: 'fridge',
    calories: 240,
    consumptionType: 'needs_cooking',
    fssaiStatus: 'exempt',
    isFlagged: false,
    notes: '[Private Track Only] Freshly butchered cuts.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_rice',
    ownerId: 'local_user',
    name: 'Gobindobhog Rice',
    category: 'grains_pulses',
    dietType: 'veg',
    quantityValue: 5,
    quantityUnit: 'kg',
    purchaseDate: new Date(Date.now() - 120 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 1800 * 3600000).toISOString(),
    expirySource: 'auto_estimated',
    storage: 'room',
    calories: 130,
    consumptionType: 'needs_cooking',
    healthAdvisories: [
      { condition: 'Type 2 Diabetes', warning: 'High GI carbs.', severity: 'caution' },
    ],
    fssaiStatus: 'verified',
    isFlagged: false,
    notes: 'Dry pantry storage container.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function KitchenLedgerPage() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kc-inventory');
        if (stored) {
          return JSON.parse(stored);
        }
        localStorage.setItem('kc-inventory', JSON.stringify(SEED_ITEMS));
      } catch {
        // storage quota fallback
      }
    }
    return SEED_ITEMS;
  });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [density, setDensity] = useState<'standard' | 'cards'>('cards');

  // Item closure modal state
  const [closingItem, setClosingItem] = useState<InventoryItem | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<ItemOutcome>('consumed');
  const [toast, setToast] = useState<string | null>(null);

  const saveItems = (updated: InventoryItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem('kc-inventory', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCloseItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingItem) return;

    const updated = items.map((item) => {
      if (item.id === closingItem.id) {
        return {
          ...item,
          status: 'closed' as const,
          outcome: selectedOutcome,
          closedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    saveItems(updated);
    setClosingItem(null);
    showToast(`✓ "${closingItem.name}" marked as ${selectedOutcome}. Ledger updated.`);
  };

  const handleResetSeeds = () => {
    saveItems(SEED_ITEMS);
    showToast('✓ Ledger reset to sample kitchen items.');
  };

  // Active items and computed metadata
  const activeItems = items.filter((i) => i.status === 'active');
  const enrichedActiveItems = activeItems.map((item) => {
    const f = calculateFreshness({
      category: item.category,
      storage: item.storage,
      expiryDate: item.expiryDate,
      isFlagged: item.isFlagged,
    });
    return { ...item, freshness: f };
  });

  // "Use This First" shelf: items expiring soonest (< 48h)
  const useThisFirstItems = enrichedActiveItems
    .filter((item) => item.freshness.band === 'expiring' || item.freshness.band === 'consume_soon')
    .sort((a, b) => a.freshness.hoursRemaining - b.freshness.hoursRemaining);

  // Filtered view
  const filteredItems = enrichedActiveItems.filter((item) => {
    const matchesSearch =
      search.trim() === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesBand = bandFilter === 'all' || item.freshness.band === bandFilter;

    return matchesSearch && matchesCategory && matchesBand;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner / Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--kc-card-border)] gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-xl">Active Kitchen Shelf · Zero Waste Hub</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--kc-ink)] mt-0.5">
            My Kitchen Freshness Board
          </h1>
          <p className="text-xs sm:text-sm text-[var(--kc-muted)] mt-1">
            {activeItems.length} active items tracked · {useThisFirstItems.length} require priority consumption
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/en/shopping-list"
            className="px-4 py-2.5 text-xs font-mono rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] transition-colors flex items-center gap-1.5"
          >
            <span>🛒 Before You Buy</span>
          </Link>
          <Link
            href="/en/inventory/add"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>+ Log Food Item</span>
          </Link>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl border border-[var(--kc-basil)] bg-[var(--kc-mint)] text-xs font-mono text-[var(--kc-basil)] font-bold flex items-center justify-between">
          <span>{toast}</span>
          <span className="text-[10px] uppercase font-mono">Ledger Synced</span>
        </div>
      )}

      {/* "USE THIS FIRST" PRIORITY SHELF */}
      {useThisFirstItems.length > 0 && (
        <section className="rounded-2xl border border-[var(--kc-chilli)]/50 bg-amber-50/50 dark:bg-amber-950/20 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[var(--kc-chilli)]/30 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[var(--kc-chilli)] animate-pulse" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Use This First · High Priority Shelf
              </h2>
            </div>
            <Link
              href="/en/recipes"
              className="text-xs font-mono font-bold text-[var(--kc-basil)] hover:underline flex items-center gap-1"
            >
              <span>🍲 Find Rescue Recipes →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useThisFirstItems.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)]">
                      {item.freshness.bandBadgeLabel}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--kc-chilli)]">
                      ⌛ {item.freshness.hoursRemaining}h left
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--kc-ink)] mb-1">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-[var(--kc-muted)] mb-2">
                    <span>{item.quantityValue} {item.quantityUnit}</span>
                    <span>·</span>
                    <span className="capitalize">{item.storage}</span>
                    {item.calories ? (
                      <>
                        <span>·</span>
                        <span className="text-[var(--kc-basil)] font-semibold">{item.calories} kcal</span>
                      </>
                    ) : null}
                  </div>
                  {item.consumptionType && (
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--kc-bg)] text-[var(--kc-muted)] mb-2">
                      {item.consumptionType === 'eat_directly' ? '🟢 Ready to Eat' : '🍳 Needs Cooking'}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--kc-muted)]">
                    Freshness: <strong className="text-[var(--kc-basil)]">{item.freshness.score}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setClosingItem(item)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors cursor-pointer shadow-sm"
                  >
                    Mark Used →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter and Density Control Toolbar */}
      <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Search */}
          <div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shelf items..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
            >
              <option value="all">All Categories</option>
              <option value="vegetables">🥬 Vegetables</option>
              <option value="fruits">🍎 Fruits</option>
              <option value="dairy">🥛 Dairy</option>
              <option value="cooked_food">🍲 Cooked Food</option>
              <option value="grains_pulses">🌾 Grains & Pulses</option>
              <option value="bread_bakery">🍞 Bakery</option>
              <option value="packaged">📦 Packaged</option>
              <option value="meat_fish_egg">🥩 Meat / Fish / Egg</option>
            </select>
          </div>

          {/* Band Filter */}
          <div>
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)]"
            >
              <option value="all">All Freshness Bands</option>
              <option value="fresh">🟢 Fresh</option>
              <option value="consume_soon">🟡 Consume Soon</option>
              <option value="expiring">🔴 Expiring (&lt;48h)</option>
              <option value="expired">⬛ Expired</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end items-center gap-1.5">
            <span className="text-[10px] font-mono text-[var(--kc-muted)]">VIEW:</span>
            <button
              type="button"
              onClick={() => setDensity('cards')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                density === 'cards'
                  ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
                  : 'border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)]'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setDensity('standard')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                density === 'standard'
                  ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
                  : 'border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)]'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Ruled Ledger View */}
      {filteredItems.length === 0 ? (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-12 text-center rounded-2xl">
          <h3 className="text-base font-bold text-[var(--kc-ink)] mb-2">
            No items matching your shelf filter
          </h3>
          <p className="text-xs text-[var(--kc-muted)] mb-6">
            Clear your search filter or log a new kitchen ingredient.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleResetSeeds}
              className="px-4 py-2 text-xs font-mono rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] hover:bg-[var(--kc-card)] cursor-pointer"
            >
              Load Sample Pantry
            </button>
            <Link
              href="/en/inventory/add"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors cursor-pointer"
            >
              + Log Food Item
            </Link>
          </div>
        </div>
      ) : density === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[var(--kc-hairline)] pb-2.5 mb-3">
                  <span className="text-[11px] font-mono uppercase text-[var(--kc-muted)]">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--kc-basil)]">
                    {item.freshness.bandBadgeLabel}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--kc-ink)] mb-1">
                  {item.name}
                </h3>
                <p className="text-xs font-mono text-[var(--kc-muted)] mb-2">
                  Portion: {item.quantityValue} {item.quantityUnit} · Stored: {item.storage}
                </p>

                {/* Calories & Preparation Mode */}
                <div className="flex flex-wrap gap-2 text-xs font-mono text-[var(--kc-ink)] mb-3">
                  {item.calories ? (
                    <span className="px-2 py-0.5 rounded bg-[var(--kc-bg)] border border-[var(--kc-hairline)] font-semibold text-[var(--kc-basil)]">
                      ⚡ {item.calories} kcal
                    </span>
                  ) : null}
                  {item.consumptionType && (
                    <span className="px-2 py-0.5 rounded bg-[var(--kc-bg)] border border-[var(--kc-hairline)] text-[var(--kc-muted)]">
                      {item.consumptionType === 'eat_directly' ? '🟢 Eat Directly' : '🍳 Needs Cooking'}
                    </span>
                  )}
                </div>

                {item.healthAdvisories && item.healthAdvisories.length > 0 && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200 dark:border-amber-900 mb-3 leading-tight">
                    ⚠️ {item.healthAdvisories[0].condition}: {item.healthAdvisories[0].warning}
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-[var(--kc-muted)] italic mb-3">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--kc-muted)]">
                  {item.freshness.hoursRemaining}h remaining
                </span>
                <button
                  type="button"
                  onClick={() => setClosingItem(item)}
                  className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors cursor-pointer shadow-sm"
                >
                  Action →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Ruled Ledger Table */
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--kc-hairline)] bg-[var(--kc-bg)] font-mono text-[var(--kc-muted)]">
                <th className="p-3.5">ITEM DESCRIPTION</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">ENERGY</th>
                <th className="p-3.5">PORTION</th>
                <th className="p-3.5">STORAGE</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">TIME LEFT</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--kc-hairline)] hover:bg-[var(--kc-bg)] transition-colors"
                >
                  <td className="p-3.5">
                    <span className="font-bold text-sm text-[var(--kc-ink)] block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[var(--kc-muted)]">
                      {item.consumptionType === 'eat_directly' ? '🟢 Ready to eat' : '🍳 Cook required'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono uppercase text-[var(--kc-muted)]">
                    {item.category.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3.5 font-mono text-[var(--kc-basil)] font-semibold">
                    {item.calories ? `${item.calories} kcal` : '—'}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[var(--kc-ink)]">
                    {item.quantityValue} {item.quantityUnit}
                  </td>
                  <td className="p-3.5 font-mono uppercase text-[var(--kc-muted)]">
                    {item.storage}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-block px-2 py-0.5 font-mono rounded-full border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)]">
                      {item.freshness.bandBadgeLabel}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-[var(--kc-ink)]">
                    {item.freshness.hoursRemaining}h
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setClosingItem(item)}
                      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors cursor-pointer"
                    >
                      Action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Outcome / Action Modal */}
      {closingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 sm:p-8 rounded-2xl shadow-xl max-w-lg w-full space-y-4">
            <div className="border-b border-[var(--kc-hairline)] pb-3 flex justify-between items-center">
              <div>
                <span className="font-annotation text-[var(--kc-basil)] text-sm">Action Ladder · Household Reduction</span>
                <h3 className="text-xl font-bold text-[var(--kc-ink)]">
                  Log Outcome: {closingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setClosingItem(null)}
                className="text-sm font-mono text-[var(--kc-muted)] hover:text-[var(--kc-ink)] cursor-pointer p-1"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[var(--kc-muted)] leading-relaxed">
              Record what happened to this food. Completing items updates your personal rupee savings and domestic waste avoidance metrics.
            </p>

            <form onSubmit={handleCloseItemSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="consumed"
                    checked={selectedOutcome === 'consumed'}
                    onChange={() => setSelectedOutcome('consumed')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-ink)] block">1. Eaten / Consumed Directly</span>
                    <span className="text-[11px] text-[var(--kc-muted)] block">Enjoyed as fresh snack or beverage</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="cooked"
                    checked={selectedOutcome === 'cooked'}
                    onChange={() => setSelectedOutcome('cooked')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-ink)] block">2. Cooked into Recipe / Meal</span>
                    <span className="text-[11px] text-[var(--kc-muted)] block">Transformed into a household meal</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="composted"
                    checked={selectedOutcome === 'composted'}
                    onChange={() => setSelectedOutcome('composted')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-ink)] block">3. Composted Organically</span>
                    <span className="text-[11px] text-[var(--kc-muted)] block">Turned into home garden compost soil</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="discarded"
                    checked={selectedOutcome === 'discarded'}
                    onChange={() => setSelectedOutcome('discarded')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-ink)] block">4. Discarded as Spoilage</span>
                    <span className="text-[11px] text-[var(--kc-muted)] block">Unavoidable waste (logged for analytics)</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kc-hairline)]">
                <button
                  type="button"
                  onClick={() => setClosingItem(null)}
                  className="px-4 py-2 text-xs font-mono rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] hover:bg-[var(--kc-card)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors cursor-pointer shadow-sm"
                >
                  Save Outcome →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
