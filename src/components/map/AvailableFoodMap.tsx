'use client';

import React from 'react';
import { Listing } from '@/domain/listings';

interface AvailableFoodMapProps {
  listings?: Listing[];
  onSelectListing?: (listing: Listing) => void;
}

// Deprecated: Public food surplus map pins are omitted in v2.0 domestic kitchen intelligence
export function AvailableFoodMap({ listings = [], onSelectListing }: AvailableFoodMapProps) {
  return (
    <div className="p-8 text-center border border-[var(--kc-card-border)] bg-[var(--kc-card)] rounded-2xl">
      <span className="text-3xl mb-2 block">🌿</span>
      <h3 className="text-sm font-bold text-[var(--kc-ink)]">
        Private Domestic Kitchen Inventory
      </h3>
      <p className="text-xs text-[var(--kc-muted)] max-w-md mx-auto mt-1">
        Public map markers have been replaced with private domestic pantry management to protect household privacy.
      </p>
    </div>
  );
}
