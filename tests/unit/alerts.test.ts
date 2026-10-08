import { describe, it, expect } from 'vitest';
import { generateFreshnessAlerts } from '../../src/domain/freshnessAlerts';
import { InventoryItem } from '../../src/domain/types';

describe('Freshness Alerts Domain Logic (AC-ALERT-01)', () => {
  const baseItem: InventoryItem = {
    id: 'item-101',
    ownerId: 'user-1',
    name: 'Fresh Cow Milk',
    category: 'dairy',
    dietType: 'veg',
    quantityValue: 1,
    quantityUnit: 'Litre',
    purchaseDate: '2026-10-01T08:00:00Z',
    expiryDate: '2026-10-02T12:00:00Z',
    expirySource: 'user_provided',
    storage: 'fridge',
    fssaiStatus: 'verified',
    isFlagged: false,
    status: 'active',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  };

  it('generates critical alert when item has < 24h remaining (AC-ALERT-01)', () => {
    // Expiry is 2026-10-02T12:00:00Z; set now to 10 hours before
    const now = new Date('2026-10-02T02:00:00Z');
    const alerts = generateFreshnessAlerts([baseItem], now);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].urgency).toBe('critical');
    expect(alerts[0].itemId).toBe('item-101');
    expect(alerts[0].hoursRemaining).toBe(10);
    expect(alerts[0].id).toBe('alert-item-101-expiring');
    expect(alerts[0].actionHref).toBe('/en/recipes');
  });

  it('generates warning alert when item has 24h to 48h remaining', () => {
    // 18 hours before expiry (dairy.fridge amberHoursThreshold is 24, red is 12)
    const now = new Date('2026-10-01T18:00:00Z');
    const alerts = generateFreshnessAlerts([baseItem], now);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].urgency).toBe('warning');
    expect(alerts[0].id).toBe('alert-item-101-consume_soon');
  });

  it('ignores closed or already consumed/cooked items', () => {
    const closedItem: InventoryItem = {
      ...baseItem,
      status: 'closed',
      outcome: 'cooked',
    };
    const now = new Date('2026-10-02T02:00:00Z');
    const alerts = generateFreshnessAlerts([closedItem], now);

    expect(alerts).toHaveLength(0);
  });
});
