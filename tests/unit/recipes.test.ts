import { describe, it, expect } from 'vitest';
import { matchRecipesToPantry } from '@/domain/recipeRescue';
import { InventoryItem } from '@/domain/types';

describe('Recipe Rescue Engine', () => {
  const sampleInventory: InventoryItem[] = [
    {
      id: 'inv_1',
      ownerId: 'u1',
      name: 'Gobindobhog Rice',
      category: 'grains_pulses',
      dietType: 'veg',
      quantityValue: 2,
      quantityUnit: 'kg',
      purchaseDate: '2026-10-01',
      expiryDate: new Date(Date.now() + 100 * 3600000).toISOString(),
      expirySource: 'user_provided',
      storage: 'room',
      fssaiStatus: 'verified',
      isFlagged: false,
      status: 'active',
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
    {
      id: 'inv_2',
      ownerId: 'u1',
      name: 'Spinach (Palak)',
      category: 'vegetables',
      dietType: 'veg',
      quantityValue: 500,
      quantityUnit: 'g',
      purchaseDate: '2026-10-05',
      // Expiring in 8 hours (urgent!)
      expiryDate: new Date(Date.now() + 8 * 3600000).toISOString(),
      expirySource: 'auto_estimated',
      storage: 'fridge',
      fssaiStatus: 'exempt',
      isFlagged: false,
      status: 'active',
      createdAt: '2026-10-05',
      updatedAt: '2026-10-05',
    },
    {
      id: 'inv_3',
      ownerId: 'u1',
      name: 'Paneer Block',
      category: 'dairy',
      dietType: 'veg',
      quantityValue: 250,
      quantityUnit: 'g',
      purchaseDate: '2026-10-06',
      // Expiring in 12 hours (urgent!)
      expiryDate: new Date(Date.now() + 12 * 3600000).toISOString(),
      expirySource: 'user_provided',
      storage: 'fridge',
      fssaiStatus: 'verified',
      isFlagged: false,
      status: 'active',
      createdAt: '2026-10-06',
      updatedAt: '2026-10-06',
    },
  ];

  it('ranks recipes that rescue near-expiry ingredients highest (AC-RECIPE-01)', () => {
    const matches = matchRecipesToPantry({
      inventory: sampleInventory,
    });

    expect(matches.length).toBeGreaterThan(0);
    const topMatch = matches[0];
    // Either Paneer Butter Masala or Palak Paneer Bhurji should be at the top
    expect(['Home-style Paneer Butter Masala', 'Spinach & Crumbled Paneer Bhurji']).toContain(topMatch.recipe.title);
    expect(topMatch.rescuedPantryItemNames.length).toBeGreaterThan(0);
  });

  it('strictly excludes non-veg and egg dishes when veg filter is active (AC-RECIPE-02)', () => {
    const vegMatches = matchRecipesToPantry({
      inventory: sampleInventory,
      dietFilter: 'veg',
    });

    const hasEggOrMeat = vegMatches.some(
      (m) => m.recipe.dietType === 'non_veg' || m.recipe.dietType === 'egg'
    );
    expect(hasEggOrMeat).toBe(false);
  });

  it('excludes recipes containing excluded allergens', () => {
    const dairyFreeMatches = matchRecipesToPantry({
      inventory: sampleInventory,
      excludedAllergens: ['dairy'],
    });

    const hasDairy = dairyFreeMatches.some((m) => m.recipe.allergens.includes('dairy'));
    expect(hasDairy).toBe(false);
  });
});
