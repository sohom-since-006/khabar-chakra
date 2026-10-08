'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe error metadata without PII
    console.error('Handled application error boundary:', error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-chilli)] p-8 md:p-12 max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 border border-[var(--kc-chilli)] bg-red-50 flex items-center justify-center font-mono font-bold text-2xl text-[var(--kc-chilli)]">
          !
        </div>
        <span className="font-annotation text-[var(--kc-chilli)] text-lg">System Interruption</span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-2 mb-2">
          Something went wrong.
        </h1>
        <p className="text-sm text-[var(--kc-moss)] mb-4 font-sans leading-relaxed">
          An unexpected error occurred while reading from or writing to the kitchen ledger.
        </p>

        {error.digest && (
          <div className="p-2 mb-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[11px] font-mono text-[var(--kc-moss)]">
            Reference Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/en/contact"
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)] transition-colors"
          >
            Report Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
