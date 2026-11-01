'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface SignupPageProps {
  params: Promise<{ locale: string }>;
}

export default function SignupPage({ params }: SignupPageProps) {
  const [locale, setLocale] = useState('en');
  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType] = useState<'member' | 'caterer' | 'ngo'>('member');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (fullName.trim().length < 2 || fullName.trim().length > 60) {
      setErrorMsg('Full name must be between 2 and 60 characters.');
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setErrorMsg('Password must be between 8 and 128 characters.');
      return;
    }
    if (!isAgeConfirmed) {
      setErrorMsg('You must confirm that you are 18 years of age or older.');
      return;
    }
    if (!isTermsAccepted) {
      setErrorMsg('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      let origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (!origin || (origin.includes('localhost') && process.env.NODE_ENV === 'production')) {
        origin = 'https://khabar-chakra.vercel.app';
      }
      const emailRedirectTo = `${origin.replace(/\/$/, '')}/${locale}/welcome`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
            age_18_confirmed_at: new Date().toISOString(),
          },
          emailRedirectTo,
        },
      });

      if (error) {
        // Show generic friendly error or rate limit message without leaking user existence
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMsg('An unexpected error occurred during submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16">
        <div className="almanac-ticket p-8 border border-[var(--kc-hairline)] bg-[var(--kc-card)] text-center space-y-4">
          <div className="w-12 h-12 bg-[var(--kc-mint)] text-[var(--kc-basil)] rounded-sm flex items-center justify-center mx-auto">
            <KhabarIcon name="message" size={24} />
          </div>
          <span className="almanac-stamp">DISPATCH ISSUED</span>
          <h1 className="text-2xl font-bold text-[var(--kc-ink)]">Check Your Mailbox</h1>
          <p className="text-sm text-[var(--kc-muted)] leading-relaxed">
            We have sent a verification link to <strong className="text-[var(--kc-ink)]">{email}</strong>. Please follow the link to activate your kitchen ledger.
          </p>
          <div className="pt-4 border-t border-[var(--kc-hairline)] text-xs text-[var(--kc-muted)]">
            Local testing? Verification emails appear in your configured mailbox.
          </div>
          <Link
            href={`/${locale}/login`}
            className="inline-block mt-4 text-xs font-semibold text-[var(--kc-basil)] hover:underline"
          >
            ← Proceed to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Typographic Poster Column */}
        <div className="md:col-span-5 space-y-4">
          <span className="font-mono text-[11px] font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase block">
            REGISTRATION · FORM 101
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--kc-ink)] tracking-tight font-heading">
            Open Your Kitchen Ledger
          </h1>
          <p className="font-heading text-xs sm:text-sm text-[var(--kc-muted)] leading-relaxed">
            Join thousands of domestic kitchens saving money and eliminating food waste with smart freshness tracking and instant receipt OCR.
          </p>
        </div>

        {/* Right Numbered Form Column */}
        <div className="md:col-span-7 border border-black/[0.08] dark:border-white/[0.1] glass-card p-6 sm:p-8 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900 text-[#D6381F] text-xs rounded-2xl font-heading">
                {errorMsg}
              </div>
            )}

            {/* 1. Name */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1.5 font-semibold">
                1. Full Name (2–60 characters)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                className="w-full px-4 py-3 text-sm border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] rounded-2xl focus:outline-none focus:border-emerald-600 transition-colors font-heading text-[var(--kc-ink)]"
              />
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1.5 font-semibold">
                2. Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 text-sm border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] rounded-2xl focus:outline-none focus:border-emerald-600 transition-colors font-heading text-[var(--kc-ink)]"
              />
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1.5 font-semibold">
                3. Password (minimum 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.01] dark:bg-white/[0.02] rounded-2xl focus:outline-none focus:border-emerald-600 transition-colors font-heading text-[var(--kc-ink)]"
              />
            </div>

            {/* 4. Age & Terms Checkboxes */}
            <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-heading text-[var(--kc-muted)]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isAgeConfirmed}
                  onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                  className="mt-0.5 accent-emerald-700"
                />
                <span>I confirm that I am <strong>18 years of age or older</strong>.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-emerald-700"
                />
                <span>
                  I accept the{' '}
                  <Link href={`/${locale}/legal/terms`} target="_blank" className="text-emerald-700 dark:text-emerald-400 underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href={`/${locale}/legal/privacy`} target="_blank" className="text-emerald-700 dark:text-emerald-400 underline font-medium">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-800 text-white text-sm font-heading font-bold rounded-full hover:bg-emerald-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {loading ? 'Registering Ledger...' : 'Complete Ledger Registration'}
            </button>

            <div className="text-center text-xs text-[var(--kc-muted)] pt-2 font-heading">
              Already registered?{' '}
              <Link href={`/${locale}/login`} className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
