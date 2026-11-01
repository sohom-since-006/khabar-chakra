import React from 'react';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="glass-card bg-[var(--kc-card)] border border-black/[0.08] dark:border-white/[0.1] p-8 sm:p-12 max-w-lg w-full text-center shadow-xl rounded-3xl relative overflow-hidden transition-all">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center font-mono font-extrabold text-2xl text-emerald-800 dark:text-emerald-300 shadow-inner">
          404
        </div>

        <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase block">
          DOMESTIC SHELF · NOT FOUND
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--kc-ink)] mt-2 mb-3 tracking-tight font-heading">
          This Shelf Is Empty
        </h1>

        <p className="text-sm text-[var(--kc-muted)] mb-8 font-heading leading-relaxed max-w-sm mx-auto">
          The requested page may have expired, moved to another pantry zone, or does not exist in
          Khabar Chakra.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/en/home"
            className="px-6 py-3 text-xs font-heading font-bold uppercase tracking-wider bg-emerald-800 text-white hover:bg-emerald-900 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Kitchen Dashboard →
          </Link>
          <Link
            href="/en/inventory/add"
            className="px-6 py-3 text-xs font-heading font-bold uppercase tracking-wider border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] text-[var(--kc-ink)] hover:bg-black/[0.05] rounded-full transition-colors"
          >
            + Add Food
          </Link>
        </div>
      </div>
    </main>
  );
}
