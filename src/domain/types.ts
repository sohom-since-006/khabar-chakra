export type FoodCategory =
  | 'packaged'
  | 'vegetables'
  | 'fruits'
  | 'meat_fish_egg'
  | 'dairy'
  | 'grains_pulses'
  | 'bread_bakery'
  | 'cooked_food'
  | 'beverages'
  | 'other';

export type StorageLocation = 'room' | 'fridge' | 'freezer';

export type DietType = 'veg' | 'non_veg' | 'egg' | 'vegan';

export type FreshnessBand = 'fresh' | 'consume_soon' | 'expiring' | 'expired';

export type WasteRiskLevel = 'low' | 'medium' | 'high';

export type FSSAIStatus = 'verified' | 'missing' | 'unregulated' | 'exempt';

export type ItemOutcome = 'consumed' | 'cooked' | 'composted' | 'recycled' | 'discarded';

export interface InventoryItem {
  id: string;
  ownerId: string;
  name: string;
  category: FoodCategory;
  dietType: DietType;
  quantityValue: number;
  quantityUnit: string;
  purchaseDate: string; // ISO date string
  cookedAt?: string; // ISO date string for cooked dishes
  expiryDate: string; // ISO date string
  expirySource: 'user_provided' | 'auto_estimated' | 'barcode_metadata';
  storage: StorageLocation;
  packaging?: string;
  barcode?: string;
  fssaiStatus: FSSAIStatus;
  fssaiLicenseNo?: string;
  isFlagged: boolean;
  photoUrl?: string;
  notes?: string;
  calories?: number;
  consumptionType?: 'eat_directly' | 'needs_cooking';
  nutrients?: {
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    fiberG?: number;
    sugarsG?: number;
    sodiumMg?: number;
    vitamins?: string[];
  };
  healthAdvisories?: Array<{
    condition: string;
    warning: string;
    severity: 'caution' | 'avoid';
  }>;
  status: 'active' | 'closed';
  outcome?: ItemOutcome;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FreshnessResult {
  score: number; // 0 - 100
  band: FreshnessBand;
  hoursRemaining: number;
  isExpired: boolean;
  isListable: boolean; // D8: false if raw meat_fish_egg or flagged
  bandColorToken: string;
  bandBadgeLabel: string;
  actionRecommendation: string;
}
