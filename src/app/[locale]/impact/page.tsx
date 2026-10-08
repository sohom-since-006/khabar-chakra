'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateImpact, ImpactReport, IMPACT_FACTORS } from '@/domain/impact';
import { InventoryItem } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function ImpactPage() {
  const [report, setReport] = useState<ImpactReport>(() => calculateImpact([]));
  const [simulationExtraKg, setSimulationExtraKg] = useState(5);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-inventory');
      let items: InventoryItem[] = stored ? JSON.parse(stored) : [];

      // Include community seed items if user inventory is small
      if (items.length < 5) {
        items = [
          ...items,
          {
            id: 'seed-imp-1',
            ownerId: 'u1',
            name: 'Puri Sabzi Leftovers',
            category: 'cooked_food',
            dietType: 'veg',
            quantityValue: 6,
            quantityUnit: 'kg',
            purchaseDate: '2026-10-01',
            expiryDate: '2026-10-02',
            expirySource: 'user_provided',
            storage: 'room',
            fssaiStatus: 'verified',
            isFlagged: false,
            status: 'closed',
            outcome: 'consumed',
            createdAt: '2026-10-01',
            updatedAt: '2026-10-02',
          },
          {
            id: 'seed-imp-2',
            ownerId: 'u1',
            name: 'Overripe Bananas',
            category: 'fruits',
            dietType: 'vegan',
            quantityValue: 2,
            quantityUnit: 'kg',
            purchaseDate: '2026-10-02',
            expiryDate: '2026-10-04',
            expirySource: 'user_provided',
            storage: 'room',
            fssaiStatus: 'verified',
            isFlagged: false,
            status: 'closed',
            outcome: 'composted',
            createdAt: '2026-10-02',
            updatedAt: '2026-10-04',
          },
          {
            id: 'seed-imp-3',
            ownerId: 'u1',
            name: 'Dal Makhani Batch',
            category: 'cooked_food',
            dietType: 'veg',
            quantityValue: 4,
            quantityUnit: 'portions',
            purchaseDate: '2026-10-03',
            expiryDate: '2026-10-04',
            expirySource: 'user_provided',
            storage: 'fridge',
            fssaiStatus: 'verified',
            isFlagged: false,
            status: 'closed',
            outcome: 'cooked',
            createdAt: '2026-10-03',
            updatedAt: '2026-10-04',
          },
        ];
      }

      setReport(calculateImpact(items));
    } catch {
      // fallback
    }
  }, []);

  // Compute simulated extra savings
  const simExtraCo2e = Math.round(simulationExtraKg * IMPACT_FACTORS.CO2E_PER_KG * 10) / 10;
  const simExtraRupees = Math.round(simulationExtraKg * IMPACT_FACTORS.RUPEES_PER_KG);
  const simExtraMeals = Math.round(simulationExtraKg / IMPACT_FACTORS.MEAL_KG_BENCHMARK);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Folio Masthead */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Ecological Balance Sheet · Vol. 1</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Community &amp; Household Impact Ledger
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Formula-based, verifiable ecological accounting of food diverted from local landfills into bellies and compost.
          </p>
        </div>
        <Link
          href="/en/home"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)] shrink-0"
        >
          ← Return to Kitchen Ledger
        </Link>
      </div>

      {/* Main Impact Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-2 text-[var(--kc-basil)] flex items-center justify-center">
            <KhabarIcon name="kg-rescued" size={24} />
          </div>
          <span className="text-[11px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
            Food Diverted
          </span>
          <span className="text-3xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
            {report.kgDiverted}
          </span>
          <span className="text-xs font-mono text-[var(--kc-basil)] font-bold">Kilograms</span>
        </div>

        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-2 text-[var(--kc-mango)] flex items-center justify-center">
            <KhabarIcon name="meals-saved" size={24} />
          </div>
          <span className="text-[11px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
            Meals Preserved
          </span>
          <span className="text-3xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
            {report.mealsSaved}
          </span>
          <span className="text-xs font-mono text-[var(--kc-moss)]">0.42 kg / meal</span>
        </div>

        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-2 text-[var(--kc-blueberry)] flex items-center justify-center">
            <KhabarIcon name="co2-avoided" size={24} />
          </div>
          <span className="text-[11px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
            CO₂e Avoided
          </span>
          <span className="text-3xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
            {report.co2eAvoidedKg}
          </span>
          <span className="text-xs font-mono text-[var(--kc-blueberry)] font-bold">kg CO₂e</span>
        </div>

        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-2 text-[var(--kc-basil)] flex items-center justify-center">
            <KhabarIcon name="buy" size={24} />
          </div>
          <span className="text-[11px] font-mono text-[var(--kc-moss)] uppercase tracking-wider block">
            Value Preserved
          </span>
          <span className="text-3xl font-bold font-mono text-[var(--kc-charcoal)] block my-1">
            ₹{report.rupeesSaved}
          </span>
          <span className="text-xs font-mono text-[var(--kc-moss)]">Household Savings</span>
        </div>
      </div>

      {/* Secondary Balance Sheet Table */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 mb-10">
        <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 mb-4 flex items-center justify-between">
          <span>Detailed Ecological Balance Sheet</span>
          <span className="text-xs font-mono text-[var(--kc-basil)] font-bold">
            Diversion Efficiency: {report.diversionRatePercent}%
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--kc-moss)]/40 text-[var(--kc-moss)] uppercase text-[10px]">
                <th className="py-2.5 px-3">Resource Indicator</th>
                <th className="py-2.5 px-3">Calculated Cumulative</th>
                <th className="py-2.5 px-3">Coefficient Basis</th>
                <th className="py-2.5 px-3">Environmental Equivalent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--kc-moss)]/20 text-[var(--kc-charcoal)]">
              <tr>
                <td className="py-3 px-3 font-bold flex items-center gap-2">
                  <KhabarIcon name="water-saved" size={16} className="text-[var(--kc-blueberry)]" />
                  Embedded Water Preserved
                </td>
                <td className="py-3 px-3 font-bold text-[var(--kc-blueberry)]">
                  {report.waterPreservedLitres} Litres
                </td>
                <td className="py-3 px-3 text-stone-500">450 L / kg food</td>
                <td className="py-3 px-3">~{Math.round(report.waterPreservedLitres / 150)} human drinking days</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold flex items-center gap-2">
                  <KhabarIcon name="co2-avoided" size={16} className="text-[var(--kc-basil)]" />
                  Methane / Landfill Prevention
                </td>
                <td className="py-3 px-3 font-bold text-[var(--kc-basil)]">
                  {report.co2eAvoidedKg} kg CO₂e
                </td>
                <td className="py-3 px-3 text-stone-500">2.5 kg CO₂e / kg food</td>
                <td className="py-3 px-3">~{Math.round(report.co2eAvoidedKg * 4.2)} km car driving avoided</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold flex items-center gap-2">
                  <KhabarIcon name="portion" size={16} className="text-[var(--kc-mango)]" />
                  Human Nutrition Protected
                </td>
                <td className="py-3 px-3 font-bold text-[var(--kc-charcoal)]">
                  {report.mealsSaved} Full Meals
                </td>
                <td className="py-3 px-3 text-stone-500">0.42 kg standard meal</td>
                <td className="py-3 px-3">Direct caloric nourishment delivered</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Household Forecast Simulator */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 mb-10">
        <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 mb-4">
          Household Forecast Simulator · What if you divert more?
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span>Additional Monthly Food Rescue:</span>
              <strong className="text-[var(--kc-basil)]">{simulationExtraKg} kg / month</strong>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={simulationExtraKg}
              onChange={(e) => setSimulationExtraKg(parseInt(e.target.value))}
              className="w-full accent-[var(--kc-basil)]"
            />
          </div>

          <div className="flex gap-4 text-center shrink-0">
            <div className="p-3 border border-[var(--kc-moss)] bg-white rounded-sm min-w-[90px]">
              <span className="text-[10px] font-mono text-[var(--kc-moss)] block">+ Meals</span>
              <span className="text-lg font-bold font-mono text-[var(--kc-charcoal)] block">{simExtraMeals}</span>
            </div>
            <div className="p-3 border border-[var(--kc-moss)] bg-white rounded-sm min-w-[90px]">
              <span className="text-[10px] font-mono text-[var(--kc-moss)] block">+ CO₂e Saved</span>
              <span className="text-lg font-bold font-mono text-[var(--kc-blueberry)] block">{simExtraCo2e}kg</span>
            </div>
            <div className="p-3 border border-[var(--kc-moss)] bg-white rounded-sm min-w-[90px]">
              <span className="text-[10px] font-mono text-[var(--kc-moss)] block">+ Rupees</span>
              <span className="text-lg font-bold font-mono text-[var(--kc-basil)] block">₹{simExtraRupees}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Source Citations Footnote (AGENTS.md §3.5 & TRD §3.5) */}
      <div className="p-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] rounded-sm text-[11px] font-mono text-[var(--kc-moss)] space-y-1.5">
        <strong className="text-xs uppercase text-[var(--kc-charcoal)] block mb-1">
          Formula Coefficient Sources &amp; Transparency Footnotes:
        </strong>
        <div>• <strong>CO₂e avoided:</strong> {report.citations.co2eCitation}</div>
        <div>• <strong>Meal weight benchmark:</strong> {report.citations.mealWeightCitation}</div>
        <div>• <strong>Rupee valuation:</strong> {report.citations.rupeeValueCitation}</div>
        <div>• <strong>Water footprint:</strong> {report.citations.waterCitation}</div>
      </div>
    </div>
  );
}
