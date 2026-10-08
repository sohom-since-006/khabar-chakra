import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface LegalDoc {
  slug: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: { title: string; content: string; referenceUrl?: string; referenceLabel?: string }[];
}

const legalDocs: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    subtitle: 'Governing user agreements, personal account usage, and platform conditions.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Eligibility & Age Mandate (18+)',
        content:
          'Khabar Chakra is strictly restricted to individuals who are 18 years of age or older. By registering an account, you confirm that you meet this requirement. Any accounts found to belong to minors will be terminated immediately.',
      },
      {
        title: '2. ₹0 Cost Public Good Policy',
        content:
          'Khabar Chakra is provided entirely free of monetary charge for personal household benefit. There are zero paid subscription plans, locked features, or transaction fees. The platform operates on a ₹0 operating cost framework using free-tier services and open open-access food databases.',
      },
      {
        title: '3. Personal Household Scope (Private Ledgers Only)',
        content:
          'Khabar Chakra is exclusively designed for personal household food-freshness tracking, kitchen inventory management, and domestic zero-waste analytics. Public food sharing, donation marketplaces, and commercial listings are strictly excluded from the platform.',
      },
      {
        title: '4. Limitation of Liability',
        content:
          'Freshness indices, expiry projections, and nutritional breakdowns are algorithmic estimates based on category shelf life models and ICMR-NIN dietary standards. Khabar Chakra does not inspect food physically. The user retains sole discretion and responsibility for evaluating food freshness, aroma, and hygiene before preparing or eating any dish.',
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy & Data Stewardship',
    subtitle: 'How we protect your domestic inventory, grocery receipts, and account data.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Strict Row-Level Security (RLS)',
        content:
          'All household inventory items, receipts, shopping lists, and meal records are private to your authenticated user account. Data isolation is strictly enforced at the database layer via Supabase Row-Level Security (auth.uid() = owner_id). No other user or anonymous visitor can view your kitchen stock.',
      },
      {
        title: '2. Zero Live GPS Tracking & Zero Public Discovery',
        content:
          'We do not track, store, or monitor your live GPS coordinates. There are no public maps, neighborhood pins, or broadcast beacons associated with your domestic inventory.',
      },
      {
        title: '3. Client-Side OCR & Data Minimization',
        content:
          'Grocery receipt OCR runs on-device in your browser using Web Workers (Tesseract.js). Bill images are processed locally without being transferred to external AI inference APIs. We do not sell personal data, host advertising networks, or deploy commercial trackers.',
      },
      {
        title: '4. Right to Deletion & Account Purge',
        content:
          'You may delete your account and all associated inventory ledgers at any time via Settings → Security. Account deletion initiates an immediate wipe of your data and a full database purge within 30 days.',
      },
    ],
  },
  'food-safety': {
    slug: 'food-safety',
    title: 'Food Safety Disclaimer & Standards',
    subtitle: 'Safe food handling principles and domestic kitchen hygiene guidelines.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. Core Principle: The Cook Decides',
        content:
          'Khabar Chakra calculates mathematical decay windows and estimates shelf life based on category averages. However, biological degradation varies with real humidity and ambient temperature. The user must always inspect food appearance, smell, and texture before preparation or consumption.',
      },
      {
        title: '2. Safe Domestic Temperature Zones',
        content:
          'Per official Food Safety and Standards Authority of India (FSSAI) guidelines, domestic refrigerators should maintain temperatures below 4°C, and freezers below -18°C. Cooked perishable dishes should be refrigerated within two hours of preparation.',
        referenceUrl: 'https://fssai.gov.in/',
        referenceLabel: 'FSSAI Food Safety Standards',
      },
      {
        title: '3. Raw Meat, Fish, and Egg Handling',
        content:
          'Raw animal proteins carry higher microbiological risks in warm climates. Raw meat, poultry, fish, and eggs must be stored securely in dedicated fridge compartments away from raw vegetables and ready-to-eat dishes, and cooked to safe internal temperatures.',
      },
      {
        title: '4. Nutritional & Disease Advisories',
        content:
          'Nutritional estimates and recipe macro breakdowns are benchmarked against the ICMR-National Institute of Nutrition (NIN) Dietary Guidelines for Indians. Health advisories for conditions such as Type 2 Diabetes, Hypertension, and Celiac Disease are informational only and do not replace personalized medical advice from a physician.',
        referenceUrl: 'https://www.nin.res.in/',
        referenceLabel: 'ICMR-National Institute of Nutrition Guidelines',
      },
    ],
  },
  guidelines: {
    slug: 'guidelines',
    title: 'Domestic Zero-Waste Kitchen Guidelines',
    subtitle: 'Best practices for sustainable home food management and waste prevention.',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: '1. "Use This First" Shelf Priority',
        content:
          'Organize your physical fridge so items expiring within 24–48 hours are placed front and center. Check your digital "Use This First" shelf before planning daily meals.',
      },
      {
        title: '2. "Before You Buy" Smart Shopping',
        content:
          'Before heading to the market or bazaar, run a quick check through the "Before You Buy" assistant to ensure you do not purchase duplicate perishable items that are already sitting in your kitchen.',
      },
      {
        title: '3. Creative Recipe Rescue',
        content:
          'Turn near-expiry vegetables, lentils, and bread into curries, khichuri, stir-fries, and broths. Preventing food waste at home saves substantial grocery money while protecting the environment.',
      },
      {
        title: '4. Responsible Organic Waste Composting',
        content:
          'When trimmings, peels, or expired organic matter cannot be consumed, divert them to home composting or municipal organic wet waste streams rather than non-segregated landfills, following UNEP Food Waste Index best practices.',
        referenceUrl: 'https://www.unep.org/resources/publication/food-waste-index-report-2024',
        referenceLabel: 'UNEP Food Waste Index Report 2024',
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
      {/* Draft Notice Banner */}
      <div className="mb-8 p-4 border border-[var(--kc-card-border)] bg-[var(--kc-card)] rounded-2xl flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 bg-[var(--kc-basil)] text-white font-bold rounded-md">
            OFFICIAL POLICY
          </span>
          <span className="text-xs font-bold text-[var(--kc-ink)]">
            Khabar Chakra v2.0 · Personal Household Food Lifecycle Policy
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--kc-muted)] hidden sm:inline">
          Last Revision: {doc.lastUpdated}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-4 rounded-2xl shadow-sm">
            <span className="font-mono text-xs text-[var(--kc-muted)] uppercase tracking-wider block mb-3 font-bold">
              Legal Documents
            </span>
            <nav className="space-y-1">
              {allDocs.map((d) => (
                <Link
                  key={d.slug}
                  href={`/en/legal/${d.slug}`}
                  className={`block px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                    d.slug === slug
                      ? 'bg-[var(--kc-mint)] font-bold text-[var(--kc-basil)] border border-[var(--kc-card-border)]'
                      : 'text-[var(--kc-muted)] hover:bg-[var(--kc-bg)] hover:text-[var(--kc-ink)]'
                  }`}
                >
                  {d.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border border-[var(--kc-card-border)] bg-[var(--kc-card)] rounded-2xl text-xs space-y-2 shadow-sm">
            <div className="font-bold text-[var(--kc-ink)]">₹0 Operating Cost Utility</div>
            <p className="text-[var(--kc-muted)] leading-relaxed">
              Khabar Chakra operates as a 100% free domestic food intelligence service for sustainable households.
            </p>
          </div>
        </aside>

        {/* Right Main Document Content */}
        <main className="lg:col-span-3 space-y-6">
          <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-8 sm:p-10 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="border-b border-[var(--kc-hairline)] pb-6 mb-8">
              <span className="font-mono text-xs text-[var(--kc-basil)] uppercase tracking-wider font-bold">
                POLICY DOCUMENT · REF {doc.slug.toUpperCase()}
              </span>
              <h1 className="text-3xl font-extrabold text-[var(--kc-ink)] mt-2 tracking-tight">
                {doc.title}
              </h1>
              <p className="text-sm text-[var(--kc-muted)] mt-2 leading-relaxed">
                {doc.subtitle}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {doc.sections.map((section, idx) => (
                <section key={idx} className="space-y-2">
                  <h2 className="text-base font-bold text-[var(--kc-ink)] font-montserrat">
                    {section.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--kc-muted)] leading-relaxed">
                    {section.content}
                  </p>
                  {section.referenceUrl && (
                    <div className="pt-2 text-xs">
                      <span className="text-[var(--kc-muted)] font-mono">Reference source: </span>
                      <a
                        href={section.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[var(--kc-basil)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{section.referenceLabel}</span>
                        <span>↗</span>
                      </a>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Document Footer */}
            <div className="mt-12 pt-6 border-t border-[var(--kc-hairline)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--kc-muted)] gap-3 font-mono">
              <span>S-QUAD · Asansol Engineering College</span>
              <span>Effective Date: October 2026</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
