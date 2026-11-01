'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { matchRecipesToPantry } from '@/domain/recipeRescue';
import { InventoryItem, DietType } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { getCleanInventory } from '@/utils/inventoryStorage';

export default function RecipesPage() {
  const [dietFilter, setDietFilter] = useState<DietType | 'all'>('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setInventory(getCleanInventory());
  }, []);

  const matches = matchRecipesToPantry({
    inventory,
    dietFilter,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
        <div>
          <span className="font-cursive-sacramento text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400 font-bold block">
            Culinary Conservation · Atelier Kitchen
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--kc-ink)] mt-0.5">
            Recipe Rescue &amp; Nutrition Intelligence
          </h1>
          <p className="font-heading text-xs sm:text-sm text-[var(--kc-muted)] mt-1.5 max-w-2xl">
            Recipes automatically ranked to rescue expiring ingredients in your pantry with full macronutrients &amp; health advisories.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-heading font-semibold text-emerald-800 dark:text-emerald-300 hover:opacity-90 flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] w-fit shadow-sm"
        >
          <KhabarIcon name="fridge" size={14} />
          <span>Return to Kitchen Shelf</span>
        </Link>
      </div>

      {/* Dietary Filters Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dietary Filters">
          {(['all', 'veg', 'vegan', 'egg'] as const).map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => setDietFilter(diet)}
              className={`px-5 py-2 text-xs font-heading font-bold rounded-full transition-all cursor-pointer ${
                dietFilter === diet
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'glass-card border border-black/[0.08] dark:border-white/[0.1] text-[var(--kc-ink)] hover:border-emerald-600'
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
              className="glass-card border border-black/[0.06] dark:border-white/[0.08] p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                {/* Score badge & Bengali name */}
                <div className="flex justify-between items-start border-b border-black/[0.06] dark:border-white/[0.08] pb-3 mb-3.5">
                  <span className="text-[11px] font-mono px-3 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-300">
                    {matchScore}% PANTRY MATCH
                  </span>
                  {recipe.bengaliTitle && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-heading">
                      {recipe.bengaliTitle}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-heading font-bold text-[var(--kc-ink)] mb-1">
                  {recipe.title}
                </h2>
                <p className="text-xs text-[var(--kc-muted)] leading-relaxed mb-4 font-heading line-clamp-2">
                  {recipe.summary}
                </p>

                {/* Rescued Ingredients Highlight Pill */}
                {hasRescues && (
                  <div className="p-3 rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 mb-4 text-xs font-heading">
                    <span className="font-mono text-[10px] text-[var(--kc-ink)] uppercase font-bold block mb-0.5">
                      Rescues from your shelf:
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {rescuedPantryItemNames.join(', ')}
                    </span>
                  </div>
                )}

                {/* Comprehensive Nutrition Strip */}
                <div className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] rounded-2xl p-3.5 mb-4 space-y-2 text-xs">
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
                    <div className="text-[10px] font-mono text-[var(--kc-muted)] pt-1.5 border-t border-black/[0.05] dark:border-white/[0.06] truncate">
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
                        className={`text-[11px] p-2.5 rounded-xl flex items-start gap-2 font-heading ${
                          adv.severity === 'avoid'
                            ? 'bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-[#D6381F]'
                            : 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[var(--kc-ink)]'
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

              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-emerald-800 dark:text-emerald-300 font-bold">
                  {recipe.dietType}
                </span>
                <Link
                  href={`/en/recipes/${recipe.slug}`}
                  className="px-5 py-2 text-xs font-heading font-bold rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-sm"
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
