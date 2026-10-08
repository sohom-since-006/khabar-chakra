import { describe, it, expect } from 'vitest';
import { calculateFreshness } from '@/domain/freshness';
import { assessWasteRisk } from '@/domain/wasteRisk';
import { validateFSSAI } from '@/domain/fssai';
import { estimateExpiryDate } from '@/domain/shelfLife';

describe('Domain Logic · Freshness & Food Waste Risk', () => {
  const baseTime = new Date('2026-10-08T12:00:00Z');

  it('estimates expiry correctly from shelf-life defaults', () => {
    const { expiryDate, rule } = estimateExpiryDate('dairy', 'fridge', baseTime);
    expect(rule.defaultShelfHours).toBe(72);
    const expectedTime = new Date(baseTime.getTime() + 72 * 3600 * 1000);
    expect(expiryDate.toISOString()).toBe(expectedTime.toISOString());
  });

  it('assigns Fresh band when hours remaining exceed amber threshold', () => {
    const expiry = new Date(baseTime.getTime() + 60 * 3600 * 1000); // 60h remaining (> 24h amber for fridge dairy)
    const result = calculateFreshness({
      category: 'dairy',
      storage: 'fridge',
      expiryDate: expiry,
      now: baseTime,
    });
    expect(result.band).toBe('fresh');
    expect(result.isExpired).toBe(false);
    expect(result.hoursRemaining).toBe(60);
    expect(result.isListable).toBe(true);
  });

  it('assigns Consume Soon band when hours remaining fall between amber and red', () => {
    const expiry = new Date(baseTime.getTime() + 18 * 3600 * 1000); // 18h remaining (dairy amber=24, red=12)
    const result = calculateFreshness({
      category: 'dairy',
      storage: 'fridge',
      expiryDate: expiry,
      now: baseTime,
    });
    expect(result.band).toBe('consume_soon');
    expect(result.isExpired).toBe(false);
  });

  it('assigns Expiring band when hours remaining fall below red threshold', () => {
    const expiry = new Date(baseTime.getTime() + 6 * 3600 * 1000); // 6h remaining (dairy red=12)
    const result = calculateFreshness({
      category: 'dairy',
      storage: 'fridge',
      expiryDate: expiry,
      now: baseTime,
    });
    expect(result.band).toBe('expiring');
    expect(result.isExpired).toBe(false);
  });

  it('assigns Expired band when deadline has passed', () => {
    const expiry = new Date(baseTime.getTime() - 2 * 3600 * 1000); // 2h past expiry
    const result = calculateFreshness({
      category: 'dairy',
      storage: 'fridge',
      expiryDate: expiry,
      now: baseTime,
    });
    expect(result.band).toBe('expired');
    expect(result.isExpired).toBe(true);
    expect(result.score).toBe(0);
    expect(result.isListable).toBe(false);
  });

  it('strictly enforces Binding Decision D8: raw meat, fish, and eggs are NEVER listable', () => {
    const freshExpiry = new Date(baseTime.getTime() + 30 * 3600 * 1000);
    const result = calculateFreshness({
      category: 'meat_fish_egg',
      storage: 'fridge',
      expiryDate: freshExpiry,
      now: baseTime,
    });
    expect(result.band).toBe('fresh');
    expect(result.isListable).toBe(false); // Locked in v1
  });

  it('blocks listable status for FSSAI flagged items', () => {
    const freshExpiry = new Date(baseTime.getTime() + 100 * 3600 * 1000);
    const result = calculateFreshness({
      category: 'packaged',
      storage: 'room',
      expiryDate: freshExpiry,
      isFlagged: true,
      now: baseTime,
    });
    expect(result.isListable).toBe(false);
  });

  it('assesses waste risk properly', () => {
    const highRisk = assessWasteRisk({
      category: 'cooked_food',
      storage: 'room',
      hoursRemaining: 1,
      quantityValue: 8,
    });
    expect(highRisk.riskLevel).toBe('high');
    expect(highRisk.riskScore).toBeGreaterThanOrEqual(70);

    const lowRisk = assessWasteRisk({
      category: 'grains_pulses',
      storage: 'room',
      hoursRemaining: 1500,
      quantityValue: 2,
    });
    expect(lowRisk.riskLevel).toBe('low');
    expect(lowRisk.riskScore).toBeLessThan(40);
  });

  it('validates 14-digit FSSAI license correctly', () => {
    const valid = validateFSSAI({
      category: 'packaged',
      hasLicenseMark: true,
      licenseNumber: '10014022002598',
    });
    expect(valid.isValid).toBe(true);
    expect(valid.isFlagged).toBe(false);

    const invalid = validateFSSAI({
      category: 'packaged',
      hasLicenseMark: true,
      licenseNumber: '12345',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.isFlagged).toBe(true);

    const exemptProduce = validateFSSAI({
      category: 'vegetables',
      hasLicenseMark: false,
    });
    expect(exemptProduce.isValid).toBe(true);
    expect(exemptProduce.status).toBe('exempt');
  });
});
