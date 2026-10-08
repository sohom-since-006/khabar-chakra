import { FoodCategory, FreshnessBand, FreshnessResult, StorageLocation } from './types';
import { SHELF_LIFE_DEFAULTS } from './shelfLife';

export function calculateFreshness(params: {
  category: FoodCategory;
  storage: StorageLocation;
  expiryDate: string | Date;
  purchaseDate?: string | Date;
  isFlagged?: boolean;
  now?: Date;
}): FreshnessResult {
  const now = params.now || new Date();
  const expiry = typeof params.expiryDate === 'string' ? new Date(params.expiryDate) : params.expiryDate;
  const nowMs = now.getTime();
  const expiryMs = expiry.getTime();

  const rule = SHELF_LIFE_DEFAULTS[params.category]?.[params.storage] || SHELF_LIFE_DEFAULTS.other.room;
  const totalShelfHours = rule.defaultShelfHours;

  const msRemaining = expiryMs - nowMs;
  const hoursRemaining = Math.round((msRemaining / (1000 * 60 * 60)) * 10) / 10;
  const isExpired = msRemaining <= 0;

  // Freshness score 0 - 100 (half-up rounding)
  let score = 0;
  if (!isExpired) {
    const ratio = Math.min(1, Math.max(0, hoursRemaining / totalShelfHours));
    score = Math.round(ratio * 100);
  }

  // Band Determination
  let band: FreshnessBand;
  if (isExpired) {
    band = 'expired';
  } else if (hoursRemaining <= rule.redHoursThreshold) {
    band = 'expiring';
  } else if (hoursRemaining <= rule.amberHoursThreshold) {
    band = 'consume_soon';
  } else {
    band = 'fresh';
  }

  // Visual cues (Colour + Icon + Text per DESIGN SYSTEM & PRD)
  let bandColorToken = 'var(--kc-basil)';
  let bandBadgeLabel = '🟢 Fresh';
  let actionRecommendation = 'Safe in storage. Check countdown.';

  switch (band) {
    case 'fresh':
      bandColorToken = 'var(--kc-basil)';
      bandBadgeLabel = '🟢 Fresh';
      actionRecommendation = 'Pantry safe. Track shelf countdown.';
      break;
    case 'consume_soon':
      bandColorToken = 'var(--kc-mango)';
      bandBadgeLabel = '🟡 Consume Soon';
      actionRecommendation = 'Use within 24–48 hours. Consider preparing for meal rescue.';
      break;
    case 'expiring':
      bandColorToken = 'var(--kc-chilli)';
      bandBadgeLabel = '🔴 Expiring';
      actionRecommendation = 'Urgent: Consume today, cook dish, or share surplus with neighbours.';
      break;
    case 'expired':
      bandColorToken = 'var(--kc-charcoal)';
      bandBadgeLabel = '⬛ Expired';
      actionRecommendation = 'Shelf life passed. Inspect before use. Divert to compost or recycling.';
      break;
  }

  // Decision D8: Raw meat, fish, and eggs are NEVER listable or shareable.
  // Flagged items (FSSAI issues) and expired items are also NOT listable.
  let isListable = true;
  if (params.category === 'meat_fish_egg') {
    isListable = false;
  }
  if (params.isFlagged) {
    isListable = false;
  }
  if (isExpired) {
    isListable = false;
  }

  return {
    score,
    band,
    hoursRemaining: Math.max(0, hoursRemaining),
    isExpired,
    isListable,
    bandColorToken,
    bandBadgeLabel,
    actionRecommendation,
  };
}
