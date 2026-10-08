import React from 'react';
import Link from 'next/link';

interface HelpSection {
  id: string;
  num: string;
  title: string;
  summary: string;
  isComingSoon?: boolean;
  content: string;
  badge?: string;
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    num: '01',
    title: 'Getting Started',
    summary: 'Creating your kitchen ledger, confirming age (18+), and email verification.',
    content: 'Start by creating your account with your email and full name. Confirm that you are 18 or older to comply with community safety laws. Once you register, open the verification link sent to your inbox. You can then configure your neighbourhood and start learning how food tracking works.',
  },
  {
    id: 'for-donors',
    num: '02',
    title: 'For Donors & Home Kitchens',
    summary: 'Sharing home surplus, 1–4 mandatory photos, and the strict 48-hour availability ceiling.',
    isComingSoon: true,
    content: 'This feature is coming soon in Phase 4. When active, donors can post excess meals with 1–4 photos (EXIF stripped on device). Listings remain active for an admin-adjustable window up to a hard ceiling of 48 hours. Raw meat, fish, and eggs are never listable.',
  },
  {
    id: 'for-event-hosts',
    num: '03',
    title: 'For Event Hosts & Caterers',
    summary: 'Pre-announcing wedding and banquet surplus to verified organisations.',
    isComingSoon: true,
    content: 'This feature is coming soon in Phase 4. Event hosts and banquet halls can pre-announce surplus food hours before an event concludes. Verified organisations receive notifications and claim portions via unique 6-digit pickup codes.',
  },
  {
    id: 'for-organisations',
    num: '04',
    title: 'For Verified Organisations (NGOs)',
    summary: 'Document review, leaf-tick badges, and emergency food distribution channels.',
    isComingSoon: true,
    content: 'This feature is coming soon in Phase 4. Registered NGOs and community relief teams submit verification documents (registration certificates, 12A/80G, FSSAI where applicable). Admins review every document before granting the verified green leaf-tick badge.',
  },
  {
    id: 'food-safety',
    num: '05',
    title: 'Food Safety & Community Standards',
    summary: 'Core food safety rules, no-guarantee disclaimer, and document badge meanings.',
    content: 'Khabar Chakra never certifies food. You decide whether the food is safe to accept. Our platform connects neighbours and verified organisations, but we cannot inspect or test food. A green verified badge only means that an organisation\'s identification and registration documents were reviewed by administrators, NOT that the food has been certified.',
    badge: 'MANDATORY SAFETY DISCLOSURE',
  },
  {
    id: 'waste-guide',
    num: '06',
    title: 'Responsible Waste & Recycling Guide',
    summary: 'Sorting kitchen waste into wet, dry, packaging, and composting streams.',
    isComingSoon: true,
    content: 'This feature is coming soon in Phase 5. When food passes beyond safe consumption windows, our waste matrix guides you to municipal composting pits, community livestock feeders, or dry recyclable sorting hubs across Asansol and West Bengal.',
  },
  {
    id: 'troubleshooting',
    num: '07',
    title: 'Troubleshooting & Support',
    summary: 'Password resets, email delivery issues, session security, and contact procedures.',
    content: 'If you did not receive a verification or password reset email, check your spam folder or wait for the 60-second cooldown timer before requesting a new link. For urgent account issues or privacy data requests, use the official Contact correspondence form.',
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Masthead */}
      <div className="text-center max-w-2xl mx-auto mb-12 border-b border-[var(--kc-moss)] pb-8">
        <span className="font-annotation text-[var(--kc-basil)] text-lg">Official Handbook & Manual</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
          Help Centre & Operational Guidelines
        </h1>
        <p className="text-sm text-[var(--kc-moss)] mt-2">
          Seven foundational chapters governing food safety, donation workflows, and platform policies.
        </p>
      </div>

      {/* Chapters Index & Content */}
      <div className="space-y-8">
        {helpSections.map((sec) => (
          <div
            key={sec.id}
            id={sec.id}
            className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--kc-moss)] pb-3 mb-4 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] font-bold text-[var(--kc-charcoal)]">
                  CHAPTER {sec.num}
                </span>
                <h2 className="text-xl font-bold text-[var(--kc-charcoal)]">
                  {sec.title}
                </h2>
              </div>
              {sec.badge && (
                <span className="text-[11px] font-mono px-2 py-0.5 border border-[var(--kc-chilli)] bg-red-50 text-[var(--kc-chilli)] font-bold">
                  {sec.badge}
                </span>
              )}
              {sec.isComingSoon && (
                <span className="text-[11px] font-mono px-2 py-0.5 border border-[var(--kc-mango)] bg-[var(--kc-mango)]/20 text-[var(--kc-charcoal)]">
                  Coming Soon (Phase 4/5)
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-[var(--kc-moss)] mb-3 uppercase tracking-wider">
              {sec.summary}
            </p>

            <div className="text-sm text-[var(--kc-charcoal)] leading-relaxed font-sans mb-4">
              {sec.content}
            </div>

            {sec.isComingSoon && (
              <div className="mt-4 pt-3 border-t border-dashed border-[var(--kc-moss)]/50 flex items-center justify-between text-xs">
                <span className="text-[var(--kc-moss)]">
                  This feature is currently in scheduled development.
                </span>
                <Link href="/en/faq" className="font-bold text-[var(--kc-basil)] hover:underline">
                  Read related questions in FAQ →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Further Assistance Card */}
      <div className="mt-12 p-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-charcoal)]">
            Could not find what you were looking for?
          </h3>
          <p className="text-xs text-[var(--kc-moss)] mt-1">
            Check the searchable FAQ repository or submit an administrative inquiry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/en/faq"
            className="px-4 py-2 text-xs font-bold border border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)] transition-colors"
          >
            Open FAQ
          </Link>
          <Link
            href="/en/contact"
            className="px-4 py-2 text-xs font-bold bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
          >
            Contact Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
