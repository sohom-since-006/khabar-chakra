'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { lookupBarcode } from '@/lib/openFoodFacts';

interface MatchItem {
  id: string;
  name: string;
  quantity: string;
  storage: string;
  hoursRemaining: number;
  band: string;
}

export default function BeforeYouBuyPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [barcodeLookupInfo, setBarcodeLookupInfo] = useState<string | null>(null);
  const [shoppingListAdded, setShoppingListAdded] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setShoppingListAdded(false);
    setBarcodeLookupInfo(null);

    // If query looks like a barcode (numeric, >= 8 digits), attempt barcode lookup first
    let searchName = query.trim().toLowerCase();
    if (/^[0-9]{8,14}$/.test(query.trim())) {
      const barcodeResult = await lookupBarcode(query.trim());
      if (barcodeResult.found && barcodeResult.name) {
        searchName = barcodeResult.name.toLowerCase();
        setBarcodeLookupInfo(`Recognised product: "${barcodeResult.name}" (${barcodeResult.brand || 'Packaged'})`);
      }
    }

    // Check existing items from local pantry storage or seeded inventory
    let pantryItems: Array<{
      id: string;
      name: string;
      quantityValue: number;
      quantityUnit: string;
      storage: string;
      expiryDate: string;
    }> = [];

    try {
      pantryItems = JSON.parse(localStorage.getItem('kc-inventory') || '[]');
    } catch {
      pantryItems = [];
    }

    // Default seeded samples if user just started
    if (pantryItems.length === 0) {
      pantryItems = [
        {
          id: 'seed_1',
          name: 'Toned Milk',
          quantityValue: 1,
          quantityUnit: 'L',
          storage: 'fridge',
          expiryDate: new Date(Date.now() + 18 * 3600000).toISOString(),
        },
        {
          id: 'seed_2',
          name: 'Basmati Rice',
          quantityValue: 5,
          quantityUnit: 'kg',
          storage: 'room',
          expiryDate: new Date(Date.now() + 720 * 3600000).toISOString(),
        },
        {
          id: 'seed_3',
          name: 'Fresh Tomatoes',
          quantityValue: 1.5,
          quantityUnit: 'kg',
          storage: 'fridge',
          expiryDate: new Date(Date.now() + 36 * 3600000).toISOString(),
        },
      ];
    }

    const matched = pantryItems.filter((item) =>
      item.name.toLowerCase().includes(searchName) || searchName.includes(item.name.toLowerCase())
    );

    const now = Date.now();
    const formattedMatches: MatchItem[] = matched.map((item) => {
      const diffHours = Math.round((new Date(item.expiryDate).getTime() - now) / 3600000);
      let band = '🟢 Fresh';
      if (diffHours <= 0) band = '⬛ Expired';
      else if (diffHours <= 24) band = '🔴 Expiring';
      else if (diffHours <= 48) band = '🟡 Consume Soon';

      return {
        id: item.id,
        name: item.name,
        quantity: `${item.quantityValue} ${item.quantityUnit}`,
        storage: item.storage,
        hoursRemaining: Math.max(0, diffHours),
        band,
      };
    });

    setMatches(formattedMatches);
    setHasSearched(true);
    setSearching(false);
  };

  const handleAddToShoppingList = () => {
    setShoppingListAdded(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">In-Store Assistant · FR-BUY</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Before You Buy Checker
          </h1>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline flex items-center gap-1"
        >
          ← Back to Ledger
        </Link>
      </div>

      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 mb-8">
        <p className="text-sm text-[var(--kc-charcoal)] leading-relaxed mb-6 font-sans">
          Standing in an Asansol grocery store or market? Scan the packet barcode or type the ingredient name to check if you already have it sitting on your kitchen shelf before buying duplicate food.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type ingredient name (e.g. 'Milk', 'Rice', 'Tomatoes') or scan barcode..."
            className="flex-1 px-4 py-2.5 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 disabled:opacity-50 transition-colors"
          >
            {searching ? 'Checking Shelf...' : 'Check Shelf'}
          </button>
        </form>

        {barcodeLookupInfo && (
          <div className="mt-3 p-2 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] text-xs font-mono text-[var(--kc-basil)]">
            {barcodeLookupInfo}
          </div>
        )}
      </div>

      {/* Results View */}
      {hasSearched && (
        <div className="space-y-6">
          {matches.length > 0 ? (
            <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-mango)] p-6">
              <div className="flex items-center gap-2 border-b border-[var(--kc-moss)] pb-3 mb-4">
                <KhabarIcon name="warning" className="w-5 h-5 text-[var(--kc-mango)]" />
                <h3 className="text-base font-bold text-[var(--kc-charcoal)]">
                  You already have this at home!
                </h3>
              </div>

              <div className="space-y-3 mb-6">
                {matches.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-sm font-bold text-[var(--kc-charcoal)] block">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono text-[var(--kc-moss)]">
                        Portion at home: {item.quantity} · Stored in {item.storage}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold block">{item.band}</span>
                      <span className="text-[11px] font-mono text-[var(--kc-moss)]">
                        {item.hoursRemaining}h remaining
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--kc-moss)]">
                <p className="text-xs text-[var(--kc-moss)]">
                  Consider consuming the existing portion before purchasing more.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddToShoppingList}
                    className="px-4 py-2 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-parchment)] hover:bg-[var(--kc-cream)] text-[var(--kc-charcoal)]"
                  >
                    {shoppingListAdded ? '✓ Added to List' : 'Buy anyway & add to list'}
                  </button>
                  <Link
                    href="/en/home"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                  >
                    Skip & Return
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-basil)] p-6">
              <div className="flex items-center gap-2 border-b border-[var(--kc-moss)] pb-3 mb-4">
                <KhabarIcon name="success" className="w-5 h-5 text-[var(--kc-basil)]" />
                <h3 className="text-base font-bold text-[var(--kc-charcoal)]">
                  Clear to Purchase! No duplicate found at home.
                </h3>
              </div>
              <p className="text-sm text-[var(--kc-moss)] mb-6 font-sans">
                You do not currently have &ldquo;{query}&rdquo; recorded in your active kitchen inventory ledger.
              </p>
              <div className="flex justify-end gap-3">
                <Link
                  href="/en/inventory/add"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  Log Purchased Item Now →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
