import React from 'react';
import Link from 'next/link';

interface HelpSection {
  id: string;
  num: string;
  title: string;
  summary: string;
  content: string;
  referenceUrl?: string;
  referenceLabel?: string;
  badge?: string;
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    num: '01',
    title: 'Getting Started & Kitchen Ledger',
    summary: 'Setting up your domestic pantry, confirming age (18+), and privacy-by-default.',
    content:
      'Start by signing in with Google OAuth or email. Confirm that you are 18 or older to comply with terms. Your kitchen ledger, pantry items, fridge contents, and recipes are strictly private to your account via Supabase Row-Level Security (auth.uid() = owner_id). No food or location data is ever published publicly.',
  },
  {
    id: 'smart-intake',
    num: '02',
    title: 'Smart Intake & Receipt OCR',
    summary: 'On-device grocery bill parsing, barcode lookup, and automatic shelf-life defaults.',
    content:
      'Log domestic groceries effortlessly: snap or upload a receipt from the bazaar or supermarket to run on-device OCR (via Tesseract.js), scan packaging barcodes to query the Open Food Facts database, or enter items manually. Our engine auto-estimates shelf lives for fridge, freezer, and dry pantry zones.',
    referenceUrl: 'https://world.openfoodfacts.org/',
    referenceLabel: 'Open Food Facts Database',
  },
  {
    id: 'freshness-triage',
    num: '03',
    title: 'Freshness Scoring & "Use This First" Shelf',
    summary: '0–100% mathematical decay index and automated 24–48h urgency triage.',
    content:
      'Every active ingredient receives a real-time mathematical Freshness Index based on category shelf life, temperature zone, and elapsed hours. The automated "Use This First" priority shelf prioritizes food expiring within 24 to 48 hours, highlighting what to cook next to prevent spoilage.',
  },
  {
    id: 'before-you-buy',
    num: '04',
    title: '"Before You Buy" Shopping Assistant',
    summary: 'Real-time kitchen inventory cross-checking to prevent duplicate spending.',
    content:
      'Before heading to the market, type items into the "Before You Buy" search assistant. It cross-references your planned purchases against active fridge and pantry inventory. If you already have milk or spinach expiring soon, it alerts you immediately to prevent wasteful duplicate purchases.',
  },
  {
    id: 'recipe-rescue',
    num: '05',
    title: 'Recipe Rescue & Nutritional Breakdown',
    summary: 'Transform expiring items into complete meals with ICMR-NIN macro & vitamin profiles.',
    content:
      'The Recipe Rescue engine generates home recipes engineered around ingredients currently nearing expiration in your kitchen. Every recipe includes energy (calories), macronutrients (protein, fat, carbohydrates, fiber), and key vitamins referenced against ICMR-National Institute of Nutrition (NIN) dietary guidelines for Indians, along with health advisories for diabetes, lactose intolerance, and celiac disease.',
    referenceUrl: 'https://www.nin.res.in/',
    referenceLabel: 'ICMR-National Institute of Nutrition Dietary Guidelines',
  },
  {
    id: 'waste-and-savings',
    num: '06',
    title: 'Domestic Waste & ₹ Savings Analytics',
    summary: 'Tracking rupees saved, food weight diverted, and CO₂e footprint reductions.',
    content:
      'See your household impact update in real time. We calculate domestic rupees saved (avoided waste valued via MoSPI Consumer Food Price Index baselines), edible kilograms diverted from municipal landfills, and greenhouse gas avoidance (2.5 kg CO₂e per kg food avoided, benchmarked to the UNEP Food Waste Index Report 2024).',
    referenceUrl: 'https://www.unep.org/resources/publication/food-waste-index-report-2024',
    referenceLabel: 'UNEP Food Waste Index Report 2024',
  },
  {
    id: 'food-safety',
    num: '07',
    title: 'Food Safety & Storage Principles',
    summary: 'Standard domestic hygiene and FSSAI safe food storage practices.',
    content:
      'Always inspect smell, color, and texture before consuming refrigerated leftovers. Keep perishables below 4°C, cook poultry and eggs thoroughly, and practice clean separation of raw and cooked items following official Food Safety and Standards Authority of India (FSSAI) domestic guidelines.',
    referenceUrl: 'https://fssai.gov.in/',
    referenceLabel: 'FSSAI Food Safety Guidelines',
    badge: 'MANDATORY SAFETY DISCLOSURE',
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Masthead */}
      <div className="text-center max-w-2xl mx-auto mb-12 border-b border-[var(--kc-card-border)] pb-8">
        <span className="font-annotation text-[var(--kc-basil)] text-lg">Official Handbook & Manual</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-ink)] mt-1">
          Help Centre & Kitchen Intelligence Guide
        </h1>
        <p className="text-sm text-[var(--kc-muted)] mt-2">
          Comprehensive guides covering domestic food tracking, recipe rescue, and zero-waste kitchen management.
        </p>
      </div>

      {/* Chapters Index & Content */}
      <div className="space-y-8">
        {helpSections.map((sec) => (
          <div
            key={sec.id}
            id={sec.id}
            className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-6 md:p-8 rounded-2xl shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--kc-hairline)] pb-3 mb-4 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2 py-0.5 border border-[var(--kc-card-border)] bg-[var(--kc-bg)] font-bold text-[var(--kc-ink)] rounded-md">
                  CHAPTER {sec.num}
                </span>
                <h2 className="text-xl font-bold text-[var(--kc-ink)]">
                  {sec.title}
                </h2>
              </div>
              {sec.badge && (
                <span className="text-[11px] font-mono px-2 py-0.5 border border-[var(--kc-chilli)] bg-red-50 dark:bg-red-950/40 text-[var(--kc-chilli)] font-bold rounded-md">
                  {sec.badge}
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-[var(--kc-muted)] mb-3 uppercase tracking-wider">
              {sec.summary}
            </p>

            <div className="text-sm text-[var(--kc-ink)] leading-relaxed font-sans mb-4">
              {sec.content}
            </div>

            {sec.referenceUrl && (
              <div className="mt-4 pt-3 border-t border-[var(--kc-hairline)] flex items-center justify-between text-xs">
                <span className="text-[var(--kc-muted)]">
                  Official Standard Source:
                </span>
                <a
                  href={sec.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[var(--kc-basil)] hover:underline flex items-center gap-1"
                >
                  <span>{sec.referenceLabel}</span>
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Further Assistance Card */}
      <div className="mt-12 p-6 border border-[var(--kc-card-border)] bg-[var(--kc-card)] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--kc-ink)]">
            Could not find what you were looking for?
          </h3>
          <p className="text-xs text-[var(--kc-muted)] mt-1">
            Check the searchable FAQ repository or submit an inquiry to our team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/en/faq"
            className="px-4 py-2 text-xs font-bold border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] rounded-xl transition-colors"
          >
            Open FAQ
          </Link>
          <Link
            href="/en/contact"
            className="px-4 py-2 text-xs font-bold bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] rounded-xl transition-colors shadow-sm"
          >
            Contact Team
          </Link>
        </div>
      </div>
    </div>
  );
}
