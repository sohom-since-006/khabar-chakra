import { FoodCategory, DietType } from './types';

export type ListingKind = 'pantry_item' | 'fridge_item' | 'freezer_item' | 'cooked_dish' | 'household_record';
export type ListingStatus = 'active' | 'consumed' | 'cooked' | 'archived';
export type LocationPrivacy = 'exact' | 'approximate';
export type ContactRevealPolicy = 'instant' | 'on_approval';

export interface ListingLocation {
  lat: number;
  lng: number;
  addressText: string;
  city: string;
  pinCode: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  ownerOrgType?: 'individual' | 'household' | 'authority';
  ownerVerified: boolean;
  title: string;
  description: string;
  category: FoodCategory;
  dietType: DietType;
  kind: ListingKind;
  quantityValue: number;
  quantityUnit: string;
  photos: string[]; // 1 to 4 photos allowed (D4)
  location?: ListingLocation;
  locationPrivacy?: LocationPrivacy;
  fuzzedLocation?: { lat: number; lng: number };
  contactRevealPolicy?: ContactRevealPolicy;
  windowHours: number; // hard ceiling <= 48h (D3)
  startsAt: string;
  expiresAt: string;
  pickupCode?: string; // 6-digit code (D5)
  isEmergency?: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListingValidationResult {
  isValid: boolean;
  errors: string[];
}

export const ASANSOL_DEFAULT_COORDS = {
  lat: 23.6889,
  lng: 86.9661,
};

export function validateListingInput(input: Partial<Listing>): ListingValidationResult {
  const errors: string[] = [];

  // Decision D8: Raw meat, fish, and eggs are restricted to private domestic storage only
  if (input.category === 'meat_fish_egg') {
    errors.push('Raw meat, fish, and eggs are restricted to private domestic tracking only and cannot be shared (Decision D8). Cooked dishes containing them must be classified under Cooked Food.');
  }

  // Decision D4: 1 to 4 photos
  if (!input.photos || input.photos.length < 1) {
    errors.push('At least 1 photo is required (Decision D4).');
  } else if (input.photos.length > 4) {
    errors.push('Maximum 4 photos allowed per entry (Decision D4).');
  }

  // Decision D3: Hard 48-hour ceiling
  if (typeof input.windowHours === 'number') {
    if (input.windowHours <= 0) {
      errors.push('Availability window must be greater than 0 hours.');
    } else if (input.windowHours > 48) {
      errors.push('Availability window cannot exceed the 48-hour maximum ceiling (Decision D3).');
    }
  }

  // Decision D12: Emergency alerts restricted to verified authorities
  if (input.isEmergency && (!input.ownerVerified || input.ownerOrgType !== 'authority')) {
    errors.push('Emergency food alerts are strictly reserved for verified local authorities (Decision D12).');
  }

  if (!input.title || input.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeListingContent(title: string, description: string): { cleanTitle: string; cleanDescription: string } {
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const PHONE_REGEX = /(?:\+91[\s.-]?)?(?:[6-9]\d{9}|[6-9]\d{4}[\s.-]?\d{5}|\d{3}[\s.-]?\d{3}[\s.-]?\d{4})/g;

  const cleanTitle = title.replace(EMAIL_REGEX, '[email hidden]').replace(PHONE_REGEX, '[phone hidden]').trim();
  const cleanDescription = description.replace(EMAIL_REGEX, '[email hidden]').replace(PHONE_REGEX, '[phone hidden]').trim();

  return { cleanTitle, cleanDescription };
}

export function generatePickupCode(): string {
  // 6-digit secure code (D5)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function sortListingsEndingSoonestThenNearest(
  listings: Listing[],
  userCoords: { lat: number; lng: number } = ASANSOL_DEFAULT_COORDS,
  now: Date = new Date()
): Listing[] {
  return [...listings].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;

    const aRemaining = new Date(a.expiresAt).getTime() - now.getTime();
    const bRemaining = new Date(b.expiresAt).getTime() - now.getTime();

    const timeDiffHours = Math.abs(aRemaining - bRemaining) / (1000 * 60 * 60);
    if (timeDiffHours <= 3 && a.location && b.location) {
      const aDist = calculateDistanceKm(userCoords.lat, userCoords.lng, a.location.lat, a.location.lng);
      const bDist = calculateDistanceKm(userCoords.lat, userCoords.lng, b.location.lat, b.location.lng);
      return aDist - bDist;
    }

    return aRemaining - bRemaining;
  });
}
