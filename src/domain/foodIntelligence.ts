import { FoodCategory, StorageLocation, DietType } from './types';
import { estimateExpiryDate } from './shelfLife';
import { findPackagedProduct } from './packagedFoodDatabase';

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
  brand?: string;
  manufacturer?: string;
  packagingType?: string;
  defaultQuantity?: string;
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
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 7,
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
  onion: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 40,
    proteinG: 1.1,
    carbsG: 9.3,
    fatG: 0.1,
    fiberG: 1.7,
    sugarsG: 4.2,
    sodiumMg: 4,
    vitamins: ['Vitamin C', 'Vitamin B6', 'Folate', 'Quercetin'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 30,
    healthAdvisories: [
      {
        condition: 'IBS / FODMAP Sensitivity',
        warning: 'High in fructans (oligosaccharides). May trigger bloating in IBS patients.',
        severity: 'caution',
      },
    ],
  },
  garlic: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 149,
    proteinG: 6.4,
    carbsG: 33.1,
    fatG: 0.5,
    fiberG: 2.1,
    sugarsG: 1.0,
    sodiumMg: 17,
    vitamins: ['Allicin', 'Vitamin C', 'Vitamin B6', 'Manganese'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 60,
    healthAdvisories: [
      {
        condition: 'Blood Thinning Medications',
        warning: 'Contains natural antiplatelet allicin. Consume in dietary moderation before surgeries.',
        severity: 'caution',
      },
    ],
  },
  ginger: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 80,
    proteinG: 1.8,
    carbsG: 17.8,
    fatG: 0.8,
    fiberG: 2.0,
    sugarsG: 1.7,
    sodiumMg: 13,
    vitamins: ['Gingerol', 'Vitamin B6', 'Magnesium', 'Potassium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 21,
    healthAdvisories: [],
  },
  carrot: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 41,
    proteinG: 0.9,
    carbsG: 9.6,
    fatG: 0.2,
    fiberG: 2.8,
    sugarsG: 4.7,
    sodiumMg: 69,
    vitamins: ['Beta-Carotene (Vit A)', 'Vitamin K1', 'Biotin', 'Potassium'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 21,
    healthAdvisories: [],
  },
  cauliflower: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 25,
    proteinG: 1.9,
    carbsG: 5.0,
    fatG: 0.3,
    fiberG: 2.0,
    sugarsG: 1.9,
    sodiumMg: 30,
    vitamins: ['Vitamin C', 'Vitamin K', 'Folate', 'Choline'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 7,
    healthAdvisories: [],
  },
  cabbage: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 25,
    proteinG: 1.3,
    carbsG: 5.8,
    fatG: 0.1,
    fiberG: 2.5,
    sugarsG: 3.2,
    sodiumMg: 18,
    vitamins: ['Vitamin C', 'Vitamin K', 'Sulforaphane', 'Folate'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 14,
    healthAdvisories: [],
  },
  cucumber: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 15,
    proteinG: 0.7,
    carbsG: 3.6,
    fatG: 0.1,
    fiberG: 0.5,
    sugarsG: 1.7,
    sodiumMg: 2,
    vitamins: ['Vitamin K', 'Vitamin C', 'Potassium'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 7,
    healthAdvisories: [],
  },
  capsicum: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 31,
    proteinG: 1.0,
    carbsG: 6.0,
    fatG: 0.3,
    fiberG: 2.1,
    sugarsG: 4.2,
    sodiumMg: 4,
    vitamins: ['Vitamin C (High)', 'Vitamin A', 'Vitamin B6'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 10,
    healthAdvisories: [],
  },
  okra: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 33,
    proteinG: 1.9,
    carbsG: 7.5,
    fatG: 0.2,
    fiberG: 3.2,
    sugarsG: 1.5,
    sodiumMg: 7,
    vitamins: ['Vitamin C', 'Vitamin K', 'Folate', 'Magnesium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 5,
    healthAdvisories: [],
  },
  eggplant: {
    category: 'vegetables',
    dietType: 'vegan',
    caloriesKcal: 25,
    proteinG: 1.0,
    carbsG: 5.9,
    fatG: 0.2,
    fiberG: 3.0,
    sugarsG: 3.5,
    sodiumMg: 2,
    vitamins: ['Nasunin (Anthocyanin)', 'Folate', 'Manganese'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'fridge',
    shelfLifeDays: 6,
    healthAdvisories: [],
  },
  mango: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 60,
    proteinG: 0.8,
    carbsG: 15.0,
    fatG: 0.4,
    fiberG: 1.6,
    sugarsG: 13.7,
    sodiumMg: 1,
    vitamins: ['Vitamin A', 'Vitamin C', 'Folate', 'Beta-Carotene'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'room',
    shelfLifeDays: 5,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'High sugar density. Limit portion size and consume with meals.',
        severity: 'caution',
      },
    ],
  },
  orange: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 47,
    proteinG: 0.9,
    carbsG: 11.8,
    fatG: 0.1,
    fiberG: 2.4,
    sugarsG: 9.4,
    sodiumMg: 0,
    vitamins: ['Vitamin C (High)', 'Hesperidin', 'Thiamine', 'Folate'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 14,
    healthAdvisories: [],
  },
  lemon: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 29,
    proteinG: 1.1,
    carbsG: 9.3,
    fatG: 0.3,
    fiberG: 2.8,
    sugarsG: 2.5,
    sodiumMg: 2,
    vitamins: ['Vitamin C (High)', 'Citric Acid', 'Potassium'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 21,
    healthAdvisories: [],
  },
  papaya: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 43,
    proteinG: 0.5,
    carbsG: 10.8,
    fatG: 0.3,
    fiberG: 1.7,
    sugarsG: 7.8,
    sodiumMg: 8,
    vitamins: ['Papain enzyme', 'Vitamin C', 'Vitamin A', 'Folate'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 6,
    healthAdvisories: [],
  },
  pomegranate: {
    category: 'fruits',
    dietType: 'vegan',
    caloriesKcal: 83,
    proteinG: 1.7,
    carbsG: 18.7,
    fatG: 1.2,
    fiberG: 4.0,
    sugarsG: 13.7,
    sodiumMg: 3,
    vitamins: ['Punicalagins', 'Vitamin C', 'Vitamin K', 'Potassium'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 14,
    healthAdvisories: [],
  },
  atta: {
    category: 'grains_pulses',
    dietType: 'vegan',
    caloriesKcal: 340,
    proteinG: 12.1,
    carbsG: 72.0,
    fatG: 1.7,
    fiberG: 10.7,
    sugarsG: 0.4,
    sodiumMg: 5,
    vitamins: ['B-Complex (Thiamine, Niacin)', 'Iron', 'Zinc', 'Magnesium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 90,
    healthAdvisories: [
      {
        condition: 'Celiac Disease / Gluten Sensitivity',
        warning: 'Contains wheat gluten protein.',
        severity: 'avoid',
      },
    ],
  },
  besan: {
    category: 'grains_pulses',
    dietType: 'vegan',
    caloriesKcal: 387,
    proteinG: 22.4,
    carbsG: 57.8,
    fatG: 6.7,
    fiberG: 10.8,
    sugarsG: 10.0,
    sodiumMg: 64,
    vitamins: ['Folate', 'Iron', 'Magnesium', 'Potassium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 120,
    healthAdvisories: [],
  },
  poha: {
    category: 'grains_pulses',
    dietType: 'vegan',
    caloriesKcal: 346,
    proteinG: 6.6,
    carbsG: 77.3,
    fatG: 1.2,
    fiberG: 2.8,
    sugarsG: 0.2,
    sodiumMg: 6,
    vitamins: ['Iron', 'Carbohydrates', 'Vitamin B'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 90,
    healthAdvisories: [],
  },
  butter: {
    category: 'dairy',
    dietType: 'veg',
    caloriesKcal: 717,
    proteinG: 0.9,
    carbsG: 0.1,
    fatG: 81.1,
    fiberG: 0,
    sugarsG: 0.1,
    sodiumMg: 643,
    vitamins: ['Vitamin A', 'Vitamin E', 'Vitamin D'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'fridge',
    shelfLifeDays: 60,
    healthAdvisories: [
      {
        condition: 'High Cholesterol / Heart Disease',
        warning: 'High in saturated fat. Consume in small portions.',
        severity: 'caution',
      },
    ],
  },
  ghee: {
    category: 'dairy',
    dietType: 'veg',
    caloriesKcal: 897,
    proteinG: 0.3,
    carbsG: 0,
    fatG: 99.5,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 0,
    vitamins: ['Vitamin A', 'Vitamin E', 'Butyric Acid'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'room',
    shelfLifeDays: 180,
    healthAdvisories: [],
  },
  fish: {
    category: 'meat_fish_egg',
    dietType: 'non_veg',
    caloriesKcal: 110,
    proteinG: 19.8,
    carbsG: 0,
    fatG: 2.8,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 65,
    vitamins: ['Omega-3 Fatty Acids', 'Vitamin D', 'Vitamin B12', 'Selenium'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'freezer',
    shelfLifeDays: 3,
    healthAdvisories: [
      {
        condition: 'Histamine Toxicity (Scombroid)',
        warning: 'Must be kept chilled at <= 4°C to prevent rapid bacterial histamine accumulation.',
        severity: 'avoid',
      },
      {
        condition: 'Seafood / Fish Allergy',
        warning: 'High allergen potential in allergic individuals.',
        severity: 'avoid',
      },
    ],
  },
  mutton: {
    category: 'meat_fish_egg',
    dietType: 'non_veg',
    caloriesKcal: 294,
    proteinG: 25.0,
    carbsG: 0,
    fatG: 21.0,
    fiberG: 0,
    sugarsG: 0,
    sodiumMg: 72,
    vitamins: ['Iron (Heme)', 'Zinc', 'Vitamin B12', 'Creatine'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'freezer',
    shelfLifeDays: 3,
    healthAdvisories: [
      {
        condition: 'Gout / Hyperuricemia',
        warning: 'High in purines. Restrict intake if suffering from gout flare-ups.',
        severity: 'avoid',
      },
    ],
  },
  biscuit: {
    category: 'packaged',
    dietType: 'veg',
    caloriesKcal: 450,
    proteinG: 6.5,
    carbsG: 68.0,
    fatG: 18.0,
    fiberG: 2.0,
    sugarsG: 24.0,
    sodiumMg: 350,
    vitamins: ['Fortified B-vitamins'],
    consumptionType: 'eat_directly',
    suggestedStorage: 'room',
    shelfLifeDays: 180,
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'High in refined flour and processed sugar. Limit consumption.',
        severity: 'caution',
      },
    ],
  },
  noodles: {
    category: 'packaged',
    dietType: 'veg',
    caloriesKcal: 420,
    proteinG: 8.5,
    carbsG: 60.0,
    fatG: 16.0,
    fiberG: 3.0,
    sugarsG: 3.0,
    sodiumMg: 820,
    vitamins: ['Iron'],
    consumptionType: 'needs_cooking',
    suggestedStorage: 'room',
    shelfLifeDays: 180,
    healthAdvisories: [
      {
        condition: 'Hypertension (High Blood Pressure)',
        warning: 'Tastemaker seasoning contains very high sodium (>800mg). Use half tastemaker packet.',
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
  const cleanRaw = query.trim().toLowerCase();

  // Regional language & common kitchen alias mapping
  const ALIASES: Record<string, string> = {
    alu: 'potato',
    aloo: 'potato',
    peyaj: 'onion',
    pyaz: 'onion',
    piyaz: 'onion',
    doodh: 'milk',
    dudh: 'milk',
    dahi: 'curd',
    doi: 'curd',
    mach: 'fish',
    maach: 'fish',
    rohu: 'fish',
    rui: 'fish',
    dim: 'egg',
    anda: 'egg',
    ande: 'egg',
    chawal: 'rice',
    bhat: 'rice',
    roti: 'atta',
    gehu: 'atta',
    lebu: 'lemon',
    nimbu: 'lemon',
    morich: 'capsicum',
    mirch: 'capsicum',
    karela: 'bitter_gourd',
    korola: 'bitter_gourd',
    lau: 'lauki',
    lauki: 'gourd',
    begun: 'eggplant',
    baingan: 'eggplant',
    murgi: 'chicken',
    murgh: 'chicken',
    gosht: 'mutton',
    mangsho: 'mutton',
  };

  let clean = cleanRaw;
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    if (clean.includes(alias)) {
      clean = `${clean} ${canonical}`;
      break;
    }
  }

  // 0. Check verified Packaged Products Database (Britannia, Parle, ITC, Cadbury, Nestlé, Haldiram's, Amul, etc.)
  const isStapleWord = Object.keys(ALIASES).includes(cleanRaw) || Object.values(ALIASES).includes(cleanRaw);
  const packagedMatch = !isStapleWord ? findPackagedProduct(cleanRaw, barcode) : null;
  if (packagedMatch) {
    return {
      name: packagedMatch.name,
      category: packagedMatch.category,
      dietType: packagedMatch.dietType,
      caloriesKcal: packagedMatch.caloriesKcal,
      proteinG: packagedMatch.proteinG,
      carbsG: packagedMatch.carbsG,
      fatG: packagedMatch.fatG,
      fiberG: packagedMatch.fiberG,
      sugarsG: packagedMatch.sugarsG,
      sodiumMg: packagedMatch.sodiumMg,
      vitamins: packagedMatch.vitamins,
      consumptionType: packagedMatch.consumptionType,
      healthAdvisories: packagedMatch.healthAdvisories,
      suggestedStorage: packagedMatch.suggestedStorage,
      shelfLifeDays: packagedMatch.shelfLifeDays,
      source: 'culinary_knowledge_base',
      brand: packagedMatch.brand,
      manufacturer: packagedMatch.manufacturer,
      packagingType: packagedMatch.packagingType,
      defaultQuantity: packagedMatch.defaultQuantity,
    };
  }

  // 1. Check local culinary dictionary
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

  // 2. Intelligent Category Heuristics (Ensures cakes, biscuits, snacks, chocolates are NEVER treated as raw vegetables)
  const isCakeOrBakery = clean.includes('cake') || clean.includes('biscuit') || clean.includes('cookie') || clean.includes('croissant') || clean.includes('pastry') || clean.includes('muffin') || clean.includes('rusk') || clean.includes('bread') || clean.includes('bun') || clean.includes('roll');
  const isChocolateOrConfectionery = clean.includes('choco') || clean.includes('chocolate') || clean.includes('candy') || clean.includes('toffee') || clean.includes('fudge') || clean.includes('sweet') || clean.includes('mithai');
  const isSnackOrCrisps = clean.includes('chip') || clean.includes('crisp') || clean.includes('namkeen') || clean.includes('bhujia') || clean.includes('sev') || clean.includes('puff') || clean.includes('kurkure') || clean.includes('snack') || clean.includes('cracker');
  const isNoodlesOrPasta = clean.includes('noodle') || clean.includes('maggi') || clean.includes('pasta') || clean.includes('macaroni') || clean.includes('ramen');
  const isBeverage = clean.includes('juice') || clean.includes('cola') || clean.includes('soda') || clean.includes('drink') || clean.includes('tea') || clean.includes('coffee') || clean.includes('sharbat');
  const isFruit = clean.includes('mango') || clean.includes('berry') || clean.includes('orange') || clean.includes('guava') || clean.includes('papaya') || clean.includes('apple') || clean.includes('banana');
  const isDairy = clean.includes('butter') || clean.includes('cheese') || clean.includes('ghee') || clean.includes('yogurt') || clean.includes('curd') || clean.includes('milk') || clean.includes('paneer') || clean.includes('dahi');
  const isMeat = clean.includes('fish') || clean.includes('mutton') || clean.includes('prawn') || clean.includes('meat') || clean.includes('chicken') || clean.includes('egg');

  if (isCakeOrBakery) {
    const advisories = generateHealthAdvisoriesFromNutrients({ category: 'bread_bakery', carbsG: 64, sugarsG: 28 });
    return {
      name: query.trim(),
      category: 'bread_bakery',
      dietType: 'veg',
      caloriesKcal: 420,
      proteinG: 6.0,
      carbsG: 64.0,
      fatG: 16.0,
      fiberG: 1.8,
      sugarsG: 28.0,
      sodiumMg: 220,
      vitamins: ['Wheat Gluten', 'B-Vitamins'],
      consumptionType: 'eat_directly',
      healthAdvisories: advisories,
      suggestedStorage: 'room',
      shelfLifeDays: 90,
      source: 'culinary_knowledge_base',
      packagingType: 'Packaged Bakery Product',
      defaultQuantity: '1 pack',
    };
  }

  if (isChocolateOrConfectionery) {
    const advisories = generateHealthAdvisoriesFromNutrients({ category: 'packaged', carbsG: 60, sugarsG: 50 });
    return {
      name: query.trim(),
      category: 'packaged',
      dietType: 'veg',
      caloriesKcal: 520,
      proteinG: 6.5,
      carbsG: 60.0,
      fatG: 29.0,
      fiberG: 2.2,
      sugarsG: 52.0,
      sodiumMg: 120,
      vitamins: ['Cocoa', 'Milk Solids'],
      consumptionType: 'eat_directly',
      healthAdvisories: advisories,
      suggestedStorage: 'room',
      shelfLifeDays: 270,
      source: 'culinary_knowledge_base',
      packagingType: 'Confectionery Pack',
      defaultQuantity: '1 unit',
    };
  }

  if (isSnackOrCrisps) {
    const advisories = generateHealthAdvisoriesFromNutrients({ category: 'packaged', sodiumMg: 750, fatG: 34 });
    return {
      name: query.trim(),
      category: 'packaged',
      dietType: 'veg',
      caloriesKcal: 545,
      proteinG: 6.8,
      carbsG: 53.0,
      fatG: 34.0,
      fiberG: 3.5,
      sugarsG: 3.0,
      sodiumMg: 750,
      vitamins: ['Indian Spices'],
      consumptionType: 'eat_directly',
      healthAdvisories: advisories,
      suggestedStorage: 'room',
      shelfLifeDays: 120,
      source: 'culinary_knowledge_base',
      packagingType: 'Sealed Snack Pouch',
      defaultQuantity: '1 pouch',
    };
  }

  if (isNoodlesOrPasta) {
    const advisories = generateHealthAdvisoriesFromNutrients({ category: 'packaged', sodiumMg: 1000, carbsG: 64 });
    return {
      name: query.trim(),
      category: 'packaged',
      dietType: 'veg',
      caloriesKcal: 440,
      proteinG: 9.0,
      carbsG: 64.0,
      fatG: 16.5,
      fiberG: 3.5,
      sugarsG: 3.0,
      sodiumMg: 1000,
      vitamins: ['Fortified Iron'],
      consumptionType: 'needs_cooking',
      healthAdvisories: advisories,
      suggestedStorage: 'room',
      shelfLifeDays: 270,
      source: 'culinary_knowledge_base',
      packagingType: 'Packaged Instant Noodles',
      defaultQuantity: '1 pack',
    };
  }

  if (isBeverage) {
    return {
      name: query.trim(),
      category: 'beverages',
      dietType: 'vegan',
      caloriesKcal: 48,
      proteinG: 0.1,
      carbsG: 12.0,
      fatG: 0.0,
      fiberG: 0.2,
      sugarsG: 11.5,
      sodiumMg: 15,
      vitamins: ['Vitamin C'],
      consumptionType: 'eat_directly',
      healthAdvisories: generateHealthAdvisoriesFromNutrients({ category: 'beverages', sugarsG: 11.5 }),
      suggestedStorage: 'room',
      shelfLifeDays: 180,
      source: 'culinary_knowledge_base',
      packagingType: 'Bottled/Canned Beverage',
      defaultQuantity: '1 bottle',
    };
  }

  // 3. Fallback for produce / cooking staples
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
