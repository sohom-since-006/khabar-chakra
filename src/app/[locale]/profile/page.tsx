'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('Kitchen Steward');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Asansol');
  const [area, setArea] = useState('Court Area');
  const [householdSize, setHouseholdSize] = useState('3');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (displayName.trim().length < 2 || displayName.trim().length > 60) {
      setError('Please enter your name (2 to 60 characters).');
      return;
    }

    if (phone.trim() !== '') {
      const phoneRegex = /^\+?[0-9]{8,15}$/;
      if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
        setError('Please enter a valid phone number or leave it empty.');
        return;
      }
    }

    const hSize = parseInt(householdSize, 10);
    if (isNaN(hSize) || hSize < 1 || hSize > 50) {
      setError('Enter a number between 1 and 50.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToast('Profile details updated successfully.');
      setTimeout(() => setToast(null), 3000);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Identity Ledger</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Kitchen Profile
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/en/settings"
            className="px-3 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
          >
            Preferences
          </Link>
          <Link
            href="/en/settings/security"
            className="px-3 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
          >
            Security & Login
          </Link>
        </div>
      </div>

      {toast && (
        <div className="mb-6 p-3 border border-[var(--kc-basil)] bg-green-50 text-xs font-mono text-[var(--kc-basil)] flex items-center justify-between animate-fade-in">
          <span>✓ {toast}</span>
          <span className="text-[10px] uppercase">Profile Updated</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8">
            <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-6">
              Personal & Household Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                  Display / Steward Name (2–60 chars) *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
                <span className="text-[11px] text-[var(--kc-moss)] mt-1 block">
                  Used solely for coordinated pickup handovers after explicit authorization.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                    City / Hub
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                  >
                    <option value="Asansol">Asansol</option>
                    <option value="Durgapur">Durgapur</option>
                    <option value="Raniganj">Raniganj</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Other">Other Region</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                    Neighbourhood / Locality Label
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Ushagram, Court Area"
                    className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                  Household / Kitchen Size (1–50 persons) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
                <span className="text-[11px] text-[var(--kc-moss)] mt-1 block">
                  Helps calibrate inventory portion calculations and surplus estimators.
                </span>
              </div>

              <div className="pt-4 border-t border-[var(--kc-moss)] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Updating...' : 'Save Profile Changes →'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Privacy Guarantee Notice Panel */}
        <div className="space-y-6">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <div className="flex items-center gap-2 border-b border-[var(--kc-moss)] pb-2 mb-3">
              <span className="font-mono text-xs font-bold text-[var(--kc-basil)]">
                PRIVACY GUARANTEE
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--kc-charcoal)] mb-2">
              Your phone is never shown publicly.
            </h3>
            <p className="text-xs text-[var(--kc-charcoal)] leading-relaxed mb-4">
              Under Binding Decision D2 and BACKEND SCHEMA §8.3, your phone number and exact residential pin are strictly protected behind server-side RPC authorization.
            </p>
            <ul className="text-xs text-[var(--kc-moss)] space-y-2 list-disc list-inside">
              <li>Visible only to logged-in, email-verified members.</li>
              <li>Only during an active availability window.</li>
              <li>Only after you approve (if restricted).</li>
              <li>Never cached, indexed, or exported.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
