export interface ImpactLedgerItem {
  quantityValue: number;
  quantityUnit: string;
  outcome?: 'consumed' | 'cooked' | 'composted' | 'recycled' | 'discarded' | string;
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
  // Source: UNEP Food Waste Index Report 2024 & IPCC emission factor for organic landfill diversion (2.5 kg CO2e per kg food avoided)
  // Reference: https://www.unep.org/resources/publication/food-waste-index-report-2024
  CO2E_PER_KG: 2.5,
  // Source: Standard household adult meal portion equivalent benchmark (0.42 kg per meal)
  // Reference: https://www.unep.org/resources/publication/food-waste-index-report-2024
  MEAL_KG_BENCHMARK: 0.42,
  // Source: Ministry of Statistics & Programme Implementation (MoSPI) Consumer Food Price Index basket average (₹80 per kg)
  // Reference: https://www.mospi.gov.in/
  RUPEES_PER_KG: 80.0,
  // Source: FAO & Water Footprint Network baseline for mixed agricultural food basket (450 Litres embedded water per kg)
  // Reference: https://www.fao.org/land-water/
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
      item.outcome === 'composted' ||
      item.outcome === 'recycled';

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
        'UNEP Food Waste Index Report 2024 & IPCC baseline (2.5 kg CO2e / kg food) https://www.unep.org/resources/publication/food-waste-index-report-2024',
      mealWeightCitation:
        'UNEP Food Waste Index standard domestic portion benchmark (1 meal = 0.42 kg edible food) https://www.unep.org/resources/publication/food-waste-index-report-2024',
      rupeeValueCitation:
        'MoSPI Consumer Food Price Index domestic expenditure baseline (₹80 / kg average basket) https://www.mospi.gov.in/',
      waterCitation:
        'FAO & Water Footprint Network mixed agricultural baseline (450 L / kg) https://www.fao.org/land-water/',
    },
  };
}
