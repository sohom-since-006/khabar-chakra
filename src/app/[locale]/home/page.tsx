import React from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Masthead strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--kc-moss)] gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Inventory & Freshness Ledger</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)]">
            My Kitchen Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/en/available"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)] transition-colors"
          >
            Browse Available Food
          </Link>
          <Link
            href="/en/settings"
            className="p-2 border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] transition-colors"
            title="Settings"
            aria-label="Ledger Preferences"
          >
            <KhabarIcon name="sliders" className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Shelf Ledger Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 2 Cols: The Ledger Shelf */}
        <div className="lg:col-span-2 space-y-6">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 text-center relative overflow-hidden">
            <div className="max-w-md mx-auto py-8">
              <div className="w-16 h-16 mx-auto mb-4 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex items-center justify-center">
                <KhabarIcon name="track" className="w-8 h-8 text-[var(--kc-basil)]" />
              </div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-[var(--kc-mango)]/20 border border-[var(--kc-mango)] text-[var(--kc-charcoal)] mb-3">
                Phase 2 In Development
              </span>
              <h2 className="text-xl font-bold text-[var(--kc-charcoal)] mb-2">
                Your Kitchen Ledger is coming soon
              </h2>
              <p className="text-sm text-[var(--kc-moss)] leading-relaxed mb-6 font-sans">
                We are building real-time barcode scanning, OCR packet detection, freshness countdown bands, and smart surplus sharing step by step.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/en/help"
                  className="px-5 py-2 text-xs font-bold bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  Read How It Works →
                </Link>
                <Link
                  href="/en/faq"
                  className="px-5 py-2 text-xs font-bold border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)] transition-colors"
                >
                  Consult FAQ
                </Link>
              </div>
            </div>

            {/* Faux ledger ruled lines background accent */}
            <div className="pt-6 border-t border-[var(--kc-moss)] text-left">
              <div className="flex justify-between text-xs font-mono text-[var(--kc-moss)] border-b border-[var(--kc-moss)]/50 pb-2 mb-2">
                <span>ITEM LOG ENTRY</span>
                <span>STATUS BAND</span>
                <span>HOURS REMAINING</span>
              </div>
              <div className="py-2.5 border-b border-dashed border-[var(--kc-moss)]/40 text-xs font-mono text-[var(--kc-moss)]/60 flex justify-between">
                <span>[Shelf slot 01 — Awaiting Phase 2 Scanner]</span>
                <span>—</span>
                <span>—</span>
              </div>
              <div className="py-2.5 border-b border-dashed border-[var(--kc-moss)]/40 text-xs font-mono text-[var(--kc-moss)]/60 flex justify-between">
                <span>[Shelf slot 02 — Awaiting Phase 2 Scanner]</span>
                <span>—</span>
                <span>—</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Ledger Almanac Notes */}
        <div className="space-y-6">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] border-b border-[var(--kc-moss)] pb-2 mb-4">
              Community Food Safety Rule (D4/D8)
            </h3>
            <p className="text-xs text-[var(--kc-charcoal)] leading-relaxed mb-4">
              <strong className="font-semibold text-[var(--kc-basil)]">Strict Zero Meat/Fish/Egg Sharing:</strong> Raw meat, fish, and eggs may only be tracked in private inventory, never shared or donated publicly.
            </p>
            <p className="text-xs text-[var(--kc-charcoal)] leading-relaxed">
              <strong className="font-semibold text-[var(--kc-chilli)]">Recipient Decides:</strong> Khabar Chakra never certifies food as safe. Recipients inspect all handovers prior to consumption.
            </p>
          </div>

          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] border-b border-[var(--kc-moss)] pb-2 mb-3">
              Need Assistance?
            </h3>
            <p className="text-xs text-[var(--kc-moss)] mb-4">
              Have questions regarding verification, event surplus coordination, or privacy?
            </p>
            <Link
              href="/en/contact"
              className="block w-full py-2 text-center text-xs font-bold uppercase tracking-wider border border-[var(--kc-moss)] bg-[var(--kc-parchment)] hover:bg-[var(--kc-cream)] text-[var(--kc-charcoal)] transition-colors"
            >
              Contact Admin Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
