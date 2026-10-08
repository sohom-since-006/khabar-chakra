'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TurnstileWidget } from '@/components/ui/TurnstileWidget';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'kitchen_intelligence',
    subject: '',
    message: '',
  });
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit dispatch. Please try again.');
        return;
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        topic: 'kitchen_intelligence',
        subject: '',
        message: '',
      });
    } catch {
      setStatus('error');
      setErrorMessage('A network error occurred. Please check your connection.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Masthead */}
      <div className="text-center max-w-2xl mx-auto mb-12 border-b border-[var(--kc-moss)] pb-8">
        <span className="font-annotation text-[var(--kc-basil)] text-lg">Correspondence & Dispatch</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
          Contact Administration Inbox
        </h1>
        <p className="text-sm text-[var(--kc-moss)] mt-2">
          Submit official dispatches, food safety notices, organisation queries, or privacy requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The Letterform Form */}
        <div className="lg:col-span-2">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8">
            <div className="border-b border-[var(--kc-moss)] pb-3 mb-6 flex justify-between items-center">
              <span className="font-mono text-xs text-[var(--kc-moss)] uppercase tracking-wider">
                Official Dispatch Slip · Form 102
              </span>
              <span className="font-mono text-xs text-[var(--kc-moss)]">
                Admin Queue
              </span>
            </div>

            {status === 'success' ? (
              <div className="p-8 text-center bg-[var(--kc-parchment)] border border-[var(--kc-basil)]">
                <div className="w-12 h-12 mx-auto mb-3 border border-[var(--kc-basil)] bg-[var(--kc-cream)] flex items-center justify-center text-[var(--kc-basil)] text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-[var(--kc-charcoal)] mb-2">
                  Thanks! We&apos;ve received your message.
                </h3>
                <p className="text-sm text-[var(--kc-moss)] max-w-md mx-auto mb-6">
                  Your dispatch has been delivered to the admin inbox. We review all incoming messages in order of urgency.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)]">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                      Sender Name *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ananya Das"
                      className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                      Return Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={254}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                      Topic Classification *
                    </label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                    >
                      <option value="kitchen_intelligence">Household Kitchen Intelligence</option>
                      <option value="inventory_tracking">Pantry & Fridge Tracking</option>
                      <option value="recipe_rescue">Recipe Rescue & Meal Planning</option>
                      <option value="technical_support">Technical Support</option>
                      <option value="privacy_request">Privacy Request / Grievance</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={120}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief headline of your dispatch"
                      className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                    Message Content (10 to 2000 characters) *
                  </label>
                  <textarea
                    required
                    rows={6}
                    minLength={10}
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your dispatch clearly. Note that telephone numbers and emails in body text will be masked."
                    className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)] resize-y"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-[var(--kc-moss)] mt-1">
                    <span>{formData.message.length} / 2000 chars</span>
                    <span>Max 3 submissions per hour per network</span>
                  </div>
                </div>

                {/* Cloudflare Turnstile Verification */}
                <TurnstileWidget onSuccess={setCaptchaToken} />

                <div className="pt-4 border-t border-[var(--kc-moss)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-[var(--kc-moss)]">
                    We use your message only to answer you.
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 disabled:opacity-50 transition-colors"
                  >
                    {status === 'submitting' ? 'Transmitting Dispatch...' : 'Post Dispatch to Admin →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Col: Technical Support & Security Policies */}
        <div className="space-y-6">
          {/* Tech Support Notice Card (US-P1-13 & Decision D6) */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <div className="flex items-center gap-2 border-b border-[var(--kc-moss)] pb-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--kc-mango)] animate-pulse" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-charcoal)] font-bold">
                Technical Support
              </h3>
            </div>
            <p className="text-xs font-bold text-[var(--kc-chilli)] mb-2 font-mono">
              Coming Soon
            </p>
            <p className="text-xs text-[var(--kc-moss)] leading-relaxed mb-4">
              Direct live phone and chat support infrastructure is currently in development. Until then, please use the contact form on this page. All submissions are monitored by the administrative desk.
            </p>
            <div className="text-[11px] font-mono text-[var(--kc-moss)] pt-2 border-t border-[var(--kc-moss)]/40">
              Controlled by site_settings.public_contact
            </div>
          </div>

          {/* Privacy & Anti-Harassment Card */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-charcoal)] font-bold border-b border-[var(--kc-moss)] pb-2 mb-3">
              Privacy & Data Policy
            </h3>
            <p className="text-xs text-[var(--kc-moss)] leading-relaxed mb-3">
              Khabar Chakra operates under a zero-telemetry, zero-ad-tracker mandate. Your return email is never shared with third parties or displayed publicly on any listing.
            </p>
            <Link
              href="/en/legal/privacy"
              className="text-xs font-bold text-[var(--kc-basil)] hover:underline inline-block"
            >
              Read full Privacy Draft →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
