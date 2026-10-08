'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [city, setCity] = useState('Asansol');
  const [area, setArea] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      setError('You must confirm that you are 18 years of age or older to use Khabar Chakra.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleComplete = async () => {
    setSaving(true);
    // In production, save 18+ confirmation and area preference to user profile
    setTimeout(() => {
      setSaving(false);
      router.push('/en/home');
    }, 400);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Almanac Header Note */}
      <div className="text-center mb-8 border-b border-[var(--kc-moss)] pb-6">
        <span className="font-annotation text-[var(--kc-basil)] text-lg">First Entry · Passport & Orientation</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-2">
          Welcome to Khabar Chakra
        </h1>
        <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
          Step {step} of 3 — Setting up your community kitchen ledger
        </p>
      </div>

      {/* Progress Track */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <div className={`h-1.5 rounded-none border border-[var(--kc-moss)] ${step >= 1 ? 'bg-[var(--kc-basil)]' : 'bg-transparent'}`} />
        <div className={`h-1.5 rounded-none border border-[var(--kc-moss)] ${step >= 2 ? 'bg-[var(--kc-basil)]' : 'bg-transparent'}`} />
        <div className={`h-1.5 rounded-none border border-[var(--kc-moss)] ${step >= 3 ? 'bg-[var(--kc-basil)]' : 'bg-transparent'}`} />
      </div>

      <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8">
        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">STAGE 01</span>
              <h2 className="text-lg font-bold text-[var(--kc-charcoal)]">Age Confirmation (18+ Mandate)</h2>
            </div>
            <p className="text-sm text-[var(--kc-charcoal)] mb-6 leading-relaxed">
              To manage your household kitchen ledger and domestic food intelligence, Khabar Chakra requires all account holders to be at least 18 years old. No exact birth date is stored.
            </p>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              <label className="flex items-start gap-3 p-4 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] cursor-pointer hover:border-[var(--kc-basil)] transition-colors">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-[var(--kc-moss)] text-[var(--kc-basil)] focus:ring-[var(--kc-basil)]"
                  required
                />
                <span className="text-sm font-medium text-[var(--kc-charcoal)]">
                  I solemnly confirm that I am 18 years of age or older.
                </span>
              </label>

              {error && (
                <div className="p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs text-[var(--kc-chilli)] font-mono">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-[var(--kc-moss)]">
                <button
                  type="submit"
                  disabled={!ageConfirmed}
                  className="px-6 py-2.5 text-sm font-bold bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 disabled:opacity-50 transition-colors"
                >
                  Continue to Area Setup →
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">STAGE 02</span>
              <h2 className="text-lg font-bold text-[var(--kc-charcoal)]">Select Your Area (Optional)</h2>
            </div>
            <p className="text-sm text-[var(--kc-charcoal)] mb-6 leading-relaxed">
              We never track live GPS. Setting your general region helps localize seasonal produce calendars and regional market pricing.
            </p>

            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                  City / Town
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                >
                  <option value="Asansol">Asansol (Default hub)</option>
                  <option value="Durgapur">Durgapur</option>
                  <option value="Raniganj">Raniganj</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Other">Other West Bengal Region</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                  Neighbourhood / Locality (e.g. Burnpur, Ushagram, Court Area)
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Ushagram"
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                />
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-[var(--kc-moss)]">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-mono text-[var(--kc-moss)] hover:underline"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  Continue to Quick Tour →
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">STAGE 03</span>
              <h2 className="text-lg font-bold text-[var(--kc-charcoal)]">The 4R Almanac Tour</h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex items-start gap-3">
                <KhabarIcon name="scan" className="w-5 h-5 text-[var(--kc-basil)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-[var(--kc-charcoal)]">1. Scan & Track</h3>
                  <p className="text-xs text-[var(--kc-moss)] mt-0.5">Log fresh ingredients and expiry alerts in your private kitchen ledger.</p>
                </div>
              </div>

              <div className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex items-start gap-3">
                <KhabarIcon name="track" className="w-5 h-5 text-[var(--kc-mango)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-[var(--kc-charcoal)]">2. Smart Freshness & Triage</h3>
                  <p className="text-xs text-[var(--kc-moss)] mt-0.5">Automated shelf-life calculation and &quot;Use This First&quot; queue to stop spoilage before it happens.</p>
                </div>
              </div>

              <div className="p-3 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex items-start gap-3">
                <KhabarIcon name="recipe" className="w-5 h-5 text-[var(--kc-blueberry)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase text-[var(--kc-charcoal)]">3. Recipe Rescue & Savings</h3>
                  <p className="text-xs text-[var(--kc-moss)] mt-0.5">Turn expiring ingredients into nutritious domestic meals and track verified domestic ₹ savings.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--kc-moss)]">
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-bold bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
              >
                {saving ? 'Opening Ledger...' : 'Open My Kitchen Ledger →'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <Link href="/en/help" className="text-xs font-mono text-[var(--kc-moss)] hover:underline">
          Need help? Consult the Help Centre & Handbook
        </Link>
      </div>
    </div>
  );
}
