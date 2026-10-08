import { FoodCategory, StorageLocation } from './types';

export interface ShelfLifeRule {
  defaultShelfHours: number;
  amberHoursThreshold: number; // below this -> consume_soon
  redHoursThreshold: number;   // below this -> expiring
  riskWeight: number;          // 1 - 5 perishability factor
  sourceNote: string;
}

// Default shelf-life matrix by (category, storage location)
// Rule: Every value cites a verifiable guidance baseline or placeholder per AGENTS.md §3.5
export const SHELF_LIFE_DEFAULTS: Record<FoodCategory, Record<StorageLocation, ShelfLifeRule>> = {
  vegetables: {
    room: {
      defaultShelfHours: 72,
      amberHoursThreshold: 36,
      redHoursThreshold: 12,
      riskWeight: 3,
      sourceNote: 'TODO(source): FSSAI Kitchen Freshness Guidelines for ambient leafy & root produce',
    },
    fridge: {
      defaultShelfHours: 168, // 7 days
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): ICMR-NIN Dietary & Perishable Cold Storage guidelines',
    },
    freezer: {
      defaultShelfHours: 720, // 30 days blanched
      amberHoursThreshold: 96,
      redHoursThreshold: 48,
      riskWeight: 1,
      sourceNote: 'TODO(source): Standard frozen vegetable storage reference',
    },
  },
  fruits: {
    room: {
      defaultShelfHours: 96, // 4 days
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 3,
      sourceNote: 'TODO(source): FSSAI Ambient Fruit Ripening advisory',
    },
    fridge: {
      defaultShelfHours: 240, // 10 days
      amberHoursThreshold: 72,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Standard cold-stored stone & tropical fruit baseline',
    },
    freezer: {
      defaultShelfHours: 720,
      amberHoursThreshold: 96,
      redHoursThreshold: 48,
      riskWeight: 1,
      sourceNote: 'TODO(source): Frozen fruit pulp guideline',
    },
  },
  dairy: {
    room: {
      defaultShelfHours: 8, // Fresh milk at room temp in warm climate
      amberHoursThreshold: 4,
      redHoursThreshold: 2,
      riskWeight: 5,
      sourceNote: 'TODO(source): FSSAI Boiled milk ambient preservation maximum',
    },
    fridge: {
      defaultShelfHours: 72, // 3 days refrigerated pasteurised
      amberHoursThreshold: 24,
      redHoursThreshold: 12,
      riskWeight: 4,
      sourceNote: 'TODO(source): Standard pasteurised pouch milk refrigerated duration',
    },
    freezer: {
      defaultShelfHours: 360,
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Frozen butter/paneer cold chain guidance',
    },
  },
  cooked_food: {
    room: {
      defaultShelfHours: 6, // Hot cooked dish at ambient Indian temperatures
      amberHoursThreshold: 4,
      redHoursThreshold: 2,
      riskWeight: 5,
      sourceNote: 'TODO(source): FSSAI cooked meal safe ambient consumption window',
    },
    fridge: {
      defaultShelfHours: 48,
      amberHoursThreshold: 18,
      redHoursThreshold: 6,
      riskWeight: 3,
      sourceNote: 'TODO(source): Cooked dal, curry, and rice refrigeration limit',
    },
    freezer: {
      defaultShelfHours: 240,
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Deep freeze cooked meal preservation',
    },
  },
  meat_fish_egg: {
    // Note: D8 strictly locks these to inventory tracking only - NEVER listable
    room: {
      defaultShelfHours: 4,
      amberHoursThreshold: 2,
      redHoursThreshold: 1,
      riskWeight: 5,
      sourceNote: 'TODO(source): High microbial spoilage risk raw animal protein limit',
    },
    fridge: {
      defaultShelfHours: 48,
      amberHoursThreshold: 18,
      redHoursThreshold: 6,
      riskWeight: 4,
      sourceNote: 'TODO(source): Raw butchered cuts cold storage maximum',
    },
    freezer: {
      defaultShelfHours: 720,
      amberHoursThreshold: 72,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Deep freezer raw meat baseline',
    },
  },
  bread_bakery: {
    room: {
      defaultShelfHours: 72, // 3 days
      amberHoursThreshold: 24,
      redHoursThreshold: 12,
      riskWeight: 3,
      sourceNote: 'TODO(source): Commercial sliced bread shelf baseline',
    },
    fridge: {
      defaultShelfHours: 168,
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Refrigerated bakery preservation',
    },
    freezer: {
      defaultShelfHours: 720,
      amberHoursThreshold: 96,
      redHoursThreshold: 48,
      riskWeight: 1,
      sourceNote: 'TODO(source): Frozen bread slices guideline',
    },
  },
  grains_pulses: {
    room: {
      defaultShelfHours: 2160, // 90 days
      amberHoursThreshold: 240,
      redHoursThreshold: 72,
      riskWeight: 1,
      sourceNote: 'TODO(source): Dry pantry pulses & polished rice pantry duration',
    },
    fridge: {
      defaultShelfHours: 4320,
      amberHoursThreshold: 480,
      redHoursThreshold: 120,
      riskWeight: 1,
      sourceNote: 'TODO(source): Cool storage grains guideline',
    },
    freezer: {
      defaultShelfHours: 8760,
      amberHoursThreshold: 720,
      redHoursThreshold: 168,
      riskWeight: 1,
      sourceNote: 'TODO(source): Frozen grains cold storage reference',
    },
  },
  packaged: {
    room: {
      defaultShelfHours: 720, // 30 days fallback if not specified on package
      amberHoursThreshold: 120,
      redHoursThreshold: 48,
      riskWeight: 2,
      sourceNote: 'TODO(source): Sealed ambient packaged shelf fallback',
    },
    fridge: {
      defaultShelfHours: 1440,
      amberHoursThreshold: 240,
      redHoursThreshold: 72,
      riskWeight: 1,
      sourceNote: 'TODO(source): Sealed packaged refrigerated fallback',
    },
    freezer: {
      defaultShelfHours: 4320,
      amberHoursThreshold: 480,
      redHoursThreshold: 120,
      riskWeight: 1,
      sourceNote: 'TODO(source): Sealed frozen goods guideline',
    },
  },
  beverages: {
    room: {
      defaultShelfHours: 120,
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Ambient sealed juice/syrup baseline',
    },
    fridge: {
      defaultShelfHours: 240,
      amberHoursThreshold: 72,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Chilled beverage shelf reference',
    },
    freezer: {
      defaultShelfHours: 720,
      amberHoursThreshold: 96,
      redHoursThreshold: 48,
      riskWeight: 1,
      sourceNote: 'TODO(source): Frozen beverage baseline',
    },
  },
  other: {
    room: {
      defaultShelfHours: 48,
      amberHoursThreshold: 24,
      redHoursThreshold: 12,
      riskWeight: 3,
      sourceNote: 'TODO(source): Generic pantry safe default',
    },
    fridge: {
      defaultShelfHours: 120,
      amberHoursThreshold: 48,
      redHoursThreshold: 24,
      riskWeight: 2,
      sourceNote: 'TODO(source): Generic refrigerated safe default',
    },
    freezer: {
      defaultShelfHours: 720,
      amberHoursThreshold: 96,
      redHoursThreshold: 48,
      riskWeight: 1,
      sourceNote: 'TODO(source): Generic freezer safe default',
    },
  },
};

export function estimateExpiryDate(
  category: FoodCategory,
  storage: StorageLocation,
  baseDate: Date = new Date()
): { expiryDate: Date; rule: ShelfLifeRule } {
  const rule = SHELF_LIFE_DEFAULTS[category]?.[storage] || SHELF_LIFE_DEFAULTS.other.room;
  const expiryDate = new Date(baseDate.getTime() + rule.defaultShelfHours * 3600 * 1000);
  return { expiryDate, rule };
}
