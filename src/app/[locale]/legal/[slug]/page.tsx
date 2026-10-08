import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface LegalDoc {
  slug: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: { title: string; content: string }[];
}

const legalDocs: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    subtitle: 'Governing user agreements, age limits, and platform conditions.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Eligibility & Age Mandate (18+)',
        content:
          'Khabar Chakra is strictly restricted to individuals who are 18 years of age or older. By registering an account, you confirm under oath that you meet this requirement. Any accounts found to belong to minors will be terminated immediately.',
      },
      {
        title: '2. ₹0 Cost Public Good Policy',
        content:
          'Khabar Chakra is provided entirely free of monetary charge for community benefit. There are no paid subscription plans, listing fees, or transaction levies. Selling food posted on this platform is strictly forbidden.',
      },
      {
        title: '3. Prohibited Items (Meat, Fish, Egg Sharing Ban)',
        content:
          'Under Binding Decision D8, raw meat, fish, and eggs may be logged in personal private inventory ledgers, but may NEVER be listed, shared, swapped, or donated. Cooked meals containing these ingredients are permitted under strict freshness guidelines.',
      },
      {
        title: '4. Limitation of Liability',
        content:
          'Khabar Chakra acts as a communication board between neighbours and organisations. We do not inspect, guarantee, transport, or certify any food items. Users participate at their own discretion and risk.',
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy & Data Stewardship',
    subtitle: 'How we protect your identity, location pins, and contact data.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Static Pins vs. Zero Live Tracking',
        content:
          'In accordance with Binding Decision D1, we do not track live GPS coordinates. All map markers represent static neighbourhood pins selected manually when posting a listing.',
      },
      {
        title: '2. Contact Protection & Server-Gated Disclosure',
        content:
          'Donor telephone numbers and exact addresses are never displayed in public HTML or accessible by anonymous scrapers. Contacts are revealed only to email-verified users during active listing windows via secure server-side RPC functions (reveal_contact).',
      },
      {
        title: '3. Data Minimization & Retention Schedules',
        content:
          'We do not sell data or run advertising tracking networks. Expired listings and completed pickup transactions have their exact coordinates and private metadata purged on a 30-day automated schedule.',
      },
      {
        title: '4. Right to Deletion & Privacy Inquiries',
        content:
          'You may request account deletion at any time in Settings. For formal grievance redressal or statutory data deletion requests, submit a dispatch through the Contact form under the Privacy Request classification.',
      },
    ],
  },
  'food-safety': {
    slug: 'food-safety',
    title: 'Food Safety Disclaimer & Standards',
    subtitle: 'The recipient decides: non-negotiable community food integrity standards.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Core Disclaimer: The Recipient Decides',
        content:
          'Khabar Chakra NEVER certifies, warrants, inspects, or guarantees that any shared food is fresh, safe, or fit for consumption. The recipient retains sole responsibility for inspecting food aroma, visual condition, storage temperature, and hygiene before accepting and consuming any items.',
      },
      {
        title: '2. Verified Badge Meaning',
        content:
          'A green leaf-tick verified badge indicates solely that an organisation (NGO, caterer, or institution) has submitted registration documents that were reviewed by platform administrators. The badge DOES NOT certify that any specific batch of food is safe or medically wholesome.',
      },
      {
        title: '3. Mandatory Photo & Freshness Windows',
        content:
          'All food listings require 1 to 4 authentic photos with metadata stripped on the donor device. Availability windows cannot exceed 48 hours under database-level constraints. Cooked hot meals expire in significantly shorter timeframes.',
      },
      {
        title: '4. Absolute Meat / Fish / Egg Prohibition',
        content:
          'Raw meat, raw fish, and raw eggs are banned from public distribution without exception due to microbiological rapid-spoilage risks in warm climates.',
      },
    ],
  },
  guidelines: {
    slug: 'guidelines',
    title: 'Community Code of Conduct & Guidelines',
    subtitle: 'Stewardship principles for homes, caterers, and volunteer relief groups.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Dignity in Sharing',
        content:
          'Share only food that you or your family would be proud and willing to consume. Never treat Khabar Chakra as a dumping ground for spoiled or decomposing organic matter.',
      },
      {
        title: '2. Punctuality & Pickup Codes',
        content:
          'Surplus food has a strict countdown. Recipients must arrive within the agreed window. When picking up, recipients present the 6-digit pickup code to confirm the handover.',
      },
      {
        title: '3. Zero Commercial Resale',
        content:
          'Claiming food to resell it for commercial profit is strictly prohibited and results in permanent network banning and referral to local authorities.',
      },
      {
        title: '4. Reporting & Dispute Mediation',
        content:
          'If a listing fails inspection, is falsely advertised, or violates community rules, use the contact desk to submit a report immediately.',
      },
    ],
  },
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const doc = legalDocs[slug];

  if (!doc) {
    notFound();
  }

  const allDocs = Object.values(legalDocs);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Draft Notice Banner (US-P1-15 & §6.4 legal.draft) */}
      <div className="mb-8 p-4 border border-[var(--kc-chilli)] bg-amber-50/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 bg-[var(--kc-chilli)] text-white font-bold">
            [DRAFT]
          </span>
          <span className="text-xs font-bold text-[var(--kc-charcoal)]">
            Draft — under legal review. Pending final advisory sign-off by legal counsel.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--kc-moss)] shrink-0">
          Last revised: {doc.lastUpdated}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Document Index */}
        <aside className="lg:col-span-1">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-4 sticky top-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] border-b border-[var(--kc-moss)] pb-2 mb-3">
              Legal Documents Index
            </h3>
            <nav className="space-y-1">
              {allDocs.map((item) => (
                <Link
                  key={item.slug}
                  href={`/en/legal/${item.slug}`}
                  className={`block px-3 py-2 text-xs font-mono transition-colors ${
                    item.slug === doc.slug
                      ? 'bg-[var(--kc-basil)] text-white font-bold'
                      : 'text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)]'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right 3 Cols: Document Content */}
        <main className="lg:col-span-3">
          <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8">
            <div className="border-b border-[var(--kc-moss)] pb-4 mb-8">
              <span className="font-annotation text-[var(--kc-basil)] text-lg">Official Documentation</span>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
                {doc.title}
              </h1>
              <p className="text-sm text-[var(--kc-moss)] mt-1">
                {doc.subtitle}
              </p>
            </div>

            <div className="space-y-8">
              {doc.sections.map((section, idx) => (
                <div key={idx} className="border-b border-[var(--kc-moss)]/40 pb-6 last:border-0 last:pb-0">
                  <h2 className="text-base font-bold text-[var(--kc-charcoal)] mb-3">
                    {section.title}
                  </h2>
                  <p className="text-sm text-[var(--kc-charcoal)] leading-relaxed font-sans">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-[var(--kc-moss)] flex items-center justify-between text-xs text-[var(--kc-moss)] font-mono">
              <span>Khabar Chakra Legal Charter</span>
              <span>The S-QUAD Foundation</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
