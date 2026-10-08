'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { matchRecipesToPantry } from '@/domain/recipeRescue';
import { InventoryItem, DietType } from '@/domain/types';

export default function RecipesPage() {
  const [dietFilter, setDietFilter] = useState<DietType | 'all'>('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-inventory');
      if (stored) {
        setInventory(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const matches = matchRecipesToPantry({
    inventory,
    dietFilter,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Culinary Conservation · Almanac Kitchen</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Recipe Rescue Engine
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Recipes automatically ranked to rescue expiring ingredients sitting in your kitchen right now.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline flex items-center gap-1"
        >
          ← Return to Kitchen Shelf
        </Link>
      </div>

      {/* Dietary Filters Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dietary Filters">
          {(['all', 'veg', 'vegan', 'egg'] as const).map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => setDietFilter(diet)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                dietFilter === diet
                  ? 'bg-[var(--kc-basil)] text-white font-bold'
                  : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)]'
              }`}
            >
              {diet === 'all' ? 'All Diets' : diet === 'veg' ? '🟢 Pure Veg' : diet === 'vegan' ? '🌱 Vegan' : '🟡 Egg Allowed'}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-[var(--kc-moss)]">
          {matches.length} Recipes Matched
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((item) => {
          const { recipe, matchScore, rescuedPantryItemNames, matchedIngredientsCount, totalIngredientsCount } = item;
          const hasRescues = rescuedPantryItemNames.length > 0;

          return (
            <div
              key={recipe.slug}
              className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 flex flex-col justify-between"
            >
              <div>
                {/* Score badge & Bengali name */}
                <div className="flex justify-between items-start border-b border-[var(--kc-moss)]/40 pb-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] font-bold text-[var(--kc-charcoal)]">
                    {matchScore}% PANTRY MATCH
                  </span>
                  {recipe.bengaliTitle && (
                    <span className="text-xs font-sans text-[var(--kc-moss)]">
                      {recipe.bengaliTitle}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-[var(--kc-charcoal)] mb-1">
                  {recipe.title}
                </h2>
                <p className="text-xs text-[var(--kc-moss)] leading-relaxed mb-4 font-sans line-clamp-2">
                  {recipe.summary}
                </p>

                {/* Rescued Ingredients Highlight Pill */}
                {hasRescues && (
                  <div className="p-2 border border-[var(--kc-mango)] bg-amber-50/80 mb-4 text-xs">
                    <span className="font-mono text-[10px] text-[var(--kc-charcoal)] uppercase font-bold block">
                      Rescues from your shelf:
                    </span>
                    <span className="text-xs font-semibold text-[var(--kc-basil)]">
                      {rescuedPantryItemNames.join(', ')}
                    </span>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-[11px] font-mono text-[var(--kc-moss)] space-y-1 mb-4">
                  <div>⏱ Prep: {recipe.prepMinutes}m · Cook: {recipe.cookMinutes}m</div>
                  <div>🌾 Have {matchedIngredientsCount} of {totalIngredientsCount} ingredients</div>
                  <div>⚡ {recipe.caloriesPerServing} kcal · {recipe.macros.proteinG}g Protein</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--kc-moss)] flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[var(--kc-basil)] font-bold">
                  {recipe.dietType}
                </span>
                <Link
                  href={`/en/recipes/${recipe.slug}`}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  View Recipe →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
