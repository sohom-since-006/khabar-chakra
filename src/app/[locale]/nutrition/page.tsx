'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateHouseholdNutrition, HouseholdProfile, MANDATORY_MEDICAL_DISCLAIMER } from '@/domain/nutrition';
import { InventoryItem } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function NutritionPage() {
  const [profile, setProfile] = useState<HouseholdProfile>({
    adultMen: 1,
    adultWomen: 1,
    children: 1,
    elderly: 0,
    activityLevel: 'moderate',
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-inventory');
      if (stored) setInventory(JSON.parse(stored));
    } catch {
      // fallback
    }
  }, []);

  const targets = calculateHouseholdNutrition(profile);

  // Analyze active pantry inventory by food group
  const activeItems = inventory.filter((item) => item.status === 'active');
  const produceItems = activeItems.filter((i) => i.category === 'vegetables' || i.category === 'fruits');
  const grainPulseItems = activeItems.filter((i) => i.category === 'grains_pulses' || i.category === 'bread_bakery');
  const proteinDairyItems = activeItems.filter((i) => i.category === 'dairy' || i.category === 'meat_fish_egg');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Folio Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Almanac Dietary Ledger · ICMR-NIN Reference</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Household Nutrition Journal &amp; Planner
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Reference dietary targets paired with your current kitchen pantry to maintain balanced, waste-free family meals.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)] flex items-center gap-1 shrink-0"
        >
          ← Return to Pantry Ledger
        </Link>
      </div>

      {/* Mandatory Medical Disclaimer (AC-NUT-01) */}
      <div className="p-4 border-l-4 border border-[var(--kc-blueberry)] bg-blue-50/50 mb-8 rounded-sm">
        <div className="flex items-start gap-3">
          <div className="pt-0.5 text-[var(--kc-blueberry)]">
            <KhabarIcon name="info" size={20} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold uppercase text-[var(--kc-blueberry)] tracking-wider block mb-1">
              Statutory Medical Guidance Disclaimer
            </span>
            <p className="text-xs text-[var(--kc-charcoal)] font-sans leading-relaxed">
              {MANDATORY_MEDICAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Household Profile Configuration */}
        <div className="lg:col-span-1 almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 mb-4 flex items-center gap-2">
            <KhabarIcon name="household" size={18} />
            Household Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Adult Men
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.adultMen}
                onChange={(e) => setProfile({ ...profile, adultMen: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-1.5 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Adult Women
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.adultWomen}
                onChange={(e) => setProfile({ ...profile, adultWomen: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-1.5 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Children (Ages 4–12)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.children}
                onChange={(e) => setProfile({ ...profile, children: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-1.5 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Elderly (60+ years)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.elderly}
                onChange={(e) => setProfile({ ...profile, elderly: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-1.5 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                General Activity Level
              </label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as HouseholdProfile['activityLevel'] })}
                className="w-full px-3 py-1.5 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
              >
                <option value="sedentary">Sedentary (Desk work / light household)</option>
                <option value="moderate">Moderate (Active commute / regular walking)</option>
                <option value="heavy">Heavy (Physical labour / strenuous activity)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--kc-moss)]/40 text-[11px] font-mono text-[var(--kc-moss)]">
            Reference standard: ICMR-NIN 2020 Recommended Dietary Allowances for Indians.
          </div>
        </div>

        {/* Target Cards & Macros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <div className="flex justify-between items-center border-b border-[var(--kc-moss)]/40 pb-3 mb-6">
              <h2 className="text-base font-bold text-[var(--kc-charcoal)]">
                Daily Household Dietary Estimate
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-basil)] font-bold">
                {profile.adultMen + profile.adultWomen + profile.children + profile.elderly} Household Members
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm text-center">
                <span className="text-[10px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
                  Energy Target
                </span>
                <span className="text-2xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
                  {targets.dailyCalories}
                </span>
                <span className="text-[11px] font-mono text-[var(--kc-basil)] font-bold">kcal / day</span>
              </div>

              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm text-center">
                <span className="text-[10px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
                  Protein
                </span>
                <span className="text-2xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
                  {targets.dailyProtein}g
                </span>
                <span className="text-[11px] font-mono text-[var(--kc-moss)]">Building &amp; repair</span>
              </div>

              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm text-center">
                <span className="text-[10px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
                  Carbohydrates
                </span>
                <span className="text-2xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
                  {targets.dailyCarbs}g
                </span>
                <span className="text-[11px] font-mono text-[var(--kc-moss)]">Complex energy</span>
              </div>

              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm text-center">
                <span className="text-[10px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
                  Essential Fats
                </span>
                <span className="text-2xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
                  {targets.dailyFats}g
                </span>
                <span className="text-[11px] font-mono text-[var(--kc-moss)]">Lipids &amp; absorption</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--kc-parchment)] border border-[var(--kc-moss)]/40 text-xs text-[var(--kc-charcoal)] font-sans">
              <span className="font-bold">Meal Division Guide:</span> Allocate approximately 25% for morning breakfast, 35% for lunch, 15% for evening tea/snack, and 25% for dinner.
            </div>
          </div>

          {/* Active Pantry Food Groups */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <h3 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 mb-4 flex items-center justify-between">
              <span>Pantry Food Group Audit</span>
              <span className="text-xs font-mono font-normal text-[var(--kc-moss)]">
                {activeItems.length} Active Items Tracked
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--kc-charcoal)]">Fresh Greens &amp; Fruit</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-[var(--kc-basil)] text-white font-bold rounded-sm">
                    {produceItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--kc-moss)] font-sans mb-3">
                  Provides dietary fibre, Vitamin C, potassium, and antioxidants.
                </p>
                {produceItems.length > 0 ? (
                  <ul className="text-xs font-mono text-[var(--kc-charcoal)] space-y-1">
                    {produceItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="truncate">• {item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs font-mono text-[var(--kc-chilli)] block">None in active pantry</span>
                )}
              </div>

              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--kc-charcoal)]">Grains &amp; Pulses</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-[var(--kc-mango)] text-[var(--kc-charcoal)] font-bold rounded-sm">
                    {grainPulseItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--kc-moss)] font-sans mb-3">
                  Primary source of sustained complex carbohydrates and plant proteins.
                </p>
                {grainPulseItems.length > 0 ? (
                  <ul className="text-xs font-mono text-[var(--kc-charcoal)] space-y-1">
                    {grainPulseItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="truncate">• {item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs font-mono text-[var(--kc-chilli)] block">None in active pantry</span>
                )}
              </div>

              <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--kc-charcoal)]">Proteins &amp; Dairy</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-[var(--kc-blueberry)] text-white font-bold rounded-sm">
                    {proteinDairyItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--kc-moss)] font-sans mb-3">
                  Calcium, Vitamin B12, and complete amino acids for tissue maintenance.
                </p>
                {proteinDairyItems.length > 0 ? (
                  <ul className="text-xs font-mono text-[var(--kc-charcoal)] space-y-1">
                    {proteinDairyItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="truncate">• {item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs font-mono text-[var(--kc-chilli)] block">None in active pantry</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--kc-moss)]/40">
              <span className="text-xs font-sans text-[var(--kc-moss)]">
                Ready to prepare a meal rescuing near-expiry items?
              </span>
              <Link
                href="/en/recipes"
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm"
              >
                Launch Recipe Rescue Engine →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
