'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Listing, ASANSOL_DEFAULT_COORDS } from '@/domain/listings';
import { KhabarIcon } from '@/components/ui/KhabarIcon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface AvailableFoodMapProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export function AvailableFoodMap({ listings, onSelectListing }: AvailableFoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPin, setSelectedPin] = useState<Listing | null>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  useEffect(() => {
    let mapInstance: import('leaflet').Map | null = null;
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Ensure container isn't already initialized
        if ((mapContainerRef.current as { _leaflet_id?: number })._leaflet_id) {
          return;
        }

        // Initialize Leaflet map centered at Asansol (D24)
        mapInstance = L.map(mapContainerRef.current, {
          center: [ASANSOL_DEFAULT_COORDS.lat, ASANSOL_DEFAULT_COORDS.lng],
          zoom: 12,
          minZoom: 9,
          maxZoom: 18,
          scrollWheelZoom: false, // Prevent page trap
        });

        // Use MapTiler tile URL if provided, with OpenStreetMap fallback
        const tileUrl =
          process.env.NEXT_PUBLIC_MAP_TILE_URL ||
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

        const attribution = tileUrl.includes('maptiler')
          ? '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

        L.tileLayer(tileUrl, {
          attribution,
          maxZoom: 19,
          tileSize: 512,
          zoomOffset: -1,
        }).addTo(mapInstance);

        // Add static listing pins (Decision D1: static pins only, no live tracking)
        listings.forEach((item) => {
          const isUrgent =
            new Date(item.expiresAt).getTime() - Date.now() < 6 * 60 * 60 * 1000;
          const bgClass = item.isEmergency
            ? '#D6381F'
            : isUrgent
            ? '#FFC93C'
            : '#0B6E3C';
          const textClass = isUrgent && !item.isEmergency ? '#072A26' : '#FFFFFF';

          const markerHtml = `
            <div style="
              width: 28px;
              height: 28px;
              background-color: ${bgClass};
              color: ${textClass};
              border: 1.5px solid #FFFFFF;
              border-radius: 3px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
              cursor: pointer;
              font-family: monospace;
              font-size: 11px;
              font-weight: bold;
            ">
              ${item.isEmergency ? '!' : '✦'}
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: 'almanac-map-pin',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([item.location.lat, item.location.lng], {
            icon: customIcon,
          }).addTo(mapInstance!);

          marker.on('click', () => {
            setSelectedPin(item);
          });
        });

        setIsLeafletReady(true);
      } catch (err) {
        console.warn('Leaflet initialization fallback to surveyor radar:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [listings]);

  // Fallback surveyor grid coordinates if Leaflet is not yet ready
  const minLat = 23.58;
  const maxLat = 23.74;
  const minLng = 86.9;
  const maxLng = 87.18;

  const projectCoords = (lat: number, lng: number) => {
    const x = Math.min(95, Math.max(5, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.min(95, Math.max(5, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  return (
    <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-hairline)] p-4 relative overflow-hidden">
      {/* Folio Map Masthead */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 almanac-rule text-xs font-mono">
        <div className="flex items-center gap-2 text-[var(--kc-ink)]">
          <KhabarIcon name="map" size={16} />
          <span className="font-bold">ASANSOL INDUSTRIAL CORRIDOR · CARTOGRAPHIC RADAR</span>
        </div>
        <div className="text-[var(--kc-muted)]">
          Centre: {ASANSOL_DEFAULT_COORDS.lat}°N, {ASANSOL_DEFAULT_COORDS.lng}°E (D24 · Static Pins D1)
        </div>
      </div>

      {/* Cartographic Canvas */}
      <div className="relative w-full h-[440px] bg-[#EEF3EA] border border-[var(--kc-hairline)] rounded-sm overflow-hidden select-none">
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-10 w-full h-full" />

        {/* Surveyor Radar Fallback (rendered if Leaflet is mounting or unavailable) */}
        {!isLeafletReady && (
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #0b6e3c 1px, transparent 1px), linear-gradient(to bottom, #0b6e3c 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {listings.map((item) => {
              const { x, y } = projectCoords(item.location.lat, item.location.lng);
              return (
                <div
                  key={item.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                  onClick={() => setSelectedPin(item)}
                >
                  <div className="p-1.5 rounded-sm border bg-[var(--kc-basil)] text-white text-[11px] font-mono">
                    ✦
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Pin Popover Sheet */}
        {selectedPin && (
          <div className="absolute bottom-4 right-4 max-w-sm w-full bg-[var(--kc-card)] border-2 border-[var(--kc-basil)] p-4 shadow-sm z-30 rounded-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[var(--kc-mint)] border border-[var(--kc-hairline)] text-[var(--kc-ink)] font-bold">
                {selectedPin.kind.replace('_', ' ')} · {selectedPin.dietType}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="text-[var(--kc-muted)] hover:text-[var(--kc-ink)] text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <h4 className="text-sm font-bold text-[var(--kc-ink)] mb-1">
              {selectedPin.title}
            </h4>
            <p className="text-xs text-[var(--kc-muted)] mb-2 line-clamp-2">
              {selectedPin.description}
            </p>

            <div className="text-[11px] font-mono text-[var(--kc-ink)] mb-3 flex items-center justify-between">
              <span>Qty: {selectedPin.quantityValue} {selectedPin.quantityUnit}</span>
              {selectedPin.donorVerified && (
                <VerifiedBadge orgType={selectedPin.donorOrgType} size="sm" />
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSelectListing(selectedPin)}
                className="flex-1 py-1.5 bg-[var(--kc-basil)] text-white text-xs font-mono font-bold uppercase rounded-sm hover:opacity-90 transition-opacity"
              >
                Inspect Listing &rarr;
              </button>
              <a
                href={`https://www.openstreetmap.org/?mlat=${selectedPin.location.lat}&mlon=${selectedPin.location.lng}#map=16/${selectedPin.location.lat}/${selectedPin.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1.5 border border-[var(--kc-hairline)] text-xs font-mono hover:bg-[var(--kc-mint)] text-[var(--kc-ink)]"
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
