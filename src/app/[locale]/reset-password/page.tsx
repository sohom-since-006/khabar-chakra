'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const [locale, setLocale] = useState('en');
  React.useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg('Could not update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="almanac-ticket p-6 sm:p-8 border border-[var(--kc-hairline)] bg-[var(--kc-card)] rounded-sm space-y-5">
        <h1 className="text-xl font-bold text-[var(--kc-ink)]">Establish New Password</h1>

        {success ? (
          <div className="space-y-4 text-center">
            <span className="almanac-stamp">SUCCESS</span>
            <p className="text-sm text-[var(--kc-muted)]">
              Your ledger password has been successfully renewed.
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-block px-4 py-2 bg-[var(--kc-basil)] text-white text-xs font-semibold rounded-sm"
            >
              Sign In with New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-[var(--kc-chilli)] text-xs border border-[var(--kc-chilli)] rounded-sm">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1">
                New Password (minimum 8 characters)
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
            <div>
              <label className="block text-xs font-mono uppercase text-[var(--kc-muted)] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-hairline)] bg-transparent rounded-sm focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--kc-basil)] text-white text-sm font-semibold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
