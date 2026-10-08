import { FoodCategory, StorageLocation, DietType } from './types';
import { estimateExpiryDate } from './shelfLife';

export interface FoodHealthAdvisory {
  condition: string;
  warning: string;
  severity: 'caution' | 'avoid';
}

export interface FoodDetails {
  name: string;
  category: FoodCategory;
  dietType: DietType;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarsG: number;
  sodiumMg: number;
  vitamins: string[];
  consumptionType: 'eat_directly' | 'needs_cooking';
  healthAdvisories: FoodHealthAdvisory[];
  suggestedStorage: StorageLocation;
  shelfLifeDays: number;
  source: 'open_food_facts' | 'culinary_knowledge_base';
}

// Built-in offline culinary intelligence dictionary (ICMR-NIN & Indian Kitchen Reference)
const CULINARY_KNOWLEDGE_BASE: Record<string, Partial<FoodDetails>> = {
  apple: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 52,
    proteinG: 0.3,
    carbsG: 14,
    fatG: 0.2,
    fiberG: 2.4,
    sugarsG: 10.4,
    sodiumMg: 1,
    vitamins: ['Vitamin C', 'Vitamin K', 'Potassium'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 14,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'Contains natural fructose. Consume whole with peel for fiber; avoid juicing.',
        severity: 'caution',
      },
    ],
  },
  banana: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 89,
    proteinG: 1.1,
    carbsG: 23,
    fatG: 0.3,
    fiberG: 2.6,
    sugarsG: 12,
    sodiumMg: 1,
    vitamins: ['Vitamin B6', 'Vitamin C', 'Potassium', 'Magnesium'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'room',
    shelfLifeDays: 5,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'High glycemic index when fully ripe. Moderation recommended for diabetic individuals.',
        severity: 'caution',
      },
      {
        condition: 'Chronic Kidney Disease (CKD)',
        warning: 'Very high potassium content (358mg/100g). Limit intake if restricting potassium.',
        severity: 'caution',
      },
    ],
  },
  milk: {
    category: 'dairy',
    dietType: 'veg',
    caloriesKcal: 62,
    proteinG: 3.2,
    carbsG: 4.8,
    fatG: 3.5,
    fiberG: 0,
    sugarsG: 4.8,
    sodiumMg: 44,
    vitamins: ['Calcium', 'Vitamin D', 'Vitamin B12', 'Riboflavin'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 3,
    healthAdvisories: [
      {
        condition: 'Lactose Intolerance',
        warning: 'Contains dairy lactose sugar. May cause bloating or cramping in lactose-sensitive individuals.',
        severity: 'avoid',
      },
      {
        condition: 'High Cholesterol',
        warning: 'Full-cream milk contains saturated fats. Opt for double-toned or skimmed milk.',
        severity: 'caution',
      },
    ],
  },
  curd: {
    category: 'dairy',
    dietType: 'veg',
    caloriesKcal: 98,
    proteinG: 3.5,
    carbsG: 3.4,
    fatG: 4.3,
    fiberG: 0,
    sugarsG: 3.4,
    sodiumMg: 36,
    vitamins: ['Probiotics', 'Calcium', 'Vitamin B12'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 5,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'Probiotic plain curd has low glycemic load; highly beneficial for gut health.',
        severity: 'caution',
      },
    ],
  },
  paneer: {
    category: 'dairy',
    dietType: 'veg',
    caloriesKcal: 265,
    proteinG: 18.3,
    carbsG: 1.2,
    fatG: 20.8,
    fiberG: 0,
    sugarsG: 1.2,
    sodiumMg: 18,
    vitamins: ['Calcium', 'Phosphorus', 'Vitamin A'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 4,
    healthAdvisories: [
      {
        condition: 'Cardiovascular & High Cholesterol',
        warning: 'High in saturated milk fat. Those with heart conditions should limit portion sizes.',
        severity: 'caution',
      },
    ],
  },
  spinach: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 23,
    proteinG: 2.9,
    carbsG: 3.6,
    fatG: 0.4,
    fiberG: 2.2,
    sugarsG: 0.4,
    sodiumMg: 79,
    vitamins: ['Vitamin K', 'Vitamin A', 'Vitamin C', 'Folate', 'Iron'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 5,
    healthAdvisories: [
      {
        condition: 'Calcium Oxalate Kidney Stones',
        warning: 'High in oxalates. Individuals prone to kidney stones should blanch or boil to reduce oxalate levels.',
        severity: 'caution',
      },
      {
        condition: 'Blood Thinners (Warfarin)',
        warning: 'High Vitamin K content promotes blood clotting; keep dietary intake consistent.',
        severity: 'caution',
      },
    ],
  },
  tomato: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 18,
    proteinG: 0.9,
    carbsG: 3.9,
    fatG: 0.2,
    fiberG: 1.2,
    sugarsG: 2.6,
    sodiumMg: 5,
    vitamins: ['Lycopene', 'Vitamin C', 'Potassium', 'Folate'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'room',
    shelfLifeDays: 6,
    healthAdvisories: [
      {
        condition: 'Acid Reflux / GERD',
        warning: 'High acidity (citric & malic acid) can exacerbate heartburn and gastric ulcer irritation.',
        severity: 'caution',
      },
    ],
  },
  potato: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 77,
    proteinG: 2.0,
    carbsG: 17.5,
    fatG: 0.1,
    fiberG: 2.1,
    sugarsG: 0.8,
    sodiumMg: 6,
    vitamins: ['Vitamin C', 'Vitamin B6', 'Potassium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 21,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'High glycemic index starch. Causes rapid blood glucose spike. Pair with protein & green fiber.',
        severity: 'caution',
      },
    ],
  },
  egg: {
    category: 'meat_fish_egg',
    dietType: 'egg',
    caloriesKcal: 143,
    proteinG: 12.6,
    carbsG: 0.7,
    fatG: 9.5,
    fiberG: 0,
    sugarsG: 0.4,
    sodiumMg: 142,
    vitamins: ['Vitamin B12', 'Choline', 'Vitamin D', 'Riboflavin'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 21,
    healthAdvisories: [
      {
        condition: 'Egg Allergy',
        warning: 'Common allergen. Strictly avoid for people diagnosed with albumin/egg protein allergies.',
        severity: 'avoid',
      },
      {
        condition: 'Hyperlipidemia (High Cholesterol)',
        warning: 'Egg yolk contains approximately 186mg cholesterol. Limit whole eggs or use whites only.',
        severity: 'caution',
      },
    ],
  },
  chicken: {
    category: 'meat_fish_egg',
    dietType: 'non_veg',
    caloriesKcal: 239,
    proteinG: 27.3,
    carbsG: 0,
    fatG: 13.6,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 82,
    vitamins: ['Niacin (B3)', 'Vitamin B6', 'Phosphorus', 'Selenium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 2,
    healthAdvisories: [
      {
        condition: 'Salmonella & Microbial Safety',
        warning: 'Must be cooked to an internal temperature of at least 74°C (165°F). Never consume raw.',
        severity: 'avoid',
      },
      {
        condition: 'Gout / High Uric Acid',
        warning: 'Moderate purine content. Excess consumption may elevate uric acid crystal formation.',
        severity: 'caution',
      },
    ],
  },
  rice: {
    category: 'grains_pulses',
    dietType: 'vegan',
    caloriesKcal: 130,
    proteinG: 2.7,
    carbsG: 28.2,
    fatG: 0.3,
    fiberG: 0.4,
    sugarsG: 0.1,
    sodiumMg: 1,
    vitamins: ['Thiamine (B1)', 'Iron', 'Niacin'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 180,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'Polished white rice has a high glycemic index (GI ~73). Suggest brown rice, quinoa, or millets.',
        severity: 'caution',
      },
    ],
  },
  dal: {
    category: 'grains_pulses',
    dietType: 'vegan',
    caloriesKcal: 116,
    proteinG: 9.0,
    carbsG: 20.1,
    fatG: 0.4,
    fiberG: 7.9,
    sugarsG: 1.8,
    sodiumMg: 2,
    vitamins: ['Folate', 'Iron', 'Potassium', 'Zinc'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 120,
    healthAdvisories: [
      {
        condition: 'Gout / Hyperuricemia',
        warning: 'Contains plant purines. High intake may trigger flare-ups in susceptible individuals.',
        severity: 'caution',
      },
    ],
  },
  bread: {
    category: 'bread_bakery',
    dietType: 'veg',
    caloriesKcal: 265,
    proteinG: 9.0,
    carbsG: 49.0,
    fatG: 3.2,
    fiberG: 2.7,
    sugarsG: 5.0,
    sodiumMg: 490,
    vitamins: ['Folic Acid', 'Iron', 'Thiamine'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'room',
    shelfLifeDays: 4,
    healthAdvisories: [
      {
        condition: 'Celiac Disease / Gluten Sensitivity',
        warning: 'Contains wheat gluten. Strictly avoid if you have celiac disease or gluten allergy.',
        severity: 'avoid',
      },
      {
        condition: 'Hypertension (High Blood Pressure)',
        warning: 'Commercial white bread contains high sodium (approx 490mg/100g). Monitor total daily sodium.',
        severity: 'caution',
      },
    ],
  },
  oats: {
    category: 'grains_pulses',
    dietType: 'vegan',
    caloriesKcal: 389,
    proteinG: 16.9,
    carbsG: 66.3,
    fatG: 6.9,
    fiberG: 10.6,
    sugarsG: 1.0,
    sodiumMg: 2,
    vitamins: ['Beta-glucan', 'Manganese', 'Phosphorus', 'B-vitamins'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 180,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'High in soluble beta-glucan fiber; stabilizes post-prandial blood sugar and cholesterol.',
        severity: 'caution',
      },
    ],
  },
};

/**
 * Derives health advisories programmatically from nutritional metrics
 */
export function generateHealthAdvisoriesFromNutrients(params: {
  sugarsG?: number;
  carbsG?: number;
  sodiumMg?: number;
  fatG?: number;
  category?: FoodCategory;
  ingredientsText?: string;
}): FoodHealthAdvisory[] {
  const advisories: FoodHealthAdvisory[] = [];

  // Sugar / Diabetes warning
  if ((params.sugarsG !== undefined && params.sugarsG > 12) || (params.carbsG !== undefined && params.carbsG > 50)) {
    advisories.push({
      condition: 'Type 2 Diabetes / Prediabetes',
      warning: `Elevated carbohydrates (${params.carbsG || 'high'}g) or sugars (${params.sugarsG || 'high'}g). May cause rapid blood sugar elevation. Consume with protein or fiber.`,
      severity: 'caution',
    });
  }

  // Sodium / Hypertension warning
  if (params.sodiumMg !== undefined && params.sodiumMg > 400) {
    advisories.push({
      condition: 'Hypertension (High Blood Pressure)',
      warning: `High sodium content (${params.sodiumMg}mg/100g). Exceeds low-sodium thresholds; consume in moderation to protect cardiovascular health.`,
      severity: 'caution',
    });
  }

  // Saturated Fat / Cardiovascular
  if (params.fatG !== undefined && params.fatG > 15) {
    advisories.push({
      condition: 'Cardiovascular / High Cholesterol',
      warning: `High fat density (${params.fatG}g/100g). Individuals monitoring LDL cholesterol should control portion sizes.`,
      severity: 'caution',
    });
  }

  // Dairy / Lactose
  if (params.category === 'dairy' || params.ingredientsText?.toLowerCase().includes('milk')) {
    advisories.push({
      condition: 'Lactose Intolerance',
      warning: 'Contains dairy milk solids. Individuals with lactase deficiency should avoid or take lactase enzyme.',
      severity: 'avoid',
    });
  }

  // Gluten / Celiac
  if (params.category === 'bread_bakery' || params.ingredientsText?.toLowerCase().includes('wheat')) {
    advisories.push({
      condition: 'Celiac Disease / Gluten Sensitivity',
      warning: 'Contains wheat gluten protein. Not suitable for individuals with celiac sprue or wheat allergy.',
      severity: 'avoid',
    });
  }

  return advisories;
}

/**
 * Look up comprehensive food intelligence by keyword or barcode
 */
export async function queryFoodIntelligence(
  query: string,
  barcode?: string
): Promise<FoodDetails> {
  const clean = query.trim().toLowerCase();

  // 1. Check local culinary dictionary first
  for (const [key, base] of Object.entries(CULINARY_KNOWLEDGE_BASE)) {
    if (clean.includes(key)) {
      const cat = base.category || 'vegetables';
      const stor = base.suggestedStorage || 'fridge';
      const { rule } = estimateExpiryDate(cat, stor);

      return {
        name: query.trim(),
        category: cat,
        dietType: base.dietType || 'veg',
        caloriesKcal: base.caloriesKcal || 100,
        proteinG: base.proteinG || 2,
        carbsG: base.carbsG || 15,
        fatG: base.fatG || 1,
        fiberG: base.fiberG || 2,
        sugarsG: base.sugarsG || 2,
        sodiumMg: base.sodiumMg || 10,
        vitamins: base.vitamins || ['Vitamin C', 'Potassium'],
        consumptionType: base.consumptionType || 'eat_directly',
        healthAdvisories: base.healthAdvisories || [],
        suggestedStorage: stor,
        shelfLifeDays: Math.round(rule.defaultShelfHours / 24) || 7,
        source: 'culinary_knowledge_base',
      };
    }
  }

  // 2. Fallback heuristic for any user entered food
  const isFruit = clean.includes('mango') || clean.includes('berry') || clean.includes('orange') || clean.includes('guava') || clean.includes('papaya');
  const isDairy = clean.includes('butter') || clean.includes('cheese') || clean.includes('ghee') || clean.includes('yogurt') || clean.includes('lassi');
  const isMeat = clean.includes('fish') || clean.includes('mutton') || clean.includes('prawn') || clean.includes('meat');

  const cat: FoodCategory = isFruit ? 'fruits' : isDairy ? 'dairy' : isMeat ? 'meat_fish_egg' : 'vegetables';
  const stor: StorageLocation = isFruit ? 'room' : 'fridge';
  const { rule } = estimateExpiryDate(cat, stor);
  const isDirect = isFruit || isDairy;

  const estimatedCalories = isMeat ? 220 : isDairy ? 180 : isFruit ? 65 : 45;
  const estimatedCarbs = isFruit ? 15 : isDairy ? 4 : 8;
  const estimatedSugars = isFruit ? 12 : 2;

  const advisories = generateHealthAdvisoriesFromNutrients({
    category: cat,
    carbsG: estimatedCarbs,
    sugarsG: estimatedSugars,
  });

  return {
    name: query.trim(),
    category: cat,
    dietType: isMeat ? 'non_veg' : 'veg',
    caloriesKcal: estimatedCalories,
    proteinG: isMeat ? 22 : isDairy ? 8 : 2,
    carbsG: estimatedCarbs,
    fatG: isMeat ? 12 : isDairy ? 10 : 0.5,
    fiberG: isFruit ? 2.5 : 2,
    sugarsG: estimatedSugars,
    sodiumMg: 15,
    vitamins: isFruit ? ['Vitamin C', 'Vitamin A'] : ['B-Complex', 'Minerals'],
    consumptionType: isDirect ? 'eat_directly' : 'needs_cooking',
    healthAdvisories: advisories,
    suggestedStorage: stor,
    shelfLifeDays: Math.round(rule.defaultShelfHours / 24) || 5,
    source: 'culinary_knowledge_base',
  };
}
