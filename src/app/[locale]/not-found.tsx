import React from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-8 sm:p-12 max-w-lg w-full text-center shadow-xl rounded-2xl relative overflow-hidden transition-all">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--kc-basil)]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--kc-basil)] bg-[var(--kc-mint)] flex items-center justify-center font-mono font-extrabold text-2xl text-[var(--kc-basil)] shadow-inner">
          404
        </div>

        <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--kc-basil)] uppercase block">
          DOMESTIC SHELF · NOT FOUND
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--kc-ink)] mt-2 mb-3 tracking-tight font-montserrat">
          This Shelf Is Empty
        </h1>

        <p className="text-sm text-[var(--kc-muted)] mb-8 font-sans leading-relaxed max-w-sm mx-auto">
          The requested page may have expired, moved to another pantry zone, or does not exist in
          Khabar Chakra.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/en/home"
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] rounded-xl shadow-md transition-all active:scale-95"
          >
            Kitchen Dashboard →
          </Link>
          <Link
            href="/en/inventory/add"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:bg-neutral-100 dark:hover:bg-[#132A20] rounded-xl transition-colors"
          >
            + Add Food
          </Link>
        </div>
      </div>
    </main>
  );
}
