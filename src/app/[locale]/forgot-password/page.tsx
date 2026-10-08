'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const [locale, setLocale] = useState('en');
  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });
      setSent(true);
    } catch {
      // Generic success notice to avoid leaking user accounts
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="almanac-ticket p-6 sm:p-8 border border-[var(--kc-hairline)] bg-[var(--kc-card)] rounded-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[var(--kc-hairline)] pb-3">
          <KhabarIcon name="locked" size={20} className="text-[var(--kc-muted)]" />
          <h1 className="text-xl font-bold text-[var(--kc-ink)]">Reset Ledger Password</h1>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <span className="almanac-stamp">DISPATCH ISSUED</span>
            <p className="text-sm text-[var(--kc-muted)] leading-relaxed">
              If an account with that email exists, password reset instructions have been sent. Please inspect your inbox.
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-block text-xs font-semibold text-[var(--kc-basil)] hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-xs text-[var(--kc-muted)]">
              Enter your registered email address to receive a secure password recovery link.
            </p>
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-sm focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--kc-basil)] text-white text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Transmitting...' : 'Send Recovery Dispatch'}
            </button>
            <div className="text-center pt-2">
              <Link href={`/${locale}/login`} className="text-xs text-[var(--kc-muted)] hover:underline">
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
