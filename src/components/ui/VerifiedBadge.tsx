'use client';

import React, { useState } from 'react';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface VerifiedBadgeProps {
  orgType?: 'ngo' | 'caterer' | 'banquet_hall' | 'authority' | 'individual';
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ orgType = 'ngo', size = 'sm' }: VerifiedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const label =
    orgType === 'ngo'
      ? 'Verified NGO'
      : orgType === 'caterer'
      ? 'Verified Caterer'
      : orgType === 'banquet_hall'
      ? 'Verified Banquet Hall'
      : orgType === 'authority'
      ? 'Verified Authority'
      : 'Verified Organization';

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={`${label}. Documents reviewed by Khabar Chakra. Food safety is not certified.`}
    >
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[var(--kc-basil)] bg-green-50 text-[var(--kc-basil)] rounded-sm font-mono text-[10px] font-bold">
        <KhabarIcon name="verified" size={size === 'sm' ? 12 : 14} />
        <span>{label}</span>
      </span>

      {showTooltip && (
        <span className="absolute bottom-full left-0 mb-1 w-56 p-2 bg-[var(--kc-charcoal)] text-white text-[11px] font-sans rounded-sm shadow-sm z-50 pointer-events-none">
          <span className="font-bold block text-[var(--kc-mango)] mb-0.5">Documents Reviewed</span>
          Registration and food-handling declaration verified by Khabar Chakra admins. The recipient decides whether food is safe to accept (D9).
        </span>
      )}
    </span>
  );
}
