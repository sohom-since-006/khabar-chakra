'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kc-theme') as 'system' | 'light' | 'dark' | null;
      if (savedTheme) return savedTheme;
    }
    return 'system';
  });
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kc-reduce-motion') === 'true';
    }
    return false;
  });
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('kc-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    showToast();
  };

  const handleMotionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setReduceMotion(val);
    localStorage.setItem('kc-reduce-motion', String(val));
    if (val) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    showToast();
  };

  const showToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Ledger Preferences</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Account & App Settings
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/en/profile"
            className="px-3 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
          >
            Edit Profile
          </Link>
          <Link
            href="/en/settings/security"
            className="px-3 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
          >
            Security & Login
          </Link>
        </div>
      </div>

      {savedToast && (
        <div className="mb-6 p-3 border border-[var(--kc-basil)] bg-green-50 text-xs font-mono text-[var(--kc-basil)] flex items-center justify-between animate-fade-in">
          <span>✓ Preference saved successfully.</span>
          <span className="text-[10px] uppercase">Persisted locally</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Appearance Section */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-4">
            Appearance & Visual Theme
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--kc-moss)] uppercase tracking-wider mb-2">
                Colour Palette (Market Fresh)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`p-3 text-left border text-xs font-mono transition-colors ${
                    theme === 'light'
                      ? 'border-[var(--kc-basil)] bg-[var(--kc-parchment)] font-bold text-[var(--kc-basil)]'
                      : 'border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)]'
                  }`}
                >
                  <div className="font-semibold">Market Fresh</div>
                  <div className="text-[10px] text-[var(--kc-moss)]">Light Parchment</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3 text-left border text-xs font-mono transition-colors ${
                    theme === 'dark'
                      ? 'border-[var(--kc-basil)] bg-[var(--kc-parchment)] font-bold text-[var(--kc-basil)]'
                      : 'border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)]'
                  }`}
                >
                  <div className="font-semibold">Moss Night</div>
                  <div className="text-[10px] text-[var(--kc-moss)]">Dark Contrast</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`p-3 text-left border text-xs font-mono transition-colors ${
                    theme === 'system'
                      ? 'border-[var(--kc-basil)] bg-[var(--kc-parchment)] font-bold text-[var(--kc-basil)]'
                      : 'border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)]'
                  }`}
                >
                  <div className="font-semibold">System Match</div>
                  <div className="text-[10px] text-[var(--kc-moss)]">OS Default</div>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--kc-moss)]/40">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={handleMotionToggle}
                  className="h-4 w-4 rounded-none border-[var(--kc-moss)] text-[var(--kc-basil)] focus:ring-[var(--kc-basil)]"
                />
                <div>
                  <span className="text-sm font-semibold text-[var(--kc-charcoal)] block">
                    Reduce Animations
                  </span>
                  <span className="text-xs text-[var(--kc-moss)] block font-sans">
                    Disables 3D still-life transitions and smooth motion for accessibility and low-power devices.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Language Section (TC-I18N-002) */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-4">
            Interface Language
          </h2>
          <p className="text-xs text-[var(--kc-moss)] mb-4">
            Khabar Chakra launches in English first. Regional translations are launching in Phase 6.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 border border-[var(--kc-basil)] bg-[var(--kc-parchment)]">
              <span className="text-xs font-bold text-[var(--kc-basil)] block">English (EN)</span>
              <span className="text-[10px] font-mono text-[var(--kc-moss)]">Active Primary</span>
            </div>
            <div className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-cream)] opacity-60 cursor-not-allowed">
              <span className="text-xs font-bold text-[var(--kc-charcoal)] block">বাংলা (Bengali)</span>
              <span className="text-[10px] font-mono text-[var(--kc-mango)] font-bold">Coming Soon (Phase 6)</span>
            </div>
            <div className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-cream)] opacity-60 cursor-not-allowed">
              <span className="text-xs font-bold text-[var(--kc-charcoal)] block">हिन्दी (Hindi)</span>
              <span className="text-[10px] font-mono text-[var(--kc-mango)] font-bold">Coming Soon (Phase 6)</span>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-4">
            Notification Dispatches
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={(e) => {
                  setInAppNotifs(e.target.checked);
                  showToast();
                }}
                className="h-4 w-4 rounded-none border-[var(--kc-moss)] text-[var(--kc-basil)] focus:ring-[var(--kc-basil)]"
              />
              <div>
                <span className="text-sm font-semibold text-[var(--kc-charcoal)] block">
                  In-App Freshness Alerts
                </span>
                <span className="text-xs text-[var(--kc-moss)] block">
                  Alert banners when shelf-life expires or pickup windows conclude.
                </span>
              </div>
            </label>

            <div className="opacity-60 cursor-not-allowed pt-2 border-t border-[var(--kc-moss)]/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[var(--kc-charcoal)] block">
                  Push Notifications (Web / PWA)
                </span>
                <span className="text-xs text-[var(--kc-moss)] block">
                  Coming soon in Phase 3.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">
                COMING SOON
              </span>
            </div>

            <div className="opacity-60 cursor-not-allowed pt-2 border-t border-[var(--kc-moss)]/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[var(--kc-charcoal)] block">
                  Email Digest Summary
                </span>
                <span className="text-xs text-[var(--kc-moss)] block">
                  Coming soon in Phase 3.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">
                COMING SOON
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
