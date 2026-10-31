'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log safe error metadata without PII
    console.error('Handled application error boundary:', error.message);
  }, [error]);

  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-chilli)]/60 p-8 sm:p-12 max-w-xl w-full text-center shadow-xl rounded-2xl relative overflow-hidden transition-all">
        {/* Decorative subtle botanical background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--kc-basil)]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[var(--kc-mango)]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--kc-chilli)] bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[var(--kc-chilli)] shadow-inner">
          <KhabarIcon name="warning" size={28} />
        </div>

        <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--kc-chilli)] uppercase block">
          DOMESTIC LEDGER · TEMPORARY INTERRUPT
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--kc-ink)] mt-2 mb-3 tracking-tight font-montserrat">
          A Slight Hiccup in the Kitchen
        </h1>

        <p className="text-sm text-[var(--kc-muted)] mb-6 font-sans leading-relaxed max-w-md mx-auto">
          An unexpected interruption occurred while syncing your pantry inventory. Rest assured, your
          freshness tracking and zero-waste savings records remain intact.
        </p>

        {/* Interactive Error Details Accordion */}
        <div className="mb-6 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-left text-xs font-mono py-2 px-3 bg-neutral-100 dark:bg-[#132A20] border border-[var(--kc-hairline)] rounded-lg flex items-center justify-between text-[var(--kc-muted)] hover:text-[var(--kc-ink)] transition-colors"
          >
            <span>Incident Technical Diagnostics</span>
            <span className="text-[10px]">{showDetails ? '▲ Hide' : '▼ Expand'}</span>
          </button>

          {showDetails && (
            <div className="mt-2 p-3 bg-neutral-50 dark:bg-[#071F17] border border-[var(--kc-hairline)] rounded-lg text-xs font-mono text-[var(--kc-muted)] space-y-1.5 animate-fade-in break-words">
              {error.digest && (
                <div>
                  <span className="text-[var(--kc-basil)] font-semibold">Digest:</span> {error.digest}
                </div>
              )}
              {error.message && (
                <div>
                  <span className="text-[var(--kc-chilli)] font-semibold">Message:</span>{' '}
                  {error.message}
                </div>
              )}
              <div className="text-[10px] opacity-75">
                Timestamp: {new Date().toISOString()}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] rounded-xl shadow-md transition-all active:scale-95"
          >
            Try Again ↻
          </button>
          <Link
            href="/en/home"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:bg-neutral-100 dark:hover:bg-[#132A20] rounded-xl transition-colors"
          >
            Kitchen Dashboard →
          </Link>
          <Link
            href="/en/contact"
            className="px-4 py-2.5 text-xs font-mono text-[var(--kc-muted)] hover:text-[var(--kc-basil)] underline transition-colors"
          >
            Contact S-QUAD
          </Link>
        </div>
      </div>
    </main>
  );
}
