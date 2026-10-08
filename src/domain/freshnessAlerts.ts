import { InventoryItem, FoodCategory } from './types';
import { calculateFreshness } from './freshness';

export type AlertUrgency = 'critical' | 'warning' | 'expired' | 'info';

export interface FreshnessAlert {
  id: string; // Idempotent deterministic key
  itemId: string;
  itemName: string;
  category: FoodCategory;
  urgency: AlertUrgency;
  hoursRemaining: number;
  headline: string;
  message: string;
  actionRecommendation: string;
  actionHref: string;
  actionLabel: string;
  createdAt: string;
  isRead: boolean;
  isDismissed: boolean;
}

export function generateFreshnessAlerts(
  inventory: InventoryItem[],
  now: Date = new Date()
): FreshnessAlert[] {
  const alerts: FreshnessAlert[] = [];

  for (const item of inventory) {
    if (item.status !== 'active') continue;

    const freshness = calculateFreshness({
      category: item.category,
      storage: item.storage,
      expiryDate: item.expiryDate,
      purchaseDate: item.purchaseDate,
      isFlagged: item.isFlagged,
      now,
    });

    if (freshness.band === 'expiring') {
      alerts.push({
        id: `alert-${item.id}-expiring`,
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        urgency: 'critical',
        hoursRemaining: freshness.hoursRemaining,
        headline: `Expiring Soon: ${item.name} (<24h left)`,
        message: `Your ${item.name} is reaching the end of its fresh window. Prioritize this in your next meal to prevent kitchen waste.`,
        actionRecommendation: 'Cook immediately with Recipe Rescue or freeze for later.',
        actionHref: `/en/recipes`,
        actionLabel: 'Rescue in Recipe',
        createdAt: now.toISOString(),
        isRead: false,
        isDismissed: false,
      });
    } else if (freshness.band === 'consume_soon') {
      alerts.push({
        id: `alert-${item.id}-consume_soon`,
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        urgency: 'warning',
        hoursRemaining: freshness.hoursRemaining,
        headline: `Consume Soon: ${item.name} (~${Math.round(freshness.hoursRemaining)}h remaining)`,
        message: `Your ${item.name} has entered the 24–48 hour window. Plan your upcoming meal around this item.`,
        actionRecommendation: 'Include in tonight\'s meal or prepare ingredients.',
        actionHref: `/en/recipes`,
        actionLabel: 'Browse Recipes',
        createdAt: now.toISOString(),
        isRead: false,
        isDismissed: false,
      });
    } else if (freshness.band === 'expired') {
      alerts.push({
        id: `alert-${item.id}-expired`,
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        urgency: 'expired',
        hoursRemaining: 0,
        headline: `Shelf Life Passed: ${item.name}`,
        message: `Estimated shelf life for ${item.name} has passed. Verify smell, texture and appearance before any use.`,
        actionRecommendation: 'Do not consume if spoiled. Divert to household composting or responsible disposal.',
        actionHref: `/en/home`,
        actionLabel: 'Log Kitchen Outcome',
        createdAt: now.toISOString(),
        isRead: false,
        isDismissed: false,
      });
    }
  }

  // Sort by urgency priority: critical first, then warning, then expired
  const priorityMap: Record<AlertUrgency, number> = {
    critical: 0,
    warning: 1,
    expired: 2,
    info: 3,
  };

  return alerts.sort((a, b) => {
    const pDiff = priorityMap[a.urgency] - priorityMap[b.urgency];
    if (pDiff !== 0) return pDiff;
    return a.hoursRemaining - b.hoursRemaining;
  });
}
