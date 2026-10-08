'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { matchRecipesToPantry } from '@/domain/recipeRescue';
import { InventoryItem, DietType } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

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
      <div className="border-b border-[var(--kc-card-border)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-xl">Culinary Conservation · Almanac Kitchen</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--kc-ink)] mt-1">
            Recipe Rescue & Nutrition Intelligence
          </h1>
          <p className="text-sm text-[var(--kc-muted)] mt-1 font-sans">
            Recipes automatically ranked to rescue expiring ingredients in your pantry with full macronutrients & disease health advisories.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono font-semibold text-[var(--kc-basil)] hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] w-fit"
        >
          <KhabarIcon name="fridge" size={14} />
          <span>Return to Kitchen Shelf</span>
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
              className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                dietFilter === diet
                  ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
                  : 'border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)]'
              }`}
            >
              {diet === 'all' ? 'All Diets' : diet === 'veg' ? '🟢 Pure Veg' : diet === 'vegan' ? '🌱 Vegan' : '🟡 Egg Allowed'}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono font-bold text-[var(--kc-muted)]">
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
              className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Score badge & Bengali name */}
                <div className="flex justify-between items-start border-b border-[var(--kc-hairline)] pb-2.5 mb-3">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-[var(--kc-basil)] bg-[var(--kc-mint)] font-bold text-[var(--kc-basil)]">
                    {matchScore}% PANTRY MATCH
                  </span>
                  {recipe.bengaliTitle && (
                    <span className="text-xs font-semibold text-[var(--kc-basil)]">
                      {recipe.bengaliTitle}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-[var(--kc-ink)] mb-1">
                  {recipe.title}
                </h2>
                <p className="text-xs text-[var(--kc-muted)] leading-relaxed mb-4 font-sans line-clamp-2">
                  {recipe.summary}
                </p>

                {/* Rescued Ingredients Highlight Pill */}
                {hasRescues && (
                  <div className="p-2.5 rounded-xl border border-[var(--kc-mango)] bg-[rgba(255,201,60,0.12)] mb-4 text-xs">
                    <span className="font-mono text-[10px] text-[var(--kc-ink)] uppercase font-bold block mb-0.5">
                      Rescues from your shelf:
                    </span>
                    <span className="text-xs font-semibold text-[var(--kc-basil)]">
                      {rescuedPantryItemNames.join(', ')}
                    </span>
                  </div>
                )}

                {/* Comprehensive Nutrition Strip */}
                <div className="bg-[var(--kc-bg)] border border-[var(--kc-hairline)] rounded-xl p-3 mb-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-[var(--kc-ink)]">
                    <span>⚡ {recipe.caloriesPerServing} kcal</span>
                    <span>🥩 {recipe.macros.proteinG}g Protein</span>
                    <span>🧈 {recipe.macros.fatG}g Fat</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--kc-muted)]">
                    <span>🌾 {recipe.macros.carbsG}g Carbs</span>
                    <span>🌿 {recipe.fiberG}g Fiber</span>
                  </div>
                  {recipe.vitamins && recipe.vitamins.length > 0 && (
                    <div className="text-[10px] font-mono text-[var(--kc-muted)] pt-1 border-t border-[var(--kc-hairline)] truncate">
                      💊 <strong className="text-[var(--kc-ink)]">Vitamins:</strong> {recipe.vitamins.join(', ')}
                    </div>
                  )}
                </div>

                {/* Disease / Health Advisory Alerts */}
                {recipe.healthAdvisories && recipe.healthAdvisories.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {recipe.healthAdvisories.map((adv, idx) => (
                      <div
                        key={idx}
                        className={`text-[11px] p-2 rounded-lg flex items-start gap-1.5 ${
                          adv.severity === 'avoid'
                            ? 'bg-red-50 dark:bg-red-950/30 border border-[var(--kc-chilli)] text-[var(--kc-chilli)]'
                            : 'bg-amber-50 dark:bg-amber-950/30 border border-[var(--kc-mango)] text-[var(--kc-ink)]'
                        }`}
                      >
                        <span className="shrink-0">{adv.severity === 'avoid' ? '⛔' : '⚠️'}</span>
                        <div className="leading-tight">
                          <strong className="font-semibold block">{adv.condition}:</strong>
                          <span className="text-[10px] opacity-90">{adv.warning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cooking time & ingredient match */}
                <div className="text-[11px] font-mono text-[var(--kc-muted)] space-y-0.5 mb-4">
                  <div>⏱ Prep: {recipe.prepMinutes}m · Cook: {recipe.cookMinutes}m</div>
                  <div>🥣 In Pantry: {matchedIngredientsCount} of {totalIngredientsCount} items</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--kc-hairline)] flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[var(--kc-basil)] font-bold">
                  {recipe.dietType}
                </span>
                <Link
                  href={`/en/recipes/${recipe.slug}`}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] transition-colors shadow-sm"
                >
                  Cook Recipe →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
