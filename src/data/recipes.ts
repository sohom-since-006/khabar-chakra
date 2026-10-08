import { DietType } from '@/domain/types';

export interface RecipeIngredient {
  name: string;
  amount: string;
  aliasKeywords: string[]; // for matching against pantry items
  isOptional?: boolean;
}

export interface DiseaseAdvisory {
  condition: string;
  warning: string;
  severity: 'caution' | 'avoid';
}

export interface Recipe {
  slug: string;
  title: string;
  bengaliTitle?: string;
  summary: string;
  dietType: DietType;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  caloriesPerServing: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  fiberG: number;
  vitamins: string[];
  healthAdvisories: DiseaseAdvisory[];
  allergens: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  shelfRescuePriority: 'high' | 'medium';
}

export const RECIPES_CATALOG: Recipe[] = [
  {
    slug: 'bengali-khichuri',
    title: 'Comfort Khichuri with Roasted Moong Dal',
    bengaliTitle: 'ভাজা মুগের ডালের খিচুড়ি',
    summary: 'A nourishing one-pot rice and lentil porridge ideal for using up leftover vegetables and open rice packets.',
    dietType: 'veg',
    prepMinutes: 15,
    cookMinutes: 30,
    servings: 4,
    caloriesPerServing: 320,
    macros: { proteinG: 12, carbsG: 54, fatG: 6 },
    fiberG: 5.5,
    vitamins: ['Vitamin A', 'Vitamin C', 'Folate', 'Iron'],
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'High glycemic carbohydrates from white rice. Those with diabetes should control portion size or increase lentil-to-rice ratio.',
        severity: 'caution',
      },
      {
        condition: 'Digestive Recovery / Convalescence',
        warning: 'Roasted moong dal is gentle and easily digestible; excellent for recovery from digestive distress.',
        severity: 'caution',
      },
    ],
    allergens: [],
    shelfRescuePriority: 'high',
    ingredients: [
      { name: 'Rice (Gobindobhog or Basmati)', amount: '1 cup', aliasKeywords: ['rice', 'gobindobhog', 'chawal'] },
      { name: 'Moong Dal (Yellow Lentils)', amount: '1 cup', aliasKeywords: ['dal', 'moong', 'lentil', 'pulses'] },
      { name: 'Vegetables (Potato, Cauliflower, Green Peas)', amount: '2 cups chopped', aliasKeywords: ['vegetables', 'potato', 'cauliflower', 'peas', 'spinach', 'palak'] },
      { name: 'Ginger Paste', amount: '1 tbsp', aliasKeywords: ['ginger', 'adrak'] },
      { name: 'Turmeric & Cumin Powder', amount: '1 tsp each', aliasKeywords: ['turmeric', 'spice', 'haldi', 'jeera'] },
      { name: 'Mustard Oil or Ghee', amount: '2 tbsp', aliasKeywords: ['oil', 'ghee'] },
    ],
    instructions: [
      'Dry-roast the moong dal until fragrant and light golden, then rinse alongside the rice.',
      'Heat oil in a heavy pot, temper with cumin seeds and bay leaves, then saute mixed vegetables.',
      'Add ginger paste, turmeric, and cumin powder, stirring until aromatic.',
      'Add the rice, dal, and 4 cups of boiling water. Simmer on low heat until creamy and tender.',
      'Finish with a teaspoon of ghee and serve hot.',
    ],
  },
  {
    slug: 'paneer-butter-masala',
    title: 'Home-style Paneer Butter Masala',
    bengaliTitle: 'পনির বাটার মসলা',
    summary: 'Creamy spiced tomato-curd gravy that rescues near-expiry milk, paneer, and fresh tomatoes.',
    dietType: 'veg',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 3,
    caloriesPerServing: 380,
    macros: { proteinG: 16, carbsG: 18, fatG: 28 },
    fiberG: 2.8,
    vitamins: ['Calcium', 'Vitamin A', 'Phosphorus', 'Lycopene'],
    healthAdvisories: [
      {
        condition: 'Lactose Intolerance',
        warning: 'Contains whole milk dairy and fresh paneer. Individuals with lactose intolerance should avoid or substitute with firm tofu.',
        severity: 'avoid',
      },
      {
        condition: 'High Cholesterol & Heart Disease',
        warning: 'Rich in saturated milk fats (28g total fat). Individuals monitoring LDL cholesterol should substitute cream with toned curd.',
        severity: 'caution',
      },
    ],
    allergens: ['dairy'],
    shelfRescuePriority: 'high',
    ingredients: [
      { name: 'Paneer (Cottage Cheese)', amount: '250 g cubed', aliasKeywords: ['paneer', 'cottage cheese', 'dairy'] },
      { name: 'Fresh Milk or Cream', amount: '100 ml', aliasKeywords: ['milk', 'dairy', 'cream'] },
      { name: 'Tomatoes', amount: '3 medium pureed', aliasKeywords: ['tomato', 'tomatoes', 'vegetables'] },
      { name: 'Onion & Ginger Paste', amount: '2 tbsp', aliasKeywords: ['onion', 'ginger'] },
      { name: 'Garam Masala & Kasuri Methi', amount: '1 tsp', aliasKeywords: ['spice', 'garam masala'] },
    ],
    instructions: [
      'Lightly pan-fry paneer cubes for 2 minutes and soak in warm salted water to maintain softness.',
      'Saute onion and ginger paste until oil begins to separate, then pour in the fresh tomato puree.',
      'Simmer on medium flame with turmeric, chilli powder, and garam masala.',
      'Whisk in milk or fresh cream to build the rich velvety gravy.',
      'Fold in paneer cubes, crush dried fenugreek leaves over top, and simmer for 3 minutes.',
    ],
  },
  {
    slug: 'begun-bhaja',
    title: 'Crispy Spiced Eggplant (Begun Bhaja)',
    bengaliTitle: 'বেগুন ভাজা',
    summary: 'Classic Bengali pan-fried eggplant rounds, ideal for using up soft or maturing brinjals quickly.',
    dietType: 'vegan',
    prepMinutes: 5,
    cookMinutes: 10,
    servings: 2,
    caloriesPerServing: 140,
    macros: { proteinG: 3, carbsG: 12, fatG: 9 },
    fiberG: 4.2,
    vitamins: ['Nasunin (Antioxidant)', 'Manganese', 'Potassium'],
    healthAdvisories: [
      {
        condition: 'Acid Reflux / GERD',
        warning: 'Nightshade vegetable shallow-fried in mustard oil may trigger acid reflux or heartburn in sensitive stomachs.',
        severity: 'caution',
      },
      {
        condition: 'Type 2 Diabetes',
        warning: 'Eggplant has a very low glycemic index with high fiber; safe and supportive for blood glucose control.',
        severity: 'caution',
      },
    ],
    allergens: [],
    shelfRescuePriority: 'high',
    ingredients: [
      { name: 'Eggplant / Brinjal', amount: '1 large sliced into thick discs', aliasKeywords: ['eggplant', 'brinjal', 'begun', 'vegetables'] },
      { name: 'Turmeric Powder', amount: '1/2 tsp', aliasKeywords: ['turmeric', 'haldi', 'spice'] },
      { name: 'Rice Flour or Besan', amount: '1 tbsp', aliasKeywords: ['rice flour', 'besan', 'flour'] },
      { name: 'Mustard Oil', amount: '2 tbsp', aliasKeywords: ['oil', 'mustard oil'] },
    ],
    instructions: [
      'Coat eggplant slices generously with turmeric, salt, and a pinch of rice flour for crispiness.',
      'Heat mustard oil in an iron skillet until faintly smoking.',
      'Place rounds gently into the pan and fry on medium-low heat until charred golden and tender inside.',
      'Flip once and cook the other side. Drain briefly and serve alongside dal or khichuri.',
    ],
  },
  {
    slug: 'palak-paneer-bhurji',
    title: 'Spinach & Crumbled Paneer Bhurji',
    bengaliTitle: 'পালং পনির ভুরজি',
    summary: 'A fast 15-minute skillet scramble that rescues wilting spinach leaves and expiring dairy paneer.',
    dietType: 'veg',
    prepMinutes: 5,
    cookMinutes: 10,
    servings: 2,
    caloriesPerServing: 260,
    macros: { proteinG: 18, carbsG: 8, fatG: 17 },
    fiberG: 3.5,
    vitamins: ['Vitamin K', 'Iron', 'Vitamin A', 'Calcium', 'Folate'],
    healthAdvisories: [
      {
        condition: 'Calcium Oxalate Kidney Stones',
        warning: 'Spinach is high in dietary oxalates. Those with a history of oxalate kidney stones should moderate intake.',
        severity: 'caution',
      },
      {
        condition: 'Type 2 Diabetes',
        warning: 'Exceptionally low carbohydrate (8g) with 18g protein; outstanding meal choice for glycemic management.',
        severity: 'caution',
      },
    ],
    allergens: ['dairy'],
    shelfRescuePriority: 'high',
    ingredients: [
      { name: 'Fresh Spinach', amount: '250 g finely chopped', aliasKeywords: ['spinach', 'palak', 'saag', 'vegetables'] },
      { name: 'Crumbled Paneer', amount: '150 g', aliasKeywords: ['paneer', 'dairy', 'milk'] },
      { name: 'Green Chillies & Garlic', amount: '1 tbsp chopped', aliasKeywords: ['chilli', 'garlic'] },
      { name: 'Cumin seeds', amount: '1/2 tsp', aliasKeywords: ['cumin', 'jeera', 'spice'] },
    ],
    instructions: [
      'Temper hot oil with cumin seeds, chopped garlic, and green chillies.',
      'Toss in shredded spinach and cook until wilted and excess moisture evaporates (approx 4 minutes).',
      'Add crumbled paneer, salt, and a pinch of turmeric.',
      'Toss vigorously on high heat for 2 minutes to blend flavours without drying out the paneer.',
    ],
  },
  {
    slug: 'masala-egg-curry',
    title: 'Dhaba-style Bengali Dim Kosha (Egg Curry)',
    bengaliTitle: 'ডিম কষা',
    summary: 'Rich spiced egg and potato curry for using up boiled eggs and pantry root vegetables.',
    dietType: 'egg',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 2,
    caloriesPerServing: 290,
    macros: { proteinG: 15, carbsG: 22, fatG: 16 },
    fiberG: 2.1,
    vitamins: ['Vitamin B12', 'Choline', 'Vitamin D', 'Riboflavin'],
    healthAdvisories: [
      {
        condition: 'Egg Allergy',
        warning: 'Contains whole poultry eggs. Not suitable for individuals with egg white or yolk allergies.',
        severity: 'avoid',
      },
      {
        condition: 'Hyperlipidemia / High Cholesterol',
        warning: 'Whole egg yolks contain dietary cholesterol. May discard yolks and use egg whites only.',
        severity: 'caution',
      },
    ],
    allergens: ['egg'],
    shelfRescuePriority: 'high',
    ingredients: [
      { name: 'Hard-boiled Eggs', amount: '4 eggs pierced', aliasKeywords: ['egg', 'eggs', 'dim'] },
      { name: 'Potatoes', amount: '2 halved boiled', aliasKeywords: ['potato', 'potatoes', 'aloo', 'vegetables'] },
      { name: 'Onion & Tomato Gravy Base', amount: '1 cup', aliasKeywords: ['onion', 'tomato', 'vegetables'] },
      { name: 'Ginger-Garlic Paste', amount: '1 tbsp', aliasKeywords: ['ginger', 'garlic'] },
    ],
    instructions: [
      'Rub boiled eggs and potatoes with turmeric and salt, then shallow fry in mustard oil until golden blistered.',
      'In the remaining oil, fry onions, ginger-garlic paste, and tomatoes with dry ground spices.',
      'Cook masala until oil beads appear on surface.',
      'Add 1/2 cup warm water, return eggs and potatoes to pan, and simmer until gravy clings to eggs.',
    ],
  },
  {
    slug: 'vegetable-poha',
    title: 'Flattened Rice Upma / Poha',
    bengaliTitle: 'চিঁড়ের পোলাও',
    summary: 'Quick breakfast staple using flattened rice (chire) and any spare carrots, beans, or peas in the fridge.',
    dietType: 'vegan',
    prepMinutes: 5,
    cookMinutes: 10,
    servings: 2,
    caloriesPerServing: 210,
    macros: { proteinG: 4, carbsG: 42, fatG: 4 },
    fiberG: 3.2,
    vitamins: ['Iron', 'Vitamin C', 'B-Vitamins'],
    healthAdvisories: [
      {
        condition: 'Type 2 Diabetes',
        warning: 'Flattened rice produces a moderate-to-high glycemic spike. Increase pea/carrot vegetable ratio and roasted peanuts to slow glucose absorption.',
        severity: 'caution',
      },
      {
        condition: 'Peanut Allergy',
        warning: 'Contains optional peanuts. Strictly omit peanuts for anyone with tree nut/groundnut hypersensitivity.',
        severity: 'avoid',
      },
    ],
    allergens: ['peanuts'],
    shelfRescuePriority: 'medium',
    ingredients: [
      { name: 'Poha / Chire (Flattened Rice)', amount: '2 cups rinsed', aliasKeywords: ['poha', 'chire', 'flattened rice', 'grains'] },
      { name: 'Mixed Vegetables', amount: '1 cup diced', aliasKeywords: ['vegetables', 'carrot', 'peas', 'potato'] },
      { name: 'Mustard Seeds & Curry Leaves', amount: '1 tsp', aliasKeywords: ['mustard', 'curry leaves', 'spice'] },
      { name: 'Roasted Peanuts', amount: '2 tbsp', aliasKeywords: ['peanuts', 'nuts'], isOptional: true },
    ],
    instructions: [
      'Rinse poha in a colander for 30 seconds and drain thoroughly.',
      'Heat oil, crackle mustard seeds and curry leaves, then saute vegetables until tender.',
      'Sprinkle turmeric and salt, then toss in the drained poha.',
      'Gently fold together on low heat for 3 minutes until steaming hot and golden.',
    ],
  },
];
