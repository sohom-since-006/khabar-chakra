import { describe, it, expect } from 'vitest';
import {
  validateListingInput,
  sortListingsEndingSoonestThenNearest,
  generatePickupCode,
  Listing,
} from '../../src/domain/listings';

describe('Inventory Item Validation & Constraints (Phase 4)', () => {
  const validBase: Partial<Listing> = {
    title: 'Stored Festive Sweets',
    category: 'packaged',
    dietType: 'veg',
    kind: 'pantry_item',
    quantityValue: 2,
    quantityUnit: 'kg',
    photos: ['https://example.com/sweet1.jpg'],
    windowHours: 24,
    ownerVerified: false,
    isEmergency: false,
  };

  it('strictly rejects raw meat, fish, and eggs per Decision D8', () => {
    const res = validateListingInput({
      ...validBase,
      category: 'meat_fish_egg',
    });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('Decision D8');
  });

  it('enforces 1 to 4 photos per Decision D4', () => {
    // 0 photos
    const noPhotos = validateListingInput({
      ...validBase,
      photos: [],
    });
    expect(noPhotos.isValid).toBe(false);
    expect(noPhotos.errors[0]).toContain('Decision D4');

    // 5 photos
    const tooManyPhotos = validateListingInput({
      ...validBase,
      photos: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
    });
    expect(tooManyPhotos.isValid).toBe(false);
    expect(tooManyPhotos.errors[0]).toContain('Decision D4');

    // 2 photos
    const good = validateListingInput({
      ...validBase,
      photos: ['1.jpg', '2.jpg'],
    });
    expect(good.isValid).toBe(true);
  });

  it('enforces 48-hour hard ceiling per Decision D3', () => {
    const overCeiling = validateListingInput({
      ...validBase,
      windowHours: 50,
    });
    expect(overCeiling.isValid).toBe(false);
    expect(overCeiling.errors[0]).toContain('Decision D3');

    const withinCeiling = validateListingInput({
      ...validBase,
      windowHours: 48,
    });
    expect(withinCeiling.isValid).toBe(true);
  });

  it('restricts Emergency Food Alerts to verified authorities per Decision D12', () => {
    const invalidEmergency = validateListingInput({
      ...validBase,
      isEmergency: true,
      ownerVerified: false,
      ownerOrgType: 'individual',
    });
    expect(invalidEmergency.isValid).toBe(false);
    expect(invalidEmergency.errors[0]).toContain('Decision D12');

    const validAuthorityEmergency = validateListingInput({
      ...validBase,
      isEmergency: true,
      ownerVerified: true,
      ownerOrgType: 'authority',
    });
    expect(validAuthorityEmergency.isValid).toBe(true);
  });

  it('generates a 6-digit verification code per Decision D5', () => {
    const code = generatePickupCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('sorts items by ending soonest, then nearest per Decision D11', () => {
    const now = new Date('2026-10-08T12:00:00Z');
    const userLocation = { lat: 23.6889, lng: 86.9661 }; // Asansol

    const itemLaterNear: Listing = {
      id: 'item-1',
      ownerId: 'u1',
      ownerName: 'User 1',
      ownerPhone: '+919000000001',
      ownerVerified: false,
      title: 'Item Expires in 20h, 1km away',
      description: 'Test',
      category: 'cooked_food',
      dietType: 'veg',
      kind: 'cooked_dish',
      quantityValue: 1,
      quantityUnit: 'portion',
      photos: ['1.jpg'],
      location: { lat: 23.6900, lng: 86.9700, addressText: 'Market', city: 'Asansol', pinCode: '713301' },
      locationPrivacy: 'approximate',
      contactRevealPolicy: 'instant',
      windowHours: 20,
      startsAt: '2026-10-08T12:00:00Z',
      expiresAt: '2026-10-09T08:00:00Z', // 20 hours left
      pickupCode: '123456',
      isEmergency: false,
      status: 'active',
      createdAt: '2026-10-08T12:00:00Z',
      updatedAt: '2026-10-08T12:00:00Z',
    };

    const itemSoonerFar: Listing = {
      ...itemLaterNear,
      id: 'item-2',
      title: 'Item Expires in 4h, 15km away',
      location: { lat: 23.5500, lng: 87.0500, addressText: 'Durgapur Border', city: 'Asansol', pinCode: '713303' },
      expiresAt: '2026-10-08T16:00:00Z', // 4 hours left
    };

    const sorted = sortListingsEndingSoonestThenNearest([itemLaterNear, itemSoonerFar], userLocation, now);
    expect(sorted[0].id).toBe('item-2'); // Ending soonest prioritized
  });
});
