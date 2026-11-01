'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InventoryItem, ItemOutcome } from '@/domain/types';
import { calculateFreshness } from '@/domain/freshness';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { getCleanInventory, saveCleanInventory } from '@/utils/inventoryStorage';

export default function KitchenLedgerPage() {
  const [items, setItems] = useState<InventoryItem[]>(() => getCleanInventory());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [density, setDensity] = useState<'standard' | 'cards'>('cards');

  // Item closure modal state
  const [closingItem, setClosingItem] = useState<InventoryItem | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<ItemOutcome>('consumed');
  const [toast, setToast] = useState<string | null>(null);

  const saveItems = (updated: InventoryItem[]) => {
    setItems(updated);
    saveCleanInventory(updated);
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

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setZoneFilter('all');
    setBandFilter('all');
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
    const matchesZone = zoneFilter === 'all' || item.storage === zoneFilter;
    const matchesBand = bandFilter === 'all' || item.freshness.band === bandFilter;

    return matchesSearch && matchesCategory && matchesZone && matchesBand;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner / Masthead */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all">
        <div>
          <span className="font-cursive-sacramento text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400 font-bold block">
            Active Kitchen Shelf · Zero Waste Hub
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--kc-ink)] mt-0.5">
            My Kitchen Freshness Board
          </h1>
          <p className="font-heading text-xs sm:text-sm text-[var(--kc-muted)] mt-1.5">
            {activeItems.length} active items tracked · {useThisFirstItems.length} require priority consumption
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/en/shopping-list"
            className="px-5 py-2.5 text-xs font-heading font-semibold rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-black/30 text-[var(--kc-ink)] hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
          >
            <span>🛒 Before You Buy</span>
          </Link>
          <Link
            href="/en/inventory/add"
            className="px-6 py-2.5 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-h-[44px]"
          >
            <span>+ Log Food Item</span>
          </Link>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/40 text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toast}</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-200/50 dark:bg-emerald-800/50">Ledger Synced</span>
        </div>
      )}

      {/* "USE THIS FIRST" PRIORITY SHELF */}
      {useThisFirstItems.length > 0 && (
        <section className="rounded-3xl border border-amber-200/70 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/40 via-amber-50/20 to-orange-50/30 dark:from-amber-950/20 dark:via-black/20 dark:to-orange-950/20 p-6 sm:p-8 shadow-sm backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-amber-200/60 dark:border-amber-900/40 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#D6381F] animate-pulse" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Use This First · High Priority Shelf
              </h2>
            </div>
            <Link
              href="/en/recipes"
              className="text-xs font-heading font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
            >
              <span>🍲 Find Rescue Recipes →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useThisFirstItems.map((item) => (
              <div
                key={item.id}
                className="glass-card border border-black/[0.06] dark:border-white/[0.08] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-[var(--kc-ink)] font-semibold">
                      {item.freshness.bandBadgeLabel}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#D6381F]">
                      ⌛ {item.freshness.hoursRemaining}h left
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[var(--kc-ink)] mb-1">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-[var(--kc-muted)] mb-2">
                    <span>{item.quantityValue} {item.quantityUnit}</span>
                    <span>·</span>
                    <span className="capitalize">{item.storage}</span>
                    {item.calories ? (
                      <>
                        <span>·</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{item.calories} kcal</span>
                      </>
                    ) : null}
                  </div>
                  {item.consumptionType && (
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04] text-[var(--kc-muted)] mb-2">
                      {item.consumptionType === 'eat_directly' ? '🟢 Ready to Eat' : '🍳 Needs Cooking'}
                    </span>
                  )}
                </div>

                <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--kc-muted)]">
                    Freshness: <strong className="text-emerald-700 dark:text-emerald-400">{item.freshness.score}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setClosingItem(item)}
                    className="px-4 py-1.5 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
                  >
                    Mark Used →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Multi-Zone Storage Tabs + Filter Toolbar */}
      <div className="glass-card border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
        {/* Multi-Zone Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <span className="text-xs font-heading font-bold text-[var(--kc-muted)] mr-1">ZONE:</span>
          {[
            { id: 'all', label: 'All Shelves' },
            { id: 'fridge', label: '❄️ Fridge' },
            { id: 'freezer', label: '🧊 Freezer' },
            { id: 'pantry', label: '🏺 Pantry' },
          ].map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setZoneFilter(zone.id)}
              className={`px-4 py-1.5 text-xs font-heading font-bold rounded-full transition-all cursor-pointer ${
                zoneFilter === zone.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] text-[var(--kc-muted)] hover:text-[var(--kc-ink)]'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Search */}
          <div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shelf items..."
              className="w-full px-4 py-2.5 text-xs font-heading rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-heading rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
            >
              <option value="all">All Categories</option>
              <option value="vegetables">🥬 Vegetables</option>
              <option value="fruits">🍎 Fruits</option>
              <option value="dairy">🥛 Dairy</option>
              <option value="cooked_food">🍲 Cooked Food</option>
              <option value="grains_pulses">🌾 Grains &amp; Pulses</option>
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
              className="w-full px-4 py-2.5 text-xs font-heading rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
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
              className={`px-3.5 py-1.5 text-xs font-heading rounded-full transition-all cursor-pointer ${
                density === 'cards'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)]'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setDensity('standard')}
              className={`px-3.5 py-1.5 text-xs font-heading rounded-full transition-all cursor-pointer ${
                density === 'standard'
                  ? 'bg-emerald-800 text-white font-bold shadow-sm'
                  : 'border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)]'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Ruled Ledger View */}
      {items.length === 0 ? (
        <div className="glass-card border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-14 text-center rounded-3xl shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-inner border border-emerald-200/50 dark:border-emerald-900/50">
            🌿
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--kc-ink)] font-heading">
              Your Kitchen Shelf is Fresh &amp; Ready
            </h3>
            <p className="text-xs sm:text-sm text-[var(--kc-muted)] font-heading leading-relaxed">
              No food items logged yet. Scan a grocery receipt or package barcode with on-device OCR,
              or add fresh ingredients manually to start tracking freshness and eliminating waste.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <Link
              href="/en/inventory/add"
              className="w-full sm:w-auto px-6 py-3 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <KhabarIcon name="scan" size={16} />
              <span>Scan Grocery Receipt / Barcode</span>
            </Link>
            <Link
              href="/en/inventory/add"
              className="w-full sm:w-auto px-6 py-3 text-xs font-heading font-bold rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] hover:bg-black/[0.05] transition-colors flex items-center justify-center gap-2"
            >
              <span>+ Add Item Manually</span>
            </Link>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card border border-black/[0.06] dark:border-white/[0.08] p-12 text-center rounded-3xl">
          <h3 className="font-heading text-base font-bold text-[var(--kc-ink)] mb-2">
            No items matching your shelf filter
          </h3>
          <p className="font-heading text-xs text-[var(--kc-muted)] mb-6">
            Clear your search filter or log a new kitchen ingredient.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-5 py-2 text-xs font-heading font-semibold rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] hover:bg-black/[0.05] cursor-pointer"
            >
              Clear Filters
            </button>
            <Link
              href="/en/inventory/add"
              className="px-6 py-2 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
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
              className="glass-card border border-black/[0.06] dark:border-white/[0.08] p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center border-b border-black/[0.06] dark:border-white/[0.08] pb-3 mb-3.5">
                  <span className="text-[11px] font-mono uppercase text-[var(--kc-muted)]">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {item.freshness.bandBadgeLabel}
                  </span>
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--kc-ink)] mb-1">
                  {item.name}
                </h3>
                <p className="font-heading text-xs text-[var(--kc-muted)] mb-3">
                  Portion: {item.quantityValue} {item.quantityUnit} · Stored: {item.storage}
                </p>

                {/* Calories & Preparation Mode */}
                <div className="flex flex-wrap gap-2 text-xs font-mono text-[var(--kc-ink)] mb-3">
                  {item.calories ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 font-semibold text-emerald-800 dark:text-emerald-300">
                      ⚡ {item.calories} kcal
                    </span>
                  ) : null}
                  {item.consumptionType && (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-[var(--kc-muted)] font-heading">
                      {item.consumptionType === 'eat_directly' ? '🟢 Eat Directly' : '🍳 Needs Cooking'}
                    </span>
                  )}
                </div>

                {item.healthAdvisories && item.healthAdvisories.length > 0 && (
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 mb-3 leading-tight font-heading">
                    ⚠️ {item.healthAdvisories[0].condition}: {item.healthAdvisories[0].warning}
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-[var(--kc-muted)] italic mb-3 font-heading">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--kc-muted)]">
                  {item.freshness.hoursRemaining}h remaining
                </span>
                <button
                  type="button"
                  onClick={() => setClosingItem(item)}
                  className="px-4 py-1.5 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
                >
                  Action →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Ruled Ledger Table */
        <div className="glass-card border border-black/[0.06] dark:border-white/[0.08] rounded-3xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] font-mono text-[var(--kc-muted)]">
                <th className="p-4">ITEM DESCRIPTION</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">ENERGY</th>
                <th className="p-4">PORTION</th>
                <th className="p-4">STORAGE</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">TIME LEFT</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <span className="font-heading font-bold text-sm text-[var(--kc-ink)] block">
                      {item.name}
                    </span>
                    <span className="font-heading text-[11px] text-[var(--kc-muted)]">
                      {item.consumptionType === 'eat_directly' ? '🟢 Ready to eat' : '🍳 Cook required'}
                    </span>
                  </td>
                  <td className="p-4 font-mono uppercase text-[var(--kc-muted)]">
                    {item.category.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    {item.calories ? `${item.calories} kcal` : '—'}
                  </td>
                  <td className="p-4 font-mono font-bold text-[var(--kc-ink)]">
                    {item.quantityValue} {item.quantityUnit}
                  </td>
                  <td className="p-4 font-mono uppercase text-[var(--kc-muted)]">
                    {item.storage}
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-0.5 font-mono text-[11px] rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] font-semibold">
                      {item.freshness.bandBadgeLabel}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-[var(--kc-ink)]">
                    {item.freshness.hoursRemaining}h
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setClosingItem(item)}
                      className="px-3.5 py-1.5 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white/95 dark:bg-[#0B1E16]/95 border border-black/[0.08] dark:border-white/[0.1] p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-3 flex justify-between items-center">
              <div>
                <span className="font-cursive-sacramento text-emerald-700 dark:text-emerald-400 text-xl font-bold block">
                  Action Ladder · Household Reduction
                </span>
                <h3 className="font-heading text-xl font-bold text-[var(--kc-ink)]">
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

            <p className="font-heading text-xs text-[var(--kc-muted)] leading-relaxed">
              Record what happened to this food. Completing items updates your personal rupee savings and domestic waste avoidance metrics.
            </p>

            <form onSubmit={handleCloseItemSubmit} className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors">
                  <input
                    type="radio"
                    name="outcome"
                    value="consumed"
                    checked={selectedOutcome === 'consumed'}
                    onChange={() => setSelectedOutcome('consumed')}
                    className="accent-emerald-700"
                  />
                  <div>
                    <span className="font-heading text-xs font-bold text-[var(--kc-ink)] block">1. Eaten / Consumed Directly</span>
                    <span className="font-heading text-[11px] text-[var(--kc-muted)] block">Enjoyed as fresh snack or beverage</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors">
                  <input
                    type="radio"
                    name="outcome"
                    value="cooked"
                    checked={selectedOutcome === 'cooked'}
                    onChange={() => setSelectedOutcome('cooked')}
                    className="accent-emerald-700"
                  />
                  <div>
                    <span className="font-heading text-xs font-bold text-[var(--kc-ink)] block">2. Cooked into Recipe / Meal</span>
                    <span className="font-heading text-[11px] text-[var(--kc-muted)] block">Transformed into a household meal</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors">
                  <input
                    type="radio"
                    name="outcome"
                    value="composted"
                    checked={selectedOutcome === 'composted'}
                    onChange={() => setSelectedOutcome('composted')}
                    className="accent-emerald-700"
                  />
                  <div>
                    <span className="font-heading text-xs font-bold text-[var(--kc-ink)] block">3. Composted Organically</span>
                    <span className="font-heading text-[11px] text-[var(--kc-muted)] block">Turned into home garden compost soil</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-400 transition-colors">
                  <input
                    type="radio"
                    name="outcome"
                    value="discarded"
                    checked={selectedOutcome === 'discarded'}
                    onChange={() => setSelectedOutcome('discarded')}
                    className="accent-emerald-700"
                  />
                  <div>
                    <span className="font-heading text-xs font-bold text-[var(--kc-ink)] block">4. Discarded as Spoilage</span>
                    <span className="font-heading text-[11px] text-[var(--kc-muted)] block">Unavoidable waste (logged for analytics)</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setClosingItem(null)}
                  className="px-5 py-2 text-xs font-heading font-semibold rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] hover:bg-black/[0.05] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
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
