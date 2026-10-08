import React from 'react';
import Link from 'next/link';

export default function AvailablePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--kc-moss)] gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Public Classifieds & Surplus Board</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)]">
            Available Food Feed
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/en/faq"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)] transition-colors"
          >
            How Sharing Works (FAQ)
          </Link>
        </div>
      </div>

      {/* Hero Notice Slip */}
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 mb-10 text-center relative">
        <div className="max-w-2xl mx-auto py-6">
          <span className="inline-block px-3 py-1 text-xs font-mono uppercase tracking-widest bg-[var(--kc-mango)]/25 border border-[var(--kc-mango)] text-[var(--kc-charcoal)] mb-4">
            Phase 4 Surplus Rail — In Preparation
          </span>
          <h2 className="text-2xl font-bold text-[var(--kc-charcoal)] mb-3">
            Available Food sharing is launching in Phase 4
          </h2>
          <p className="text-sm text-[var(--kc-moss)] leading-relaxed mb-6">
            Soon, surplus meals from homes, weddings, caterers, and food banks will appear here in real time. Items will be ordered by <strong>Ending Soonest</strong>, then <strong>Nearest</strong> within a strict 48-hour availability window.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/en/signup"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
            >
              Register Early as Donor or Organisation →
            </Link>
          </div>
        </div>
      </div>

      {/* Classifieds Rail Mock Preview (Kitchen Almanac Classifieds Style) */}
      <div className="mb-10">
        <div className="flex items-center justify-between border-b border-[var(--kc-moss)] pb-2 mb-6">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--kc-moss)]">
            Preview of Upcoming Classifieds Format
          </h3>
          <span className="text-xs font-annotation text-[var(--kc-basil)]">Sample Ledger Listings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample 1 */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-5 opacity-75">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] text-[var(--kc-moss)]">
                DONATION · ASANSOL
              </span>
              <span className="text-[11px] font-mono text-[var(--kc-chilli)] font-bold">
                ⌛ 4h left
              </span>
            </div>
            <h4 className="text-base font-bold text-[var(--kc-charcoal)] mb-1">
              Fresh Khichuri & Begun Bhaja
            </h4>
            <p className="text-xs text-[var(--kc-moss)] mb-4">
              Prepared for afternoon gathering. ~15 servings packaged in hygienic foil boxes.
            </p>
            <div className="text-[11px] font-mono border-t border-[var(--kc-moss)] pt-2 flex justify-between text-[var(--kc-moss)]">
              <span>Verified Kitchen</span>
              <span>Pickup Code Req.</span>
            </div>
          </div>

          {/* Sample 2 */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-5 opacity-75">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] text-[var(--kc-moss)]">
                EVENT SURPLUS · USHAGRAM
              </span>
              <span className="text-[11px] font-mono text-[var(--kc-mango)] font-bold">
                ⌛ 8h left
              </span>
            </div>
            <h4 className="text-base font-bold text-[var(--kc-charcoal)] mb-1">
              Wedding Banquet Leftovers (Veg)
            </h4>
            <p className="text-xs text-[var(--kc-moss)] mb-4">
              Paneer Butter Masala & Naan, kept in temperature-safe chafing trays.
            </p>
            <div className="text-[11px] font-mono border-t border-[var(--kc-moss)] pt-2 flex justify-between text-[var(--kc-moss)]">
              <span>NGO Distribution Only</span>
              <span>Bulk Transmit</span>
            </div>
          </div>

          {/* Sample 3 */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-5 opacity-75">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[var(--kc-parchment)] border border-[var(--kc-moss)] text-[var(--kc-moss)]">
                PANTRY SHARE · COURT AREA
              </span>
              <span className="text-[11px] font-mono text-[var(--kc-basil)] font-bold">
                ⌛ 24h left
              </span>
            </div>
            <h4 className="text-base font-bold text-[var(--kc-charcoal)] mb-1">
              Surplus Garden Guavas & Bananas
            </h4>
            <p className="text-xs text-[var(--kc-moss)] mb-4">
              Unbroken, home-grown fresh seasonal harvest. Approx 4 kg total.
            </p>
            <div className="text-[11px] font-mono border-t border-[var(--kc-moss)] pt-2 flex justify-between text-[var(--kc-moss)]">
              <span>Neighbourhood Share</span>
              <span>Static Pin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-xs text-[var(--kc-charcoal)]">
        <strong className="font-bold text-[var(--kc-basil)]">Binding Safety Protocol (D4 & D8):</strong> All listings require 1–4 original photos stripped of EXIF data on the device. Raw meat, fish, and eggs are strictly prohibited from public listings. Khabar Chakra never certifies food safety; the recipient inspects and decides.
      </div>
    </div>
  );
}
