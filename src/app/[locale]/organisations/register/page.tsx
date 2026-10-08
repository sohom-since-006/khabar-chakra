'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function OrganisationRegisterPage() {
  const router = useRouter();

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'ngo' | 'caterer' | 'banquet_hall' | 'authority'>('ngo');
  const [regNumber, setRegNumber] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [operatingCity, setOperatingCity] = useState('Asansol');
  const [uploadedDocNames, setUploadedDocNames] = useState<string[]>([
    'registration_certificate.pdf',
    'fssai_undertaking.pdf',
  ]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;

    const newApplication = {
      id: `org-app-${Date.now()}`,
      orgName,
      orgType,
      regNumber,
      fssaiLicense,
      contactPerson,
      contactPhone,
      operatingCity,
      documents: uploadedDocNames,
      status: 'pending_review',
      appliedAt: new Date().toISOString(),
      firstAdminApproval: null,
      secondAdminApproval: null,
    };

    try {
      const stored = localStorage.getItem('kc-org-verifications');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem('kc-org-verifications', JSON.stringify([newApplication, ...existing]));
    } catch {
      // fallback
    }

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Folio Masthead */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Organisation Accreditation · Docket Form</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Apply for Verified Organisation Badge
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Submit statutory registration papers for manual review by Khabar Chakra admins (Decision D9 &amp; D21).
          </p>
        </div>
        <Link
          href="/en/available"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)]"
        >
          ← Available Food
        </Link>
      </div>

      {isSubmitted ? (
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-[var(--kc-basil)] flex items-center justify-center">
            <KhabarIcon name="certificate" size={40} />
          </div>
          <h2 className="text-xl font-bold text-[var(--kc-charcoal)] mb-2">
            Verification Docket Submitted
          </h2>
          <p className="text-xs text-[var(--kc-moss)] font-sans max-w-md mx-auto mb-6 leading-relaxed">
            Your registration documents have entered the administrative audit vault. Per Decision D21, applications are reviewed with 60-second encrypted document links and two-admin review for trusted institutions.
          </p>
          <button
            type="button"
            onClick={() => router.push('/en/available')}
            className="px-6 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[var(--kc-basil)] text-white rounded-sm"
          >
            Return to Available Food Directory
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Badge Meaning Notice (D9) */}
          <div className="p-4 border-l-4 border border-[var(--kc-basil)] bg-green-50/70 rounded-sm">
            <h3 className="font-mono text-xs font-bold uppercase text-[var(--kc-basil)] tracking-wider mb-1 flex items-center gap-1.5">
              <KhabarIcon name="info" size={16} />
              Verified Badge Declaration (Decision D9)
            </h3>
            <p className="text-xs font-sans text-[var(--kc-charcoal)] leading-relaxed">
              The verified leaf-tick badge certifies solely that statutory registration documents (NGO DARPAN, FSSAI licence, municipal registration) have been opened and manually audited by Khabar Chakra administrators. <strong>The badge does NOT certify food safety. The recipient always decides whether food is safe to accept.</strong>
            </p>
          </div>

          {/* Form Fields */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3">
              1. Institutional Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  Organisation / Firm Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asansol Anandamoyee Seva Trust"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  Entity Category (D9) *
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as typeof orgType)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
                >
                  <option value="ngo">Non-Governmental Organisation (NGO)</option>
                  <option value="caterer">Commercial Caterer</option>
                  <option value="banquet_hall">Banquet Hall / Community Centre</option>
                  <option value="authority">Trusted Authority / Municipal Body</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  Registration / NGO DARPAN / CIN Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WB/2021/0192837"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  FSSAI Registration / Licence Number (if applicable)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="14-digit FSSAI number"
                  value={fssaiLicense}
                  onChange={(e) => setFssaiLicense(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3">
              2. Authorized Representative
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  Official Phone (+91) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 90000 00000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                  Primary Operating Region *
                </label>
                <input
                  type="text"
                  required
                  value={operatingCity}
                  onChange={(e) => setOperatingCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3 flex justify-between items-center">
              <span>3. Statutory Documents (Stored in Private Storage Vault)</span>
              <span className="text-[11px] font-normal text-[var(--kc-moss)]">PDF / PNG / JPG</span>
            </h2>

            <div className="space-y-2">
              {uploadedDocNames.map((name, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-[var(--kc-moss)] rounded-sm text-xs font-mono">
                  <span className="flex items-center gap-2 text-[var(--kc-charcoal)]">
                    <KhabarIcon name="certificate" size={16} />
                    {name}
                  </span>
                  <span className="text-[10px] text-[var(--kc-basil)] font-bold">✓ Attached</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance */}
          <div className="p-4 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] rounded-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded-sm text-[var(--kc-basil)]"
              />
              <span className="text-xs font-sans text-[var(--kc-charcoal)] leading-relaxed">
                I hereby declare that all uploaded documents are authentic and current. I understand that our badge will be reviewed under the two-admin audit rule (D21) and that we never misrepresent food safety certification to recipients.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!termsAccepted}
            className={`w-full py-3 text-xs font-mono uppercase font-bold tracking-wider rounded-sm transition-opacity ${
              termsAccepted
                ? 'bg-[var(--kc-basil)] text-white hover:opacity-90'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            Submit Application Docket for Admin Audit →
          </button>
        </form>
      )}
    </div>
  );
}
