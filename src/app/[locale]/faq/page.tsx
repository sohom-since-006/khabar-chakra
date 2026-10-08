'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: 'Getting started' | 'Account and password' | 'Food safety' | 'Privacy and safety' | 'Technical support';
  question: string;
  answer: string;
  link?: { url: string; label: string };
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-khabar-chakra',
    category: 'Getting started',
    question: 'What is Khabar Chakra?',
    answer:
      'Khabar Chakra (খাবার চক্র) is a 100% free domestic kitchen food-lifecycle intelligence platform. It tracks pantry and fridge freshness via on-device receipt OCR, provides mathematical 0–100% freshness triage on a "Use This First" shelf, eliminates duplicate grocery purchases via "Before You Buy", rescues expiring ingredients into recipes, and tracks domestic ₹ savings and zero-waste streaks.',
  },
  {
    id: 'is-it-free',
    category: 'Getting started',
    question: 'Is it free?',
    answer:
      'Yes. Khabar Chakra is 100% free with ₹0 operating cost. There are zero paid subscriptions, hidden fees, or premium paywalls. It runs entirely on client-side compute, free open data, and Supabase free tier.',
  },
  {
    id: 'who-can-use-it',
    category: 'Getting started',
    question: 'Who can use it?',
    answer:
      'Anyone aged 18 or older managing a domestic home kitchen, pantry, or personal grocery budget.',
  },
  {
    id: 'whats-available-right-now',
    category: 'Getting started',
    question: "What features are currently available?",
    answer:
      'The entire core suite is active: multi-zone storage (Fridge, Freezer, Pantry), receipt OCR bill parsing, Open Food Facts barcode lookup, dynamic freshness scoring, the "Use This First" shelf, "Before You Buy" shopping assistant, Recipe Rescue with nutrient breakdown and disease advisories, push expiry notifications, and domestic waste & ₹ savings analytics.',
  },
  {
    id: 'why-verify-email',
    category: 'Account and password',
    question: 'Why do I need to verify my email?',
    answer:
      'Email verification secures your private account and ensures your private kitchen inventory is safely synced to your personal cloud profile.',
  },
  {
    id: 'didnt-get-verification-email',
    category: 'Account and password',
    question: "I didn't get the verification email.",
    answer:
      'Check your spam or junk folder, then use "Send a new link" on the verification page. You can request a fresh verification link every 60 seconds.',
  },
  {
    id: 'reset-password',
    category: 'Account and password',
    question: 'How do I reset my password?',
    answer:
      'Choose "Forgot password" on the login page and enter your email address. Follow the link we send you. For security, all other active sessions will be signed out afterwards.',
  },
  {
    id: 'change-email-or-delete',
    category: 'Account and password',
    question: 'How do I change my email or delete my account?',
    answer:
      'Open Settings → Security. Changing your email requires confirmation sent to the new address. Deleting your account immediately wipes your kitchen data and purges all records within 30 days.',
  },
  {
    id: 'does-khabar-chakra-check-food',
    category: 'Food safety',
    question: 'Does Khabar Chakra check that food is safe?',
    answer:
      'Khabar Chakra calculates mathematical perishability decay windows based on storage conditions and estimates nutritional values using ICMR-National Institute of Nutrition (NIN) standards. However, the software does not inspect food physically. You retain sole responsibility for checking smell, texture, and visual appearance before cooking or consuming any ingredient.',
    link: {
      url: 'https://www.nin.res.in/',
      label: 'ICMR-National Institute of Nutrition Guidelines',
    },
  },
  {
    id: 'is-my-data-private',
    category: 'Privacy and safety',
    question: 'Is my kitchen inventory private?',
    answer:
      'Yes, 100% private. In Khabar Chakra, all pantry contents, receipts, and meal records are secured via Supabase Row-Level Security (auth.uid() = owner_id). No food or location data is ever broadcast or visible to third parties.',
  },
  {
    id: 'how-impact-is-calculated',
    category: 'Getting started',
    question: 'How are domestic ₹ savings and CO₂e impact calculated?',
    answer:
      'Domestic rupees saved are benchmarked against the Ministry of Statistics and Programme Implementation (MoSPI) Consumer Food Price Index (₹80/kg average food basket). Edible food diversion prevents greenhouse gases at 2.5 kg CO₂e per kg food avoided, benchmarked to the UNEP Food Waste Index Report 2024.',
    link: {
      url: 'https://www.unep.org/resources/publication/food-waste-index-report-2024',
      label: 'UNEP Food Waste Index Report 2024',
    },
  },
  {
    id: 'how-to-make-privacy-request',
    category: 'Privacy and safety',
    question: 'How do I make a formal privacy or data deletion request?',
    answer:
      'Use the contact form and select "Privacy Request / Grievance" from the topic dropdown. We respond to all statutory data requests promptly.',
  },
  {
    id: 'how-to-get-technical-help',
    category: 'Technical support',
    question: 'How can I get technical help or report a bug?',
    answer:
      'Use the contact form and choose "Technical Support", or report an issue directly on the official GitHub repository.',
  },
];

const categories = [
  'All',
  'Getting started',
  'Account and password',
  'Food safety',
  'Privacy and safety',
  'Technical support',
] as const;

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setOpenItems((prev) => ({ ...prev, [hash]: true }));
        const elem = document.getElementById(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    const timer = setTimeout(handleHash, 50);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearTimeout(timer);
    };
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    faqData.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItems(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  const filteredItems = faqData.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 border-b border-[var(--kc-card-border)] pb-8">
        <span className="font-annotation text-[var(--kc-basil)] text-lg">Inquiries & Answers</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-ink)] mt-1">
          Frequently Answered Questions (FAQ)
        </h1>
        <p className="text-sm text-[var(--kc-muted)] mt-2">
          Clear, definitive answers on domestic food tracking, recipe rescue, and household data privacy.
        </p>
      </div>

      {/* Controls Strip: Search & Category Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. 'privacy', 'recipes', 'free', 'impact')..."
            aria-label="Search questions"
            className="w-full px-4 py-3 pl-10 text-sm border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] rounded-xl focus:outline-none focus:border-[var(--kc-basil)] shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-[var(--kc-muted)]">
            🔍
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="FAQ Categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
                    : 'border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expand/Collapse All */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={handleExpandAll}
              className="text-[var(--kc-basil)] hover:underline cursor-pointer"
            >
              Expand all
            </button>
            <span className="text-[var(--kc-muted)]">·</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-[var(--kc-muted)] hover:underline cursor-pointer"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      {/* Questions Accordion List */}
      {filteredItems.length === 0 ? (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-8 text-center rounded-2xl">
          <h3 className="text-base font-bold text-[var(--kc-ink)] mb-2">No matching questions found</h3>
          <p className="text-sm text-[var(--kc-muted)] mb-6">
            We could not find an answer matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <Link
            href="/en/contact"
            className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] rounded-xl transition-colors shadow-sm"
          >
            Ask the Admin Inbox →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isOpen = !!openItems[item.id];
            return (
              <div
                key={item.id}
                id={item.id}
                className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`answer-${item.id}`}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-[var(--kc-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--kc-muted)]">
                      Q:
                    </span>
                    <span className="font-semibold text-sm text-[var(--kc-ink)]">
                      {item.question}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--kc-muted)] shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`answer-${item.id}`}
                    className="px-6 pb-5 pt-2 text-xs sm:text-sm text-[var(--kc-muted)] leading-relaxed border-t border-[var(--kc-hairline)] space-y-3"
                  >
                    <p>{item.answer}</p>
                    {item.link && (
                      <div className="pt-2 text-xs">
                        <span className="text-[var(--kc-muted)] font-mono">Reference source: </span>
                        <a
                          href={item.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[var(--kc-basil)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.link.label}</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
