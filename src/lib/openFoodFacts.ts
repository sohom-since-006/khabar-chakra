import { FoodCategory, DietType } from '@/domain/types';

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
    };
  } catch (err) {
    console.warn('Open Food Facts API unavailable or offline:', err);
    return { found: false };
  }
}
