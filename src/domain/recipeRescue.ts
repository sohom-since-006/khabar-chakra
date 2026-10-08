import { Recipe, RECIPES_CATALOG } from '@/data/recipes';
import { InventoryItem, DietType } from './types';
import { calculateFreshness } from './freshness';

export interface RecipeRescueMatch {
  recipe: Recipe;
  matchScore: number; // 0 - 100
  matchedIngredientsCount: number;
  totalIngredientsCount: number;
  rescuedPantryItemNames: string[];
  missingIngredients: string[];
}

export function matchRecipesToPantry(params: {
  inventory: InventoryItem[];
  dietFilter?: DietType | 'all';
  excludedAllergens?: string[];
}): RecipeRescueMatch[] {
  const { inventory, dietFilter = 'all', excludedAllergens = [] } = params;

  // Active items only
  const activeItems = inventory.filter((i) => i.status === 'active');

  // Compute freshness for active items to identify near-expiry candidates
  const enrichedPantry = activeItems.map((item) => {
    const f = calculateFreshness({
      category: item.category,
      storage: item.storage,
      expiryDate: item.expiryDate,
      isFlagged: item.isFlagged,
    });
    return {
      name: item.name.toLowerCase(),
      isNearExpiry: f.band === 'expiring' || f.band === 'consume_soon',
      original: item,
    };
  });

  const results: RecipeRescueMatch[] = [];

  for (const recipe of RECIPES_CATALOG) {
    // 1. Hard Dietary Filter
    if (dietFilter !== 'all') {
      if (dietFilter === 'veg' && (recipe.dietType === 'non_veg' || recipe.dietType === 'egg')) {
        continue;
      }
      if (dietFilter === 'vegan' && recipe.dietType !== 'vegan') {
        continue;
      }
      if (dietFilter === 'egg' && recipe.dietType === 'non_veg') {
        continue;
      }
    }

    // 2. Allergen Exclusion
    if (excludedAllergens.length > 0) {
      const hasExcluded = recipe.allergens.some((a) => excludedAllergens.includes(a));
      if (hasExcluded) continue;
    }

    // 3. Match Ingredients
    const rescuedItemNames = new Set<string>();
    let matchedCount = 0;
    const missing: string[] = [];

    for (const ing of recipe.ingredients) {
      let isIngMatched = false;

      for (const item of enrichedPantry) {
        // Check if any alias keyword matches item name or vice versa
        const isMatch = ing.aliasKeywords.some(
          (kw) => item.name.includes(kw) || kw.includes(item.name)
        );

        if (isMatch) {
          isIngMatched = true;
          if (item.isNearExpiry) {
            rescuedItemNames.add(item.original.name);
          }
          break;
        }
      }

      if (isIngMatched) {
        matchedCount++;
      } else if (!ing.isOptional) {
        missing.push(ing.name);
      }
    }

    const totalCount = recipe.ingredients.length;
    const coveragePercentage = totalCount > 0 ? (matchedCount / totalCount) * 50 : 0;
    const nearExpiryBoost = Math.min(50, rescuedItemNames.size * 25);
    const matchScore = Math.min(100, Math.round(coveragePercentage + nearExpiryBoost));

    results.push({
      recipe,
      matchScore,
      matchedIngredientsCount: matchedCount,
      totalIngredientsCount: totalCount,
      rescuedPantryItemNames: Array.from(rescuedItemNames),
      missingIngredients: missing,
    });
  }

  // Sort descending by match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
