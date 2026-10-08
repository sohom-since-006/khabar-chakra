'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const [locale, setLocale] = useState('en');
  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || `/${locale}/home`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Generic failure message per SECURITY §6 & US-P1-03
        setErrorMsg('Email or password is incorrect.');
      } else {
        // Safe redirect within origin
        const destination = nextParam.startsWith('/') ? nextParam : `/${locale}/home`;
        router.push(destination);
        router.refresh();
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="almanac-ticket p-6 sm:p-8 border border-[var(--kc-hairline)] bg-[var(--kc-card)] rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-4">
          <div>
            <span className="almanac-num">AUTH · DISPATCH 201</span>
            <h1 className="text-2xl font-extrabold text-[var(--kc-ink)] mt-0.5">Kitchen Sign In</h1>
          </div>
          <KhabarIcon name="profile" size={28} className="text-[var(--kc-muted)]" />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-[var(--kc-chilli)] text-[var(--kc-chilli)] text-xs rounded-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-mono uppercase text-[var(--kc-muted)]">
                Password
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-[11px] text-[var(--kc-muted)] hover:text-[var(--kc-basil)] underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-sm focus:outline-none focus:border-[var(--kc-basil)]"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--kc-muted)]">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="accent-[var(--kc-basil)]"
              />
              <span>Stay signed in on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--kc-basil)] text-white text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Authenticating...' : 'Sign In to Ledger'}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--kc-hairline)] text-center text-xs text-[var(--kc-muted)]">
          Don&apos;t have a kitchen ledger yet?{' '}
          <Link href={`/${locale}/signup`} className="text-[var(--kc-basil)] font-semibold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </main>
  );
}
