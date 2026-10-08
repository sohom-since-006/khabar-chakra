import { FoodCategory, DietType } from '@/domain/types';
import { FoodHealthAdvisory, generateHealthAdvisoriesFromNutrients } from '@/domain/foodIntelligence';

export interface ProductLookupResult {
  found: boolean;
  name?: string;
  brand?: string;
  category?: FoodCategory;
  dietType?: DietType;
  quantity?: string;
  packaging?: string;
  imageUrl?: string;
  rawIngredients?: string;
  fssaiLicense?: string;
  caloriesKcal?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarsG?: number;
  sodiumMg?: number;
  vitamins?: string[];
  consumptionType?: 'eat_directly' | 'needs_cooking';
  healthAdvisories?: FoodHealthAdvisory[];
  estimatedShelfDays?: number;
}

export async function lookupBarcode(barcode: string): Promise<ProductLookupResult> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    return { found: false };
  }

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`, {
      headers: {
        'User-Agent': 'KhabarChakra-CommunityApp/1.0 (https://khabar-chakra.vercel.app)',
      },
    });

    if (!res.ok) {
      return { found: false };
    }

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return { found: false };
    }

    const p = data.product;

    // Detect diet type from vegetarian tags
    let dietType: DietType = 'veg';
    if (p.ingredients_analysis_tags?.includes('en:non-vegetarian')) {
      dietType = 'non_veg';
    } else if (p.ingredients_analysis_tags?.includes('en:vegan')) {
      dietType = 'vegan';
    }

    // Map categories
    let category: FoodCategory = 'packaged';
    const cats = (p.categories_tags || []).join(' ').toLowerCase();
    if (cats.includes('dairy') || cats.includes('milk') || cats.includes('cheese') || cats.includes('curd')) {
      category = 'dairy';
    } else if (cats.includes('bread') || cats.includes('bakery') || cats.includes('biscuit')) {
      category = 'bread_bakery';
    } else if (cats.includes('beverage') || cats.includes('tea') || cats.includes('juice')) {
      category = 'beverages';
    } else if (cats.includes('vegetable')) {
      category = 'vegetables';
    } else if (cats.includes('fruit')) {
      category = 'fruits';
    } else if (cats.includes('meat') || cats.includes('fish') || cats.includes('egg') || cats.includes('poultry')) {
      category = 'meat_fish_egg';
    } else if (cats.includes('cereal') || cats.includes('grain') || cats.includes('rice') || cats.includes('pulse')) {
      category = 'grains_pulses';
    }

    // Extract nutriments from Open Food Facts
    const nut = p.nutriments || {};
    const caloriesKcal = Math.round(nut['energy-kcal_100g'] ?? nut['energy-kcal'] ?? (nut['energy-kj_100g'] ? nut['energy-kj_100g'] / 4.184 : 0));
    const proteinG = parseFloat((nut.proteins_100g ?? nut.proteins ?? 0).toFixed(1));
    const carbsG = parseFloat((nut.carbohydrates_100g ?? nut.carbohydrates ?? 0).toFixed(1));
    const fatG = parseFloat((nut.fat_100g ?? nut.fat ?? 0).toFixed(1));
    const fiberG = parseFloat((nut.fiber_100g ?? nut.fiber ?? 0).toFixed(1));
    const sugarsG = parseFloat((nut.sugars_100g ?? nut.sugars ?? 0).toFixed(1));
    const sodiumMg = Math.round((nut.sodium_100g ?? (nut.salt_100g ? nut.salt_100g / 2.5 : 0)) * 1000);

    // Extract vitamins and minerals mentioned
    const vitamins: string[] = [];
    if (nut['vitamin-c_100g']) vitamins.push('Vitamin C');
    if (nut['vitamin-a_100g']) vitamins.push('Vitamin A');
    if (nut['vitamin-d_100g']) vitamins.push('Vitamin D');
    if (nut['calcium_100g']) vitamins.push('Calcium');
    if (nut['iron_100g']) vitamins.push('Iron');
    if (vitamins.length === 0) {
      if (category === 'fruits' || category === 'vegetables') vitamins.push('Vitamin C', 'Potassium');
      if (category === 'dairy') vitamins.push('Calcium', 'Vitamin B12');
      if (category === 'grains_pulses') vitamins.push('B-Complex', 'Iron');
    }

    // Determine consumption type
    const isDirect = category === 'fruits' || category === 'beverages' || cats.includes('snack') || cats.includes('biscuit') || cats.includes('ready-to-eat');
    const consumptionType = isDirect ? 'eat_directly' : 'needs_cooking';

    // Generate Disease / Health advisories
    const healthAdvisories = generateHealthAdvisoriesFromNutrients({
      category,
      sugarsG,
      carbsG,
      fatG,
      sodiumMg,
      ingredientsText: p.ingredients_text,
    });

    return {
      found: true,
      name: p.product_name || p.product_name_en || 'Packaged Grocery Item',
      brand: p.brands,
      category,
      dietType,
      quantity: p.quantity,
      packaging: p.packaging,
      imageUrl: p.image_url || p.image_front_small_url,
      rawIngredients: p.ingredients_text,
      caloriesKcal: caloriesKcal || undefined,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      sugarsG,
      sodiumMg,
      vitamins,
      consumptionType,
      healthAdvisories,
      estimatedShelfDays: category === 'dairy' ? 4 : category === 'vegetables' ? 7 : category === 'fruits' ? 10 : 30,
    };
  } catch (err) {
    console.warn('Open Food Facts API unavailable or offline:', err);
    return { found: false };
  }
}
