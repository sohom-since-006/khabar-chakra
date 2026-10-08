'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Listing, ListingKind, sortListingsEndingSoonestThenNearest, calculateDistanceKm, ASANSOL_DEFAULT_COORDS } from '@/domain/listings';
import { DietType } from '@/domain/types';
import { MOCK_COMMUNITY_LISTINGS } from '@/data/mockListings';
import { AvailableFoodMap } from '@/components/map/AvailableFoodMap';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function AvailablePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [kindFilter, setKindFilter] = useState<ListingKind | 'all'>('all');
  const [dietFilter, setDietFilter] = useState<DietType | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Selected listing for inspection modal
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [revealedContacts, setRevealedContacts] = useState<string[]>([]);
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [pickupSuccess, setPickupSuccess] = useState(false);
  const [pickupError, setPickupError] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-community-listings');
      if (stored) {
        const parsed: Listing[] = JSON.parse(stored);
        setListings(parsed);
      } else {
        setListings(MOCK_COMMUNITY_LISTINGS);
        localStorage.setItem('kc-community-listings', JSON.stringify(MOCK_COMMUNITY_LISTINGS));
      }
    } catch {
      setListings(MOCK_COMMUNITY_LISTINGS);
    }
  }, []);

  // Filter listings
  const filtered = listings.filter((item) => {
    if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
    if (dietFilter !== 'all' && item.dietType !== dietFilter) return false;
    if (verifiedOnly && !item.donorVerified) return false;
    if (emergencyOnly && !item.isEmergency) return false;
    return true;
  });

  // Sort by ending soonest, then nearest (Decision D11)
  const sorted = sortListingsEndingSoonestThenNearest(filtered, ASANSOL_DEFAULT_COORDS);

  // Reveal contact RPC simulation (Decision D2 & BACKEND SCHEMA §8.3)
  const handleRevealContact = (listingId: string) => {
    if (!revealedContacts.includes(listingId)) {
      setRevealedContacts([...revealedContacts, listingId]);
    }
  };

  // 6-digit pickup code handover (Decision D5)
  const handleConfirmPickup = () => {
    if (!activeListing) return;
    if (pickupCodeInput.trim() !== activeListing.pickupCode) {
      setPickupError('Invalid 6-digit pickup code. Please confirm with the food donor.');
      return;
    }

    // Mark as claimed
    const updated = listings.map((item) => {
      if (item.id === activeListing.id) {
        return {
          ...item,
          status: 'claimed' as const,
          claimedAt: new Date().toISOString(),
          claimedBy: 'usr-current',
        };
      }
      return item;
    });

    setListings(updated);
    try {
      localStorage.setItem('kc-community-listings', JSON.stringify(updated));
    } catch {
      // fallback
    }

    setPickupSuccess(true);
    setPickupError('');
    setTimeout(() => {
      setActiveListing(null);
      setPickupSuccess(false);
      setPickupCodeInput('');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Folio Masthead */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--kc-moss)] gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Public Surplus Board · Gazette Rail</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)]">
            Available Food Directory
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Real-time surplus listings from households, caterers, and organisations. Sorted by ending soonest, then nearest (D11).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/en/emergency"
            className="px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[var(--kc-chilli)] text-white hover:opacity-90 rounded-sm flex items-center gap-1.5"
          >
            <KhabarIcon name="warning" size={14} />
            <span>Emergency NGOs</span>
          </Link>

          <Link
            href="/en/share/new"
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm"
          >
            + Post Food Surplus
          </Link>
        </div>
      </div>

      {/* Control Strip & Filters */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-4 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--kc-moss)]/40">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-[var(--kc-moss)] p-0.5 rounded-sm bg-white">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors rounded-sm ${
                viewMode === 'cards'
                  ? 'bg-[var(--kc-basil)] text-white font-bold'
                  : 'text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)]'
              }`}
            >
              Gazette Rail
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors rounded-sm ${
                viewMode === 'map'
                  ? 'bg-[var(--kc-basil)] text-white font-bold'
                  : 'text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)]'
              }`}
            >
              Interactive Map (D24)
            </button>
          </div>

          <div className="text-xs font-mono text-[var(--kc-moss)]">
            Showing {sorted.length} Listings · Hard Ceiling ≤ 48h (D3)
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Kind Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-[var(--kc-moss)] uppercase mr-1">Kind:</span>
            {(['all', 'donate', 'share', 'swap', 'event_surplus'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKindFilter(k)}
                className={`px-2 py-0.5 text-[11px] font-mono uppercase rounded-sm border ${
                  kindFilter === k
                    ? 'border-[var(--kc-basil)] bg-[var(--kc-basil)] text-white font-bold'
                    : 'border-[var(--kc-moss)] bg-white text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)]'
                }`}
              >
                {k === 'all' ? 'All' : k.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Diet Filter */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] font-mono text-[var(--kc-moss)] uppercase mr-1">Diet:</span>
            {(['all', 'veg', 'vegan', 'egg', 'non_veg'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDietFilter(d)}
                className={`px-2 py-0.5 text-[11px] font-mono uppercase rounded-sm border ${
                  dietFilter === d
                    ? 'border-[var(--kc-basil)] bg-[var(--kc-basil)] text-white font-bold'
                    : 'border-[var(--kc-moss)] bg-white text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)]'
                }`}
              >
                {d === 'all' ? 'All' : d === 'veg' ? 'Veg' : d === 'vegan' ? 'Vegan' : d === 'egg' ? 'Egg' : 'Non-Veg'}
              </button>
            ))}
          </div>

          {/* Toggles */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-2.5 py-0.5 text-[11px] font-mono uppercase rounded-sm border ${
              verifiedOnly
                ? 'border-[var(--kc-basil)] bg-[var(--kc-basil)] text-white font-bold'
                : 'border-[var(--kc-moss)] bg-white text-[var(--kc-charcoal)]'
            }`}
          >
            ✓ Verified Orgs Only (D9)
          </button>

          <button
            type="button"
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-2.5 py-0.5 text-[11px] font-mono uppercase rounded-sm border ${
              emergencyOnly
                ? 'border-[var(--kc-chilli)] bg-[var(--kc-chilli)] text-white font-bold'
                : 'border-[var(--kc-moss)] bg-white text-[var(--kc-charcoal)]'
            }`}
          >
            ★ Emergency Only (D12)
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <AvailableFoodMap listings={sorted} onSelectListing={(l) => setActiveListing(l)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((item) => {
            const hoursLeft = Math.max(
              0,
              Math.round((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60) * 10) / 10
            );
            const distKm = calculateDistanceKm(
              ASANSOL_DEFAULT_COORDS.lat,
              ASANSOL_DEFAULT_COORDS.lng,
              item.location.lat,
              item.location.lng
            );

            const isUrgent = hoursLeft <= 6;
            const isMedium = hoursLeft <= 24;

            return (
              <div
                key={item.id}
                className={`almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] flex flex-col justify-between overflow-hidden transition-shadow ${
                  item.status === 'claimed' ? 'opacity-60 bg-stone-100' : ''
                }`}
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-video bg-stone-200 overflow-hidden border-b border-[var(--kc-moss)]/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-black/75 text-white font-bold rounded-sm uppercase">
                        {item.kind.replace('_', ' ')}
                      </span>
                      {item.isEmergency && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--kc-chilli)] text-white font-bold rounded-sm">
                          EMERGENCY NGO
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-sm font-bold shadow-sm ${
                          isUrgent
                            ? 'bg-[var(--kc-chilli)] text-white animate-pulse'
                            : isMedium
                            ? 'bg-[var(--kc-mango)] text-[var(--kc-charcoal)]'
                            : 'bg-[var(--kc-basil)] text-white'
                        }`}
                      >
                        ⌛ {hoursLeft}h left
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase text-[var(--kc-moss)]">
                        {item.dietType === 'veg' ? '🟢 Veg' : item.dietType === 'vegan' ? '🌱 Vegan' : item.dietType === 'egg' ? '🟡 Egg' : '🔴 Non-Veg'} · {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-[var(--kc-moss)] font-bold">
                        ~{distKm} km away
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--kc-charcoal)] mb-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--kc-moss)] line-clamp-2 mb-4 font-sans leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-3 border-t border-[var(--kc-moss)]/30 flex items-center justify-between text-xs font-mono text-[var(--kc-charcoal)]">
                      <span className="font-bold">
                        {item.quantityValue} {item.quantityUnit}
                      </span>
                      {item.donorVerified ? (
                        <VerifiedBadge orgType={item.donorOrgType} size="sm" />
                      ) : (
                        <span className="text-[11px] text-[var(--kc-moss)]">Community Donor</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-[var(--kc-parchment)] border-t border-[var(--kc-moss)]/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--kc-moss)] truncate max-w-[140px]">
                    📍 {item.location.city} ({item.locationPrivacy})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveListing(item)}
                    className="px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm"
                  >
                    {item.status === 'claimed' ? 'Claimed ✓' : 'Inspect &amp; Request'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Handover & Contact Reveal Modal */}
      {activeListing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="almanac-card bg-[var(--kc-cream)] border-2 border-[var(--kc-basil)] max-w-2xl w-full p-6 sm:p-8 rounded-sm my-8 relative">
            <button
              type="button"
              onClick={() => {
                setActiveListing(null);
                setPickupError('');
                setPickupSuccess(false);
              }}
              className="absolute top-4 right-4 text-sm font-mono text-stone-500 hover:text-stone-900 border border-[var(--kc-moss)] px-2 py-0.5 bg-white"
            >
              ✕ Esc Close
            </button>

            {pickupSuccess ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 mx-auto mb-4 text-[var(--kc-basil)] flex items-center justify-center">
                  <KhabarIcon name="success" size={48} />
                </div>
                <h3 className="text-xl font-bold text-[var(--kc-charcoal)] mb-2">
                  Handover Successfully Confirmed!
                </h3>
                <p className="text-xs text-[var(--kc-moss)] font-sans max-w-md mx-auto">
                  6-digit pickup code verified. Food marked as rescued from waste in the community ledger. Thank you for closing the food cycle!
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono uppercase px-2 py-0.5 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] font-bold text-[var(--kc-charcoal)]">
                    {activeListing.kind.replace('_', ' ')} · {activeListing.dietType}
                  </span>
                  {activeListing.donorVerified && (
                    <VerifiedBadge orgType={activeListing.donorOrgType} size="md" />
                  )}
                  <span className="text-xs font-mono text-[var(--kc-chilli)] font-bold ml-auto">
                    Pickup Window Closes in {activeListing.windowHours}h
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-[var(--kc-charcoal)] mb-2">
                  {activeListing.title}
                </h2>
                <p className="text-xs text-[var(--kc-moss)] mb-6 font-sans leading-relaxed">
                  {activeListing.description}
                </p>

                {/* Photo Gallery Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  {activeListing.photos.map((url, i) => (
                    <div key={i} className="aspect-video bg-stone-200 border border-[var(--kc-moss)] overflow-hidden rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Inspection proof ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                {/* Location & Contact Section (D1 & D2) */}
                <div className="p-4 border border-[var(--kc-moss)] bg-white rounded-sm mb-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--kc-moss)] uppercase block">
                        Static Vicinity (D1: No GPS Tracking)
                      </span>
                      <span className="text-sm font-bold text-[var(--kc-charcoal)] block">
                        📍 {activeListing.location.addressText}, {activeListing.location.city}
                      </span>
                    </div>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${activeListing.location.lat}&mlon=${activeListing.location.lng}#map=16/${activeListing.location.lat}/${activeListing.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[var(--kc-basil)] underline hover:opacity-80"
                    >
                      External Map Link ↗
                    </a>
                  </div>

                  {/* Contact Reveal RPC (D2 & BACKEND SCHEMA §8.3) */}
                  <div className="pt-3 border-t border-[var(--kc-moss)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--kc-moss)] uppercase block">
                        Donor Contact Details (D2)
                      </span>
                      {revealedContacts.includes(activeListing.id) ? (
                        <span className="text-sm font-mono font-bold text-[var(--kc-charcoal)] block">
                          📞 {activeListing.donorPhone} ({activeListing.donorName})
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-stone-500 block">
                          🔒 Hidden under privacy rules · Logged-in session required
                        </span>
                      )}
                    </div>

                    {!revealedContacts.includes(activeListing.id) && (
                      <button
                        type="button"
                        onClick={() => handleRevealContact(activeListing.id)}
                        className="px-3 py-1.5 text-xs font-mono uppercase font-bold bg-[var(--kc-blueberry)] text-white hover:opacity-90 rounded-sm"
                      >
                        Reveal Pickup Contact (RPC)
                      </button>
                    )}
                  </div>
                </div>

                {/* 6-Digit Pickup Code Section (D5) */}
                <div className="p-4 border border-dashed border-[var(--kc-moss)] bg-[var(--kc-parchment)] rounded-sm mb-6">
                  <span className="text-xs font-mono uppercase font-bold text-[var(--kc-charcoal)] block mb-1">
                    Handover Protocol · 6-Digit Pickup Code (D5)
                  </span>
                  <p className="text-[11px] text-[var(--kc-moss)] font-sans mb-3">
                    The donor holds code: <strong className="font-mono bg-white px-1.5 py-0.5 border border-stone-300">{activeListing.pickupCode}</strong>. Enter code below upon collection to record handover.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={pickupCodeInput}
                      onChange={(e) => setPickupCodeInput(e.target.value)}
                      className="px-3 py-1.5 text-sm font-mono tracking-widest border border-[var(--kc-moss)] bg-white rounded-sm w-44"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmPickup}
                      className="px-4 py-1.5 text-xs font-mono uppercase font-bold bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm"
                    >
                      Confirm Handover
                    </button>
                  </div>

                  {pickupError && (
                    <span className="text-xs font-mono text-[var(--kc-chilli)] block mt-2">{pickupError}</span>
                  )}
                </div>

                {/* Statutory Food Safety Disclaimer */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 text-[11px] font-sans text-amber-900 rounded-sm">
                  <strong>Food Safety Notice:</strong> You decide whether the food is safe to accept. Khabar Chakra does not inspect or guarantee food safety. Check appearance and temperature upon handover.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
