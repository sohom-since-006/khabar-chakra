'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface VerifyEmailPageProps {
  params: Promise<{ locale: string }>;
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const [locale, setLocale] = useState('en');
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cooldown > 0) return;

    const supabase = createClient();
    try {
      await supabase.auth.resend({
        type: 'signup',
        email,
      });
      setMsg('A fresh verification link has been dispatched if this email is on record.');
      setCooldown(60);
    } catch {
      setMsg('Could not resend email at this moment. Please try again shortly.');
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="almanac-ticket p-8 border border-[var(--kc-hairline)] bg-[var(--kc-card)] rounded-sm space-y-5 text-center">
        <div className="w-12 h-12 bg-[var(--kc-mint)] text-[var(--kc-basil)] rounded-sm flex items-center justify-center mx-auto">
          <KhabarIcon name="warning" size={24} />
        </div>

        <span className="almanac-stamp">VERIFICATION REQUIRED</span>
        <h1 className="text-2xl font-bold text-[var(--kc-ink)]">Verify Your Email</h1>
        
        <p className="text-sm text-[var(--kc-muted)] leading-relaxed">
          To maintain security and prevent spam in our food-sharing network, please check your inbox and click the activation link.
        </p>

        {msg && (
          <div className="p-2.5 bg-[var(--kc-mint)] text-[var(--kc-basil)] text-xs rounded-sm border border-[var(--kc-hairline)]">
            {msg}
          </div>
        )}

        <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
          <label className="block text-xs font-mono uppercase text-[var(--kc-muted)]">
            Didn&apos;t receive it? Enter your email:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-sm focus:outline-none focus:border-[var(--kc-basil)]"
          />
          <button
            type="submit"
            disabled={cooldown > 0}
            className="w-full py-2 bg-[var(--kc-card)] border border-[var(--kc-hairline)] text-xs font-semibold rounded-sm hover:bg-[var(--kc-mint)] disabled:opacity-50 transition-colors"
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Link'}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--kc-hairline)] text-xs">
          <Link href={`/${locale}/login`} className="text-[var(--kc-basil)] hover:underline font-medium">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
