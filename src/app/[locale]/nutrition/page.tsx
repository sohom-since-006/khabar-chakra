'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateHouseholdNutrition, HouseholdProfile, MANDATORY_MEDICAL_DISCLAIMER } from '@/domain/nutrition';
import { InventoryItem } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { getCleanInventory } from '@/utils/inventoryStorage';

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
    setInventory(getCleanInventory());
  }, []);

  const targets = calculateHouseholdNutrition(profile);

  // Analyze active pantry inventory by food group
  const activeItems = inventory.filter((item) => item.status === 'active');
  const produceItems = activeItems.filter((i) => i.category === 'vegetables' || i.category === 'fruits');
  const grainPulseItems = activeItems.filter((i) => i.category === 'grains_pulses' || i.category === 'bread_bakery');
  const proteinDairyItems = activeItems.filter((i) => i.category === 'dairy' || i.category === 'meat_fish_egg');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Folio Header */}
      <div className="border-b border-[var(--kc-card-border)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-cursive-sacramento text-[var(--kc-basil)] text-2xl">Dietary Ledger &amp; ICMR-NIN Targets</span>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[var(--kc-ink)] mt-1">
            Household Nutrition Journal &amp; Macro Guide
          </h1>
          <p className="text-sm font-heading text-[var(--kc-muted)] mt-1">
            Reference dietary targets paired with your current kitchen pantry to maintain balanced, zero-waste family meals.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-heading font-semibold text-[var(--kc-muted)] hover:text-[var(--kc-basil)] border border-[var(--kc-card-border)] px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#0D241B]/80 backdrop-blur-md flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
        >
          ← Return to Pantry Ledger
        </Link>
      </div>

      {/* Statutory Medical Disclaimer Card (Clean Luxury Pill, No Side-Tab Cliché) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/[0.05] dark:bg-blue-500/[0.1] border border-blue-500/20 mb-8 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-[var(--kc-blueberry)] shrink-0">
            <KhabarIcon name="info" size={18} />
          </div>
          <div>
            <span className="font-heading text-xs font-bold uppercase text-[var(--kc-blueberry)] tracking-wider block mb-1">
              Statutory Medical Guidance Disclaimer
            </span>
            <p className="text-xs text-[var(--kc-ink)] leading-relaxed">
              {MANDATORY_MEDICAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Household Profile Configuration */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-[var(--kc-card-border)]">
          <h2 className="text-base font-heading font-bold text-[var(--kc-ink)] border-b border-[var(--kc-card-border)] pb-3 mb-5 flex items-center gap-2">
            <KhabarIcon name="household" size={18} />
            Household Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-[var(--kc-ink)] mb-1.5">
                Adult Men
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.adultMen}
                onChange={(e) => setProfile({ ...profile, adultMen: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3.5 py-2 text-sm border border-[var(--kc-card-border)] bg-neutral-50/80 dark:bg-[#071610]/80 rounded-xl font-heading text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)]"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[var(--kc-ink)] mb-1.5">
                Adult Women
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.adultWomen}
                onChange={(e) => setProfile({ ...profile, adultWomen: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3.5 py-2 text-sm border border-[var(--kc-card-border)] bg-neutral-50/80 dark:bg-[#071610]/80 rounded-xl font-heading text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)]"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[var(--kc-ink)] mb-1.5">
                Children (Ages 4–12)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.children}
                onChange={(e) => setProfile({ ...profile, children: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3.5 py-2 text-sm border border-[var(--kc-card-border)] bg-neutral-50/80 dark:bg-[#071610]/80 rounded-xl font-heading text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)]"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[var(--kc-ink)] mb-1.5">
                Elderly (60+ years)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.elderly}
                onChange={(e) => setProfile({ ...profile, elderly: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3.5 py-2 text-sm border border-[var(--kc-card-border)] bg-neutral-50/80 dark:bg-[#071610]/80 rounded-xl font-heading text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)]"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[var(--kc-ink)] mb-1.5">
                General Activity Level
              </label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as HouseholdProfile['activityLevel'] })}
                className="w-full px-3.5 py-2 text-sm border border-[var(--kc-card-border)] bg-neutral-50/80 dark:bg-[#071610]/80 rounded-xl font-heading text-[var(--kc-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)]"
              >
                <option value="sedentary">Sedentary (Desk work / light household)</option>
                <option value="moderate">Moderate (Active commute / regular walking)</option>
                <option value="heavy">Heavy (Physical labour / strenuous activity)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--kc-card-border)] text-[11px] font-heading text-[var(--kc-muted)]">
            Reference standard: ICMR-NIN 2020 Recommended Dietary Allowances for Indians.
          </div>
        </div>

        {/* Target Cards & Macros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-[var(--kc-card-border)]">
            <div className="flex justify-between items-center border-b border-[var(--kc-card-border)] pb-4 mb-6">
              <h2 className="text-base font-heading font-bold text-[var(--kc-ink)]">
                Daily Household Dietary Baseline
              </h2>
              <span className="font-heading text-xs px-3 py-1 rounded-full bg-[var(--kc-mint)] dark:bg-[#133527] text-[var(--kc-basil)] font-bold border border-[var(--kc-card-border)]">
                {profile.adultMen + profile.adultWomen + profile.children + profile.elderly} Members Enrolled
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 text-center shadow-sm">
                <span className="text-[10px] font-heading text-[var(--kc-muted)] uppercase tracking-wider block">
                  Energy Target
                </span>
                <span className="text-2xl font-bold font-heading text-[var(--kc-ink)] block my-1">
                  {targets.dailyCalories}
                </span>
                <span className="text-[11px] font-heading text-[var(--kc-basil)] font-semibold">kcal / day</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 text-center shadow-sm">
                <span className="text-[10px] font-heading text-[var(--kc-muted)] uppercase tracking-wider block">
                  Protein
                </span>
                <span className="text-2xl font-bold font-heading text-[var(--kc-ink)] block my-1">
                  {targets.dailyProtein}g
                </span>
                <span className="text-[11px] font-heading text-[var(--kc-muted)]">Tissue repair</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 text-center shadow-sm">
                <span className="text-[10px] font-heading text-[var(--kc-muted)] uppercase tracking-wider block">
                  Carbohydrates
                </span>
                <span className="text-2xl font-bold font-heading text-[var(--kc-ink)] block my-1">
                  {targets.dailyCarbs}g
                </span>
                <span className="text-[11px] font-heading text-[var(--kc-muted)]">Complex fuel</span>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 text-center shadow-sm">
                <span className="text-[10px] font-heading text-[var(--kc-muted)] uppercase tracking-wider block">
                  Healthy Fats
                </span>
                <span className="text-2xl font-bold font-heading text-[var(--kc-ink)] block my-1">
                  {targets.dailyFats}g
                </span>
                <span className="text-[11px] font-heading text-[var(--kc-muted)]">Absorption</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-[#071610]/70 border border-[var(--kc-card-border)] text-xs text-[var(--kc-ink)] font-heading">
              <span className="font-bold text-[var(--kc-basil)]">Meal Division Guide:</span> Allocate approximately 25% for breakfast, 35% for lunch, 15% for evening tea/snack, and 25% for dinner.
            </div>
          </div>

          {/* Active Pantry Food Groups */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-[var(--kc-card-border)]">
            <h3 className="text-base font-heading font-bold text-[var(--kc-ink)] border-b border-[var(--kc-card-border)] pb-3 mb-5 flex items-center justify-between">
              <span>Pantry Food Group Audit</span>
              <span className="text-xs font-heading font-normal text-[var(--kc-muted)]">
                {activeItems.length} Active Items In Ledger
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-heading font-bold text-[var(--kc-ink)]">Fresh Greens &amp; Fruit</span>
                  <span className="text-xs px-2.5 py-0.5 bg-[var(--kc-mint)] dark:bg-[#123023] text-[var(--kc-basil)] font-bold rounded-full font-heading">
                    {produceItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--kc-muted)] font-heading mb-3 leading-relaxed">
                  Dietary fibre, Vitamin C, potassium, and antioxidants.
                </p>
                {produceItems.length > 0 ? (
                  <ul className="text-xs font-heading text-[var(--kc-ink)] space-y-1">
                    {produceItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="truncate text-[var(--kc-muted)]">• {item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs font-heading text-[var(--kc-chilli)] block">None in active pantry</span>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-heading font-bold text-[var(--kc-ink)]">Grains &amp; Pulses</span>
                  <span className="text-xs px-2.5 py-0.5 bg-amber-500/10 text-[var(--kc-mango)] font-bold rounded-full font-heading">
                    {grainPulseItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--kc-muted)] font-heading mb-3 leading-relaxed">
                  Complex carbs, B-complex vitamins, and plant protein.
                </p>
                {grainPulseItems.length > 0 ? (
                  <ul className="text-xs font-heading text-[var(--kc-ink)] space-y-1">
                    {grainPulseItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="truncate text-[var(--kc-muted)]">• {item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs font-heading text-[var(--kc-chilli)] block">None in active pantry</span>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-[var(--kc-card-border)] bg-white/70 dark:bg-[#071610]/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-heading font-bold text-[var(--kc-ink)]">Protein &amp; Dairy</span>
                  <span className="text-xs px-2.5 py-0.5 bg-blue-500/10 text-[var(--kc-blueberry)] font-bold rounded-full font-heading">
                    {proteinDairyItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--kc-muted)] font-heading mb-3 leading-relaxed">
                  Complete amino acids, calcium, and bioavailable iron.
                </p>
                {proteinDairyItems.length > 0 ? (
                  <ul className="text-xs font-heading text-[var(--kc-ink)] space-y-1">
                    {proteinDairyItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="truncate text-[var(--kc-muted)]">• {item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs font-heading text-[var(--kc-chilli)] block">None in active pantry</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
