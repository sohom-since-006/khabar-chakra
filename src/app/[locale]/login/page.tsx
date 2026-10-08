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
  const nextParam = searchParams.get('next') || `/${locale}`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTarget = nextParam.startsWith('/') ? nextParam : `/${locale}`;
      const redirectTo = `${origin}/${locale}/auth/callback?next=${encodeURIComponent(redirectTarget)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to initialize Google Sign In.');
        setGoogleLoading(false);
      }
    } catch {
      setErrorMsg('An unexpected error occurred while contacting Google.');
      setGoogleLoading(false);
    }
  };

  // Standard Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Email or password is incorrect. Please verify your credentials.');
      } else {
        const destination = nextParam.startsWith('/') ? nextParam : `/${locale}`;
        router.push(destination);
        router.refresh();
      }
    } catch {
      setErrorMsg('An unexpected authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="p-6 sm:p-8 border border-[var(--kc-card-border)] bg-[var(--kc-card)] rounded-2xl shadow-lg space-y-6 transition-all">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-[var(--kc-hairline)] pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--kc-basil)] uppercase block">
              HOUSEHOLD LEDGER · SECURE ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--kc-ink)] mt-1 font-montserrat">
              Kitchen Sign In
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--kc-mint)] flex items-center justify-center text-[var(--kc-basil)]">
            <KhabarIcon name="profile" size={22} />
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-[var(--kc-chilli)] text-[var(--kc-chilli)] text-xs rounded-xl flex items-center gap-2">
            <KhabarIcon name="error" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Option: Google OAuth */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-xl border border-[var(--kc-card-border)] bg-white dark:bg-[#143024] hover:bg-neutral-50 dark:hover:bg-[#1A3D2F] text-[var(--kc-ink)] font-semibold text-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 group hover:scale-[1.01]"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 border-2 border-[var(--kc-basil)] border-t-transparent rounded-full animate-spin" />
                Connecting to Google...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[var(--kc-muted)]">
            Instant 1-click access to your personal pantry and fridge ledger.
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--kc-hairline)] w-full" />
          <span className="bg-[var(--kc-card)] px-3 text-[10px] font-mono uppercase tracking-wider text-[var(--kc-muted)] shrink-0">
            Or sign in with email
          </span>
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1.5 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-xl text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)] focus:ring-1 focus:ring-[var(--kc-basil)] transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-mono uppercase text-[var(--kc-muted)] font-semibold">
                Password
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-xs text-[var(--kc-muted)] hover:text-[var(--kc-basil)] underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-xl text-[var(--kc-ink)] focus:outline-none focus:border-[var(--kc-basil)] focus:ring-1 focus:ring-[var(--kc-basil)] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--kc-muted)]">
              <input
                type="checkbox"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="accent-[var(--kc-basil)] rounded"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 bg-[var(--kc-basil)] text-white text-sm font-bold rounded-xl hover:bg-[var(--kc-basil-hover)] disabled:opacity-50 transition-all shadow-sm hover:shadow"
          >
            {loading ? 'Authenticating...' : 'Sign In with Password'}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--kc-hairline)] text-center text-xs text-[var(--kc-muted)]">
          Don&apos;t have a kitchen ledger account?{' '}
          <Link
            href={`/${locale}/signup`}
            className="text-[var(--kc-basil)] font-bold hover:underline"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </main>
  );
}
