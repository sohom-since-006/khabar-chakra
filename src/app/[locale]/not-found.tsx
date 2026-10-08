import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 md:p-12 max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-4 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex items-center justify-center font-mono font-bold text-2xl text-[var(--kc-chilli)]">
          404
        </div>
        <span className="font-annotation text-[var(--kc-basil)] text-lg">Empty Shelf · Ledger Page Not Found</span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-2 mb-3">
          This dispatch could not be found.
        </h1>
        <p className="text-sm text-[var(--kc-moss)] mb-8 font-sans leading-relaxed">
          The requested page may have expired, moved to another shelf, or does not exist in the Kitchen Almanac.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/en"
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
          >
            Return to Front Page
          </Link>
          <Link
            href="/en/help"
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)] transition-colors"
          >
            Consult Handbook
          </Link>
        </div>
      </div>
    </div>
  );
}
