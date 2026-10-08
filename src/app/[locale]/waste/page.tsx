'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  WASTE_TAXONOMY,
  ASANSOL_DROP_OFF_HUBS,
  classifyWasteItem,
  WasteCategoryGuide,
} from '@/domain/waste';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function WastePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [classifiedResult, setClassifiedResult] = useState<WasteCategoryGuide | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setClassifiedResult(null);
      return;
    }
    const result = classifyWasteItem(searchQuery);
    setClassifiedResult(result);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Folio Masthead */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Ecological Loop · 4R Manual</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Food Waste &amp; Separation Guide
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Responsible municipal sorting protocols and local West Bengal organic drop-off centres when food cannot be rescued.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)] shrink-0"
        >
          ← Kitchen Ledger
        </Link>
      </div>

      {/* Interactive Waste Classifier Search */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 mb-10">
        <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)] mb-1 flex items-center gap-2">
          <KhabarIcon name="search" size={16} />
          Interactive Waste Sorter · What do I do with...
        </h2>
        <p className="text-xs text-[var(--kc-moss)] mb-4 font-sans">
          Type any food scrap, leftover dish, or packaging material to determine the correct disposal stream.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g. Cauliflower leaves, old dal gravy, milk pouch, crushed eggshells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
          />
          <button
            type="submit"
            className="px-5 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm"
          >
            Classify Stream →
          </button>
        </form>

        {classifiedResult && (
          <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]">
                Recommended Disposal: {classifiedResult.title}
              </span>
              <span className="text-xs font-sans text-[var(--kc-moss)] font-semibold">
                {classifiedResult.bengaliTitle}
              </span>
            </div>
            <p className="text-xs text-[var(--kc-moss)] font-sans mb-3">
              {classifiedResult.description}
            </p>
            <div className="text-[11px] font-mono text-[var(--kc-charcoal)] bg-[var(--kc-parchment)] p-2 border border-[var(--kc-moss)]/40">
              <strong>Handling Protocol:</strong> {classifiedResult.handlingInstruction}
            </div>
          </div>
        )}
      </div>

      {/* 5-Tier Waste Taxonomy Cards */}
      <div className="mb-12">
        <div className="border-b border-[var(--kc-moss)] pb-2 mb-6 flex justify-between items-end">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)]">
            5-Tier Household Waste Separation Hierarchy
          </h2>
          <span className="text-xs font-mono text-[var(--kc-moss)]">
            Strict Source Segregation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WASTE_TAXONOMY.map((tier) => (
            <div
              key={tier.stream}
              className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start border-b border-[var(--kc-moss)]/40 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--kc-charcoal)]">
                      {tier.title}
                    </h3>
                    <span className="text-[11px] font-sans text-[var(--kc-moss)] font-medium">
                      {tier.bengaliTitle}
                    </span>
                  </div>
                  <div className="pt-0.5 text-[var(--kc-basil)]">
                    <KhabarIcon name={tier.iconName} size={20} />
                  </div>
                </div>

                <p className="text-xs text-[var(--kc-moss)] font-sans mb-4 leading-relaxed">
                  {tier.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--kc-basil)] block mb-1">
                      ✓ Permitted In This Stream:
                    </span>
                    <ul className="text-xs font-mono text-[var(--kc-charcoal)] space-y-1">
                      {tier.permittedItems.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--kc-chilli)] block mb-1">
                      ✕ Strictly Prohibited:
                    </span>
                    <ul className="text-xs font-mono text-stone-600 space-y-1">
                      {tier.prohibitedItems.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--kc-moss)]/40 text-[11px] font-mono text-[var(--kc-moss)]">
                <strong>Rule:</strong> {tier.handlingInstruction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Drop-off Hubs Directory */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 mb-12">
        <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 mb-4 flex items-center justify-between">
          <span>Local Drop-Off &amp; Composting Directory · Asansol Corridor</span>
          <span className="text-xs font-mono text-[var(--kc-moss)] font-normal">
            Verified Drop-Off Nodes
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ASANSOL_DROP_OFF_HUBS.map((hub) => (
            <div
              key={hub.id}
              className="p-5 border border-[var(--kc-moss)] bg-white rounded-sm space-y-2"
            >
              <h3 className="text-sm font-bold text-[var(--kc-charcoal)]">
                {hub.name}
              </h3>
              <p className="text-xs font-mono text-[var(--kc-moss)]">
                📍 {hub.address}, {hub.city}
              </p>
              <div className="text-[11px] font-mono text-[var(--kc-basil)] font-semibold">
                🕒 Hours: {hub.operatingHours}
              </div>
              <p className="text-[11px] font-sans text-stone-600 leading-relaxed pt-2 border-t border-stone-200">
                {hub.contactNotes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
