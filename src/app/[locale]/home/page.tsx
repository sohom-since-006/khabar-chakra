'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InventoryItem, ItemOutcome } from '@/domain/types';
import { calculateFreshness } from '@/domain/freshness';

// Default starter items for an Asansol household ledger
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
    fssaiStatus: 'exempt',
    isFlagged: false,
    notes: 'Prepared for evening dinner. In airtight steel container.',
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
    fssaiStatus: 'exempt',
    isFlagged: false,
    notes: 'Bought from Burnpur local haat.',
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
    fssaiStatus: 'exempt',
    isFlagged: false,
    notes: '[Private Track Only] Freshly butchered.',
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
    fssaiStatus: 'verified',
    isFlagged: false,
    notes: 'Dry pantry storage drum.',
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
        // storage quota or incognito fallback
      }
    }
    return SEED_ITEMS;
  });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [density, setDensity] = useState<'standard' | 'compact' | 'cards'>('standard');
  
  // Item closure modal state
  const [closingItem, setClosingItem] = useState<InventoryItem | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<ItemOutcome>('consumed');
  const [toast, setToast] = useState<string | null>(null);

  const saveItems = (updated: InventoryItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem('kc-inventory', JSON.stringify(updated));
    } catch {
      // storage quota or incognito fallback
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
    showToast(`✓ Item marked as ${selectedOutcome}. Ledger updated.`);
  };

  const handleResetSeeds = () => {
    saveItems(SEED_ITEMS);
    showToast('✓ Ledger reset to sample Asansol household items.');
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

  // "Use This First" shelf: items expiring soonest (< 48h or in red/amber band)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Masthead */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--kc-moss)] gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Active Kitchen Inventory · Ledger 101</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-0.5">
            My Kitchen Freshness Board
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/en/inventory/check"
            className="px-4 py-2 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)] transition-colors flex items-center gap-1.5"
          >
            <span>🔍 Before You Buy</span>
          </Link>
          <Link
            href="/en/inventory/add"
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors flex items-center gap-1.5"
          >
            <span>+ Log Food Item</span>
          </Link>
        </div>
      </div>

      {toast && (
        <div className="mb-6 p-3 border border-[var(--kc-basil)] bg-green-50 text-xs font-mono text-[var(--kc-basil)] flex items-center justify-between animate-fade-in">
          <span>{toast}</span>
          <span className="text-[10px] uppercase font-mono">Ledger Synced</span>
        </div>
      )}

      {/* "USE THIS FIRST" PRIORITY SHELF (FR-TRACK-4) */}
      {useThisFirstItems.length > 0 && (
        <section className="mb-10">
          <div className="border border-[var(--kc-chilli)] bg-amber-50/70 p-5">
            <div className="flex items-center justify-between border-b border-[var(--kc-chilli)]/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--kc-chilli)] animate-pulse" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[var(--kc-charcoal)]">
                  Use This First · High Priority Shelf
                </h2>
              </div>
              <span className="font-annotation text-[var(--kc-chilli)] text-sm">
                Rescue before expiry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {useThisFirstItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">
                        {item.freshness.bandBadgeLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-[var(--kc-chilli)]">
                        ⌛ {item.freshness.hoursRemaining}h left
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--kc-charcoal)] mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[var(--kc-moss)] font-mono mb-3">
                      Portion: {item.quantityValue} {item.quantityUnit} · Stored in {item.storage}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--kc-moss)]/40 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[var(--kc-moss)]">
                      Freshness: {item.freshness.score}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setClosingItem(item)}
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                    >
                      Action →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter and Density Control Toolbar */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-1">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search kitchen shelf..."
              className="w-full px-3 py-1.5 text-xs border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
            >
              <option value="all">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="cooked_food">Cooked Food</option>
              <option value="dairy">Dairy</option>
              <option value="meat_fish_egg">Meat / Fish / Egg</option>
              <option value="grains_pulses">Grains & Pulses</option>
              <option value="packaged">Packaged</option>
              <option value="bread_bakery">Bakery</option>
            </select>
          </div>

          {/* Band Filter */}
          <div>
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
            >
              <option value="all">All Freshness Bands</option>
              <option value="fresh">🟢 Fresh</option>
              <option value="consume_soon">🟡 Consume Soon</option>
              <option value="expiring">🔴 Expiring</option>
              <option value="expired">⬛ Expired</option>
            </select>
          </div>

          {/* Density Switch */}
          <div className="flex justify-end items-center gap-1">
            <span className="text-[11px] font-mono text-[var(--kc-moss)] mr-1">VIEW:</span>
            <button
              type="button"
              onClick={() => setDensity('standard')}
              className={`px-2 py-1 text-xs font-mono transition-colors ${
                density === 'standard' ? 'bg-[var(--kc-basil)] text-white font-bold' : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)]'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setDensity('cards')}
              className={`px-2 py-1 text-xs font-mono transition-colors ${
                density === 'cards' ? 'bg-[var(--kc-basil)] text-white font-bold' : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)]'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Ruled Ledger View */}
      {filteredItems.length === 0 ? (
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-12 text-center">
          <h3 className="text-base font-bold text-[var(--kc-charcoal)] mb-2">
            No items matching your shelf filter
          </h3>
          <p className="text-xs text-[var(--kc-moss)] mb-6 font-sans">
            Clear search or log a new ingredient to refresh your kitchen ledger.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleResetSeeds}
              className="px-4 py-2 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)]"
            >
              Load Sample Asansol Items
            </button>
            <Link
              href="/en/inventory/add"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
            >
              + Add Item
            </Link>
          </div>
        </div>
      ) : density === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[var(--kc-moss)]/40 pb-2 mb-3">
                  <span className="text-[11px] font-mono uppercase text-[var(--kc-moss)]">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {item.freshness.bandBadgeLabel}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--kc-charcoal)] mb-1">
                  {item.name}
                </h3>
                <p className="text-xs font-mono text-[var(--kc-moss)] mb-2">
                  Portion: {item.quantityValue} {item.quantityUnit} · Stored: {item.storage}
                </p>
                {item.notes && (
                  <p className="text-xs text-[var(--kc-charcoal)] italic mb-4 font-sans">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--kc-moss)] flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--kc-moss)]">
                  {item.freshness.hoursRemaining}h remaining
                </span>
                <button
                  type="button"
                  onClick={() => setClosingItem(item)}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Ruled Ledger Table */
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--kc-moss)] bg-[var(--kc-parchment)] font-mono text-[var(--kc-moss)]">
                <th className="p-3">ITEM DESCRIPTION</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">PORTION</th>
                <th className="p-3">STORAGE</th>
                <th className="p-3">FRESHNESS BAND</th>
                <th className="p-3 text-right">TIME LEFT</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--kc-moss)]/40 hover:bg-[var(--kc-parchment)]/60 transition-colors"
                >
                  <td className="p-3">
                    <span className="font-bold text-sm text-[var(--kc-charcoal)] block">
                      {item.name}
                    </span>
                    {item.notes && (
                      <span className="text-[11px] text-[var(--kc-moss)] block italic font-sans">
                        {item.notes}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono uppercase text-[var(--kc-moss)]">
                    {item.category.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3 font-mono font-bold text-[var(--kc-charcoal)]">
                    {item.quantityValue} {item.quantityUnit}
                  </td>
                  <td className="p-3 font-mono uppercase text-[var(--kc-moss)]">
                    {item.storage}
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 font-mono border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">
                      {item.freshness.bandBadgeLabel}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[var(--kc-charcoal)]">
                    {item.freshness.hoursRemaining}h
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setClosingItem(item)}
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
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

      {/* Item Outcome / Action Ladder Modal (FR-TRACK-10, FR-TRACK-11) */}
      {closingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 max-w-lg w-full">
            <div className="border-b border-[var(--kc-moss)] pb-3 mb-6 flex justify-between items-center">
              <div>
                <span className="font-annotation text-[var(--kc-basil)] text-sm">Action Ladder · FR-TRACK-10</span>
                <h3 className="text-xl font-bold text-[var(--kc-charcoal)]">
                  Manage: {closingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setClosingItem(null)}
                className="text-sm font-mono text-[var(--kc-moss)] hover:text-[var(--kc-charcoal)]"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[var(--kc-charcoal)] mb-4 font-sans leading-relaxed">
              Record the outcome for this portion. Completing items updates your personal household waste avoidance ledger.
            </p>

            <form onSubmit={handleCloseItemSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="consumed"
                    checked={selectedOutcome === 'consumed'}
                    onChange={() => setSelectedOutcome('consumed')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-charcoal)] block">1. Eaten / Consumed</span>
                    <span className="text-[11px] text-[var(--kc-moss)] block">Successfully used in household meal</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="cooked"
                    checked={selectedOutcome === 'cooked'}
                    onChange={() => setSelectedOutcome('cooked')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-charcoal)] block">2. Cooked into Recipe</span>
                    <span className="text-[11px] text-[var(--kc-moss)] block">Prepared into another meal or frozen stew</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="shared"
                    checked={selectedOutcome === 'shared'}
                    onChange={() => setSelectedOutcome('shared')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-charcoal)] block">3. Shared Surplus</span>
                    <span className="text-[11px] text-[var(--kc-moss)] block">Handed over to neighbour or community group</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="composted"
                    checked={selectedOutcome === 'composted'}
                    onChange={() => setSelectedOutcome('composted')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-charcoal)] block">4. Composted Organically</span>
                    <span className="text-[11px] text-[var(--kc-moss)] block">Diverted to home pit or garden soil</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] cursor-pointer hover:border-[var(--kc-basil)]">
                  <input
                    type="radio"
                    name="outcome"
                    value="discarded"
                    checked={selectedOutcome === 'discarded'}
                    onChange={() => setSelectedOutcome('discarded')}
                    className="accent-[var(--kc-basil)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--kc-charcoal)] block">5. Discarded as Spoilage</span>
                    <span className="text-[11px] text-[var(--kc-moss)] block">Unavoidable waste (tracked for reduction)</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kc-moss)]">
                <button
                  type="button"
                  onClick={() => setClosingItem(null)}
                  className="px-4 py-2 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-parchment)] hover:bg-[var(--kc-cream)] text-[var(--kc-charcoal)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
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
