'use client';

import React, { useState } from 'react';
import { Listing, ASANSOL_DEFAULT_COORDS } from '@/domain/listings';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface AvailableFoodMapProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export function AvailableFoodMap({ listings, onSelectListing }: AvailableFoodMapProps) {
  const [selectedPin, setSelectedPin] = useState<Listing | null>(null);

  // Map center bounds roughly around Asansol, Raniganj, Burnpur (West Bengal)
  // Lat: ~23.55 to 23.75, Lng: ~86.90 to 87.15
  const minLat = 23.58;
  const maxLat = 23.74;
  const minLng = 86.90;
  const maxLng = 87.18;

  // Project lat/lng to percentage within SVG bounding box
  const projectCoords = (lat: number, lng: number) => {
    const x = Math.min(95, Math.max(5, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Invert Y because latitude goes north (up) but SVG coordinates go down
    const y = Math.min(95, Math.max(5, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  return (
    <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-4 relative overflow-hidden">
      {/* Folio Map Masthead */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[var(--kc-moss)]/40 text-xs font-mono">
        <div className="flex items-center gap-2 text-[var(--kc-charcoal)]">
          <KhabarIcon name="map" size={16} />
          <span className="font-bold">ASANSOL INDUSTRIAL CORRIDOR · STATIC RADAR MAP</span>
        </div>
        <div className="text-[var(--kc-moss)]">
          Centre: {ASANSOL_DEFAULT_COORDS.lat}°N, {ASANSOL_DEFAULT_COORDS.lng}°E (Decision D24)
        </div>
      </div>

      {/* Cartographic Canvas */}
      <div className="relative w-full h-[420px] bg-[#eef3ea] border border-[var(--kc-moss)] rounded-sm overflow-hidden select-none">
        {/* Subtle grid lines mimicking vintage surveyor map */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0b6e3c 1px, transparent 1px), linear-gradient(to bottom, #0b6e3c 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Major landmark labels */}
        <div className="absolute top-[35%] left-[25%] text-[10px] font-mono text-[var(--kc-moss)] uppercase tracking-wider opacity-60 pointer-events-none">
          Burnpur Riverside
        </div>
        <div className="absolute top-[28%] left-[45%] text-[11px] font-mono text-[var(--kc-charcoal)] font-bold uppercase tracking-wider opacity-70 pointer-events-none">
          ★ Asansol Central Junction
        </div>
        <div className="absolute bottom-[25%] right-[22%] text-[10px] font-mono text-[var(--kc-moss)] uppercase tracking-wider opacity-60 pointer-events-none">
          Raniganj Industrial Belt
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 border border-[var(--kc-moss)] text-[9px] font-mono text-[var(--kc-moss)] z-10">
          OpenStreetMap Cartography Baseline · Static Pins (D1)
        </div>

        {/* Listing Pins */}
        {listings.map((item) => {
          const { x, y } = projectCoords(item.location.lat, item.location.lng);
          const isSelected = selectedPin?.id === item.id;
          const isUrgent = new Date(item.expiresAt).getTime() - Date.now() < 6 * 60 * 60 * 1000;

          return (
            <div
              key={item.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onClick={() => setSelectedPin(item)}
            >
              <div
                className={`p-1.5 rounded-sm border transition-transform ${
                  isSelected
                    ? 'scale-125 ring-2 ring-[var(--kc-basil)] z-30'
                    : 'hover:scale-110'
                } ${
                  item.isEmergency
                    ? 'bg-[var(--kc-chilli)] text-white border-white'
                    : isUrgent
                    ? 'bg-[var(--kc-mango)] text-[var(--kc-charcoal)] border-[var(--kc-charcoal)]'
                    : 'bg-[var(--kc-basil)] text-white border-white'
                }`}
                title={item.title}
              >
                <KhabarIcon name={item.isEmergency ? 'warning' : 'meal'} size={14} />
              </div>

              {/* Pin tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap px-2 py-1 bg-[var(--kc-charcoal)] text-white text-[10px] font-mono rounded-sm pointer-events-none z-40">
                {item.title} ({item.quantityValue} {item.quantityUnit})
              </div>
            </div>
          );
        })}

        {/* Selected Pin Popover Sheet */}
        {selectedPin && (
          <div className="absolute bottom-4 right-4 max-w-sm w-full bg-white border-2 border-[var(--kc-basil)] p-4 shadow-sm z-30 rounded-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] text-[var(--kc-charcoal)] font-bold">
                {selectedPin.kind.replace('_', ' ')} · {selectedPin.dietType}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="text-stone-400 hover:text-stone-800 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <h4 className="text-sm font-bold text-[var(--kc-charcoal)] mb-1">
              {selectedPin.title}
            </h4>
            <p className="text-xs text-[var(--kc-moss)] mb-2 line-clamp-2">
              {selectedPin.description}
            </p>

            <div className="text-[11px] font-mono text-[var(--kc-charcoal)] mb-3 flex items-center justify-between">
              <span>Qty: {selectedPin.quantityValue} {selectedPin.quantityUnit}</span>
              {selectedPin.donorVerified && (
                <VerifiedBadge orgType={selectedPin.donorOrgType} size="sm" />
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSelectListing(selectedPin)}
                className="flex-1 py-1.5 bg-[var(--kc-basil)] text-white text-xs font-mono font-bold uppercase rounded-sm hover:opacity-90"
              >
                Inspect Listing &rarr;
              </button>
              <a
                href={`https://www.openstreetmap.org/?mlat=${selectedPin.location.lat}&mlon=${selectedPin.location.lng}#map=16/${selectedPin.location.lat}/${selectedPin.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1.5 border border-[var(--kc-moss)] text-xs font-mono hover:bg-[var(--kc-parchment)]"
                title="External Directions (D24)"
              >
                Map ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
