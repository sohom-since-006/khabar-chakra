export interface ImpactLedgerItem {
  quantityValue: number;
  quantityUnit: string;
  outcome?: string; // 'consumed' | 'cooked' | 'shared' | 'donated' | 'composted' | 'discarded'
}

export interface ImpactReport {
  totalItemsRecorded: number;
  divertedItemsCount: number;
  kgDiverted: number;
  mealsSaved: number;
  co2eAvoidedKg: number;
  rupeesSaved: number;
  waterPreservedLitres: number;
  diversionRatePercent: number;
  citations: {
    co2eCitation: string;
    mealWeightCitation: string;
    rupeeValueCitation: string;
    waterCitation: string;
  };
}

export const IMPACT_FACTORS = {
  // TODO(source): UNEP Food Waste Index Report & IPCC emission factor for organic landfill diversion (2.5 kg CO2e per kg food avoided)
  CO2E_PER_KG: 2.5,
  // TODO(source): Standard humanitarian meal equivalent benchmark (1 adult meal = 0.42 kg)
  MEAL_KG_BENCHMARK: 0.42,
  // TODO(source): Placeholder Indian retail grocery food expenditure baseline (average ₹80 per kg food value preserved)
  RUPEES_PER_KG: 80.0,
  // TODO(source): FAO Water Footprint Network baseline for mixed agricultural food basket (450 Litres embedded water per kg)
  WATER_LITRES_PER_KG: 450.0,
};

export function calculateImpact(items: ImpactLedgerItem[]): ImpactReport {
  let divertedKg = 0;
  let discardedKg = 0;
  let divertedCount = 0;

  for (const item of items) {
    // Normalise quantity to kilograms
    let weightKg = item.quantityValue || 0;
    const unit = (item.quantityUnit || '').toLowerCase();

    if (unit === 'g' || unit === 'grams' || unit === 'gram') {
      weightKg = weightKg / 1000;
    } else if (unit === 'portions' || unit === 'portion' || unit === 'servings') {
      weightKg = weightKg * IMPACT_FACTORS.MEAL_KG_BENCHMARK;
    } else if (unit === 'litre' || unit === 'litres' || unit === 'l') {
      weightKg = weightKg * 1.0; // approx density 1 kg/L for liquid dairy/beverages
    }

    const isDiverted =
      item.outcome === 'consumed' ||
      item.outcome === 'cooked' ||
      item.outcome === 'shared' ||
      item.outcome === 'donated' ||
      item.outcome === 'composted';

    if (isDiverted) {
      divertedKg += weightKg;
      divertedCount += 1;
    } else if (item.outcome === 'discarded') {
      discardedKg += weightKg;
    }
  }

  const roundedKgDiverted = Math.round(divertedKg * 10) / 10;
  const totalWeight = divertedKg + discardedKg;
  const diversionRate =
    totalWeight > 0 ? Math.round((divertedKg / totalWeight) * 100) : 100;

  return {
    totalItemsRecorded: items.length,
    divertedItemsCount: divertedCount,
    kgDiverted: roundedKgDiverted,
    mealsSaved: Math.round(roundedKgDiverted / IMPACT_FACTORS.MEAL_KG_BENCHMARK),
    co2eAvoidedKg: Math.round(roundedKgDiverted * IMPACT_FACTORS.CO2E_PER_KG * 10) / 10,
    rupeesSaved: Math.round(roundedKgDiverted * IMPACT_FACTORS.RUPEES_PER_KG),
    waterPreservedLitres: Math.round(roundedKgDiverted * IMPACT_FACTORS.WATER_LITRES_PER_KG),
    diversionRatePercent: diversionRate,
    citations: {
      co2eCitation:
        'TODO(source): UNEP Food Waste Index Report & IPCC baseline (2.5 kg CO2e / kg food)',
      mealWeightCitation:
        'TODO(source): Standard food relief benchmark (1 meal = 0.42 kg edible food)',
      rupeeValueCitation:
        'TODO(source): Placeholder Indian retail grocery food expenditure baseline (₹80 / kg)',
      waterCitation:
        'TODO(source): FAO Water Footprint Network mixed agricultural baseline (450 L / kg)',
    },
  };
}
