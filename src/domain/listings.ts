import { FoodCategory, DietType } from './types';

export type ListingKind = 'donate' | 'share' | 'swap' | 'event_surplus';
export type ListingStatus = 'active' | 'reserved' | 'claimed' | 'cancelled' | 'expired';
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
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorOrgType?: 'individual' | 'ngo' | 'caterer' | 'banquet_hall' | 'authority';
  donorVerified: boolean;
  title: string;
  description: string;
  category: FoodCategory;
  dietType: DietType;
  kind: ListingKind;
  quantityValue: number;
  quantityUnit: string;
  photos: string[]; // 1 to 4 photos required (D4)
  location: ListingLocation;
  locationPrivacy: LocationPrivacy;
  fuzzedLocation?: { lat: number; lng: number };
  contactRevealPolicy: ContactRevealPolicy;
  windowHours: number; // hard ceiling <= 48h (D3)
  startsAt: string;
  expiresAt: string;
  pickupCode: string; // 6-digit code (D5)
  isEmergency: boolean; // D12: verified NGOs only
  status: ListingStatus;
  claimedBy?: string;
  claimedAt?: string;
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

  // Decision D8: Raw meat, fish, and eggs are NEVER listable
  if (input.category === 'meat_fish_egg') {
    errors.push('Raw meat, fish, and eggs cannot be shared, donated, or listed (Decision D8). Cooked dishes containing them must be classified under Cooked Food.');
  }

  // Decision D4: 1 to 4 photos required
  if (!input.photos || input.photos.length < 1) {
    errors.push('At least 1 photo is required to publish a listing (Decision D4).');
  } else if (input.photos.length > 4) {
    errors.push('Maximum 4 photos allowed per listing (Decision D4).');
  }

  // Decision D3: Hard 48-hour ceiling
  if (typeof input.windowHours === 'number') {
    if (input.windowHours <= 0) {
      errors.push('Availability window must be greater than 0 hours.');
    } else if (input.windowHours > 48) {
      errors.push('Availability window cannot exceed the 48-hour maximum ceiling (Decision D3).');
    }
  }

  // Decision D12: Emergency food sharing restricted to verified NGOs
  if (input.isEmergency && (!input.donorVerified || input.donorOrgType !== 'ngo')) {
    errors.push('Emergency Food Sharing broadcast is strictly reserved for verified NGOs (Decision D12).');
  }

  if (!input.title || input.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generatePickupCode(): string {
  // 6-digit secure code (D5)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate approximate Haversine distance in kilometres
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

// Decision D11: Available Food default order: ending soonest, then nearest
export function sortListingsEndingSoonestThenNearest(
  listings: Listing[],
  userCoords: { lat: number; lng: number } = ASANSOL_DEFAULT_COORDS,
  now: Date = new Date()
): Listing[] {
  return [...listings].sort((a, b) => {
    // 1. Prioritize active listings over completed/claimed
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;

    // 2. Primary sort: Remaining time (ending soonest)
    const aRemaining = new Date(a.expiresAt).getTime() - now.getTime();
    const bRemaining = new Date(b.expiresAt).getTime() - now.getTime();

    // If both expire within ~3 hours of each other, break tie with distance (nearest)
    const timeDiffHours = Math.abs(aRemaining - bRemaining) / (1000 * 60 * 60);
    if (timeDiffHours <= 3) {
      const aDist = calculateDistanceKm(userCoords.lat, userCoords.lng, a.location.lat, a.location.lng);
      const bDist = calculateDistanceKm(userCoords.lat, userCoords.lng, b.location.lat, b.location.lng);
      return aDist - bDist;
    }

    return aRemaining - bRemaining;
  });
}
