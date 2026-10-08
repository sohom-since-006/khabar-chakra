'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Listing } from '@/domain/listings';
import { MOCK_COMMUNITY_LISTINGS } from '@/data/mockListings';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function EmergencyPage() {
  const [emergencyListings, setEmergencyListings] = useState<Listing[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-community-listings');
      const all: Listing[] = stored ? JSON.parse(stored) : MOCK_COMMUNITY_LISTINGS;
      setEmergencyListings(all.filter((item) => item.isEmergency));
    } catch {
      setEmergencyListings(MOCK_COMMUNITY_LISTINGS.filter((item) => item.isEmergency));
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Folio Masthead */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-chilli)] text-lg">Rapid Response Corridor · Priority Rail</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1 flex items-center gap-3">
            <span>Emergency Food Sharing</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[var(--kc-chilli)] text-white font-bold rounded-sm">
              VERIFIED NGOS ONLY · D12
            </span>
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            High-priority food broadcast reserved exclusively for accredited NGOs to redistribute large-batch banquet surplus to vulnerable shelters.
          </p>
        </div>
        <Link
          href="/en/available"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)]"
        >
          ← Available Food
        </Link>
      </div>

      {/* Decision D12 Mandate Banner */}
      <div className="p-5 border-l-4 border border-[var(--kc-chilli)] bg-red-50 mb-8 rounded-sm">
        <div className="flex items-start gap-3">
          <div className="pt-0.5 text-[var(--kc-chilli)]">
            <KhabarIcon name="warning" size={24} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold uppercase text-[var(--kc-chilli)] tracking-wider block mb-1">
              Decision D12 Protocol Mandate
            </span>
            <p className="text-xs font-sans text-[var(--kc-charcoal)] leading-relaxed">
              <strong>Emergency Food Sharing is reserved exclusively for verified NGOs.</strong> Caterers, banquet halls, and municipal authorities have no special emergency broadcast powers. Only NGOs with vetted field relief capacity may issue emergency collection broadcasts to prevent chaotic crowd gathering and ensure hygienic distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Active Emergency Broadcasts Feed */}
      <div className="space-y-6 mb-12">
        <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 flex items-center justify-between">
          <span>Active Emergency Relief Broadcasts</span>
          <span className="text-xs font-mono text-[var(--kc-moss)] font-normal">
            {emergencyListings.length} Active Dispatch Channels
          </span>
        </h2>

        {emergencyListings.length === 0 ? (
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 text-center">
            <h3 className="text-sm font-bold text-[var(--kc-charcoal)] mb-1">No Active Emergency Broadcasts</h3>
            <p className="text-xs text-[var(--kc-moss)] font-sans">
              All community relief channels are currently clear. Regular surplus remains accessible in Available Food.
            </p>
          </div>
        ) : (
          emergencyListings.map((item) => (
            <div
              key={item.id}
              className="almanac-card border-2 border-[var(--kc-chilli)] bg-[var(--kc-cream)] p-6 rounded-sm shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--kc-chilli)] text-white font-bold rounded-sm uppercase">
                      RAPID RESCUE BROADCAST
                    </span>
                    <VerifiedBadge orgType={item.donorOrgType} size="sm" />
                    <span className="text-xs font-mono text-[var(--kc-moss)] font-bold">
                      📍 {item.location.addressText}, {item.location.city}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--kc-charcoal)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--kc-moss)] font-sans leading-relaxed mb-4 max-w-2xl">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-[var(--kc-charcoal)]">
                    <span className="bg-white px-2 py-1 border border-[var(--kc-moss)] font-bold">
                      Quantity: {item.quantityValue} {item.quantityUnit}
                    </span>
                    <span className="bg-white px-2 py-1 border border-[var(--kc-moss)] font-bold text-[var(--kc-chilli)]">
                      Window Ceiling: {item.windowHours} Hours (D3)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <Link
                    href={`/en/available`}
                    className="px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[var(--kc-chilli)] text-white hover:opacity-90 rounded-sm"
                  >
                    Open Handover Ticket →
                  </Link>
                  <span className="text-[10px] font-mono text-[var(--kc-moss)]">
                    6-Digit Pickup Code Active
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NGO Verification Call to Action */}
      <div className="p-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[var(--kc-charcoal)] mb-1">
            Are you a registered shelter or humanitarian NGO in West Bengal?
          </h4>
          <p className="text-xs text-[var(--kc-moss)] font-sans">
            Complete the two-admin accreditation process to obtain emergency broadcasting authority.
          </p>
        </div>
        <Link
          href="/en/organisations/register"
          className="px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm shrink-0"
        >
          Submit NGO Credentials (D9) →
        </Link>
      </div>
    </div>
  );
}
