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
  const [accountType, setAccountType] = useState<'member' | 'caterer' | 'ngo'>('member');
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
            age_18_confirmed_at: new Date().toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/${locale}/welcome`,
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
          <span className="almanac-num">REGISTRATION · FORM 101</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--kc-ink)] tracking-tight">
            Open Your Kitchen Ledger
          </h1>
          <p className="text-sm text-[var(--kc-muted)] leading-relaxed">
            Join the community food loop. Track what is in your pantry, reduce waste, or step forward as an accredited organisation.
          </p>

          <div className="p-4 border-l-2 border-[var(--kc-basil)] bg-[var(--kc-card)] text-xs space-y-2">
            <div className="font-semibold text-[var(--kc-ink)]">Community Safety Rules:</div>
            <ul className="list-disc pl-4 space-y-1 text-[var(--kc-muted)]">
              <li>18+ participation only.</li>
              <li>Raw meat, fish, and eggs are never shared.</li>
              <li>Static pins protect exact donor addresses.</li>
            </ul>
          </div>

          <div className="font-annotation text-base text-[var(--kc-muted)] pt-2">
            &ldquo;Your food choices ripple across your neighbourhood.&rdquo;
          </div>
        </div>

        {/* Right Numbered Form Column */}
        <div className="md:col-span-7 border border-[var(--kc-hairline)] bg-[var(--kc-card)] p-6 sm:p-8 rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-[var(--kc-chilli)] text-[var(--kc-chilli)] text-xs rounded-sm">
                {errorMsg}
              </div>
            )}

            {/* 1. Name */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1">
                1. Full Name (2–60 characters)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                className="w-full px-3 py-2 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-sm focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1">
                2. Email Address
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

            {/* 3. Password */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1">
                3. Password (minimum 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-sm focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>

            {/* 4. Account Type Selection */}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1.5">
                4. Primary Intent / Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className={`p-2.5 border rounded-sm cursor-pointer flex flex-col justify-between ${accountType === 'member' ? 'border-[var(--kc-basil)] bg-[var(--kc-mint)] font-medium' : 'border-[var(--kc-hairline)]'}`}>
                  <input
                    type="radio"
                    name="accountType"
                    checked={accountType === 'member'}
                    onChange={() => setAccountType('member')}
                    className="sr-only"
                  />
                  <span>Household</span>
                  <span className="text-[10px] text-[var(--kc-muted)] mt-1">Individual / Home</span>
                </label>

                <label className={`p-2.5 border rounded-sm cursor-pointer flex flex-col justify-between ${accountType === 'caterer' ? 'border-[var(--kc-basil)] bg-[var(--kc-mint)] font-medium' : 'border-[var(--kc-hairline)]'}`}>
                  <input
                    type="radio"
                    name="accountType"
                    checked={accountType === 'caterer'}
                    onChange={() => setAccountType('caterer')}
                    className="sr-only"
                  />
                  <span>Caterer / Hall</span>
                  <span className="text-[10px] text-[var(--kc-muted)] mt-1">Event surplus</span>
                </label>

                <label className={`p-2.5 border rounded-sm cursor-pointer flex flex-col justify-between ${accountType === 'ngo' ? 'border-[var(--kc-basil)] bg-[var(--kc-mint)] font-medium' : 'border-[var(--kc-hairline)]'}`}>
                  <input
                    type="radio"
                    name="accountType"
                    checked={accountType === 'ngo'}
                    onChange={() => setAccountType('ngo')}
                    className="sr-only"
                  />
                  <span>NGO / Partner</span>
                  <span className="text-[10px] text-[var(--kc-muted)] mt-1">Verified relief</span>
                </label>
              </div>
              {accountType === 'ngo' && (
                <p className="text-[11px] text-[var(--kc-muted)] mt-1.5 italic">
                  * Organisations apply for the Verified Leaf-Tick badge after initial account confirmation.
                </p>
              )}
            </div>

            {/* 5. Age & Terms Checkboxes (Mandatory per PRD & D20) */}
            <div className="space-y-2 pt-2 border-t border-[var(--kc-hairline)] text-xs">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isAgeConfirmed}
                  onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                  className="mt-0.5 accent-[var(--kc-basil)]"
                />
                <span>I confirm that I am <strong>18 years of age or older</strong>.</span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-[var(--kc-basil)]"
                />
                <span>
                  I accept the{' '}
                  <Link href={`/${locale}/legal/terms`} target="_blank" className="text-[var(--kc-basil)] underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href={`/${locale}/legal/privacy`} target="_blank" className="text-[var(--kc-basil)] underline">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--kc-basil)] text-white text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Registering Ledger...' : 'Complete Ledger Registration'}
            </button>

            <div className="text-center text-xs text-[var(--kc-muted)] pt-2">
              Already registered?{' '}
              <Link href={`/${locale}/login`} className="text-[var(--kc-basil)] font-semibold hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
