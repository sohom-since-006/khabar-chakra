'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RECIPES_CATALOG } from '@/data/recipes';
import { InventoryItem } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cookedSuccess, setCookedSuccess] = useState(false);
  const [addedToShopping, setAddedToShopping] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-inventory');
      if (stored) setInventory(JSON.parse(stored));
    } catch {
      // fallback
    }
  }, []);

  const recipe = RECIPES_CATALOG.find((r) => r.slug === slug);

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[var(--kc-ink)]">Recipe Not Found</h1>
        <p className="text-sm text-[var(--kc-muted)] mb-6">The requested recipe could not be found in the catalog.</p>
        <Link href="/en/recipes" className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white">
          Return to Recipes
        </Link>
      </div>
    );
  }

  // Handle "I Cooked This" (AC-RECIPE-03)
  const handleCookedThis = () => {
    const updatedInventory = inventory.map((item) => {
      const isMatched = recipe.ingredients.some((ing) =>
        ing.aliasKeywords.some((kw) => item.name.toLowerCase().includes(kw))
      );

      if (isMatched && item.status === 'active') {
        return {
          ...item,
          status: 'closed' as const,
          outcome: 'cooked' as const,
          closedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    try {
      localStorage.setItem('kc-inventory', JSON.stringify(updatedInventory));
    } catch {
      // fallback
    }

    setCookedSuccess(true);
    setTimeout(() => {
      router.push('/en/home');
    }, 1800);
  };

  // Handle "Add Missing Ingredients to Shopping List"
  const handleAddMissingToShopping = () => {
    const missing = recipe.ingredients.filter((ing) => {
      return !inventory.some((item) =>
        item.status === 'active' &&
        ing.aliasKeywords.some((kw) => item.name.toLowerCase().includes(kw))
      );
    });

    try {
      const currentList = JSON.parse(localStorage.getItem('kc-shopping-list') || '[]');
      const newItems = missing.map((m) => ({
        id: 'shop_' + Date.now() + Math.random().toString(36).substring(2, 5),
        name: m.name,
        quantity: m.amount,
        checked: false,
        addedFrom: recipe.title,
      }));
      localStorage.setItem('kc-shopping-list', JSON.stringify([...currentList, ...newItems]));
      setAddedToShopping(true);
      setTimeout(() => setAddedToShopping(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/en/recipes" className="text-xs font-mono font-semibold text-[var(--kc-basil)] hover:underline flex items-center gap-1">
          ← Back to Recipe Rescue Index
        </Link>
        <span className="text-xs font-mono text-[var(--kc-muted)]">
          Culinary ID: {recipe.slug}
        </span>
      </div>

      {cookedSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--kc-basil)] bg-[var(--kc-mint)] text-xs font-mono text-[var(--kc-basil)] flex items-center justify-between">
          <span className="font-bold">✓ Meal cooked! Rescued ingredients marked as used in your kitchen ledger.</span>
          <span className="text-[10px] uppercase font-bold animate-pulse">Redirecting to Kitchen Shelf...</span>
        </div>
      )}

      {addedToShopping && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--kc-mango)] bg-[rgba(255,201,60,0.15)] text-xs font-mono text-[var(--kc-ink)] flex items-center justify-between">
          <span className="font-bold">✓ Missing ingredients added to your &ldquo;Before You Buy&rdquo; Shopping List!</span>
          <Link href="/en/shopping-list" className="underline font-bold text-[var(--kc-basil)]">View Shopping List →</Link>
        </div>
      )}

      {/* Main Recipe Card */}
      <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 sm:p-8 rounded-2xl shadow-sm mb-8 space-y-6">
        {/* Header */}
        <div className="border-b border-[var(--kc-hairline)] pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-[var(--kc-basil)] bg-[var(--kc-mint)] font-bold text-[var(--kc-basil)] uppercase">
              {recipe.dietType} · {recipe.servings} Servings
            </span>
            {recipe.bengaliTitle && (
              <span className="text-base font-sans text-[var(--kc-basil)] font-semibold">
                {recipe.bengaliTitle}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--kc-ink)]">
            {recipe.title}
          </h1>
          <p className="text-sm text-[var(--kc-muted)] mt-2 font-sans leading-relaxed">
            {recipe.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--kc-hairline)] text-xs font-mono">
            <div className="bg-[var(--kc-bg)] p-2.5 rounded-lg border border-[var(--kc-hairline)]">
              <span className="text-[var(--kc-muted)] block text-[10px]">PREPARATION</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.prepMinutes} mins</span>
            </div>
            <div className="bg-[var(--kc-bg)] p-2.5 rounded-lg border border-[var(--kc-hairline)]">
              <span className="text-[var(--kc-muted)] block text-[10px]">COOK TIME</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.cookMinutes} mins</span>
            </div>
            <div className="bg-[var(--kc-bg)] p-2.5 rounded-lg border border-[var(--kc-hairline)]">
              <span className="text-[var(--kc-muted)] block text-[10px]">ENERGY</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.caloriesPerServing} kcal</span>
            </div>
            <div className="bg-[var(--kc-bg)] p-2.5 rounded-lg border border-[var(--kc-hairline)]">
              <span className="text-[var(--kc-muted)] block text-[10px]">PROTEIN</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.macros.proteinG}g / serving</span>
            </div>
          </div>
        </div>

        {/* Detailed Macronutrients & Vitamins Breakdown Card */}
        <div className="rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--kc-ink)] flex items-center gap-1.5">
              <span>📊</span>
              <span>Full Nutrient & Vitamin Profile (Per Serving)</span>
            </h2>
            <span className="text-[10px] font-mono text-[var(--kc-muted)]">ICMR-NIN Reference</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[var(--kc-card)] border border-[var(--kc-hairline)]">
              <span className="text-[10px] text-[var(--kc-muted)] block">Carbohydrates</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.macros.carbsG} g</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--kc-card)] border border-[var(--kc-hairline)]">
              <span className="text-[10px] text-[var(--kc-muted)] block">Fats (Lipids)</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.macros.fatG} g</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--kc-card)] border border-[var(--kc-hairline)]">
              <span className="text-[10px] text-[var(--kc-muted)] block">Dietary Fiber</span>
              <span className="font-bold text-[var(--kc-ink)] text-sm">{recipe.fiberG} g</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--kc-card)] border border-[var(--kc-hairline)]">
              <span className="text-[10px] text-[var(--kc-muted)] block">Key Vitamins</span>
              <span className="font-bold text-[var(--kc-basil)] text-xs truncate block">{recipe.vitamins.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Medical & Disease Advisory Warnings */}
        {recipe.healthAdvisories && recipe.healthAdvisories.length > 0 && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--kc-ink)]">
                Health & Medical Condition Advisories
              </h2>
            </div>
            <div className="space-y-2">
              {recipe.healthAdvisories.map((advisory, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    advisory.severity === 'avoid'
                      ? 'bg-red-50 dark:bg-red-950/40 border border-[var(--kc-chilli)] text-[var(--kc-chilli)]'
                      : 'bg-amber-50 dark:bg-amber-950/40 border border-[var(--kc-mango)] text-[var(--kc-ink)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {advisory.severity === 'avoid' ? '⛔ STRICT CONTRAINDICATION:' : '⚠️ CAUTION / MODERATION:'} {advisory.condition}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-95">
                    {advisory.warning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients Checklist */}
        <div>
          <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-2 mb-4">
            <h2 className="text-sm font-bold text-[var(--kc-ink)] uppercase font-mono tracking-wider">
              Ingredients & Pantry Cross-Check
            </h2>
            <button
              type="button"
              onClick={handleAddMissingToShopping}
              className="text-xs font-mono font-semibold text-[var(--kc-basil)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Add Missing to Shopping List
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients.map((ing, idx) => {
              const inPantry = inventory.some((item) =>
                item.status === 'active' &&
                ing.aliasKeywords.some((kw) => item.name.toLowerCase().includes(kw))
              );

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    inPantry
                      ? 'border-[var(--kc-basil)] bg-[var(--kc-mint)] text-[var(--kc-ink)]'
                      : 'border-[var(--kc-hairline)] bg-[var(--kc-bg)] text-[var(--kc-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{inPantry ? '✓' : '○'}</span>
                    <span className="font-medium text-[var(--kc-ink)]">{ing.name}</span>
                  </div>
                  <span className="font-mono text-[11px] shrink-0 font-semibold">{ing.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-sm font-bold text-[var(--kc-ink)] uppercase font-mono tracking-wider border-b border-[var(--kc-hairline)] pb-2 mb-4">
            Cooking Instructions
          </h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex gap-4 text-sm font-sans leading-relaxed">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg border border-[var(--kc-basil)] bg-[var(--kc-mint)] text-[var(--kc-basil)] h-fit shrink-0 font-bold">
                  {idx + 1}
                </span>
                <span className="text-[var(--kc-ink)] pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action: "I Cooked This" (AC-RECIPE-03) */}
        <div className="pt-6 border-t border-[var(--kc-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--kc-muted)]">
            Cooking this meal now? Tap below to deduct all matched items from your active pantry ledger.
          </p>
          <button
            type="button"
            onClick={handleCookedThis}
            disabled={cookedSuccess}
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            ✓ I Cooked This Dish
          </button>
        </div>
      </div>
    </div>
  );
}
