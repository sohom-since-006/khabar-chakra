'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RECIPES_CATALOG } from '@/data/recipes';
import { InventoryItem } from '@/domain/types';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cookedSuccess, setCookedSuccess] = useState(false);

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
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <p className="text-sm text-[var(--kc-moss)] mb-6">The requested recipe could not be found in the catalog.</p>
        <Link href="/en/recipes" className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white">
          Return to Recipes
        </Link>
      </div>
    );
  }

  // Handle "I Cooked This" (AC-RECIPE-03)
  const handleCookedThis = () => {
    const updatedInventory = inventory.map((item) => {
      // Check if this item is in the recipe ingredients
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
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link href="/en/recipes" className="text-xs font-mono text-[var(--kc-moss)] hover:underline">
          ← Back to Recipe Rescue Index
        </Link>
      </div>

      {cookedSuccess && (
        <div className="mb-6 p-4 border border-[var(--kc-basil)] bg-green-50 text-xs font-mono text-[var(--kc-basil)] flex items-center justify-between animate-fade-in">
          <span>✓ Meal prepared! Rescued ingredients marked as cooked in your pantry ledger.</span>
          <span className="text-[10px] uppercase font-bold">Redirecting to Ledger...</span>
        </div>
      )}

      {/* Main Recipe Card */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 mb-8">
        {/* Header */}
        <div className="border-b border-[var(--kc-moss)] pb-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] font-bold text-[var(--kc-charcoal)] uppercase">
              {recipe.dietType} · {recipe.servings} Servings
            </span>
            {recipe.bengaliTitle && (
              <span className="text-base font-sans text-[var(--kc-basil)] font-semibold">
                {recipe.bengaliTitle}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)]">
            {recipe.title}
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-2 font-sans leading-relaxed">
            {recipe.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--kc-moss)]/40 text-xs font-mono">
            <div>
              <span className="text-[var(--kc-moss)] block">PREPARATION</span>
              <span className="font-bold text-[var(--kc-charcoal)]">{recipe.prepMinutes} minutes</span>
            </div>
            <div>
              <span className="text-[var(--kc-moss)] block">COOK TIME</span>
              <span className="font-bold text-[var(--kc-charcoal)]">{recipe.cookMinutes} minutes</span>
            </div>
            <div>
              <span className="text-[var(--kc-moss)] block">ENERGY</span>
              <span className="font-bold text-[var(--kc-charcoal)]">{recipe.caloriesPerServing} kcal</span>
            </div>
            <div>
              <span className="text-[var(--kc-moss)] block">PROTEIN</span>
              <span className="font-bold text-[var(--kc-charcoal)]">{recipe.macros.proteinG}g per portion</span>
            </div>
          </div>
        </div>

        {/* Ingredients Checklist */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-4">
            Ingredients & Pantry Check
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients.map((ing, idx) => {
              const inPantry = inventory.some((item) =>
                item.status === 'active' &&
                ing.aliasKeywords.some((kw) => item.name.toLowerCase().includes(kw))
              );

              return (
                <div
                  key={idx}
                  className={`p-3 border text-xs flex items-center justify-between ${
                    inPantry
                      ? 'border-[var(--kc-basil)] bg-green-50/70 text-[var(--kc-charcoal)]'
                      : 'border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-moss)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{inPantry ? '✓' : '○'}</span>
                    <span className="font-medium">{ing.name}</span>
                  </div>
                  <span className="font-mono text-[11px] shrink-0">{ing.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-4">
            Cooking Instructions
          </h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex gap-4 text-sm font-sans leading-relaxed">
                <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] h-fit shrink-0 font-bold">
                  {idx + 1}
                </span>
                <span className="text-[var(--kc-charcoal)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action: "I Cooked This" (AC-RECIPE-03) */}
        <div className="pt-6 border-t border-[var(--kc-moss)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--kc-moss)]">
            Cooking this meal? Tap below to deduct used items from your pantry shelf.
          </p>
          <button
            type="button"
            onClick={handleCookedThis}
            disabled={cookedSuccess}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 disabled:opacity-50 transition-colors"
          >
            ✓ I Cooked This Dish
          </button>
        </div>
      </div>
    </div>
  );
}
